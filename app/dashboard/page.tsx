'use client';

import Image from 'next/image';

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-neutral-100">
          Bem-vindo ao Ecossistema CRC
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Confira a visão estratégica da comunidade e a literatura base da nossa rede.
        </p>
      </div>

      {/* Vídeo de Apresentação (4 Minutos) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl space-y-3">
        <h2 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
          <span>🎬</span> Visão Geral da Comunidade
        </h2>
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center">
          <video
            controls
            className="w-full h-full object-cover"
            src="/assets/miniAPN.mp4"
          >
            Seu navegador não suporta a exibição de vídeos.
          </video>
        </div>
        <p className="text-xs text-neutral-400">
          Assista para entender o conceito de consumo inteligente e a dinâmica das 3 gerações.
        </p>
      </div>

      {/* Banner Oficial do Livro na Amazon */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-cyan-950/40 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center gap-5">
        <div className="relative w-24 h-36 flex-shrink-0 bg-neutral-950 rounded-lg border border-neutral-800 flex items-center justify-center text-center p-2 shadow-2xl">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
            Livro Base
          </span>
        </div>
        <div className="space-y-2 text-center sm:text-left flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">
            Literatura Oficial
          </span>
          <h3 className="text-base font-bold text-neutral-100 leading-tight">
            Aprofunde os conceitos no Livro Oficial na Amazon
          </h3>
          <p className="text-xs text-neutral-400">
            Adquira a obra para compreender a fundamentação teórica e prática do ecossistema.
          </p>
          <a
            href="https://www.amazon.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs transition shadow-lg shadow-amber-950/30"
          >
            Ver na Amazon ↗
          </a>
        </div>
      </div>
    </div>
  );
}