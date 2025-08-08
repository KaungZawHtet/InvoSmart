using InvoSmart.Api.Abstractions;
using InvoSmart.Api.Contracts;
using InvoSmart.Api.Data;
using InvoSmart.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace InvoSmart.Api.Services;

public sealed class CustomerService(AppDbContext db, ILogger<CustomerService> logger)
    : ICustomerService
{
    public async Task<(IReadOnlyList<CustomerResponseDto> Items, int Total)> GetAllAsync(
        int page,
        int pageSize,
        CancellationToken ct
    )
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var q = db.Customers.AsNoTracking().OrderByDescending(x => x.CreatedAtUtc);

        var items = await q.Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CustomerResponseDto(
                c.Id,
                c.Name,
                c.Email,
                c.Phone,
                c.BillingAddress,
                c.CreatedAtUtc
            ))
            .ToListAsync(ct);

        var total = await db.Customers.CountAsync(ct);
        return (items, total);
    }

    public async Task<CustomerResponseDto?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var c = await db.Customers.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return c is null
            ? null
            : new CustomerResponseDto(
                c.Id,
                c.Name,
                c.Email,
                c.Phone,
                c.BillingAddress,
                c.CreatedAtUtc
            );
    }

    public async Task<CustomerResponseDto> CreateAsync(CustomerCreateDto dto, CancellationToken ct)
    {
        var entity = new Customer
        {
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.Phone,
            BillingAddress = dto.BillingAddress,
        };

        db.Customers.Add(entity);
        await db.SaveChangesAsync(ct);

        return new CustomerResponseDto(
            entity.Id,
            entity.Name,
            entity.Email,
            entity.Phone,
            entity.BillingAddress,
            entity.CreatedAtUtc
        );
    }

    public async Task<bool> UpdateAsync(Guid id, CustomerUpdateDto dto, CancellationToken ct)
    {
        var entity = await db.Customers.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return false;

        entity.Name = dto.Name;
        entity.Email = dto.Email;
        entity.Phone = dto.Phone;
        entity.BillingAddress = dto.BillingAddress;

        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var entity = await db.Customers.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return false;

        db.Customers.Remove(entity);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
