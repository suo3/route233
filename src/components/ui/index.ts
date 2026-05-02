import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
}

export const Button = ({ variant = 'primary', isLoading, children, className, ...props }: ButtonProps) => {
  const baseStyles = "px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98]",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 active:scale-[0.98]",
    outline: "border-2 border-slate-200 text-slate-700 hover:border-blue-600 hover:text-blue-600 active:scale-[0.98]",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 active:scale-[0.98]"
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
    className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${props.className}`}
  />
);

export const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">
    {children}
  </label>
);
