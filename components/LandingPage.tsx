import React from 'react';
import { FireIcon, CheckCircleIcon, PayPalIcon, LockIcon } from './Icons';

interface LandingPageProps {
  onEnterApp: () => void;
  onBuyCredits: (amount: number) => void;
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

  // NOTE: In a real app, this would use PayPal Webhooks to verify payment server-side.
  // For this MVP, clicking the button simulates the intent, and we provide a "Claim" button for the user to get their credits.
  return (
    <div className="w-full">
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={() => {
           // Simulate a delay for the user to pay, then trigger callback
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

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onBuyCredits }) => {
  const email = "juansantos3131@yaoo.com";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-fuchsia-500/30 overflow-x-hidden">
      
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
            onClick={onEnterApp}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Launch App
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
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
             <a href="#pricing" className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:shadow-[0_0_40px_-10px_rgba(232,121,249,0.5)]">
               Buy Credits
             </a>
             <button onClick={onEnterApp} className="px-8 py-4 rounded-full font-bold text-lg text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all">
               Launch Dashboard
             </button>
          </div>
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
                  <PayPalButton 
                    email={email}
                    amount="5.00"
                    itemName="StreamSlicer 5000 Credits"
                    label="Buy 5,000 Credits"
                    onSuccess={() => onBuyCredits(5000)}
                    className="bg-zinc-100 hover:bg-white text-black"
                  />
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
                  <PayPalButton 
                    email={email}
                    amount="20.00"
                    itemName="StreamSlicer 22000 Credits"
                    label="Buy 22,000 Credits"
                    onSuccess={() => onBuyCredits(22000)}
                    className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white"
                  />
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
                  <PayPalButton 
                    email={email}
                    amount="50.00"
                    itemName="StreamSlicer 60000 Credits"
                    label="Buy 60,000 Credits"
                    onSuccess={() => onBuyCredits(60000)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                  />
               </div>

            </div>
         </div>
      </div>

    </div>
  );
};