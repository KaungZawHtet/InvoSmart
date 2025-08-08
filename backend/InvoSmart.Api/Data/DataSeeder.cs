using Bogus;
using InvoSmart.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace InvoSmart.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(
        AppDbContext db,
        ILogger logger,
        CancellationToken ct = default
    )
    {
        // If we already have data, do nothing (idempotent)
        if (await db.Customers.AnyAsync(ct))
            return;

        var faker = new Faker("en");

        // Customers
        var customers = new Faker<Customer>("en")
            .RuleFor(c => c.Id, _ => Guid.NewGuid())
            .RuleFor(c => c.Name, f => f.Company.CompanyName())
            .RuleFor(c => c.Email, f => f.Internet.Email())
            .RuleFor(c => c.Phone, f => f.Phone.PhoneNumber())
            .RuleFor(c => c.BillingAddress, f => f.Address.FullAddress())
            .RuleFor(c => c.CreatedAtUtc, _ => DateTime.UtcNow.AddDays(-faker.Random.Int(1, 90)))
            .Generate(10);

        // Invoices
        var invoices = new List<Invoice>();
        int seq = 1000;
        foreach (var c in customers)
        {
            var count = faker.Random.Int(2, 6);
            for (int i = 0; i < count; i++)
            {
                var issue = DateTime.UtcNow.AddDays(-faker.Random.Int(5, 60));
                var due = issue.AddDays(faker.Random.Int(7, 21));
                var amount = faker.Random.Decimal(50, 1500);
                var status = faker.PickRandom<InvoiceStatus>();

                invoices.Add(
                    new Invoice
                    {
                        Id = Guid.NewGuid(),
                        InvoiceNumber = $"INV-{seq++}",
                        Amount = decimal.Round(amount, 2),
                        IssueDateUtc = issue,
                        DueDateUtc = due,
                        Status = status,
                        CustomerId = c.Id,
                        CreatedAtUtc = issue,
                    }
                );
            }
        }

        db.Customers.AddRange(customers);
        db.Invoices.AddRange(invoices);

        await db.SaveChangesAsync(ct);

        logger.LogInformation(
            "Seeded {CustomerCount} customers and {InvoiceCount} invoices",
            customers.Count,
            invoices.Count
        );
    }
}
