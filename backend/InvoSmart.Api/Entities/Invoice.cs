namespace InvoSmart.Api.Entities;

public enum InvoiceStatus
{
    Draft,
    Sent,
    Paid,
    Overdue,
    Cancelled,
}

public class Invoice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string InvoiceNumber { get; set; } = default!;
    public decimal Amount { get; set; }
    public DateTime IssueDateUtc { get; set; }
    public DateTime DueDateUtc { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;

    // FK
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = default!;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
