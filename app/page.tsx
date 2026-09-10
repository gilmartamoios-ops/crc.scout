'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface LandingPageProps {
  gestorSlug?: string;
}

export default function LandingPage({ gestorSlug }: LandingPageProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(false);

  const perguntas = [
    {
      id: 'p1',
      pergunta: 'Como você avalia o impacto do seu consumo diário no seu orçamento hoje?',
      opcoes: ['Consumo sem retorno', 'Gostaria de otimizar', 'Busco autonomia financeira']
    },
    {
      id: 'p2',
      pergunta: 'Você já faz parte de alguma gestão colaborativa ou rede de consumo?',
      opcoes: ['Não, primeira vez', 'Já conheço o formato', 'Sou gestor de comunidade']
    }
  ];

  const handleOpcao = (perguntaId: string, opcao: string) => {
    setRespostas({ ...respostas, [perguntaId]: opcao });
    if (step < perguntas.length) {
      setStep(step + 1);
    } else {
      setStep(3);
    }
  };

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      console.log('Lead Capturado:', { nome, whatsapp, respostas, gestorPadrinho: gestorSlug || 'Direto' });
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao registrar:', error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        
        <div className="relative w-32 h-32 mb-4">
          <Image
            src="/assets/logo-crc.png"
            alt="CRC.SCOUT"
            fill
            className="object-contain"
            priority
          />
        </div>

        <span className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-2">
          {gestorSlug ? `Convite do Gestor: ${gestorSlug}` : 'Passe de Acesso à Comunidade'}
        </span>

        {step <= perguntas.length && (
          <div className="w-full mt-2">
            <h2 className="text-lg font-medium text-neutral-200 mb-6">
              {perguntas[step - 1].pergunta}
            </h2>
            <div className="space-y-3">
              {perguntas[step - 1].opcoes.map((opcao, index) => (
                <button
                  key={index}
                  onClick={() => handleOpcao(perguntas[step - 1].id, opcao)}
                  className="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-sm font-medium transition duration-200 text-left flex justify-between items-center"
                >
                  <span>{opcao}</span>
                  <span className="text-neutral-500">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleFinalizar} className="w-full mt-2 space-y-4">
            <h2 className="text-base font-medium text-neutral-200">
              Seu perfil foi qualificado. Digite seu contato para liberar o aplicativo.
            </h2>
            
            <input
              type="text"
              placeholder="Seu Nome Completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition"
            />

            <input
              type="tel"
              placeholder="Seu WhatsApp com DDD"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition"
            />

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl text-sm transition shadow-lg shadow-cyan-950/50"
            >
              {carregando ? 'Liberando Acesso...' : 'Acessar Comunidade CRC'}
            </button>
          </form>
        )}

      </div>
    </main>
  );
}
