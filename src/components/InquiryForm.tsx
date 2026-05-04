'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button, Input, Label } from '@/components/ui';

type Category = 'electronics' | 'automotive' | 'general';

export default function InquiryForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [category, setCategory] = useState<Category>('general');
  const [result, setResult] = useState<{ success: boolean; message?: string; reason?: string } | null>(null);

  // Check login status on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setIsAnonymous(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const files = formData.getAll('images') as File[];
    const imageUrls: string[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const customer_id = user?.id;
      let contact_email = formData.get('contact_email') as string | null;
      let contact_phone = formData.get('contact_phone') as string | null;

      if (!customer_id && !contact_email && !contact_phone) {
        throw new Error('Please provide an email or phone number so we can contact you with the quote.');
      }

      // 1. Upload images to Supabase Storage
      for (const file of files) {
        if (file.size > 0) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${customer_id || 'anonymous'}/${fileName}`;

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
        customer_id,
        contact_email,
        contact_phone,
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

      if (json.success) {
        if (!customer_id) {
            setResult({ success: true, message: 'Request received! We will contact you via your provided email or phone with your quote.'});
            (e.target as HTMLFormElement).reset();
            setCategory('general');
        } else {
            router.push('/track?message=Request Received! We are reviewing your request. Check your locker for updates.&type=success');
        }
      } else {
        setResult({
          success: json.success,
          message: json.message,
          reason: json.reason,
        });
      }
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
      <div className="bg-white border border-gray-300 p-12">
        <div className="mb-10 border-b border-gray-200 pb-8">
          <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">Request a Quote</h1>
          <p className="text-gray-600">Tell us what you need from the US. We'll handle the sourcing, verification, and shipping.</p>
        </div>

        {result && (
          <div className={`mb-10 p-6 border ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <p className="font-bold text-lg mb-1">{result.success ? 'Request Received' : 'Action Required'}</p>
            <p className="text-sm">{result.message || (result.success ? 'We are reviewing your request. Check your locker for updates.' : '')}</p>
            {result.reason && (
              <div className="mt-4 p-4 bg-white border border-red-200 text-xs font-mono text-red-900">
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
                  className={`py-4 px-4 border-2 transition-all capitalize font-bold text-sm ${
                    category === cat 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <input type="hidden" name="category" value={category} />
            </div>
          </div>

          {isAnonymous && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 border border-gray-200">
                <div className="col-span-full">
                    <h3 className="font-bold text-black">Contact Information</h3>
                    <p className="text-xs text-gray-500">Since you are not logged in, please provide contact details so we can send your quote.</p>
                </div>
                <div>
                    <Label>Email Address</Label>
                    <Input name="contact_email" type="email" placeholder="you@example.com" />
                </div>
                <div>
                    <Label>Phone Number (WhatsApp preferred)</Label>
                    <Input name="contact_phone" placeholder="+1234567890" />
                </div>
            </div>
          )}

          <div>
            <Label>Source URL (Optional)</Label>
            <Input name="source_url" placeholder="e.g. Amazon, eBay, or Micro Center link" className="rounded-none border-gray-300 focus:border-black focus:ring-black" />
            <p className="text-[10px] text-gray-500 mt-2 font-medium">Providing a link helps us find the exact item faster.</p>
          </div>

          {category === 'automotive' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <Label>VIN Number</Label>
              <Input name="vin" placeholder="17-character VIN" maxLength={17} required className="rounded-none border-gray-300 focus:border-black focus:ring-black" />
              <p className="text-[10px] text-gray-500 mt-2 italic">Required for car parts and vehicle sourcing.</p>
            </div>
          )}

          <div>
            <Label>Detailed Description</Label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="e.g. 2018 Toyota Camry Alternator (OEM), or Refurbished MacBook Pro M1 16GB RAM."
              className="w-full px-5 py-4 bg-white border border-gray-300 rounded-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-black"
            />
          </div>

          <div>
            <Label>Upload Reference Photos (Optional)</Label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex justify-center text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-transparent font-bold text-black hover:underline">
                    <span>Upload files</span>
                    <input name="images" type="file" multiple className="sr-only" accept="image/*" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-6 text-lg font-bold bg-black text-white hover:bg-gray-800 rounded-none border-none">
            Submit Request
          </Button>
        </form>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Route233 Sourcing Engine &bull; USA &bull; GHA</p>
      </div>
    </div>
  );
}
