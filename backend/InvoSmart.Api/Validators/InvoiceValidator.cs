using FluentValidation;
using InvoSmart.Api.Contracts;

namespace InvoSmart.Api.Validators;

public class InvoiceCreateValidator : AbstractValidator<InvoiceCreateDto>
{
    public InvoiceCreateValidator()
    {
        RuleFor(x => x.InvoiceNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.IssueDateUtc).LessThanOrEqualTo(x => x.DueDateUtc);
        RuleFor(x => x.CustomerId).NotEmpty();
    }
}

public class InvoiceUpdateValidator : AbstractValidator<InvoiceUpdateDto>
{
    public InvoiceUpdateValidator()
    {
        RuleFor(x => x.InvoiceNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.IssueDateUtc).LessThanOrEqualTo(x => x.DueDateUtc);
        RuleFor(x => x.Status).IsInEnum();
    }
}
