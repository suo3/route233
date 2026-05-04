import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
}

export const Button = ({ variant = 'primary', isLoading, children, className, ...props }: ButtonProps) => {
  const baseStyles = "px-6 py-3 font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 border-black active:scale-[0.98]",
    secondary: "bg-gray-100 text-black hover:bg-gray-200 border-gray-100 active:scale-[0.98]",
    accent: "bg-yellow-400 text-black hover:bg-yellow-500 border-yellow-400 active:scale-[0.98]",
    outline: "bg-white border-gray-300 text-black hover:border-black active:scale-[0.98]",
    danger: "bg-red-50 border-red-100 text-red-600 hover:bg-red-100 active:scale-[0.98]"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </span>
      ) : children}
    </button>
  );
};

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props} 
    className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all ${props.className}`}
  />
);

export const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">
    {children}
  </label>
);
