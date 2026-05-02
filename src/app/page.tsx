import Link from 'next/link';
import { Button } from '@/components/ui';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Dark Premium */}
      <section className="pt-32 pb-40 px-6 bg-slate-900 relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              USA to Ghana Operations Active
            </div>
            <h1 className="text-7xl font-black text-white leading-[1.05] tracking-tight mb-8">
              Your Personal <span className="text-blue-500">Sourcing Agent</span> in the United States.
            </h1>
            <p className="text-xl text-slate-400 mb-12 leading-relaxed max-w-xl">
              Stop worrying about international shipping. We find, verify, and ship refurbished electronics and automotive parts from Philadelphia and Delaware directly to your doorstep in Ghana.
            </p>
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
              <Link href="/inquire">
                <Button className="w-full bg-blue-600 text-white text-lg py-7 px-10 rounded-2xl shadow-2xl shadow-blue-500/40 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all border-none">
                  Submit a Request
                </Button>
              </Link>
              <Link href="/track">
                <Button variant="outline" className="w-full border-2 border-slate-700 text-white text-lg py-7 px-10 rounded-2xl hover:bg-slate-800 transition-all">
                  Track My Order
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-800" />
                ))}
              </div>
              <p className="text-sm text-slate-400">
                <span className="font-bold text-white">500+ items</span> successfully delivered to Accra & Kumasi.
              </p>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div className="aspect-square bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[4rem] rotate-3 shadow-2xl shadow-blue-500/20 relative overflow-hidden border border-white/10">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
               <div className="absolute top-12 left-12 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-64 shadow-2xl">
                 <p className="text-white/60 text-xs font-bold uppercase mb-2">Last Quote Issued</p>
                 <p className="text-white text-2xl font-black">₵1,450.00</p>
                 <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-400 w-2/3"></div>
                 </div>
                 <p className="text-white/40 text-[10px] mt-2 italic">Alternator for 2018 Toyota Camry</p>
               </div>
               
               <div className="absolute bottom-12 right-12 bg-white p-8 rounded-3xl w-72 shadow-2xl rotate-[-6deg]">
                 <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center font-bold">📦</div>
                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-black">IN TRANSIT</span>
                 </div>
                 <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Current Location</p>
                 <p className="text-slate-900 font-bold">Departed Philadelphia Hub</p>
                 <p className="text-slate-400 text-[9px] mt-2">Est. Delivery: 4 Days (Accra)</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Light Clean */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">How Route233 Works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-xl leading-relaxed">We've simplified the US sourcing experience. No hidden fees, no port surprises.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Tell us what you need",
                desc: "Paste an Amazon link or describe a car part. Our 'Gatekeeper' AI instantly checks for shipping feasibility and car age regulations.",
                icon: "📝"
              },
              {
                step: "02",
                title: "Get a 'Landed Cost' Quote",
                desc: "Our Philly-based admins source the best deal. You get one price in GHS that includes purchase, shipping, and all clearing fees.",
                icon: "💰"
              },
              {
                step: "03",
                title: "Pay & Track to Pickup",
                desc: "Pay securely via MoMo. Track your item from our Philly Hub to your local pickup point in Accra or Kumasi via your digital locker.",
                icon: "🚚"
              }
            ].map((item, idx) => (
              <div key={idx} className="group relative bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">{item.icon}</div>
                <div className="text-blue-600 font-black text-xs mb-4 tracking-[0.2em] uppercase">{item.step}</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section - Split Design */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-5xl font-black text-slate-900 mb-12 tracking-tight leading-tight">The Route233 Advantage</h2>
              <div className="grid gap-10">
                {[
                  { t: "Tax-Free Sourcing", d: "We utilize our Delaware warehouse to zero out US sales tax, saving you 8-10% on every purchase.", i: "🛡️" },
                  { t: "Verified Philly Hub", d: "Physical inspections of every refurbished electronic and car part before it leaves the US.", i: "🏙️" },
                  { t: "MoMo & Local Payments", d: "Pay in GHS using Paystack. No need for dollar cards or high bank exchange rates.", i: "📱" }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-8">
                    <div className="w-16 h-16 bg-white rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center justify-center text-3xl shrink-0">{item.i}</div>
                    <div>
                      <h4 className="font-bold text-xl text-slate-900 mb-2">{item.t}</h4>
                      <p className="text-slate-500 leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-[4rem] p-16 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] group-hover:bg-blue-600/30 transition-all" />
              <h3 className="text-4xl font-black mb-6 leading-tight relative z-10">Ready to start sourcing?</h3>
              <p className="text-slate-400 mb-12 text-lg leading-relaxed relative z-10">Join 500+ Ghanaians who trust Route233 for their specialized sourcing needs from the USA.</p>
              <Link href="/inquire" className="relative z-10">
                <Button className="w-full bg-blue-600 py-8 text-xl rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-500/20 transition-all border-none">
                  Submit My First Request
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
