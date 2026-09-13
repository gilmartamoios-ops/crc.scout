'use client';

import { FormEvent, useMemo, useState } from 'react';
import Image from 'next/image';

interface LandingPageProps {
  params: {
    slug: string;
  };
}

type Perfil = 'gestor' | 'cliente' | 'ambos' | '';

interface Respostas {
  objetivo: string;
  interesse: string;
  disponibilidade: string;
  experiencia: string;
}

export default function LandingPage({ params }: LandingPageProps) {
  const gestorSlug = params?.slug || '';

  const [etapa, setEtapa] = useState(1);
  const [respostas, setRespostas] = useState<Respostas>({
    objetivo: '',
    interesse: '',
    disponibilidade: '',
    experiencia: '',
  });

  const [perfil, setPerfil] = useState<Perfil>('');
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [consentimento, setConsentimento] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');

  const perguntas = useMemo(
    () => [
      {
        id: 'objetivo',
        titulo: 'O que despertou seu interesse em conhecer o CRC?',
        opcoes: [
          'Quero otimizar meu consumo',
          'Quero conhecer uma nova possibilidade de negócio',
          'Quero construir uma comunidade',
          'Quero apenas conhecer os produtos',
        ],
      },
      {
        id: 'interesse',
        titulo: 'Qual destas possibilidades mais combina com você?',
        opcoes: [
          'Participar como consumidor',
          'Construir uma comunidade de gestores',
          'Desenvolver as duas possibilidades',
          'Ainda não sei',
        ],
      },
      {
        id: 'disponibilidade',
        titulo: 'Quanto tempo você teria para desenvolver uma comunidade?',
        opcoes: [
          'Poucas horas por semana',
          'Algumas horas por dia',
          'Tenho bastante disponibilidade',
          'Ainda não sei',
        ],
      },
      {
        id: 'experiencia',
        titulo: 'Como você se considera em relação a relacionamento e gestão de pessoas?',
        opcoes: [
          'Tenho facilidade para me relacionar',
          'Já lidero ou coordeno pessoas',
          'Estou começando a desenvolver essa habilidade',
          'Prefiro conhecer primeiro',
        ],
      },
    ],
    []
  );

  const perguntaAtual = perguntas[etapa - 1];

  const selecionarResposta = (valor: string) => {
    if (!perguntaAtual) return;

    setRespostas((anterior) => ({
      ...anterior,
      [perguntaAtual.id]: valor,
    }));

    if (etapa < perguntas.length) {
      setEtapa((anterior) => anterior + 1);
    } else {
      setEtapa(5);
    }
  };

  const selecionarPerfil = (valor: Perfil) => {
    setPerfil(valor);
    setEtapa(6);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro('');

    if (!nome.trim() || !whatsapp.trim()) {
      setErro('Informe seu nome e WhatsApp para continuar.');
      return;
    }

    if (!consentimento) {
      setErro(
        'Para solicitar contato, é necessário autorizar o uso dos dados para essa finalidade.'
      );
      return;
    }

    setCarregando(true);

    /*
     * IMPORTANTE:
     * Ainda não gravamos este lead no Supabase.
     *
     * A tabela "leads", os campos, as regras de RLS,
     * o registro de consentimento e a distribuição
     * para o gestor serão construídos na próxima etapa.
     *
     * Por enquanto, mantemos os dados preparados
     * para o futuro motor de inteligência.
     */

    const leadPreparado = {
      origem_gestor: gestorSlug || null,
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      cidade: cidade.trim(),
      perfil,
      respostas,
      consentimento,
      data_consentimento: new Date().toISOString(),
    };

    console.log('SCOUT — lead preparado:', leadPreparado);

    setEnviado(true);
    setCarregando(false);
  };

  const voltar = () => {
    if (etapa > 1 && etapa <= 5) {
      setEtapa((anterior) => anterior - 1);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-8 sm:px-6">
        {/* CABEÇALHO */}
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 h-28 w-28 sm:h-32 sm:w-32">
            <Image
              src="/assets/logo-crc.png"
              alt="CRC — Comunidade de Relacionamento de Consumo"
              fill
              priority
              sizes="128px"
              className="object-contain"
            />
          </div>

          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
            SCOUT.CRC
          </span>

          {gestorSlug ? (
            <p className="mt-2 text-xs text-neutral-500">
              Você chegou através do convite de um gestor CRC.
            </p>
          ) : (
            <p className="mt-2 text-xs text-neutral-500">
              Conheça a Comunidade de Relacionamento de Consumo.
            </p>
          )}
        </header>

        {/* APRESENTAÇÃO */}
        {etapa === 1 && (
          <section className="space-y-5">
            <div>
              <h1 className="text-center text-2xl font-bold leading-tight text-neutral-100 sm:text-3xl">
                Antes de decidir, conheça o conceito CRC.
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-neutral-400">
                O CRC parte de uma ideia simples: pessoas organizadas em
                comunidades podem transformar a maneira como consomem,
                se relacionam e desenvolvem novas possibilidades.
              </p>
            </div>

            {/* VÍDEO OFICIAL */}
            <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-black shadow-2xl">
              <div className="aspect-video w-full">
                <video
                  controls
                  preload="metadata"
                  playsInline
                  className="h-full w-full object-contain"
                  src="/assets/miniAPN.mp4"
                >
                  Seu navegador não suporta a reprodução deste vídeo.
                </video>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
                <span className="text-lg">◉</span>
                <h2 className="mt-2 text-sm font-semibold">
                  Consumo
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                  O gestor é, antes de tudo, consumidor.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
                <span className="text-lg">◎</span>
                <h2 className="mt-2 text-sm font-semibold">
                  Comunidade
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                  A unidade começa com três gestores.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
                <span className="text-lg">↗</span>
                <h2 className="mt-2 text-sm font-semibold">
                  Desenvolvimento
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                  Cada gestor define o tamanho da sua comunidade.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEtapa(2)}
              className="w-full rounded-xl bg-cyan-500 px-5 py-3.5 text-sm font-bold text-black transition hover:bg-cyan-400"
            >
              Quero conhecer melhor
            </button>
          </section>
        )}

        {/* QUALIFICAÇÃO */}
        {etapa >= 2 && etapa <= 5 && perguntaAtual && (
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-xl sm:p-7">
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  Conhecendo seu perfil
                </span>

                <span className="text-[10px] text-neutral-600">
                  {etapa - 1}/{perguntas.length}
                </span>
              </div>

              <div className="h-1 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{
                    width: `${((etapa - 1) / perguntas.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold leading-relaxed text-neutral-100">
              {perguntaAtual.titulo}
            </h2>

            <div className="mt-6 space-y-3">
              {perguntaAtual.opcoes.map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => selecionarResposta(opcao)}
                  className="flex w-full items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4 text-left text-sm text-neutral-200 transition hover:border-cyan-500/60 hover:bg-neutral-800"
                >
                  <span>{opcao}</span>
                  <span className="ml-4 text-neutral-600">→</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={voltar}
              className="mt-5 text-xs text-neutral-600 transition hover:text-neutral-300"
            >
              ← Voltar
            </button>
          </section>
        )}

        {/* DEFINIÇÃO DO INTERESSE */}
        {etapa === 5 && (
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-xl sm:p-7">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              Última etapa
            </span>

            <h2 className="mt-3 text-xl font-semibold leading-relaxed">
              O que você gostaria de conhecer primeiro?
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              Essa resposta ajuda o SCOUT a direcionar melhor sua jornada.
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => selecionarPerfil('gestor')}
                className="w-full rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-4 text-left transition hover:border-cyan-400 hover:bg-cyan-500/20"
              >
                <strong className="block text-sm text-cyan-300">
                  Quero conhecer a construção de uma comunidade
                </strong>
                <span className="mt-1 block text-xs text-neutral-500">
                  Quero entender como funciona o papel do gestor CRC.
                </span>
              </button>

              <button
                type="button"
                onClick={() => selecionarPerfil('cliente')}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-left transition hover:border-cyan-500/60 hover:bg-neutral-800"
              >
                <strong className="block text-sm text-neutral-200">
                  Quero conhecer os produtos
                </strong>
                <span className="mt-1 block text-xs text-neutral-500">
                  Meu principal interesse é o consumo.
                </span>
              </button>

              <button
                type="button"
                onClick={() => selecionarPerfil('ambos')}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-left transition hover:border-cyan-500/60 hover:bg-neutral-800"
              >
                <strong className="block text-sm text-neutral-200">
                  Quero conhecer as duas possibilidades
                </strong>
                <span className="mt-1 block text-xs text-neutral-500">
                  Quero compreender consumo e comunidade.
                </span>
              </button>
            </div>
          </section>
        )}

        {/* IDENTIFICAÇÃO */}
        {etapa === 6 && !enviado && (
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-xl sm:p-7">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              Solicitar orientação
            </span>

            <h2 className="mt-3 text-xl font-semibold">
              Quer conversar com um gestor?
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              Se você quiser receber uma orientação personalizada,
              deixe seus dados abaixo. Eles serão utilizados para essa
              finalidade, conforme sua autorização.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Seu nome"
                autoComplete="name"
                required
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3.5 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-cyan-500"
              />

              <input
                type="tel"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                placeholder="WhatsApp com DDD"
                autoComplete="tel"
                required
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3.5 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-cyan-500"
              />

              <input
                type="text"
                value={cidade}
                onChange={(event) => setCidade(event.target.value)}
                placeholder="Cidade / Estado (opcional)"
                autoComplete="address-level2"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3.5 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-cyan-500"
              />

              <label className="flex cursor-pointer gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <input
                  type="checkbox"
                  checked={consentimento}
                  onChange={(event) =>
                    setConsentimento(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-cyan-500"
                />

                <span className="text-xs leading-relaxed text-neutral-500">
                  Autorizo o uso dos dados informados para que um
                  representante do CRC entre em contato comigo sobre
                  a finalidade que solicitei.
                </span>
              </label>

              {erro && (
                <div className="rounded-xl border border-rose-900 bg-rose-950/40 p-3 text-xs text-rose-300">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="w-full rounded-xl bg-cyan-500 px-5 py-3.5 text-sm font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {carregando
                  ? 'Processando...'
                  : 'Solicitar orientação'}
              </button>
            </form>

            <p className="mt-4 text-center text-[10px] leading-relaxed text-neutral-700">
              O SCOUT.CRC não promete resultados financeiros.
              A finalidade desta etapa é compreender seu interesse
              e encaminhar sua solicitação de contato.
            </p>
          </section>
        )}

        {/* CONFIRMAÇÃO */}
        {enviado && (
          <section className="rounded-2xl border border-cyan-900/60 bg-cyan-950/20 p-7 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/10 text-2xl text-cyan-400">
              ✓
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Solicitação registrada
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              Obrigado, {nome.split(' ')[0] || 'por participar'}.
              Seu interesse foi registrado para a próxima etapa
              da jornada SCOUT.CRC.
            </p>

            <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                Perfil indicado
              </p>

              <p className="mt-2 text-sm text-neutral-300">
                {perfil === 'gestor' &&
                  'Interesse principal: construção de comunidade.'}

                {perfil === 'cliente' &&
                  'Interesse principal: produtos e consumo.'}

                {perfil === 'ambos' &&
                  'Interesse: comunidade e consumo.'}
              </p>
            </div>
          </section>
        )}

        {/* RODAPÉ */}
        <footer className="mt-auto pt-10 text-center">
          <p className="text-[10px] text-neutral-700">
            SCOUT.CRC — inteligência para construção de comunidades.
          </p>

          {gestorSlug && (
            <p className="mt-1 text-[9px] text-neutral-800">
              Origem: {gestorSlug}
            </p>
          )}
        </footer>
      </div>
    </main>
  );
}
