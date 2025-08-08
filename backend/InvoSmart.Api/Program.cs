using Serilog;

Log.Logger = new LoggerConfiguration().WriteTo.Console().CreateLogger();


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();


// Hook Serilog into the host and read config from appsettings
builder.Host.UseSerilog(
    (ctx, lc) =>
    {
        lc.ReadFrom.Configuration(ctx.Configuration)
            .Enrich.WithEnvironmentName()
            .Enrich.WithProcessId()
            .Enrich.WithThreadId()
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File("logs/app-.log", rollingInterval: RollingInterval.Day);
    }
);

var app = builder.Build();

app.UseSerilogRequestLogging(opts =>
{
    // Add key HTTP info to each request log
    opts.MessageTemplate =
        "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
     app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapHealthChecks("/healthz");

app.Run();
