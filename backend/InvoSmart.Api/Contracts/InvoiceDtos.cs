using InvoSmart.Api.Entities;

namespace InvoSmart.Api.Contracts;

public record InvoiceCreateDto(
    string InvoiceNumber,
    decimal Amount,
    DateTime IssueDateUtc,
    DateTime DueDateUtc,
    Guid CustomerId
);

public record InvoiceUpdateDto(
    string InvoiceNumber,
    decimal Amount,
    DateTime IssueDateUtc,
    DateTime DueDateUtc,
    InvoiceStatus Status
);

public record InvoiceResponseDto(
    Guid Id,
    string InvoiceNumber,
    decimal Amount,
    DateTime IssueDateUtc,
    DateTime DueDateUtc,
    InvoiceStatus Status,
    Guid CustomerId,
    DateTime CreatedAtUtc
);
