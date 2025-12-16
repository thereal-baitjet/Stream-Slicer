import React from 'react';
import { FireIcon, CheckCircleIcon, PayPalIcon, LockIcon } from './Icons';

interface LandingPageProps {
  onEnterApp: () => void;
  onLogin: (provider: 'google' | 'github') => void; // Updated signature
  onBuyCredits: (amount: number) => void;
  onTryFree: () => void;
}

const PayPalButton: React.FC<{ 
  email: string; 
  amount?: string; 
  itemName: string; 
  label: string; 
  onSuccess: () => void;
  className?: string;
}> = ({ email, amount, itemName, label, onSuccess, className }) => {
  const baseUrl = "https://www.paypal.com/cgi-bin/webscr";
  const cmd = '_xclick';
  
  let href = `${baseUrl}?cmd=${cmd}&business=${email}&item_name=${encodeURIComponent(itemName)}&currency_code=USD`;
  if (amount) {
    href += `&amount=${amount}`;
  }

  return (
    <div className="w-full">
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={() => {
           setTimeout(() => onSuccess(), 2000); 
        }}
        className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-bold transition-all transform hover:scale-105 cursor-pointer ${className}`}
      >
        <PayPalIcon className="w-5 h-5" />
        {label}
      </a>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onLogin, onBuyCredits, onTryFree }) => {
  const email = "juansantos3131@yaoo.com";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-fuchsia-500/30 overflow-x-hidden flex flex-col">
      
      {/* Navbar */}
      <nav className="border-b border-zinc-900 bg-black/50 backdrop-blur fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center">
              <span className="font-bold text-white">S</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Stream<span className="text-fuchsia-500">Slicer</span></span>
          </div>
          <button 
            onClick={() => onLogin('github')}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Log In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-fuchsia-400 text-xs font-bold uppercase tracking-wider mb-4">
            <FireIcon className="w-4 h-4" />
            <span>Pay As You Go AI</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent pb-2">
            Turn Streams into<br/>
            <span className="text-white">Revenue.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Purchase credits to analyze hours of footage. Only pay for what you use. 
            Powered by Gemini 2.5 Flash.
          </p>
          
          <div className="flex flex-col items-center gap-3 pt-6">
             {/* Vercel-Style GitHub Button */}
             <button
               onClick={() => onLogin('github')}
               className="flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-md font-medium text-lg hover:bg-zinc-200 transition-all w-full max-w-xs justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
             >
               <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-black group-hover:scale-110 transition-transform"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.05-.015-2.055-3.33.72-4.035-1.605-4.035-1.605-.54-1.38-1.335-1.755-1.335-1.755-1.087-.75.075-.735.075-.735 1.2.09 1.83 1.245 1.83 1.245 1.065 1.83 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405 1.02 0 2.04.135 3 .405 2.28-1.56 3.285-1.23 3.285-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path></svg>
               Continue with GitHub
             </button>
             
             {/* Google Fallback */}
             <button
               onClick={() => onLogin('google')} 
               className="text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors"
             >
               or continue with Google
             </button>
          </div>
          
          <button 
             onClick={onTryFree}
             className="text-fuchsia-500 hover:text-fuchsia-400 text-sm underline underline-offset-4 pt-4"
           >
             Try Demo Mode
           </button>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 px-6 relative">
         <div className="absolute inset-0 bg-fuchsia-900/5 blur-[120px] pointer-events-none" />
         <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Credit Packs</h2>
              <p className="text-zinc-400">1000 Credits ≈ $1.00 USD value of processing.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
               
               {/* Starter */}
               <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 flex flex-col hover:border-zinc-700 transition-colors">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-zinc-300">Starter Pack</h3>
                    <div className="text-4xl font-bold text-white mt-2">$5</div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-sm text-zinc-400">
                      <CheckCircleIcon className="w-4 h-4 text-zinc-600" />
                      5,000 Credits
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-400">
                      <CheckCircleIcon className="w-4 h-4 text-zinc-600" />
                      Analyze ~2 hours of 1080p
                    </li>
                  </ul>
                  <button
                    onClick={() => onLogin('github')}
                    className="bg-zinc-100 hover:bg-white text-black w-full py-3 px-4 rounded-lg font-bold transition-all"
                  >
                    Get Started
                  </button>
               </div>

               {/* Pro - Featured */}
               <div className="bg-zinc-900 border border-fuchsia-500/30 rounded-2xl p-8 flex flex-col relative shadow-2xl shadow-fuchsia-900/20 scale-105">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Most Popular
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-fuchsia-300">Pro Pack</h3>
                    <div className="text-4xl font-bold text-white mt-2">$20</div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-sm text-zinc-200">
                      <CheckCircleIcon className="w-4 h-4 text-fuchsia-500" />
                      22,000 Credits (+10% Bonus)
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-200">
                      <CheckCircleIcon className="w-4 h-4 text-fuchsia-500" />
                      Analyze ~10 hours of content
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-200">
                      <CheckCircleIcon className="w-4 h-4 text-fuchsia-500" />
                      Priority Support
                    </li>
                  </ul>
                  <button
                    onClick={() => onLogin('github')}
                    className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white w-full py-3 px-4 rounded-lg font-bold transition-all"
                  >
                    Get Started
                  </button>
               </div>

               {/* Heavy User */}
               <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 flex flex-col hover:border-zinc-700 transition-colors">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-zinc-300">Agency Pack</h3>
                    <div className="text-4xl font-bold text-white mt-2">$50</div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-sm text-zinc-400">
                      <CheckCircleIcon className="w-4 h-4 text-zinc-600" />
                      60,000 Credits (+20% Bonus)
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-400">
                      <CheckCircleIcon className="w-4 h-4 text-zinc-600" />
                      Bulk Analysis Ready
                    </li>
                  </ul>
                  <button
                    onClick={() => onLogin('github')}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 w-full py-3 px-4 rounded-lg font-bold transition-all"
                  >
                    Get Started
                  </button>
               </div>

            </div>
         </div>
      </div>

      {/* Innovator Footer */}
      <footer className="w-full py-8 text-center bg-zinc-950 border-t border-zinc-900 mt-auto">
         <div className="max-w-2xl mx-auto px-6">
            <p className="text-fuchsia-500 text-xs font-bold uppercase tracking-widest mb-3">Beta Testing Phase</p>
            <p className="text-zinc-500 text-sm mb-2">
              This is in the testing phase for innovator users. We will add features and stuff.
            </p>
            <p className="text-zinc-400 text-sm">
              Just leave a comments to make this app more useful.<br/>
              DM <a href="https://www.instagram.com/mr.j.c.santos/" target="_blank" rel="noopener noreferrer" className="text-zinc-200 font-bold hover:text-fuchsia-400 transition-colors">@mr.j.c.santos</a> Subject: <span className="text-zinc-200">StreamSlicer</span>
            </p>
         </div>
      </footer>

    </div>
  );
};