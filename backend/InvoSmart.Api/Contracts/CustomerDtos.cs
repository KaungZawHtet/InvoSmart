namespace InvoSmart.Api.Contracts;

public record CustomerCreateDto(string Name, string Email, string? Phone, string? BillingAddress);

public record CustomerUpdateDto(string Name, string Email, string? Phone, string? BillingAddress);

public record CustomerResponseDto(
    Guid Id,
    string Name,
    string Email,
    string? Phone,
    string? BillingAddress,
    DateTime CreatedAtUtc
);
