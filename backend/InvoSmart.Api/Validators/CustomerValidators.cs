using FluentValidation;
using InvoSmart.Api.Contracts;

namespace InvoSmart.Api.Validators;

public class CustomerCreateValidator : AbstractValidator<CustomerCreateDto>
{
    public CustomerCreateValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Phone).MaximumLength(50);
        RuleFor(x => x.BillingAddress).MaximumLength(500);
    }
}

public class CustomerUpdateValidator : AbstractValidator<CustomerUpdateDto>
{
    public CustomerUpdateValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Phone).MaximumLength(50);
        RuleFor(x => x.BillingAddress).MaximumLength(500);
    }
}
