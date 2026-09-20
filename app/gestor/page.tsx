'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function GestorPage() {
  const router = useRouter();

  const [whatsapp, setWhatsapp] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    setMensagem('');

    const numero = whatsapp.replace(/\D/g, '');

    if (!numero) {
      setMensagem('Digite seu WhatsApp.');
      return;
    }

    setCarregando(true);

    const { data, error } = await supabase
      .from('gestores')
      .select('id, nome, whatsapp, slug')
      .eq('whatsapp', numero)
      .maybeSingle();

    if (error) {
      console.error('Erro ao localizar gestor:', error);
      setMensagem('Não foi possível verificar o acesso.');
      setCarregando(false);
      return;
    }

    if (!data) {
      setMensagem('WhatsApp não encontrado entre os gestores.');
      setCarregando(false);
      return;
    }

    sessionStorage.setItem(
      'scout_gestor',
      JSON.stringify({
        id: data.id,
        nome: data.nome,
        whatsapp: data.whatsapp,
        slug: data.slug,
      })
    );

    router.push('/sala');
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-500">
            SCOUT.CRC
          </p>

          <h1 className="text-2xl font-bold">
            Acesso do Gestor
          </h1>

          <p className="text-sm text-neutral-400">
            Entre com o WhatsApp cadastrado no CRC.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-2">
              WhatsApp
            </label>

            <input
              type="tel"
              inputMode="numeric"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500"
            />
          </div>

          {mensagem && (
            <p className="text-xs text-red-400">
              {mensagem}
            </p>
          )}

          <button
            onClick={entrar}
            disabled={carregando}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold rounded-xl py-3 text-sm transition"
          >
            {carregando ? 'Verificando...' : 'Entrar na Sala'}
          </button>
        </div>
      </div>
    </main>
  );
}