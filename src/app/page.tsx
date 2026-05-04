import Link from 'next/link';
import { Button } from '@/components/ui';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Uber Style */}
      <section className="pt-32 pb-40 px-6 bg-black relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-in fade-in duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-sm text-xs font-bold uppercase tracking-wider mb-8">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Operations Active
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight tracking-tight mb-8">
              Sourcing from the US, <br/>made simple.
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-xl font-normal">
              Find, verify, and ship auto parts and electronics from Philadelphia to Ghana. One landed cost. No hidden fees.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/inquire">
                <Button className="w-full sm:w-auto !bg-white !text-black text-lg py-7 px-10 rounded-none hover:!bg-gray-200 transition-colors font-semibold border-none">
                  Request a Quote
                </Button>
              </Link>
              <Link href="/track">
                <Button variant="outline" className="w-full sm:w-auto !bg-black border-2 !border-white !text-white text-lg py-7 px-10 rounded-none hover:!bg-white hover:!text-black transition-colors font-semibold">
                  Track Delivery
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative animate-in fade-in duration-700 delay-300 lg:ml-12 hidden md:block">
            {/* Flat Solid Card */}
            <div className="bg-white p-10 border border-gray-200">
               <div className="flex justify-between items-start mb-12 border-b border-gray-200 pb-6">
                 <div>
                   <h3 className="text-2xl font-bold text-black tracking-tight">MacBook Pro M2</h3>
                   <p className="text-gray-500 font-medium mt-1">Refurbished • Grade A</p>
                 </div>
                 <div className="bg-green-100 text-green-800 text-xs px-3 py-1 font-bold uppercase">
                   In Transit
                 </div>
               </div>

               <div className="mb-10">
                 <p className="text-gray-500 text-sm font-bold uppercase mb-2">Total Landed Cost</p>
                 <p className="text-black text-5xl font-bold tracking-tighter">₵24,500</p>
               </div>

               <div className="space-y-6 border-t border-gray-200 pt-8">
                 <div className="flex items-start gap-4">
                   <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shrink-0 mt-1">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                   </div>
                   <div>
                     <p className="text-black font-bold">Cleared US Customs</p>
                     <p className="text-gray-500 text-sm mt-1">Philadelphia Hub</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-4">
                   <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center shrink-0 mt-1">
                     <div className="w-2 h-2 rounded-full bg-black"></div>
                   </div>
                   <div>
                     <p className="text-black font-bold">Air Freight to KIA</p>
                     <p className="text-gray-500 text-sm mt-1">Est. Arrival: Tomorrow</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Minimalist Grid */}
      <section className="py-32 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 tracking-tight">Zero friction sourcing.</h2>
            <p className="text-gray-600 max-w-2xl text-xl leading-relaxed font-normal">
              We handle the complicated logistics. You just tell us what you need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Provide Link",
                desc: "Send an Amazon/eBay link or car VIN. We verify US availability and Ghana customs regulations immediately.",
              },
              {
                step: "2",
                title: "Get Quote",
                desc: "Our team sources the best deal. You receive a guaranteed GHS price including purchase, shipping, and duty.",
              },
              {
                step: "3",
                title: "Pay & Track",
                desc: "Pay securely via MoMo. Watch your item's journey from our warehouse directly to your hands.",
              }
            ].map((item, idx) => (
              <div key={idx} className="group">
                <div className="mb-6">
                  <span className="text-black font-bold text-2xl">{item.step}.</span>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4 tracking-tight">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed font-normal text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep Dive Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-16 tracking-tight">
                The Route233 Advantage
              </h2>
              <div className="space-y-12">
                {[
                  { t: "Tax-Free Sourcing", d: "We utilize our Delaware warehouse to zero out US sales tax, saving you 8-10% upfront on every purchase." },
                  { t: "Physical Quality Control", d: "Every refurbished electronic device and car part is physically inspected at our Philly hub before it boards a plane." },
                  { t: "Locked-in Cedi Payments", d: "Pay in GHS using Mobile Money. Our high-volume currency hedging means no dollar card hassles and better rates." }
                ].map((item, idx) => (
                  <div key={idx} className="border-l-4 border-black pl-6 py-2">
                    <h4 className="font-bold text-2xl text-black mb-3">{item.t}</h4>
                    <p className="text-gray-600 leading-relaxed font-normal text-lg">{item.d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black p-16 text-white h-full flex flex-col justify-center">
              <h3 className="text-5xl font-bold mb-8 leading-tight tracking-tight">Ready to upgrade your sourcing pipeline?</h3>
              <p className="text-gray-400 mb-12 text-xl leading-relaxed font-normal">Join the hundreds of Ghanaians who have stopped relying on family members abroad and started using a professional logistics pipeline.</p>
              
              <Link href="/inquire" className="block w-full">
                <Button className="w-full !bg-white !text-black hover:!bg-gray-200 py-8 text-xl font-bold rounded-none transition-colors border-none">
                  Request a Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
