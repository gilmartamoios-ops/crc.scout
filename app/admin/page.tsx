'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminPage() {
  const [abaAtiva, setAbaAtiva] = useState<'curadoria' | 'mentoria'>('curadoria');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Formulário de Curadoria
  const [curadoriaTitulo, setCuradoriaTitulo] = useState('');
  const [curadoriaDescricao, setCuradoriaDescricao] = useState('');
  const [curadoriaPdfUrl, setCuradoriaPdfUrl] = useState('');
  const [curadoriaVideoUrl, setCuradoriaVideoUrl] = useState('');

  // Formulário de Mentoria
  const [mentoriaTitulo, setMentoriaTitulo] = useState('');
  const [mentoriaYoutubeUrl, setMentoriaYoutubeUrl] = useState('');
  const [mentoriaModulo, setMentoriaModulo] = useState('Módulo 01: Fundamentos da Comunidade');
  const [mentoriaPdfApoioUrl, setMentoriaPdfApoioUrl] = useState('');

  // Salvar Curadoria no Supabase
  const handleSalvarCuradoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem(null);

    try {
      const { error } = await supabase.from('curadoria').insert([
        {
          titulo: curadoriaTitulo,
          descricao: curadoriaDescricao,
          pdf_url: curadoriaPdfUrl,
          video_url: curadoriaVideoUrl,
        },
      ]);

      if (error) throw error;

      setMensagem({ tipo: 'sucesso', texto: 'Curadoria publicada com sucesso!' });
      setCuradoriaTitulo('');
      setCuradoriaDescricao('');
      setCuradoriaPdfUrl('');
      setCuradoriaVideoUrl('');
    } catch (err: any) {
      setMensagem({
        tipo: 'erro',
        texto: err.message || 'Erro ao publicar curadoria. Verifique a conexão com o Supabase.',
      });
    } finally {
      setCarregando(false);
    }
  };

  // Salvar Mentoria no Supabase
  const handleSalvarMentoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem(null);

    try {
      const { error } = await supabase.from('mentorias').insert([
        {
          titulo: mentoriaTitulo,
          youtube_url: mentoriaYoutubeUrl,
          modulo: mentoriaModulo,
          pdf_apoio_url: mentoriaPdfApoioUrl,
        },
      ]);

      if (error) throw error;

      setMensagem({ tipo: 'sucesso', texto: 'Mentoria publicada com sucesso!' });
      setMentoriaTitulo('');
      setMentoriaYoutubeUrl('');
      setMentoriaPdfApoioUrl('');
    } catch (err: any) {
      setMensagem({
        tipo: 'erro',
        texto: err.message || 'Erro ao publicar mentoria. Verifique a conexão com o Supabase.',
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Topo do Painel */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image
                src="/assets/logo-crc.png"
                alt="CRC Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-100">
                Painel do Administrador
              </h1>
              <p className="text-xs text-neutral-400">
                Alimente a comunidade CRC.SCOUT sem alterar código
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="text-xs text-cyan-400 hover:underline bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl"
          >
            ← Voltar ao App
          </Link>
        </div>

        {/* Notificação Status */}
        {mensagem && (
          <div
            className={`p-4 rounded-xl border text-xs font-medium ${
              mensagem.tipo === 'sucesso'
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/50 border-rose-800 text-rose-300'
            }`}
          >
            {mensagem.texto}
          </div>
        )}

        {/* Seleção de Abas */}
        <div className="flex gap-2 border-b border-neutral-800 pb-2">
          <button
            onClick={() => {
              setAbaAtiva('curadoria');
              setMensagem(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              abaAtiva === 'curadoria'
                ? 'bg-cyan-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            📦 Publicar Curadoria
          </button>
          <button
            onClick={() => {
              setAbaAtiva('mentoria');
              setMensagem(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              abaAtiva === 'mentoria'
                ? 'bg-cyan-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            🎥 Publicar Mentoria (YouTube)
          </button>
        </div>

        {/* Form 1: Curadoria Semanal */}
        {abaAtiva === 'curadoria' && (
          <form
            onSubmit={handleSalvarCuradoria}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl"
          >
            <h2 className="text-sm font-bold text-neutral-200">
              Nova Curadoria de Produto / Ficha Técnica
            </h2>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Título da Curadoria</label>
              <input
                type="text"
                required
                placeholder="Ex: Curadoria #12 - Ficha Técnica do Lançamento"
                value={curadoriaTitulo}
                onChange={(e) => setCuradoriaTitulo(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Descrição / Destaques</label>
              <textarea
                rows={3}
                required
                placeholder="Resumo dos benefícios do produto e orientações para a rede..."
                value={curadoriaDescricao}
                onChange={(e) => setCuradoriaDescricao(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Link do PDF (Ficha Técnica)</label>
              <input
                type="url"
                placeholder="https://sua-nuvem.com/ficha.pdf"
                value={curadoriaPdfUrl}
                onChange={(e) => setCuradoriaPdfUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Link de Vídeo Explicativo (Opcional)</label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={curadoriaVideoUrl}
                onChange={(e) => setCuradoriaVideoUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs transition shadow-lg"
            >
              {carregando ? 'Publicando...' : 'Disponibilizar na Comunidade'}
            </button>
          </form>
        )}

        {/* Form 2: Mentoria YouTube */}
        {abaAtiva === 'mentoria' && (
          <form
            onSubmit={handleSalvarMentoria}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl"
          >
            <h2 className="text-sm font-bold text-neutral-200">
              Nova Mentoria do Canal do YouTube
            </h2>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Módulo / Categoria</label>
              <select
                value={mentoriaModulo}
                onChange={(e) => setMentoriaModulo(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Módulo 01: Fundamentos da Comunidade">
                  Módulo 01: Fundamentos da Comunidade
                </option>
                <option value="Módulo 02: Gestão das 3 Gerações">
                  Módulo 02: Gestão das 3 Gerações
                </option>
                <option value="Módulo 03: Liderança & Execução">
                  Módulo 03: Liderança & Execução
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Título da Aula / Mentoria</label>
              <input
                type="text"
                required
                placeholder="Ex: Mentoria #05 - Como Conectar Novos Gestores"
                value={mentoriaTitulo}
                onChange={(e) => setMentoriaTitulo(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Link do Vídeo no YouTube</label>
              <input
                type="url"
                required
                placeholder="https://www.youtube.com/watch?v=..."
                value={mentoriaYoutubeUrl}
                onChange={(e) => setMentoriaYoutubeUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className