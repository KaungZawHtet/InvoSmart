'use client';

import React, { useState } from 'react';

type DunningResponse = { text: string };

export default function DunningPage() {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
    const [customerName, setCustomerName] = useState('');
    const [amount, setAmount] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>('');
    const [tone, setTone] = useState<'firm' | 'friendly' | 'legal'>('firm');

    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [result, setResult] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const canSubmit =
        customerName.trim().length > 0 &&
        amount.trim().length > 0 &&
        !Number.isNaN(Number(amount)) &&
        Number(amount) > 0 &&
        !!dueDate;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        setApiError(null);
        setResult('');

        try {
            // IMPORTANT: property names must be PascalCase to match your C# record
            const body = {
                CustomerName: customerName.trim(),
                Amount: Number(amount),
                DueDate: dueDate, // yyyy-MM-dd; .NET DateTime parses this fine
                Tone: tone,
            };

            console.log(`Kaung Zaw Htet`);
            console.log(`${API_BASE}/api/Ai/dunning`);

            const res = await fetch(`${API_BASE}/api/Ai/dunning`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const msg = await safeErrorMessage(res);
                throw new Error(msg || `Request failed with ${res.status}`);
            }

            const data: DunningResponse = await res.json();
            setResult(data.text ?? '');
        } catch (err: unknown) {
            setApiError(
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred'
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleCopy() {
        await navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500); // reset after 1.5s
    }

    console.log(`Before render`);

    return (
        <div className="mx-auto max-w-3xl p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">
                    Generate Dunning Email
                </h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm"
            >
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Customer name</label>
                    <input
                        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring"
                        placeholder="Acme Co."
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium">Amount (THB)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring"
                        placeholder="1000.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium">Due date</label>
                    <input
                        type="date"
                        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium">Tone</label>
                    <select
                        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring"
                        value={tone}
                        onChange={(e) =>
                            setTone(
                                e.target.value as 'firm' | 'friendly' | 'legal'
                            )
                        }
                    >
                        <option value="firm">Firm (default)</option>
                        <option value="friendly">Friendly</option>
                        <option value="legal">Legal</option>
                    </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={!canSubmit || loading}
                        className="rounded-2xl bg-black px-5 py-2 text-white disabled:opacity-50"
                    >
                        {loading ? 'Generating…' : 'Generate'}
                    </button>
                    {!canSubmit && (
                        <span className="text-sm text-gray-500">
                            Fill all fields with valid values to enable.
                        </span>
                    )}
                </div>
            </form>

            {apiError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {apiError}
                </div>
            )}

            {result && (
                <div className="mt-6 grid gap-3 rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Result</h2>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="text-sm underline disabled:opacity-50"
                            disabled={!result}
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>

                    <pre className="whitespace-pre-wrap break-words text-sm">
                        {result}
                    </pre>
                </div>
            )}

            <footer className="mt-10 text-xs text-gray-500">
                This page is about generating email for dunning.
            </footer>
        </div>
    );
}

async function safeErrorMessage(res: Response) {
    try {
        const data = await res.json();
        return data?.error || data?.message || JSON.stringify(data);
    } catch {
        return res.statusText;
    }
}
