using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace InvoSmart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PingController : ControllerBase
{
    private readonly ILogger<PingController> _logger;

    public PingController(ILogger<PingController> logger) => _logger = logger;

    [HttpGet]
    public IActionResult Get()
    {
        _logger.LogInformation("Ping received at {TimeUtc}", DateTime.UtcNow);
        return Ok(new { message = "pong", timeUtc = DateTime.UtcNow });
    }
}
