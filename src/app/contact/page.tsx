'use client';

import Link from 'next/link';
import { Button, Input, Label } from '@/components/ui';
import { useState } from 'react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string;

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_phone: phone,
          category: 'general',
          description: `Name: ${name}\n\nMessage: ${message}`,
        }),
      });

      let data;
      const textResponse = await res.text();
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        throw new Error('Server error: unable to send message right now.');
      }
      
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to send message');

      setResult({ success: true, message: 'Message sent successfully! We will get back to you soon on WhatsApp.' });
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors mb-12 group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Home
        </Link>

        <div className="grid lg:grid-cols-2 gap-20">
          <div>
            <h1 className="text-5xl font-bold text-black mb-8 tracking-tight">Get in Touch</h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Have questions about a specific car part or sourcing electronics? Our teams in the US and Accra are ready to help.
            </p>

            <div className="space-y-10">
              <div className="flex gap-6">
                <div className="w-14 h-14 border border-gray-200 flex items-center justify-center text-2xl">📍</div>
                <div>
                  <h4 className="font-bold text-black mb-1">US Sourcing Hub</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Logistics & Verification Center<br />
                    United States of America
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-14 h-14 border border-gray-200 flex items-center justify-center text-2xl">🇬🇭</div>
                <div>
                  <h4 className="font-bold text-black mb-1">Accra Pickup Point</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    East Legon, Greater Accra<br />
                    Ghana
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-14 h-14 border border-gray-200 flex items-center justify-center text-2xl">📱</div>
                <div>
                  <h4 className="font-bold text-black mb-1">WhatsApp Business</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    +233 53 666 9982<br />
                    Mon - Sat, 9am - 6pm GMT
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 border border-gray-200">
            <h3 className="text-2xl font-bold text-black mb-8">Send us a message</h3>

            {result && (
              <div className={`mb-6 p-4 border ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                <p className="font-bold text-sm">{result.message}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label>Your Name</Label>
                <Input name="name" required placeholder="Kwesi Mensah" className="rounded-none border-gray-300 focus:border-black focus:ring-black" />
              </div>
              <div>
                <Label>WhatsApp Number</Label>
                <Input name="phone" required placeholder="024 XXX XXXX" className="rounded-none border-gray-300 focus:border-black focus:ring-black" />
              </div>
              <div>
                <Label>How can we help?</Label>
                <textarea
                  name="message"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-black transition-all"
                  rows={4}
                  placeholder="Tell us about the item you're looking for..."
                />
              </div>
              <Button type="submit" isLoading={loading} className="w-full bg-black text-white py-6 text-lg rounded-none border-none hover:bg-gray-800">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
