'use client';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070A] p-4 text-center">
      <div className="bg-surface border border-white/5 p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] to-[#00c8d8] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 text-sm">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <button
          onClick={() => router.push('/')}
          className="w-full py-3 bg-gradient-to-r from-[#00F2FE] to-[#00c8d8] rounded-xl text-black font-bold shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] transition-all"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}
