import InquiryForm from '@/components/InquiryForm';
import Link from 'next/link';

export default function InquirePage() {
  return (
    <main className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors mb-8 group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Home
        </Link>
        <InquiryForm />
      </div>
    </main>
  );
}
