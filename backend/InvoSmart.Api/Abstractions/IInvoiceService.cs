using InvoSmart.Api.Contracts;

namespace InvoSmart.Api.Abstractions;

public interface IInvoiceService
{
    Task<(IReadOnlyList<InvoiceResponseDto> Items, int Total)> GetAllAsync(
        Guid? customerId,
        int page,
        int pageSize,
        CancellationToken ct
    );
    Task<InvoiceResponseDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<InvoiceResponseDto> CreateAsync(InvoiceCreateDto dto, CancellationToken ct);
    Task<bool> UpdateAsync(Guid id, InvoiceUpdateDto dto, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);
}
