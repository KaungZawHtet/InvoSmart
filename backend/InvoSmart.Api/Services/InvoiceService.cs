using InvoSmart.Api.Abstractions;
using InvoSmart.Api.Contracts;
using InvoSmart.Api.Data;
using InvoSmart.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace InvoSmart.Api.Services;

public sealed class InvoiceService(AppDbContext db, ILogger<InvoiceService> logger)
    : IInvoiceService
{
    public async Task<(IReadOnlyList<InvoiceResponseDto> Items, int Total)> GetAllAsync(
        Guid? customerId,
        int page,
        int pageSize,
        CancellationToken ct
    )
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var q = db.Invoices.AsNoTracking().OrderByDescending(i => i.CreatedAtUtc);
        if (customerId.HasValue && customerId.Value != Guid.Empty)
            q = q.Where(i => i.CustomerId == customerId).OrderByDescending(i => i.CreatedAtUtc);

        var items = await q.Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new InvoiceResponseDto(
                i.Id,
                i.InvoiceNumber,
                i.Amount,
                i.IssueDateUtc,
                i.DueDateUtc,
                i.Status,
                i.CustomerId,
                i.CreatedAtUtc
            ))
            .ToListAsync(ct);

        var total = await (
            customerId.HasValue && customerId.Value != Guid.Empty
                ? db.Invoices.CountAsync(i => i.CustomerId == customerId, ct)
                : db.Invoices.CountAsync(ct)
        );

        return (items, total);
    }

    public async Task<InvoiceResponseDto?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var i = await db.Invoices.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return i is null
            ? null
            : new InvoiceResponseDto(
                i.Id,
                i.InvoiceNumber,
                i.Amount,
                i.IssueDateUtc,
                i.DueDateUtc,
                i.Status,
                i.CustomerId,
                i.CreatedAtUtc
            );
    }

    public async Task<InvoiceResponseDto> CreateAsync(InvoiceCreateDto dto, CancellationToken ct)
    {
        var exists = await db.Customers.AnyAsync(c => c.Id == dto.CustomerId, ct);
        if (!exists)
            throw new ArgumentException("CustomerId not found.");

        var entity = new Invoice
        {
            InvoiceNumber = dto.InvoiceNumber,
            Amount = dto.Amount,
            IssueDateUtc = dto.IssueDateUtc,
            DueDateUtc = dto.DueDateUtc,
            CustomerId = dto.CustomerId,
            Status = InvoiceStatus.Sent,
        };

        db.Invoices.Add(entity);
        await db.SaveChangesAsync(ct);

        return new InvoiceResponseDto(
            entity.Id,
            entity.InvoiceNumber,
            entity.Amount,
            entity.IssueDateUtc,
            entity.DueDateUtc,
            entity.Status,
            entity.CustomerId,
            entity.CreatedAtUtc
        );
    }

    public async Task<bool> UpdateAsync(Guid id, InvoiceUpdateDto dto, CancellationToken ct)
    {
        var entity = await db.Invoices.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return false;

        entity.InvoiceNumber = dto.InvoiceNumber;
        entity.Amount = dto.Amount;
        entity.IssueDateUtc = dto.IssueDateUtc;
        entity.DueDateUtc = dto.DueDateUtc;
        entity.Status = dto.Status;

        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var entity = await db.Invoices.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return false;

        db.Invoices.Remove(entity);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
