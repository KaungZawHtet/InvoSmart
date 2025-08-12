using System.Threading.Tasks;
using Azure;
using Azure.AI.Inference;
using Azure.AI.OpenAI;
using Azure.Core;
using Azure.Core.Pipeline;
using Azure.Identity;
using OpenAI.Chat;

namespace InvoSmart.Api.Services;

public class AiFoundryService
{
    private readonly ChatClient _chat;

    public AiFoundryService(IConfiguration cfg)
    {
        var endpoint = new Uri(cfg["AzureOpenAI:Endpoint"]!); // https://...cognitiveservices.azure.com/
        var key = cfg["AzureOpenAI:ApiKey"]!;
        var deployment = cfg["AzureOpenAI:Deployment"]!; // e.g., gpt-4o

        var client = new AzureOpenAIClient(endpoint, new AzureKeyCredential(key));
        _chat = client.GetChatClient(deployment);
    }

    public async Task<string> GenerateDunningAsync(
        string customer,
        decimal amount,
        DateTime due,
        string tone = "firm"
    )
    {
        var req = new ChatCompletionOptions { Temperature = 0.3f };
        var msgs = new List<ChatMessage>
        {
            new SystemChatMessage(
                "You create concise, legally safe AR/dunning emails. Keep within 120 words."
            ),
            new UserChatMessage(
                $@"Customer: {customer}
Overdue amount: {amount:C}
Due date: {due:yyyy-MM-dd}
Tone: {tone}
Output: subject + body, plain text."
            ),
        };
        var resp = await _chat.CompleteChatAsync(msgs, req);
        return resp.Value.Content[0].Text;
    }
}
