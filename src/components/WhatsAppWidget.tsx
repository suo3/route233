'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function WhatsAppWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  
  // The WhatsApp number (without the +)
  const phoneNumber = '233536669982';
  
  // Custom message based on the page they are on
  let prefilledMessage = 'Hello 233 Logistics, I need help with sourcing/shipping.';
  if (pathname === '/track') {
    prefilledMessage = 'Hello, I need an update on my shipment.';
  } else if (pathname === '/inquire') {
    prefilledMessage = 'Hello, I have a question about requesting a quote.';
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(prefilledMessage)}`;

  useEffect(() => {
    // Delay showing the widget slightly for a smooth entrance
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-8 fade-in duration-500">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
        aria-label="Chat with us on WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8"
        >
          <path d="M12.01 2.014a9.966 9.966 0 0 0-8.52 15.012l-1.42 5.195 5.313-1.394a9.972 9.972 0 1 0 4.627-18.813zM17.47 16.2c-.25.703-1.455 1.34-2.025 1.41-.53.064-1.205.127-3.418-.79-2.678-1.106-4.38-3.83-4.52-4.016-.14-.187-1.077-1.436-1.077-2.738 0-1.303.68-1.947.925-2.203.246-.257.535-.32.712-.32.176 0 .352.004.506.012.163.007.382-.06.58.417.203.488.694 1.696.755 1.818.06.123.1.267.027.425-.07.158-.106.257-.21.38-.106.123-.223.268-.316.368-.102.106-.21.222-.09.43.12.206.536.883 1.144 1.427.783.702 1.448.918 1.662 1.022.215.105.34.09.467-.058.127-.147.544-.633.69-.85.146-.217.292-.18.49-.105.197.074 1.25.59 1.464.697.214.106.356.158.408.246.052.088.052.513-.198 1.217z" />
        </svg>
      </a>
      
      {/* Tooltip */}
      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-max">
        <div className="bg-white text-black text-sm font-bold px-4 py-2 shadow-lg border border-gray-100 rounded-md">
          Chat with us!
        </div>
      </div>
    </div>
  );
}
