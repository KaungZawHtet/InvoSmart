import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import Link from 'next/link';

import StatusBadge from '@/components/StatusBadge';
import CreateInvoiceDialog from './CreateInvoiceDialog';
import DeleteInvoiceButton from './DeleteInvoiceButton';
import InvoicesTable from './Table';

type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

type Invoice = {
    id: string;
    invoiceNumber: string;
    amount: number;
    issueDateUtc: string;
    dueDateUtc: string;
    status: InvoiceStatus;
    customerId: string;
    createdAtUtc: string;
};

async function fetchInvoices(params: {
    customerId?: string;
    page: number;
    pageSize: number;
}) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
    const search = new URLSearchParams({
        page: String(params.page),
        pageSize: String(params.pageSize),
    });
    if (params.customerId) search.set('customerId', params.customerId);

    const url = `${base}/api/invoices?${search.toString()}`;

    let res: Response;
    try {
        res = await fetch(url, { cache: 'no-store' });
    } catch {
        throw new Error('Failed to reach API');
    }

    const total = Number(res.headers.get('X-Total-Count') ?? '0');
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
    }

    const data = (await res.json()) as Invoice[];
    return { data, total };
}

export default async function InvoicesPage({
    searchParams,
}: {
    searchParams?: Promise<{
        customerId?: string;
        page?: string;
        pageSize?: string;
    }>;
}) {
    const q = (await searchParams) ?? {};
    const customerId = q.customerId?.trim() || undefined;
    const page = Math.max(1, Number(q.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize ?? 10)));

    const { data, total } = await fetchInvoices({ customerId, page, pageSize });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Invoices</h1>
                <CreateInvoiceDialog />
            </div>

            {/* Desktop table */}
            <Card className="hidden md:block">
                <CardHeader>
                    <CardTitle className="text-base">
                        {customerId ? 'Customer invoices' : 'All invoices'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <InvoicesTable invoices={data} />
                </CardContent>
            </Card>

            {/* Mobile cards */}
            <div className="grid gap-3 md:hidden">
                {data.map((i) => (
                    <Card key={i.id}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="font-medium">
                                    {i.invoiceNumber}
                                </div>
                                <StatusBadge status={i.status} />
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                                Amount: {i.amount.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Due:{' '}
                                {new Date(i.dueDateUtc).toLocaleDateString()}
                            </div>
                            <div className="mt-3 flex items-center gap-3">
                                <Link
                                    href={`/invoices/${i.id}`}
                                    className="text-sm text-primary underline"
                                >
                                    View →
                                </Link>
                                <DeleteInvoiceButton
                                    invoiceId={i.id}
                                    invoiceNumber={i.invoiceNumber}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {data.length === 0 && (
                    <Card>
                        <CardContent className="p-6 text-center text-sm text-muted-foreground">
                            No invoices found.
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Pagination (mobile + desktop) */}
            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm text-muted-foreground shrink-0 whitespace-nowrap tabular-nums">
                    Page {page} of {totalPages}&nbsp;·&nbsp;{total} total
                </div>

                <Pagination>
                    <PaginationContent className="flex items-center gap-2">
                        <PaginationItem>
                            <PaginationPrevious
                                className={
                                    page <= 1
                                        ? 'pointer-events-none opacity-50'
                                        : ''
                                }
                                href={`/invoices?${new URLSearchParams({
                                    ...(customerId ? { customerId } : {}),
                                    page: String(Math.max(1, page - 1)),
                                    pageSize: String(pageSize),
                                }).toString()}`}
                            />
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationLink
                                href={`/invoices?${new URLSearchParams({
                                    ...(customerId ? { customerId } : {}),
                                    page: String(page),
                                    pageSize: String(pageSize),
                                }).toString()}`}
                                className="min-w-9 justify-center"
                                isActive
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>

                        {page + 1 <= totalPages && (
                            <PaginationItem>
                                <PaginationLink
                                    href={`/invoices?${new URLSearchParams({
                                        ...(customerId ? { customerId } : {}),
                                        page: String(page + 1),
                                        pageSize: String(pageSize),
                                    }).toString()}`}
                                    className="min-w-9 justify-center"
                                >
                                    {page + 1}
                                </PaginationLink>
                            </PaginationItem>
                        )}

                        <PaginationItem>
                            <PaginationNext
                                className={
                                    page >= totalPages
                                        ? 'pointer-events-none opacity-50'
                                        : ''
                                }
                                href={`/invoices?${new URLSearchParams({
                                    ...(customerId ? { customerId } : {}),
                                    page: String(
                                        Math.min(totalPages, page + 1)
                                    ),
                                    pageSize: String(pageSize),
                                }).toString()}`}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </section>
    );
}
