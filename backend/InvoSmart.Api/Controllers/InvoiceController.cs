using InvoSmart.Api.Abstractions;
using InvoSmart.Api.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace InvoSmart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoicesController(IInvoiceService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvoiceResponseDto>>> GetAll(
        [FromQuery] Guid? customerId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default
    )
    {
        var (items, total) = await service.GetAllAsync(customerId, page, pageSize, ct);
        Response.Headers.Append("X-Total-Count", total.ToString());
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<InvoiceResponseDto>> GetById(Guid id, CancellationToken ct) =>
        (await service.GetByIdAsync(id, ct)) is { } i ? Ok(i) : NotFound();

    [HttpPost]
    public async Task<ActionResult<InvoiceResponseDto>> Create(
        [FromBody] InvoiceCreateDto dto,
        CancellationToken ct
    )
    {
        var created = await service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] InvoiceUpdateDto dto,
        CancellationToken ct
    ) => await service.UpdateAsync(id, dto, ct) ? NoContent() : NotFound();

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct) =>
        await service.DeleteAsync(id, ct) ? NoContent() : NotFound();
}
