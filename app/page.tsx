'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const perguntas = useMemo(
    () => [
      {
        id: 'objetivo' as const,
        titulo: 'O que despertou seu interesse em conhecer o CRC?',
        opcoes: [
          'Quero otimizar meu consumo',
          'Quero conhecer uma nova possibilidade de negócio',
          'Quero construir uma comunidade',
          'Quero apenas conhecer os produtos',
        ],
      },
      {
        id: 'interesse' as const,
        titulo: 'Qual destas possibilidades mais combina com você?',
        opcoes: [
          'Participar como consumidor',
          'Construir uma comunidade de gestores',
          'Desenvolver as duas possibilidades',
          'Ainda não sei',
        ],
      },
      {
        id: 'disponibilidade' as const,
        titulo: 'Quanto tempo você teria para desenvolver uma comunidade?',
        opcoes: [
          'Poucas horas por semana',
          'Algumas horas por dia',
          'Tenho bastante disponibilidade',
          'Ainda não sei',
        ],
      },
      {
        id: 'experiencia' as const,
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

  const indicePergunta = etapa >= 3 && etapa <= 6 ? etapa - 3 : -1;

  const perguntaAtual =
    indicePergunta >= 0 ? perguntas[indicePergunta] : null;

  const respostaAtual = perguntaAtual
    ? respostas[perguntaAtual.id]
    : '';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('etapa') === 'quiz') {
      setEtapa(3);
    }
  }, []);

  useEffect(() => {
    if (etapa !== 2 || !videoRef.current) {
      return;
    }

    const video = videoRef.current;

    video.currentTime = 0;

    const iniciarVideo = async () => {
      try {
        await video.play();
      } catch {
        // Alguns navegadores podem bloquear o autoplay.
      }
    };

    iniciarVideo();
  }, [etapa]);

  const selecionarResposta = (valor: string) => {
  if (!perguntaAtual) return;

  setRespostas((anterior) => ({
    ...anterior,
    [perguntaAtual.id]: valor,
  }));

  
};
  const continuarPergunta = async () => {
  if (!perguntaAtual || !respostaAtual) {
    return;
  }

  if (etapa < 6) {
    setEtapa((anterior) => anterior + 1);
    return;
  }

  console.log('SCOUT � entrou na fun��o continuarPergunta');

  const registro = {
    tipo: 'convidado',
    titulo: 'Jornada SCOUT concluída',
    descricao: 'Convidado concluiu o quiz e entrou na Sala de Estar',
    dados: {
      perfil: '',
      respostas: {
        ...respostas,
        [perguntaAtual.id]: respostaAtual,
      },
      origem: 'scout-hall',
      etapa: 'sala',
      data_entrada_sala: new Date().toISOString(),
    },
  };

  const { error } = await supabase
    .from('scout_registros')
    .insert(registro);

  if (error) {
    console.error('SCOUT — erro ao registrar entrada na sala:', error);
  }

  window.location.href = '/sala';
};
  const selecionarPerfil = (valor: Perfil) => {
    setPerfil(valor);
    setEtapa(8);
  };

  const handleVideoEnded = () => {
    setEtapa(2.5);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErro('');

    if (!nome.trim() || !whatsapp.trim()) {
      setErro('Informe seu nome e WhatsApp para concluir.');
      return;
    }

    if (!consentimento) {
      setErro(
        'Para concluir seu cadastro no SCOUT, é necessário autorizar o uso dos dados para essa finalidade.'
      );
      return;
    }

    setCarregando(true);

    const convidado = {
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      cidade: cidade.trim(),
      perfil,
      respostas,
      consentimento,
      data_consentimento: new Date().toISOString(),
      origem: 'scout-hall',
    };

    const { error } = await supabase.from('scout_registros').insert({
      tipo: 'convidado',
      titulo: 'Novo convidado SCOUT',
      descricao: `Cadastro concluído por ${nome.trim()}`,
      dados: convidado,
    });

    if (error) {
      console.error('SCOUT — erro ao registrar convidado:', error);

      setErro(
        'Não foi possível concluir agora. Verifique sua conexão e tente novamente.'
      );

      setCarregando(false);
      return;
    }

    console.log('SCOUT — convidado registrado:', convidado);

    setEnviado(true);
    setCarregando(false);
    setEtapa(9);
  };

  const voltar = () => {
    if (etapa >= 3 && etapa <= 6) {
      setEtapa((anterior) => anterior - 1);
      return;
    }

    if (etapa === 7) {
      setEtapa(6);
      return;
    }

    if (etapa === 8) {
      setEtapa(7);
    }
  };

  return (
    <main className="scout-landing">
      <div className="scout-shell">
        <header className="scout-header">
          <div className="scout-brand">
            <div className="scout-logo">
              <Image
                src="/assets/logo-crc.png"
                alt="CRC"
                width={44}
                height={44}
                priority
                className="scout-logo-image"
              />
            </div>

            <div className="scout-brand-copy">
              <div className="scout-brand-name">SCOUT.CRC</div>
              <div className="scout-brand-subtitle">
                inteligência para comunidades
              </div>
            </div>
          </div>

          <div className="scout-header-note">CONHEÇA · EXPLORE · DECIDA</div>
        </header>

        {etapa === 1 && (
          <section className="scout-hero">
            <div className="scout-hero-copy">
              <div className="scout-eyebrow">
                <span className="scout-eyebrow-dot" />
                UMA NOVA FORMA DE CONHECER O CRC
              </div>

              <h1 className="scout-hero-title">
                Antes de escolher,
                <span> descubra.</span>
              </h1>

              <p className="scout-hero-text">
                O SCOUT apresenta o universo CRC de forma simples, clara e sem
                pressão. Você conhece primeiro. Depois decide se alguma coisa
                aqui faz sentido para você.
              </p>

              <div className="scout-hero-actions">
                <button
                  type="button"
                  className="scout-button scout-button-primary"
                  onClick={() => setEtapa(2)}
                >
                  Explorar o CRC
                  <span>→</span>
                </button>

                <div className="scout-hero-caption">
                  Conheça primeiro. Decida depois.
                </div>
              </div>
            </div>

            <div className="scout-hero-art" aria-hidden="true">
              <div className="scout-orbit scout-orbit-one" />
              <div className="scout-orbit scout-orbit-two" />
              <div className="scout-orbit scout-orbit-three" />

              <div className="scout-core">
                <span className="scout-core-label">SCOUT</span>
                <strong>CRC</strong>
                <small>uma comunidade em movimento</small>
              </div>

              <div className="scout-floating scout-floating-top">
                CONSUMO
              </div>

              <div className="scout-floating scout-floating-right">
                RELAÇÃO
              </div>

              <div className="scout-floating scout-floating-bottom">
                COMUNIDADE
              </div>
            </div>
          </section>
        )}

        {etapa === 2 && (
          <section className="scout-content">
            <div className="scout-section-intro">
              <div className="scout-eyebrow">AGORA VOCÊ PODE CONHECER</div>

              <h2 className="scout-section-title">
                O conceito por trás do CRC.
              </h2>

              <p className="scout-section-text">
                Antes das perguntas, veja a ideia que sustenta essa proposta.
                Depois você decide se quer continuar.
              </p>
            </div>

            <div className="scout-video-card">
              <div className="scout-video-frame">
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  className="scout-video"
                  src="/assets/miniAPN.mp4"
                  onEnded={handleVideoEnded}
                >
                  Seu navegador não suporta a reprodução deste vídeo.
                </video>

                <div className="scout-video-fallback">
                  <span>APRESENTAÇÃO CRC</span>
                  <small>
                    O vídeo será disponibilizado nesta etapa quando estiver
                    publicado no ambiente definitivo.
                  </small>
                </div>
              </div>
            </div>

            <div className="scout-choice-row">
  <button
    type="button"
    className="scout-link-button"
    onClick={() => setEtapa(1)}
  >
    ← Voltar
  </button>

  <button
    type="button"
    className="scout-primary-button"
    onClick={() => setEtapa(2.5)}
  >
    Agora quero experimentar →
  </button>
</div>
          </section>
        )}

      
{etapa === 2.5 && (
  <section className="scout-content scout-content-narrow">
    <div className="scout-section-intro">
      <div className="scout-eyebrow">PRÓXIMA ETAPA</div>

      <h2 className="scout-section-title">
        Agora experimente.
      </h2>

      <p className="scout-section-text">
        Você acabou de conhecer o conceito. Agora pode experimentar na
        prática uma das possibilidades do CRC.
      </p>
    </div>

    <div className="scout-profile-options">
      <a
  href="https://simuladorprosff.vercel.app/"
  className="scout-profile-card scout-profile-card-featured scout-simulator-cta"
  style={{
    display: "block",
    padding: "28px",
    border: "2px solid rgba(67, 219, 232, 0.55)",
    borderRadius: "18px",
    background: "linear-gradient(135deg, rgba(67, 219, 232, 0.12), rgba(255, 255, 255, 0.03))",
    boxShadow: "0 0 30px rgba(67, 219, 232, 0.12)",
    textDecoration: "none",
    cursor: "pointer",
  }}
>
        <div className="scout-simulator-cta-content">
          <span className="scout-profile-tag">SIMULADOR</span>

          <strong>Descubra como funciona</strong>

          <small>
            Faça uma simulação e veja, na prática, como essa possibilidade
            pode funcionar para você.
          </small>

          <span className="scout-simulator-cta-action">
            <span>ABRIR SIMULADOR</span>
            <span>→</span>
          </span>
        </div>
      </a>
    </div>

    <button
      type="button"
      className="scout-link-button"
      onClick={() => setEtapa(2)}
    >
      ← Voltar ao vídeo
    </button>
  </section>
)}


        {etapa >= 3 && etapa <= 6 && perguntaAtual && (
          <section className="scout-content scout-content-narrow">
            <div className="scout-progress-head">
              <span>CONHECENDO SEU PERFIL</span>

              <strong>
                {indicePergunta + 1}/{perguntas.length}
              </strong>
            </div>

            <div className="scout-progress">
              <div
                className="scout-progress-bar"
                style={{
                  width: `${((indicePergunta + 1) / perguntas.length) * 100}%`,
                }}
              />
            </div>

            <div className="scout-question-card">
              <h2 className="scout-question-title">
                {perguntaAtual.titulo}
              </h2>

              <p className="scout-section-text">
                Escolha apenas uma opção.
              </p>

              <div className="scout-options">
                {perguntaAtual.opcoes.map((opcao) => {
                  const selecionada = respostaAtual === opcao;

                  return (
                    <button
                      key={opcao}
                      type="button"
                      className="scout-option"
                      aria-pressed={selecionada}
                      onClick={() => selecionarResposta(opcao)}
                      style={
                        selecionada
                          ? {
                              borderColor: 'rgba(0,255,136,.65)',
                              background: 'rgba(0,255,136,.08)',
                            }
                          : undefined
                      }
                    >
                      <span>{opcao}</span>
                      <strong>{selecionada ? '✓' : '→'}</strong>
                    </button>
                  );
                })}
              </div>

              <button
  type="button"
  className="scout-button scout-button-primary scout-form-button"
  disabled={!respostaAtual}
  onClick={continuarPergunta}
>
  {etapa === 6 ? 'Entrar na sala' : 'Continuar'}
  <span>→</span>
</button>

              <button
                type="button"
                className="scout-link-button"
                onClick={voltar}
              >
                ← Voltar
              </button>
            </div>
          </section>
        )}

        {etapa === 7 && (
          <section className="scout-content scout-content-narrow">
            <div className="scout-section-intro">
              <div className="scout-eyebrow">ÚLTIMO PASSO</div>

              <h2 className="scout-section-title">
                O que você gostaria de conhecer primeiro?
              </h2>

              <p className="scout-section-text">
                Não existe resposta certa. Essa escolha apenas orienta a
                próxima etapa da sua jornada.
              </p>
            </div>

            <div className="scout-profile-options">
              <button
                type="button"
                className="scout-profile-card scout-profile-card-featured"
                onClick={() => selecionarPerfil('gestor')}
              >
                <span className="scout-profile-tag">COMUNIDADE</span>

                <strong>Conhecer a construção de uma comunidade</strong>

                <small>
                  Quero entender o papel do gestor dentro do CRC.
                </small>

                <span className="scout-card-arrow">→</span>
              </button>

              <button
                type="button"
                className="scout-profile-card"
                onClick={() => selecionarPerfil('cliente')}
              >
                <span className="scout-profile-tag">CONSUMO</span>

                <strong>Conhecer os produtos</strong>

                <small>Meu principal interesse é o consumo.</small>

                <span className="scout-card-arrow">→</span>
              </button>

              <button
                type="button"
                className="scout-profile-card"
                onClick={() => selecionarPerfil('ambos')}
              >
                <span className="scout-profile-tag">OS DOIS</span>

                <strong>Conhecer consumo e comunidade</strong>

                <small>Quero compreender as duas possibilidades.</small>

                <span className="scout-card-arrow">→</span>
              </button>
            </div>

            <button
              type="button"
              className="scout-link-button"
              onClick={voltar}
            >
              ← Voltar
            </button>
          </section>
        )}

        {etapa === 8 && !enviado && (
          <section className="scout-content scout-content-narrow">
            <div className="scout-section-intro">
              <div className="scout-eyebrow">CONCLUIR JORNADA</div>

              <h2 className="scout-section-title">
                Quer continuar sua jornada no CRC?
              </h2>

              <p className="scout-section-text">
                Deixe seus dados para registrar sua jornada no SCOUT. Eles
                serão utilizados para a finalidade que você autorizou.
              </p>
            </div>

            <form className="scout-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                autoComplete="name"
                required
              />

              <input
                type="tel"
                placeholder="WhatsApp com DDD"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                autoComplete="tel"
                required
              />

              <input
                type="text"
                placeholder="Cidade / Estado (opcional)"
                value={cidade}
                onChange={(event) => setCidade(event.target.value)}
                autoComplete="address-level2"
              />

              <label className="scout-consent">
                <input
                  type="checkbox"
                  checked={consentimento}
                  onChange={(event) =>
                    setConsentimento(event.target.checked)
                  }
                />

                <span>
                  Autorizo o uso dos dados informados para a finalidade
                  apresentada nesta jornada do SCOUT.
                </span>
              </label>

              {erro && <div className="scout-error">{erro}</div>}

              <button
                type="submit"
                className="scout-button scout-button-primary scout-form-button"
                disabled={carregando}
              >
                {carregando ? 'Registrando...' : 'Concluir e avançar'}
                {!carregando && <span>→</span>}
              </button>
            </form>

            <button
              type="button"
              className="scout-link-button"
              onClick={voltar}
            >
              ← Voltar
            </button>
          </section>
        )}

        {etapa === 9 && enviado && (
          <section className="scout-content scout-content-narrow">
            <div className="scout-success">
              <div className="scout-success-icon">✓</div>

              <div className="scout-eyebrow">JORNADA CONCLUÍDA</div>

              <h2 className="scout-section-title">
                Agora você faz parte da jornada SCOUT.
              </h2>

              <p className="scout-section-text">
                Obrigado, {nome.split(' ')[0] || 'por participar'}. Suas
                respostas e seus dados foram registrados com sucesso.
              </p>

              <div className="scout-success-profile">
                <span>SEU INTERESSE</span>

                <strong>
                  {perfil === 'gestor' && 'Construção de comunidade'}
                  {perfil === 'cliente' && 'Produtos e consumo'}
                  {perfil === 'ambos' && 'Comunidade e consumo'}
                </strong>
              </div>
            </div>
          </section>
        )}

        <footer className="scout-footer">
          <span>SCOUT.CRC</span>
          <small>Conheça primeiro. Decida depois.</small>
        </footer>
      </div>
    </main>
  );
}
