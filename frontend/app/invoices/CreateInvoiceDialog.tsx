'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type Customer = {
    id: string;
    name: string;
    email: string;
};

type FormState = {
    customerId: string;
    invoiceNumber: string;
    amount: string; // keep as string for input control, parse to number
    issueDate: string; // yyyy-mm-dd
    dueDate: string; // yyyy-mm-dd
};

function toUtc(date: string): string {
    // Convert yyyy-mm-dd to ISO at midnight UTC
    const [y, m, d] = date.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toISOString();
}

export default function CreateInvoiceDialog() {
    const router = useRouter();
    const search = useSearchParams();
    const preselectCustomerId = search.get('customerId') ?? '';

    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    const today = useMemo(() => new Date(), []);
    const defaultIssue = useMemo(
        () => new Date().toISOString().slice(0, 10),
        []
    );
    const defaultDue = useMemo(() => {
        const dt = new Date();
        dt.setDate(dt.getDate() + 14);
        return dt.toISOString().slice(0, 10);
    }, []);

    const [form, setForm] = useState<FormState>({
        customerId: preselectCustomerId,
        invoiceNumber: '',
        amount: '',
        issueDate: defaultIssue,
        dueDate: defaultDue,
    });

    // Load customers for dropdown when dialog opens
    useEffect(() => {
        if (!open) return;
        const load = async () => {
            setLoadingCustomers(true);
            try {
                const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
                const res = await fetch(
                    `${base}/api/customers?page=1&pageSize=100`,
                    { cache: 'no-store' }
                );
                if (!res.ok) throw new Error(`API ${res.status}`);
                const data = (await res.json()) as Customer[];
                setCustomers(data);
                // Preselect if URL has customerId
                if (
                    preselectCustomerId &&
                    !data.find((c) => c.id === preselectCustomerId)
                ) {
                    toast.warning('Selected customer not found in list.');
                }
            } catch (err) {
                toast.error('Failed to load customers');
            } finally {
                setLoadingCustomers(false);
            }
        };
        load();
    }, [open, preselectCustomerId]);

    const onChange =
        (key: keyof FormState) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setForm((f) => ({ ...f, [key]: e.target.value }));
        };

    async function handleCreate() {
        // minimal client-side checks
        if (!form.customerId) return toast.error('Customer is required');
        if (!form.invoiceNumber.trim())
            return toast.error('Invoice number is required');
        const amountNum = Number(form.amount);
        if (!Number.isFinite(amountNum) || amountNum <= 0) {
            return toast.error('Amount must be greater than 0');
        }
        if (!form.issueDate || !form.dueDate)
            return toast.error('Issue and Due dates are required');
        if (new Date(form.issueDate) > new Date(form.dueDate)) {
            return toast.error('Issue date must be on/before Due date');
        }

        setSubmitting(true);
        try {
            const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
            const res = await fetch(`${base}/api/invoices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceNumber: form.invoiceNumber.trim(),
                    amount: amountNum,
                    issueDateUtc: toUtc(form.issueDate),
                    dueDateUtc: toUtc(form.dueDate),
                    customerId: form.customerId,
                }),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => '');
                // Customize common conflicts (e.g., duplicate number)
                if (res.status === 409) {
                    throw new Error('Invoice number already exists.');
                }
                throw new Error(text || `API ${res.status} ${res.statusText}`);
            }

            toast.success('Invoice created');
            setOpen(false);
            setForm({
                customerId: preselectCustomerId,
                invoiceNumber: '',
                amount: '',
                issueDate: defaultIssue,
                dueDate: defaultDue,
            });
            router.refresh();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Failed to create invoice'
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="text-sm">
                    + New Invoice
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create invoice</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="customerId">Customer *</Label>
                        <select
                            id="customerId"
                            className="h-9 rounded-md border bg-background px-3 text-sm"
                            value={form.customerId}
                            onChange={onChange('customerId')}
                            disabled={loadingCustomers}
                        >
                            <option value="">Select a customer...</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} — {c.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="invoiceNumber">Invoice number *</Label>
                        <Input
                            id="invoiceNumber"
                            value={form.invoiceNumber}
                            onChange={onChange('invoiceNumber')}
                            placeholder="INV-1001"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={form.amount}
                            onChange={onChange('amount')}
                            placeholder="199.99"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="issueDate">Issue date *</Label>
                        <Input
                            id="issueDate"
                            type="date"
                            value={form.issueDate}
                            onChange={onChange('issueDate')}
                            max={new Date().toISOString().slice(0, 10)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="dueDate">Due date *</Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={form.dueDate}
                            onChange={onChange('dueDate')}
                            min={form.issueDate}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={handleCreate} disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
