import Link from 'next/link';

export default function Home() {
    return (
        <section className="grid gap-4 sm:grid-cols-2">
            <Link
                href="/customers"
                className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow"
            >
                <h2 className="text-gray-600 text-lg font-semibold">
                    Customers →
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Manage customers and contacts.
                </p>
            </Link>
            <Link
                href="/invoices"
                className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow"
            >
                <h2 className=" text-gray-600 text-lg font-semibold">
                    Invoices →
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Track, send, and reconcile invoices.
                </p>
            </Link>
        </section>
    );
}
