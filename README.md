# InvoSmart

### Database migration

Consider to use idempotent script.

```
dotnet ef migrations script --idempotent --project backend/InvoSmart.Api/InvoSmart.Api.csproj -o artifacts/migrations.sql

```
