using InvoSmart.Api.Data;
using InvoSmart.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvoSmart.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController(AppDbContext db) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var customers = await db
                .Customers.AsNoTracking()
                .OrderBy(c => c.CreatedAtUtc)
                .ToListAsync();
            return Ok(customers);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Customer input)
        {
            var entity = new Customer
            {
                Name = input.Name,
                Email = input.Email,
                Phone = input.Phone,
                BillingAddress = input.BillingAddress,
            };
            db.Customers.Add(entity);
            await db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, entity);
        }
    }
}
