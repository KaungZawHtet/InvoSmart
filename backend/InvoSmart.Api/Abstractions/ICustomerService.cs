using InvoSmart.Api.Contracts;

namespace InvoSmart.Api.Abstractions;

public interface ICustomerService
{
    Task<(IReadOnlyList<CustomerResponseDto> Items, int Total)> GetAllAsync(
        int page,
        int pageSize,
        CancellationToken ct
    );
    Task<CustomerResponseDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<CustomerResponseDto> CreateAsync(CustomerCreateDto dto, CancellationToken ct);
    Task<bool> UpdateAsync(Guid id, CustomerUpdateDto dto, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);
}
