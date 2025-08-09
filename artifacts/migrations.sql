CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20250808151728_InitialCreate') THEN
    CREATE TABLE customers (
        "Id" uuid NOT NULL,
        "Name" character varying(200) NOT NULL,
        "Email" character varying(200) NOT NULL,
        "Phone" text,
        "BillingAddress" text,
        "CreatedAtUtc" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_customers" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20250808151728_InitialCreate') THEN
    CREATE TABLE invoices (
        "Id" uuid NOT NULL,
        "InvoiceNumber" character varying(50) NOT NULL,
        "Amount" numeric(12,2) NOT NULL,
        "IssueDateUtc" timestamp with time zone NOT NULL,
        "DueDateUtc" timestamp with time zone NOT NULL,
        "Status" integer NOT NULL,
        "CustomerId" uuid NOT NULL,
        "CreatedAtUtc" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_invoices" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_invoices_customers_CustomerId" FOREIGN KEY ("CustomerId") REFERENCES customers ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20250808151728_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_customers_Email" ON customers ("Email");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20250808151728_InitialCreate') THEN
    CREATE INDEX "IX_invoices_CustomerId" ON invoices ("CustomerId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20250808151728_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_invoices_InvoiceNumber" ON invoices ("InvoiceNumber");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20250808151728_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20250808151728_InitialCreate', '9.0.8');
    END IF;
END $EF$;
COMMIT;

