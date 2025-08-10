# InvoSmart

InvoSmart is a experimental full-stack application for managing **invoices, customers, and business operations**.  
It features a **.NET 9 Web API backend** with PostgreSQL and a **Next.js 14 frontend** styled with Tailwind CSS + Shadcn UI.  
The solution is built for **Azure cloud deployment** with **GitHub Actions (OIDC)** for CI/CD.

---

## 🚀 Tech Stack

**Backend (BE)**

-   .NET 9 Web API (C#)
-   Entity Framework Core + PostgreSQL
-   Global exception handling & logging
-   RESTful API with pagination & status enums
-   Deployed to Azure App Service (Linux)
-   CI/CD with GitHub Actions (OIDC login)
-   Application Insights for monitoring

**Frontend (FE)**

-   Next.js 14 (App Router)
-   TypeScript + Tailwind CSS + Shadcn UI
-   Responsive layout with mobile-first design
-   API integration via centralized fetch helper
-   Status badges, pagination, CRUD UI

---

## ⚙️ Prerequisites

-   [.NET 9 SDK](https://dotnet.microsoft.com/download)
-   [Node.js 20+](https://nodejs.org/)
-   [PostgreSQL 16+](https://www.postgresql.org/download/)
-   [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
-   GitHub account with Actions enabled

---

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
