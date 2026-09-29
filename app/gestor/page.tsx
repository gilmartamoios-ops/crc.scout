'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function GestorPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

    useEffect(() => {
    async function verificarAcesso() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('Erro ao trocar código por sessão:', error);
          setMensagem('O link de acesso expirou ou já foi utilizado.');
          return;
        }

        window.history.replaceState({}, document.title, '/gestor');
      }

      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session?.user?.email) {
        return;
      }

      const emailAutenticado = data.session.user.email.trim().toLowerCase();

      const { data: gestor, error: gestorError } = await supabase
        .from('gestores')
        .select('id, nome, whatsapp, slug, email')
        .eq('email', emailAutenticado)
        .maybeSingle();

      if (gestorError || !gestor) {
        await supabase.auth.signOut();
        setMensagem('Este e-mail não está autorizado como gestor.');
        return;
      }

      sessionStorage.setItem(
        'scout_gestor',
        JSON.stringify({
          id: gestor.id,
          nome: gestor.nome,
          whatsapp: gestor.whatsapp,
          slug: gestor.slug,
        })
      );

      router.push('/sala');
    }

    verificarAcesso();
  }, [router]);
  async function enviarLink() {
    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo) {
      setMensagem('Digite seu e-mail.');
      return;
    }

    setMensagem('');
    setCarregando(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: emailLimpo,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: 'https://crc-scout.vercel.app/gestor',
      },
    });

    if (error) {
      console.error('Erro ao enviar link:', error);
      setMensagem('Não foi possível enviar o link de acesso.');
      setCarregando(false);
      return;
    }

    setMensagem('Link de acesso enviado para seu e-mail.');
    setCarregando(false);
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
            Informe o e-mail autorizado no CRC.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-2">
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500"
            />
          </div>

          {mensagem && (
            <p className="text-xs text-neutral-300">
              {mensagem}
            </p>
          )}

          <button
            type="button"
            onClick={enviarLink}
            disabled={carregando}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold rounded-xl py-3 text-sm transition"
          >
            {carregando ? 'Enviando...' : 'Enviar link de acesso'}
          </button>
        </div>
      </div>
    </main>
  );
}