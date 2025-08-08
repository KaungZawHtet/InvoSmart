// components/StatusBadge.tsx
export type InvoiceStatus =
    | 'Draft'
    | 'Sent'
    | 'Paid'
    | 'Overdue'
    | 'Cancelled'
    | 'Canceled';

const STYLE: Record<InvoiceStatus, { bg: string; fg: string }> = {
    Draft: { bg: 'var(--muted)', fg: 'var(--foreground)' },
    Sent: { bg: 'var(--accent)', fg: 'var(--accent-foreground)' },
    Paid: { bg: 'var(--success)', fg: 'var(--success-foreground)' },
    Overdue: { bg: 'var(--destructive)', fg: 'var(--destructive-foreground)' },
    Cancelled: { bg: 'var(--secondary)', fg: 'var(--secondary-foreground)' },
    Canceled: { bg: 'var(--secondary)', fg: 'var(--secondary-foreground)' },
};

function normalizeStatus(value: unknown): InvoiceStatus {
    if (typeof value !== 'string') {
        console.warn('Invoice status is not a string:', value);
        return 'Draft';
    }
    const v = value.trim();
    if (v === 'Canceled') return 'Canceled';
    if (v === 'Cancelled') return 'Cancelled';
    if (['Draft', 'Sent', 'Paid', 'Overdue'].includes(v)) {
        return v as InvoiceStatus;
    }
    console.warn('Unknown invoice status string:', v);
    return 'Draft';
}

export default function StatusBadge({ status }: { status: unknown }) {
    const s = STYLE[normalizeStatus(status)];
    return (
        <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: s.bg, color: s.fg }}
        >
            {String(status)}
        </span>
    );
}
