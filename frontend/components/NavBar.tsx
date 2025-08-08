'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/customers', label: 'Customers' },
    { href: '/invoices', label: 'Invoices' },
];

export default function NavBar() {
    const pathname = usePathname();
    return (
        <header className="w-full border-b bg-white">
            <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
                <Link href="/" className="font-semibold">
                    InvoSmart
                </Link>
                <ul className="flex gap-4">
                    {links.map((l) => {
                        const active = pathname === l.href;
                        return (
                            <li key={l.href}>
                                <Link
                                    href={l.href}
                                    className={
                                        'text-sm hover:underline ' +
                                        (active
                                            ? 'font-semibold text-gray-900'
                                            : 'text-gray-800 hover:text-gray-900')
                                    }
                                >
                                    {l.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </header>
    );
}
