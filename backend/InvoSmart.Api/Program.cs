using System.Text.Json.Serialization;
using InvoSmart.Api.Abstractions;
using InvoSmart.Api.Data;
using InvoSmart.Api.Middlewares;
using InvoSmart.Api.Services;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.EntityFrameworkCore;
using Serilog;

Log.Logger = new LoggerConfiguration().WriteTo.Console().CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder
    .Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
;
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();

builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();

builder.Services.AddApplicationInsightsTelemetry();

var allowedOrigins =
    builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
const string CorsPolicy = "Frontend";

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: CorsPolicy,
        policy =>
        {
            policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
        }
    );
});

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var cs = builder.Configuration.GetConnectionString("Default");
    options.UseNpgsql(cs);
    // Optional: detailed EF logs in dev
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

// Hook Serilog into the host and read config from appsettings
builder.Host.UseSerilog(
    (ctx, services, lc) =>
    {
        lc.ReadFrom.Configuration(ctx.Configuration)
            .Enrich.WithEnvironmentName()
            .Enrich.WithProcessId()
            .Enrich.WithThreadId()
            .Enrich.FromLogContext()
            .WriteTo.Console();

        if (ctx.HostingEnvironment.IsDevelopment())
        {
            lc.WriteTo.File("logs/app-.log", rollingInterval: RollingInterval.Day);
        }

        // Enable AI sink only in Staging/Prod and when we actually have a connection string
        var aiConn =
            ctx.Configuration["ApplicationInsights:ConnectionString"]
            ?? Environment.GetEnvironmentVariable("APPLICATIONINSIGHTS_CONNECTION_STRING");

        if (
            !string.IsNullOrWhiteSpace(aiConn)
            && (ctx.HostingEnvironment.IsStaging() || ctx.HostingEnvironment.IsProduction())
        )
        {
            var aiConfig = services.GetRequiredService<TelemetryConfiguration>();
            lc.WriteTo.ApplicationInsights(aiConfig, TelemetryConverter.Traces);
        }
    }
);

var app = builder.Build();

app.UseSerilogRequestLogging(opts =>
{
    // Add key HTTP info to each request log
    opts.MessageTemplate =
        "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
});

// Seed the database
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<InvoSmart.Api.Data.AppDbContext>();
    var log = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");
    try
    {
        await InvoSmart.Api.Data.DbSeeder.SeedAsync(db, log);
    }
    catch (Exception ex)
    {
        log.LogError(ex, "Error seeding the database");
        throw;
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseCors(CorsPolicy);

app.UseMiddleware<ErrorHandlingMiddleware>();

app.MapControllers();

app.MapHealthChecks("/healthz");

app.Run();
