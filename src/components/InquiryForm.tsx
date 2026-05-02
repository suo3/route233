'use client';

import { useState } from 'react';
import { Button, Input, Label } from '@/components/ui';

type Category = 'electronics' | 'automotive' | 'general';

export default function InquiryForm() {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<Category>('general');
  const [result, setResult] = useState<{ success: boolean; message?: string; reason?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      customer_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', // Placeholder UUID
      category: formData.get('category'),
      source_url: formData.get('source_url'),
      description: formData.get('description'),
      vin: formData.get('vin'),
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      setResult({
        success: json.success,
        message: json.message,
        reason: json.reason,
      });
    } catch (err) {
      setResult({ success: false, message: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Request a Quote</h1>
          <p className="text-slate-500">Tell us what you want to source from the US, and we'll handle the rest.</p>
        </div>

        {result && (
          <div className={`mb-8 p-4 rounded-2xl border ${result.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <p className="font-bold">{result.success ? 'Success!' : 'Request Flagged'}</p>
            <p className="text-sm">{result.message || (result.success ? 'Your request has been submitted for review.' : '')}</p>
            {result.reason && (
              <div className="mt-2 p-3 bg-white/50 rounded-xl border border-red-100 text-xs font-mono">
                REASON: {result.reason}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Category</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['general', 'electronics', 'automotive'] as Category[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-3 px-4 rounded-xl border-2 transition-all capitalize font-medium ${
                    category === cat 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <input type="hidden" name="category" value={category} />
            </div>
          </div>

          <div>
            <Label>Source URL (Amazon, eBay, etc.)</Label>
            <Input name="source_url" placeholder="https://..." />
          </div>

          {category === 'automotive' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <Label>VIN Number</Label>
              <Input name="vin" placeholder="17-character VIN" maxLength={17} />
              <p className="text-xs text-slate-400 mt-2 italic">Required for car parts and vehicle sourcing.</p>
            </div>
          )}

          <div>
            <Label>Description</Label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="e.g. 2018 Toyota Camry Alternator, OEM only."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <Button type="submit" isLoading={loading} className="w-full">
            Submit Sourcing Request
          </Button>
        </form>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400 uppercase tracking-widest">Route233 Sourcing Engine v1.0</p>
      </div>
    </div>
  );
}
