'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type Props = {
    invoiceId: string;
    invoiceNumber: string;
};

export default function DeleteInvoiceButton({
    invoiceId,
    invoiceNumber,
}: Props) {
    const router = useRouter();

    async function onConfirm() {
        try {
            const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
            const res = await fetch(`${base}/api/invoices/${invoiceId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                throw new Error(text || `API ${res.status} ${res.statusText}`);
            }
            toast.success(`Deleted ${invoiceNumber}`);
            router.refresh();
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : 'Failed to delete invoice';
            toast.error(msg);
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                >
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete invoice {invoiceNumber}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. The invoice will be
                        permanently removed.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={onConfirm}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
