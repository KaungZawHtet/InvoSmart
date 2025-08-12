using InvoSmart.Api.Services;
using Microsoft.AspNetCore.Mvc;
using static InvoSmart.Api.Contracts.AiDto;

namespace InvoSmart.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        private readonly AiFoundryService _aiService;

        public AiController(AiFoundryService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("dunning")]
        public async Task<IActionResult> GenerateDunning([FromBody] DunningRequestDto request)
        {
            if (request == null)
                return BadRequest("Request body is required.");

            var text = await _aiService.GenerateDunningAsync(
                request.CustomerName,
                request.Amount,
                request.DueDate,
                request.Tone
            );

            return Ok(new { text });
        }
    }
}
