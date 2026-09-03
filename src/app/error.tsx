'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070A] p-4 text-center">
      <div className="bg-surface border border-white/5 p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <h2 className="text-3xl font-black text-white mb-4">Something went wrong!</h2>
        <p className="text-gray-400 mb-8 text-sm">
          We encountered an unexpected error. Please try again or return home.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 bg-gradient-to-r from-[#00F2FE] to-[#00c8d8] rounded-xl text-black font-bold shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}
