import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl">
        <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block">
          Now Live: USA to Ghana
        </div>
        <h1 className="text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Route<span className="text-blue-600">233</span>
        </h1>
        <p className="text-xl text-slate-600 mb-12 leading-relaxed">
          The specialized sourcing and logistics platform for refurbished electronics and automotive parts. 
          Bridging the gap between Philadelphia and Accra.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/inquire" className="group p-8 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200 hover:border-blue-600 transition-all text-left">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              🚀
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Customer Portal</h3>
            <p className="text-slate-500 mb-6">Submit your sourcing request and get a landed cost quote in GHS.</p>
            <span className="text-blue-600 font-bold flex items-center gap-2">
              Start Sourcing <span>&rarr;</span>
            </span>
          </Link>

          <Link href="/admin/dashboard" className="group p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all text-left">
            <div className="w-12 h-12 bg-slate-800 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-slate-700">
              🛡️
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h3>
            <p className="text-slate-400 mb-6">Review inquiries, check US availability, and manage shipments.</p>
            <span className="text-white/50 font-bold flex items-center gap-2">
              Access Hub <span>&rarr;</span>
            </span>
          </Link>
        </div>
      </div>

      <footer className="mt-20 border-t border-slate-200 pt-8 w-full max-w-3xl text-slate-400 text-sm">
        &copy; 2026 Akanexus Studio &bull; Route233 Operations (Philly Hub)
      </footer>
    </main>
  );
}
