namespace InvoSmart.Api.Contracts;

public class AiDto
{
    public record DunningRequestDto(
        string CustomerName,
        decimal Amount,
        DateTime DueDate,
        string Tone = "firm"
    );
}
