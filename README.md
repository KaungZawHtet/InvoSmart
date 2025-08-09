# InvoSmart

### Database migration

Consider to use idempotent script.

```bash
dotnet ef migrations script --idempotent --project backend/InvoSmart.Api/InvoSmart.Api.csproj -o artifacts/migrations.sql

psql "host=$HOST dbname=$DB user=$USER password=$PASSWORD sslmode=require" -v ON_ERROR_STOP=1 -f artifacts/migrations.sql

```

This is alternative one but prefer idempotent script

```bash
dotnet ef database update --project InvoSmart.Api/InvoSmart.Api.csproj --startup-project InvoSmart.Api/InvoSmart.Api.csproj
```
