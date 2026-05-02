import Link from 'next/link';
import { Button, Input, Label } from '@/components/ui';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-12 group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Home
        </Link>
        
        <div className="grid lg:grid-cols-2 gap-20">
          <div>
            <h1 className="text-5xl font-black text-slate-900 mb-8 tracking-tight">Get in Touch</h1>
            <p className="text-xl text-slate-600 mb-12 leading-relaxed">
              Have questions about a specific car part or sourcing electronics? Our teams in Philly and Accra are ready to help.
            </p>

            <div className="space-y-10">
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">📍</div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Philadelphia Hub</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Logistics & Verification Center<br />
                    West Philadelphia, PA 19104
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">🇬🇭</div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Accra Pickup Point</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    East Legon, Greater Accra<br />
                    Ghana
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">📱</div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">WhatsApp Business</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    +233 24 400 0000<br />
                    Mon - Sat, 9am - 6pm GMT
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-12 rounded-[3rem] border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Send us a message</h3>
            <form className="space-y-6">
              <div>
                <Label>Your Name</Label>
                <Input placeholder="Kwesi Mensah" />
              </div>
              <div>
                <Label>WhatsApp Number</Label>
                <Input placeholder="024 XXX XXXX" />
              </div>
              <div>
                <Label>How can we help?</Label>
                <textarea 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 transition-all"
                  rows={4}
                  placeholder="Tell us about the item you're looking for..."
                />
              </div>
              <Button className="w-full bg-blue-600 py-6 text-lg rounded-2xl shadow-xl shadow-blue-500/10">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
