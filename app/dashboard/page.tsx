'use client';

import { useState } from 'react';

export default function CapaSantinhoDigital() {
  const [etapa, setEtapa] = useState(1);

  return (
    <main style={{ minHeight: '100vh', width: '100vw', background: '#050505', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 0, padding: '16px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '340px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
        
        <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '2px', color: '#00ff88', background: 'rgba(0,255,136,0.1)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(0,255,136,0.25)' }}>
          SANTINHO DIGITAL · RISCO ZERO
        </span>

        {/* Player do Vídeo Protagonista */}
        <div style={{ width: '100%', aspectRatio: '9/16', maxHeight: '420px', background: '#111111', borderRadius: '18px', overflow: 'hidden', border: '2px solid rgba(0,255,136,0.5)', boxShadow: '0 0 40px rgba(0,255,136,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video
            src="/assets/santinho.mp4"
            autoPlay
            loop
            muted
            playsInline
            controls
            preload="auto"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* CTA Principal */}
        <button
          type="button"
          onClick={() => window.location.href = '/hall'}
          style={{ width: '100%', padding: '16px', background: '#00ff88', color: '#050505', fontWeight: 900, fontSize: '13px', borderRadius: '14px', border: 'none', letterSpacing: '1px', cursor: 'pointer', boxShadow: '0 0 25px rgba(0,255,136,0.4)' }}
        >
          ENTRAR NO SCOUT ➔
        </button>

        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
          Conheça primeiro. Decida depois.
        </p>
      </div>
    </main>
  );
}