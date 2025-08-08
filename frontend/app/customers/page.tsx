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
import CustomersTable from './table';

type Customer = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    billingAddress?: string;
    createdAtUtc: string;
};

async function fetchCustomers(page: number, pageSize: number) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL!; // e.g. http://localhost:5242
    const url = `${base}/api/customers?page=${page}&pageSize=${pageSize}`;

    let res: Response;
    try {
        res = await fetch(url, { cache: 'no-store' });
    } catch (e: any) {
        console.error('Fetch failed:', e?.message ?? e);
        throw new Error('Failed to reach API');
    }

    const total = Number(res.headers.get('X-Total-Count') ?? '0');

    if (!res.ok) {
        let detail = '';
        try {
            detail = await res.text();
        } catch {}
        console.error('API error', res.status, res.statusText, detail);
        throw new Error(`API ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as Customer[];
    return { data, total };
}

export default async function CustomersPage({
    searchParams,
}: {
    searchParams?: { page?: string; pageSize?: string };
}) {
    const page = Math.max(1, Number(searchParams?.page ?? 1));
    const pageSize = Math.min(
        100,
        Math.max(1, Number(searchParams?.pageSize ?? 10))
    );

    const { data, total } = await fetchCustomers(page, pageSize);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Customers</h1>
                <Link
                    href="/customers/new"
                    className="text-sm underline underline-offset-4 hover:no-underline"
                >
                    + New Customer
                </Link>
            </div>

            {/* Desktop table */}
            <Card className="hidden md:block">
                <CardHeader>
                    <CardTitle className="text-base">All customers</CardTitle>
                </CardHeader>
                <CardContent>
                    <CustomersTable customers={data} />
                </CardContent>
            </Card>

            {/* Mobile cards */}
            <div className="grid gap-3 md:hidden">
                {data.map((c) => (
                    <Card key={c.id}>
                        <CardContent className="p-4">
                            <div className="font-medium text-foreground">
                                {c.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {c.email}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {c.phone ?? '—'}
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                {new Date(c.createdAtUtc).toLocaleDateString()}
                            </div>
                            <div className="mt-3">
                                <Link
                                    href={`/invoices?customerId=${c.id}`}
                                    className="text-sm text-primary underline"
                                >
                                    View invoices →
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {data.length === 0 && (
                    <Card>
                        <CardContent className="p-6 text-center text-sm text-muted-foreground">
                            No customers found.
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Pagination (visible on both mobile & desktop) */}
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
                                href={`/customers?page=${Math.max(
                                    1,
                                    page - 1
                                )}&pageSize=${pageSize}`}
                            />
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationLink
                                href={`/customers?page=${page}&pageSize=${pageSize}`}
                                className="min-w-9 justify-center"
                                isActive
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>

                        {page + 1 <= totalPages && (
                            <PaginationItem>
                                <PaginationLink
                                    href={`/customers?page=${
                                        page + 1
                                    }&pageSize=${pageSize}`}
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
                                href={`/customers?page=${Math.min(
                                    totalPages,
                                    page + 1
                                )}&pageSize=${pageSize}`}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </section>
    );
}
