import Link from 'next/link';
import { Button, Input, Label } from '@/components/ui';

export default function ContactPage() {
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
              Have questions about a specific car part or sourcing electronics? Our teams in Philly and Accra are ready to help.
            </p>

            <div className="space-y-10">
              <div className="flex gap-6">
                <div className="w-14 h-14 border border-gray-200 flex items-center justify-center text-2xl">📍</div>
                <div>
                  <h4 className="font-bold text-black mb-1">Philadelphia Hub</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Logistics & Verification Center<br />
                    West Philadelphia, PA 19104
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
                    +233 24 400 0000<br />
                    Mon - Sat, 9am - 6pm GMT
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 border border-gray-200">
            <h3 className="text-2xl font-bold text-black mb-8">Send us a message</h3>
            <form className="space-y-6">
              <div>
                <Label>Your Name</Label>
                <Input placeholder="Kwesi Mensah" className="rounded-none border-gray-300 focus:border-black focus:ring-black" />
              </div>
              <div>
                <Label>WhatsApp Number</Label>
                <Input placeholder="024 XXX XXXX" className="rounded-none border-gray-300 focus:border-black focus:ring-black" />
              </div>
              <div>
                <Label>How can we help?</Label>
                <textarea 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-black transition-all"
                  rows={4}
                  placeholder="Tell us about the item you're looking for..."
                />
              </div>
              <Button className="w-full bg-black text-white py-6 text-lg rounded-none border-none hover:bg-gray-800">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
