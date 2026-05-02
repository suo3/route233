'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
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
    const files = formData.getAll('images') as File[];
    const imageUrls: string[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login to submit a request');

      // 1. Upload images to Supabase Storage
      for (const file of files) {
        if (file.size > 0) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('route233_inquiry_images')
            .upload(filePath, file);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('route233_inquiry_images')
              .getPublicUrl(filePath);
            imageUrls.push(publicUrl);
          }
        }
      }

      const data = {
        customer_id: user.id,
        category: formData.get('category'),
        source_url: formData.get('source_url'),
        description: formData.get('description'),
        vin: formData.get('vin'),
        images: imageUrls,
      };

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit request. Please try again.');
      }

      setResult({
        success: json.success,
        message: json.message,
        reason: json.reason,
      });
    } catch (err: any) {
      console.error('Submission Error:', err);
      let userFriendlyMessage = 'An unexpected error occurred. Please try again or contact support.';
      
      if (err.message?.includes('recursion') || err.message?.includes('policy')) {
        userFriendlyMessage = 'System configuration error. Our team has been notified. Please try again in a few minutes.';
      } else if (err.message) {
        userFriendlyMessage = err.message;
      }

      setResult({ success: false, message: userFriendlyMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 p-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Request a Quote</h1>
          <p className="text-slate-500">Tell us what you need from the US. We'll handle the sourcing, verification, and shipping.</p>
        </div>

        {result && (
          <div className={`mb-10 p-6 rounded-[2rem] border ${result.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <p className="font-bold text-lg mb-1">{result.success ? 'Request Received' : 'Action Required'}</p>
            <p className="text-sm opacity-90">{result.message || (result.success ? 'We are reviewing your request. Check your locker for updates.' : '')}</p>
            {result.reason && (
              <div className="mt-4 p-4 bg-white/50 rounded-2xl border border-red-100 text-xs font-mono">
                FLAGGED: {result.reason}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <Label>Category</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['general', 'electronics', 'automotive'] as Category[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-4 px-4 rounded-2xl border-2 transition-all capitalize font-bold text-sm ${
                    category === cat 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <input type="hidden" name="category" value={category} />
            </div>
          </div>

          <div>
            <Label>Source URL (Optional)</Label>
            <Input name="source_url" placeholder="e.g. Amazon, eBay, or Micro Center link" />
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Providing a link helps us find the exact item faster.</p>
          </div>

          {category === 'automotive' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <Label>VIN Number</Label>
              <Input name="vin" placeholder="17-character VIN" maxLength={17} />
              <p className="text-[10px] text-slate-400 mt-2 italic">Required for car parts and vehicle sourcing.</p>
            </div>
          )}

          <div>
            <Label>Detailed Description</Label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="e.g. 2018 Toyota Camry Alternator (OEM), or Refurbished MacBook Pro M1 16GB RAM."
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
            />
          </div>

          <div>
            <Label>Upload Reference Photos (Optional)</Label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-[1.5rem] hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-slate-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-bold text-blue-600 hover:text-blue-500">
                    <span>Upload files</span>
                    <input name="images" type="file" multiple className="sr-only" accept="image/*" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-5 text-xl rounded-[1.5rem] shadow-xl shadow-blue-500/20">
            Submit Sourcing Request
          </Button>
        </form>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Route233 Sourcing Engine &bull; USA &bull; GHA</p>
      </div>
    </div>
  );
}
