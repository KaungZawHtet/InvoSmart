import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

type Customer = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    billingAddress?: string;
    createdAtUtc: string;
};

export default function CustomersTable({
    customers,
}: {
    customers: Customer[];
}) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((c) => (
                        <TableRow key={c.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                                {c.name}
                            </TableCell>
                            <TableCell>{c.email}</TableCell>
                            <TableCell>{c.phone ?? '—'}</TableCell>
                            <TableCell>
                                {new Date(c.createdAtUtc).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link
                                    href={`/invoices?customerId=${c.id}`}
                                    className="text-primary underline"
                                >
                                    View invoices
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                    {customers.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="text-center text-muted-foreground"
                            >
                                No customers found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
