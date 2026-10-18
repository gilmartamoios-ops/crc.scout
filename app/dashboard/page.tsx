'use client';

import { useState } from 'react';

export default function CapaSantinhoDigital() {
  const [etapa, setEtapa] = useState(1);

  return (
    <main className="min-h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[340px] flex flex-col gap-4 items-center text-center my-auto">
        
        {/* Tag Superior */}
        <span className="text-[10px] font-extrabold tracking-[2px] text-[#00ff88] bg-[#00ff88]/10 px-3 py-1.5 rounded-full border border-[#00ff88]/30 uppercase">
          SANTINHO DIGITAL · RISCO ZERO
        </span>

        {/* Player do Vídeo Protagonista (Formato Vertical Stories) */}
        <div className="w-full aspect-[9/16] max-h-[420px] bg-black rounded-2xl overflow-hidden border-2 border-[#00ff88]/50 shadow-[0_0_40px_rgba(0,255,136,0.25)] flex items-center justify-center relative">
          <video
            src="/assets/santinho.mp4"
            autoPlay
            loop
            muted
            playsInline
            controls
            preload="auto"
            className="w-full h-full object-cover block"
          />
        </div>

        {/* CTA Principal Colado no Vídeo */}
        <button
          type="button"
          onClick={() => window.location.href = '/hall'}
          className="w-full py-4 bg-[#00ff88] text-[#050505] font-black text-xs rounded-xl tracking-wider uppercase border-none cursor-pointer shadow-[0_0_25px_rgba(0,255,136,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          ENTRAR NO SCOUT ➔
        </button>

        {/* Legenda de Fecho */}
        <p className="text-[10px] text-gray-400 uppercase tracking-widest m-0">
          Conheça primeiro. Decida depois.
        </p>

      </div>
    </main>
  );
}