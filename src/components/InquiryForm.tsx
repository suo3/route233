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
    <div className="max-w-2xl mx-auto p-2 sm:p-4 md:p-6">
      <div className="bg-white border border-gray-300 p-4 md:p-10">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-1 tracking-tight">Request a Quote</h1>
          <p className="text-gray-500 text-xs md:text-sm">Sourcing, verification, and shipping handled.</p>
        </div>

        {result && (
          <div className={`mb-6 p-4 border ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <p className="font-bold text-base mb-1">{result.success ? 'Request Received' : 'Action Required'}</p>
            <p className="text-xs">{result.message || (result.success ? 'We are reviewing your request.' : '')}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-[10px] uppercase tracking-wider mb-2 block">Category</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['general', 'electronics', 'automotive'] as Category[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-1 border-2 transition-all capitalize font-bold text-[10px] md:text-xs ${
                    category === cat 
                      ? 'border-yellow-400 bg-yellow-400 text-black' 
                      : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <input type="hidden" name="category" value={category} />
            </div>
          </div>

          {isAnonymous && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-100">
                <div className="col-span-full border-b border-gray-200 pb-2 mb-2">
                    <h3 className="font-bold text-xs text-black">Contact Info</h3>
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] uppercase">Email</Label>
                    <Input name="contact_email" type="email" placeholder="you@example.com" className="h-10 text-sm" />
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] uppercase">Phone / WhatsApp</Label>
                    <Input name="contact_phone" placeholder="+233..." className="h-10 text-sm" />
                </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase">Source URL (Optional)</Label>
              <Input name="source_url" placeholder="Paste link here" className="h-10 text-sm rounded-none border-gray-300 focus:border-black" />
            </div>

            {category === 'automotive' && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                <Label className="text-[10px] uppercase">VIN Number</Label>
                <Input name="vin" placeholder="17-character VIN" maxLength={17} required className="h-10 text-sm rounded-none border-gray-300 focus:border-black" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] uppercase">Detailed Description</Label>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="What are we looking for?"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-black text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] uppercase">Reference Photos</Label>
            <div className="relative border-2 border-gray-200 border-dashed bg-gray-50 hover:bg-gray-100 transition-colors p-4 text-center">
              <input name="images" type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
              <div className="flex items-center justify-center gap-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-gray-500 font-bold uppercase">Tap to upload photos</p>
              </div>
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-4 text-sm font-bold bg-black text-white hover:bg-gray-800 rounded-none border-none uppercase tracking-widest">
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
