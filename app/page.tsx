'use client';

import { FormEvent, useMemo, useState } from 'react';
import Image from 'next/image';

type Perfil = 'gestor' | 'cliente' | 'ambos' | '';

interface Respostas {
  objetivo: string;
  interesse: string;
  disponibilidade: string;
  experiencia: string;
}

export default function LandingPage() {
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
        titulo:
          'Como você se considera em relação a relacionamento e gestão de pessoas?',
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

  const perguntaAtual = perguntas[etapa - 2];

  const selecionarResposta = (valor: string) => {
    if (!perguntaAtual) return;

    setRespostas((anterior) => ({
      ...anterior,
      [perguntaAtual.id]: valor,
    }));

    if (etapa < 5) {
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

    const leadPreparado = {
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
    <main className="min-h-screen overflow-hidden bg-[#06080a] text-white">
      {/* ATMOSFERA DE FUNDO */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[-120px] right-[-80px] h-[320px] w-[320px] rounded-full bg-cyan-400/5 blur-[100px]" />
        <div className="absolute left-[-120px] top-[35%] h-[260px] w-[260px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        {/* TOPO */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
  style={{
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.03)',
  }}
>
  <Image
    src="/assets/logo-crc.png"
    alt="CRC"
    width={48}
    height={48}
    priority
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      display: 'block',
    }}
  />
</div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-400">
                SCOUT.CRC
              </div>
              <div className="text-[10px] text-neutral-500">
                Inteligência para comunidades
              </div>
            </div>
          </div>

          <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-neutral-500 sm:block">
            Conheça · Explore · Decida
          </div>
        </header>

        {/* ETAPA 1 — APRESENTAÇÃO */}
        {etapa === 1 && (
          <section className="flex flex-1 flex-col justify-center py-14 lg:py-20">
            <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
              {/* TEXTO */}
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Uma nova forma de conhecer o CRC
                </div>

                <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  E se uma comunidade pudesse mudar a forma como você
                  <span className="text-cyan-400"> consome, se conecta e cresce?</span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-400 sm:text-lg">
                  O SCOUT foi criado para apresentar o ecossistema CRC de forma
                  simples, inteligente e sem pressão. Primeiro você conhece.
                  Depois decide se faz sentido para você.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setEtapa(2)}
                    className="group inline-flex items-center justify-center rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-black shadow-[0_0_35px_rgba(34,211,238,0.15)] transition hover:-translate-y-0.5 hover:bg-cyan-300"
                  >
                    Conhecer o CRC
                    <span className="ml-2 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEtapa(2)}
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-neutral-200 transition hover:border-cyan-400/30 hover:bg-white/[0.06]"
                  >
                    Quero explorar
                  </button>
                </div>

                <p className="mt-5 text-[11px] text-neutral-600">
                  Sem promessa de resultado. Sem pressão. Apenas informação para
                  você decidir.
                </p>
              </div>

              {/* PAINEL VISUAL */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025] p-5 shadow-2xl backdrop-blur">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-transparent" />

                  <div className="relative">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                        Visão CRC
                      </span>
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-2.5 py-1 text-[9px] text-cyan-300">
                        SCOUT
                      </span>
                    </div>

                    <div className="mx-auto flex aspect-square max-w-[310px] items-center justify-center rounded-full border border-cyan-400/20 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.14),_rgba(6,8,10,0)_62%)]">
                      <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-white/10 bg-[#080b0d] shadow-[0_0_70px_rgba(34,211,238,0.08)]">
                        <div className="absolute h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.8)]" />
                        <div className="absolute h-28 w-28 rounded-full border border-cyan-400/10" />
                        <div className="absolute h-36 w-36 rounded-full border border-cyan-400/5" />

                        <div className="text-center">
                          <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                            Comunidade
                          </div>
                          <div className="mt-2 text-2xl font-semibold text-white">
                            3
                          </div>
                          <div className="mt-1 text-[10px] text-neutral-600">
                            gestores iniciam o núcleo
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">
                        <div className="text-[10px] uppercase tracking-wider text-neutral-500">
                          Consumo
                        </div>
                        <div className="mt-1 text-xs text-neutral-200">
                          Mais inteligente
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">
                        <div className="text-[10px] uppercase tracking-wider text-neutral-500">
                          Relação
                        </div>
                        <div className="mt-1 text-xs text-neutral-200">
                          Mais próxima
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">
                        <div className="text-[10px] uppercase tracking-wider text-neutral-500">
                          Comunidade
                        </div>
                        <div className="mt-1 text-xs text-neutral-200">
                          Mais ativa
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BASE */}
            <div className="mt-14 grid gap-4 border-t border-white/5 pt-7 sm:grid-cols-3">
              <div>
                <div className="text-sm font-semibold text-white">
                  Você começa conhecendo
                </div>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  O SCOUT organiza a informação antes de pedir qualquer decisão.
                </p>
              </div>

              <div>
                <div className="text-sm font-semibold text-white">
                  Você entende seu perfil
                </div>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Algumas perguntas ajudam a entender o que realmente desperta seu
                  interesse.
                </p>
              </div>

              <div>
                <div className="text-sm font-semibold text-white">
                  Você decide o próximo passo
                </div>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  O objetivo é clareza, não pressão.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* QUALIFICAÇÃO */}
        {etapa >= 2 && etapa <= 5 && perguntaAtual && (
          <section className="flex flex-1 items-center py-14">
            <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-2xl backdrop-blur sm:p-8">
              <div className="mb-7">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                    Conhecendo seu perfil
                  </span>

                  <span className="text-[10px] text-neutral-600">
                    {etapa - 1}/{perguntas.length}
                  </span>
                </div>

                <div className="h-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                    style={{
                      width: `${((etapa - 1) / perguntas.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <h2 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
                {perguntaAtual.titulo}
              </h2>

              <div className="mt-7 space-y-3">
                {perguntaAtual.opcoes.map((opcao) => (
                  <button
                    key={opcao}
                    type="button"
                    onClick={() => selecionarResposta(opcao)}
                    className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-left text-sm text-neutral-200 transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-cyan-400/[0.04]"
                  >
                    <span>{opcao}</span>
                    <span className="ml-4 text-neutral-600 transition group-hover:translate-x-1 group-hover:text-cyan-400">
                      →
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={voltar}
                className="mt-6 text-xs text-neutral-600 transition hover:text-neutral-300"
              >
                ← Voltar
              </button>
            </div>
          </section>
        )}

        {/* PERFIL */}
        {etapa === 5 && (
          <section className="flex flex-1 items-center py-14">
            <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-2xl backdrop-blur sm:p-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Próximo passo
              </span>

              <h2 className="mt-3 text-3xl font-semibold leading-tight text-white">
                O que você gostaria de conhecer primeiro?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
                Essa escolha ajuda o SCOUT a organizar sua jornada.
              </p>

              <div className="mt-7 space-y-3">
                <button
                  type="button"
                  onClick={() => selecionarPerfil('gestor')}
                  className="w-full rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-5 text-left transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.08]"
                >
                  <strong className="block text-sm text-cyan-300">
                    Conhecer a construção de uma comunidade
                  </strong>
                  <span className="mt-1 block text-xs text-neutral-500">
                    Entender o papel do gestor dentro do CRC.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => selecionarPerfil('cliente')}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition hover:border-cyan-400/30 hover:bg-white/[0.04]"
                >
                  <strong className="block text-sm text-neutral-100">
                    Conhecer os produtos
                  </strong>
                  <span className="mt-1 block text-xs text-neutral-500">
                    Meu principal interesse é o consumo.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => selecionarPerfil('ambos')}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition hover:border-cyan-400/30 hover:bg-white/[0.04]"
                >
                  <strong className="block text-sm text-neutral-100">
                    Conhecer as duas possibilidades
                  </strong>
                  <span className="mt-1 block text-xs text-neutral-500">
                    Quero compreender consumo e comunidade.
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* IDENTIFICAÇÃO */}
        {etapa === 6 && !enviado && (
          <section className="flex flex-1 items-center py-14">
            <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-2xl backdrop-blur sm:p-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Solicitar orientação
              </span>

              <h2 className="mt-3 text-3xl font-semibold text-white">
                Quer conversar com um gestor?
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Deixe seus dados para solicitar uma orientação personalizada.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <input
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-cyan-400/50"
                />

                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  placeholder="WhatsApp com DDD"
                  autoComplete="tel"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-cyan-400/50"
                />

                <input
                  type="text"
                  value={cidade}
                  onChange={(event) => setCidade(event.target.value)}
                  placeholder="Cidade / Estado (opcional)"
                  autoComplete="address-level2"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-cyan-400/50"
                />

                <label className="flex cursor-pointer gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <input
                    type="checkbox"
                    checked={consentimento}
                    onChange={(event) =>
                      setConsentimento(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-cyan-400"
                  />

                  <span className="text-xs leading-relaxed text-neutral-500">
                    Autorizo o uso dos dados informados para receber contato do
                    CRC sobre a finalidade que solicitei.
                  </span>
                </label>

                {erro && (
                  <div className="rounded-2xl border border-rose-900/50 bg-rose-950/30 p-3 text-xs text-rose-300">
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full rounded-2xl bg-cyan-400 px-5 py-4 text-sm font-bold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {carregando ? 'Processando...' : 'Solicitar orientação'}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* CONFIRMAÇÃO */}
        {enviado && (
          <section className="flex flex-1 items-center py-14">
            <div className="mx-auto w-full max-w-2xl rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.04] p-8 text-center shadow-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-2xl text-cyan-300">
                ✓
              </div>

              <h2 className="mt-5 text-2xl font-bold text-white">
                Solicitação registrada
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-400">
                Obrigado, {nome.split(' ')[0] || 'por participar'}.
              </p>

              <p className="mt-2 text-xs leading-5 text-neutral-500">
                Seu interesse foi registrado para a próxima etapa da jornada
                SCOUT.CRC.
              </p>
            </div>
          </section>
        )}

        <footer className="border-t border-white/5 py-6 text-center">
          <p className="text-[10px] text-neutral-700">
            SCOUT.CRC — inteligência para construção de comunidades.
          </p>
        </footer>
      </div>
    </main>
  );
}