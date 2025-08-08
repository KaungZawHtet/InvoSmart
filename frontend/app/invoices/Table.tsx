'use client';

import StatusBadge, { InvoiceStatus } from '@/components/StatusBadge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import DeleteInvoiceButton from './DeleteInvoiceButton';

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

export default function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((i) => (
                        <TableRow key={i.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                                {i.invoiceNumber}
                            </TableCell>
                            <TableCell>{i.amount.toFixed(2)}</TableCell>
                            <TableCell>
                                {new Date(i.issueDateUtc).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                {new Date(i.dueDateUtc).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={i.status} />
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Link
                                    href={`/invoices/${i.id}`}
                                    className="text-primary underline"
                                >
                                    View
                                </Link>
                                <DeleteInvoiceButton
                                    invoiceId={i.id}
                                    invoiceNumber={i.invoiceNumber}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                    {invoices.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="text-center text-muted-foreground"
                            >
                                No invoices found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
