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
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

type FormState = {
    name: string;
    email: string;
    phone: string;
    billingAddress: string;
};

export default function CreateCustomerDialog() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState<FormState>({
        name: '',
        email: '',
        phone: '',
        billingAddress: '',
    });

    const onChange =
        (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm((f) => ({ ...f, [key]: e.target.value }));
        };

    async function handleCreate() {
        // minimal client-side checks
        if (!form.name.trim() || !form.email.trim()) {
            toast.error('Name and Email are required');
            return;
        }

        setSubmitting(true);
        try {
            // use env base url (works client-side)
            const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
            const res = await fetch(`${base}/api/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim() || null,
                    billingAddress: form.billingAddress.trim() || null,
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(`API ${res.status}: ${msg || res.statusText}`);
            }

            toast.success('Customer created');
            setOpen(false);
            setForm({ name: '', email: '', phone: '', billingAddress: '' });
            router.refresh(); // refresh server component data
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="text-sm">
                    + New Customer
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create customer</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={form.name}
                            onChange={onChange('name')}
                            placeholder="Acme Ltd"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={onChange('email')}
                            placeholder="billing@acme.test"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={form.phone}
                            onChange={onChange('phone')}
                            placeholder="+1 555 0100"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="billingAddress">Billing address</Label>
                        <Input
                            id="billingAddress"
                            value={form.billingAddress}
                            onChange={onChange('billingAddress')}
                            placeholder="123 Main St"
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
