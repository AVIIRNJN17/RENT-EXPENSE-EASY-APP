import React, { useState } from 'react';
import { Sparkles, Gift, X, Award, Lightbulb, Heart, Zap, ArrowRight, Printer } from 'lucide-react';

interface FloatingCatGiftProps {
  onOpenPrinterHub: () => void;
  onOpenExpenseModal: () => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

const SAVING_TIPS = [
  {
    title: 'सबमीटर रीडिंग समय पर लें ⚡',
    tip: 'हर महीने की 1 तारीख को बिजली सबमीटर की रीडिंग नोट कर लें ताकि मकान मालिक से बिल को लेकर कभी भी विवाद न हो!'
  },
  {
    title: 'राशन थोक में खरीदें 🌾',
    tip: 'आटा, चावल, और तेल जैसी बुनियादी सामग्री 5-10 किलो के पैक में होलसेल मंडी से लें, इससे 15-25% तक बचत होती है!'
  },
  {
    title: 'गीजर और AC टाइमर का उपयोग 🔌',
    tip: 'नहाने से 10 मिनट पहले गीजर बंद कर दें। केवल 1 घंटे कम AC/गीजर चलाने से महीने में 30-40 यूनिट बिजली बचती है!'
  },
  {
    title: 'दैनिक चाय-नाश्ता ट्रैक करें ☕',
    tip: 'रोज़ाना ₹40-50 के छोटे ख़र्च महीने में ₹1500 बन जाते हैं। ऐप में तुरंत Quick Add करने से बजट कभी नहीं बिगड़ता!'
  },
  {
    title: 'UPI हिस्ट्री का मिलान 💳',
    tip: 'हफ्ते में एक बार अपने UPI पेमेंट्स और ऐप के दैनिक ख़र्चों का मिलान करें ताकि हर एक रुपये का हिसाब रहे!'
  }
];

export default function FloatingCatGift({
  onOpenPrinterHub,
  onOpenExpenseModal,
  showToast
}: FloatingCatGiftProps) {
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [heartPops, setHeartPops] = useState(false);

  const handleCatClick = () => {
    // Random tip
    setTipIndex(Math.floor(Math.random() * SAVING_TIPS.length));
    setHeartPops(true);
    setTimeout(() => setHeartPops(false), 1200);
    setIsGiftModalOpen(true);
    showToast('Meow! Cat opened your Lucky Gift Box! 🎁🐾', 'success');
  };

  const currentTip = SAVING_TIPS[tipIndex];

  return (
    <>
      {/* FLOATING 3D-FEELING CAT & GIFT BOX ON SCREEN */}
      <div
        className={`fixed z-40 transition-all duration-300 ${
          isMinimized
            ? 'bottom-24 md:bottom-6 right-2 sm:right-4'
            : 'bottom-20 md:bottom-8 right-3 sm:right-6'
        }`}
      >
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold px-3 py-2 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-white"
            title="Wake up 3D Mascot Cat"
          >
            <span>🐱🐾</span>
            <span className="text-[11px]">Gift Cat</span>
          </button>
        ) : (
          <div className="relative group select-none">
            {/* Pop-up heart animation */}
            {heartPops && (
              <div className="absolute -top-10 left-6 text-rose-500 text-2xl animate-bounce">
                ❤️✨
              </div>
            )}

            {/* Floating Speech Tag */}
            <div
              onClick={handleCatClick}
              className="cursor-pointer mb-1.5 ml-auto w-fit bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-lg border border-amber-300 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform"
            >
              <Gift className="w-3 h-3 text-rose-500 animate-spin-slow" />
              <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                Tap for Lucky Gift! 🎁
              </span>
            </div>

            {/* 3D Cat Container */}
            <div
              onClick={handleCatClick}
              className="cursor-pointer animate-3d-cat filter drop-shadow-2xl relative transition-transform active:scale-90"
              title="Click me for Lucky Gift & Savings Wisdom!"
            >
              {/* Layered Pseudo-3D SVG Cat Holding Gift Box */}
              <svg
                width="84"
                height="84"
                viewBox="0 0 100 100"
                className="overflow-visible"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Cat 3D Fur Radial Gradient */}
                  <radialGradient id="catFur3D" cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#FFFBEB" />
                    <stop offset="50%" stopColor="#FEF3C7" />
                    <stop offset="100%" stopColor="#FDE68A" />
                  </radialGradient>

                  {/* Ear Inner Gradient */}
                  <linearGradient id="earGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FDA4AF" />
                    <stop offset="100%" stopColor="#F43F5E" />
                  </linearGradient>

                  {/* 3D Gift Box Gradients */}
                  <linearGradient id="giftFront3D" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F43F5E" />
                    <stop offset="100%" stopColor="#BE123C" />
                  </linearGradient>
                  <linearGradient id="giftTop3D" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FB7185" />
                    <stop offset="100%" stopColor="#F43F5E" />
                  </linearGradient>
                  <linearGradient id="giftRibbon" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>

                  {/* Shiny Eye Reflection */}
                  <radialGradient id="eyeShine" cx="35%" cy="30%" r="50%">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#020617" />
                  </radialGradient>
                </defs>

                {/* Left Ear */}
                <polygon points="16,36 28,6 44,30" fill="url(#catFur3D)" stroke="#78350F" strokeWidth="1.5" strokeLinejoin="round" />
                <polygon points="22,32 28,14 38,28" fill="url(#earGradient)" />

                {/* Right Ear */}
                <polygon points="84,36 72,6 56,30" fill="url(#catFur3D)" stroke="#78350F" strokeWidth="1.5" strokeLinejoin="round" />
                <polygon points="78,32 72,14 62,28" fill="url(#earGradient)" />

                {/* Cat Head Sphere */}
                <circle cx="50" cy="50" r="34" fill="url(#catFur3D)" stroke="#78350F" strokeWidth="1.5" />

                {/* 3D Specular Highlight on Forehead */}
                <ellipse cx="44" cy="30" rx="14" ry="7" fill="#FFFFFF" opacity="0.6" />

                {/* Rosy Cheeks Blush */}
                <ellipse cx="27" cy="58" rx="7" ry="4.5" fill="#FDA4AF" opacity="0.85" />
                <ellipse cx="73" cy="58" rx="7" ry="4.5" fill="#FDA4AF" opacity="0.85" />

                {/* Anime Big Eyes with 3D Specular Sparks */}
                <ellipse cx="36" cy="46" rx="6.5" ry="8" fill="url(#eyeShine)" />
                <ellipse cx="64" cy="46" rx="6.5" ry="8" fill="url(#eyeShine)" />
                {/* Highlights in Left Eye */}
                <circle cx="34" cy="43" r="2.8" fill="#FFFFFF" />
                <circle cx="38" cy="49" r="1.3" fill="#FFFFFF" />
                {/* Highlights in Right Eye */}
                <circle cx="62" cy="43" r="2.8" fill="#FFFFFF" />
                <circle cx="66" cy="49" r="1.3" fill="#FFFFFF" />

                {/* Cute Nose */}
                <polygon points="50,54 46,50 54,50" fill="#E11D48" />

                {/* Cat Mouth Curve */}
                <path d="M46,56 Q50,61 50,56 Q50,61 54,56" fill="none" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />

                {/* Whiskers */}
                <line x1="12" y1="50" x2="25" y2="52" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="10" y1="58" x2="24" y2="57" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="88" y1="50" x2="75" y2="52" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="90" y1="58" x2="76" y2="57" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />

                {/* Cat Paws Holding Gift */}
                <circle cx="35" cy="74" r="6" fill="#FFFBEB" stroke="#78350F" strokeWidth="1.2" />
                <circle cx="65" cy="74" r="6" fill="#FFFBEB" stroke="#78350F" strokeWidth="1.2" />

                {/* 3D WRAPPED GIFT BOX */}
                <g className="animate-gift-glow">
                  {/* Gift Box Top Face */}
                  <polygon points="50,60 68,66 50,72 32,66" fill="url(#giftTop3D)" stroke="#9F1239" strokeWidth="1" />

                  {/* Gift Box Left & Right Faces */}
                  <polygon points="32,66 50,72 50,92 32,86" fill="url(#giftFront3D)" stroke="#9F1239" strokeWidth="1" />
                  <polygon points="50,72 68,66 68,86 50,92" fill="#9F1239" stroke="#881337" strokeWidth="1" />

                  {/* Golden Ribbons */}
                  <polygon points="48,60 52,60 52,92 48,92" fill="url(#giftRibbon)" />
                  <polygon points="32,76 68,76 68,80 32,80" fill="url(#giftRibbon)" opacity="0.9" />

                  {/* Gift Ribbon Bow */}
                  <circle cx="50" cy="62" r="3" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
                  <ellipse cx="44" cy="58" rx="4.5" ry="3" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" />
                  <ellipse cx="56" cy="58" rx="4.5" ry="3" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" />
                </g>

                {/* Floating Stars Sparkles */}
                <circle cx="82" cy="22" r="2" fill="#F59E0B" className="animate-ping" />
                <circle cx="18" cy="22" r="1.5" fill="#EC4899" className="animate-ping" />
              </svg>

              {/* 3D Floor Shadow */}
              <div className="w-16 h-3 mx-auto bg-slate-950 rounded-full animate-cat-shadow filter blur-[2px] mt-0.5" />
            </div>

            {/* Minimize / Close Mascot Button */}
            <button
              onClick={e => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-slate-800 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-slate-900 shadow-md opacity-70 hover:opacity-100"
              title="Minimize Mascot"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* LUCKY 3D CAT SURPRISE GIFT MODAL */}
      {/* ============================================================== */}
      {isGiftModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto border-2 border-amber-300 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white p-5 text-center relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => setIsGiftModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cat Avatar badge in modal */}
              <div className="w-16 h-16 rounded-2xl bg-white p-1 mx-auto shadow-xl transform hover:rotate-6 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[12px] flex items-center justify-center text-2xl">
                  🐱🐾
                </div>
              </div>

              <h3 className="font-black text-lg sm:text-xl mt-3 text-white tracking-tight">
                Lucky Cat's Surprise Gift! 🎁
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                बिल्ली का लकी गिफ़्ट बॉक्स और बजट बचत मन्त्र
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Lucky Blessing */}
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center space-y-1">
                <span className="text-xl">🐾 💰 🪙</span>
                <h4 className="text-sm font-extrabold text-amber-950">
                  शुभ लाभ! Lucky Mascot Blessing
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  "मेओव! आप अपने रेंट, बिजली और दैनिक ख़र्चों का बढ़िया हिसाब रख रहे हैं। आपकी बचत इस महीने ज़रूर बढ़ेगी!"
                </p>
              </div>

              {/* Saving Tip of the Day */}
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                    {currentTip.title}
                  </h4>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  {currentTip.tip}
                </p>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Shortcuts
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsGiftModalOpen(false);
                      onOpenExpenseModal();
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-left text-xs font-semibold text-slate-800 transition-all flex items-center justify-between"
                  >
                    <span>+ Add Kharcha</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      setIsGiftModalOpen(false);
                      onOpenPrinterHub();
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded-xl text-left text-xs font-semibold text-slate-800 transition-all flex items-center justify-between"
                  >
                    <span>🖨️ Bills & Printer</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setTipIndex((tipIndex + 1) % SAVING_TIPS.length)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                <span>Another Tip</span> 🔄
              </button>
              <button
                onClick={() => setIsGiftModalOpen(false)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all active:scale-95"
              >
                Close & Thank You! 🐾
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
