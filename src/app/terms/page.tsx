import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-3xl mx-auto border border-gray-200 p-12">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors mb-12 group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Home
        </Link>
        
        <h1 className="text-5xl font-bold text-black mb-8 tracking-tight">Terms of Service</h1>
        <p className="text-gray-500 mb-12">Last Updated: May 2, 2026</p>

        <div className="space-y-12 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">1. Sourcing and Procurement</h2>
            <p>
              233 Logistics acts as a sourcing agent and logistics facilitator. When you submit an inquiry, we provide a "Landed Cost" quote which includes the purchase price, US domestic shipping, international freight, and estimated Ghana customs duties. We are not the original manufacturer of the items sourced.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">2. Payment and Quotes</h2>
            <p>
              All quotes are valid for 48 hours due to the volatile nature of electronics pricing and currency exchange rates. Payments must be made in full via our approved payment partners (Paystack) before sourcing commences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">3. Prohibited Items</h2>
            <p>
              233 Logistics complies with all US Export and Ghana Import regulations. We do not source or ship:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Hazardous materials or chemicals</li>
              <li>Perishable goods</li>
              <li>Counterfeit products</li>
              <li>Items older than 10 years (specifically for automotive parts per Ghana regulations)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">4. Shipping and Verification</h2>
            <p>
              Every item is physically inspected at our US Hub. We verify that the item matches your request and is in the condition described by the seller. If an item arrives at our hub damaged or incorrect, we will handle the US-side return and notify you immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">5. Customs and Delivery</h2>
            <p>
              While we provide an estimated "Landed Cost" that includes duties, Ghana Customs final valuations may vary. 233 Logistics covers standard duty variations, but in the event of extreme revaluation by customs authorities, we will consult with the customer before clearing.
            </p>
          </section>

          <section className="bg-gray-50 p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-black mb-4">6. Refunds</h2>
            <p>
              Once an item has been purchased in the US and verified at our hub, the sourcing fee is non-refundable. If we are unable to source the item after payment, a full refund will be issued via Paystack.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

