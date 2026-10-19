'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Perfil = 'gestor' | 'cliente' | 'ambos' | '';

interface Respostas {
  objetivo: string;
}

export default function LandingPage() {
  const [etapa, setEtapa] = useState(1);
  const [isMuted, setIsMuted] = useState(true);

  const [respostas, setRespostas] = useState<Respostas>({
    objetivo: '',
  });

  const [perfil, setPerfil] = useState<Perfil>('');
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [consentimento, setConsentimento] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [gestorId, setGestorId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const santinhoVideoRef = useRef<HTMLVideoElement | null>(null);

  // PERGUNTAS DO QUIZ ATUALIZADAS PARA AS 3 FRENTES REAIS (FLUXO ENXUTO)
  const perguntas = useMemo(
    () => [
      {
        id: 'objetivo' as const,
        titulo: 'Qual é o seu objetivo principal no momento atual?',
        opcoes: [
          'Transição Profissional & Autonomia de Carreira',
          'Saúde Integrativa, Bem-estar & Ozonioterapia',
          'Consumo Consciente & Economia Doméstica',
        ],
      },
    ],
    []
  );

  const indicePergunta = etapa >= 3 && etapa <= 3 ? etapa - 3 : -1;
  const perguntaAtual = indicePergunta >= 0 ? perguntas[indicePergunta] : null;
  const respostaAtual = perguntaAtual ? respostas[perguntaAtual.id] : '';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gestorIdParam = params.get('gestor_id');

    if (gestorIdParam) {
      setGestorId(gestorIdParam);
      sessionStorage.setItem('scout_gestor_origem', gestorIdParam);
    }

    if (params.get('etapa') === 'quiz') {
      setEtapa(3);
    }
  }, []);

  const toggleAudio = () => {
    if (santinhoVideoRef.current) {
      santinhoVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const selecionarResposta = (valor: string) => {
    if (!perguntaAtual) return;
    setRespostas((anterior) => ({
      ...anterior,
      [perguntaAtual.id]: valor,
    }));
  };

  const continuarPergunta = async () => {
    if (!perguntaAtual || !respostaAtual) return;

    // Como o Quiz agora tem apenas 1 pergunta principal na etapa 3, ao avançar já vamos direto para a etapa de cadastro (etapa 8)
    setEtapa(8);
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

    if (!nome.trim() || !whatsapp.trim() || !cidade.trim()) {
      setErro('Informe seu nome, cidade e WhatsApp para concluir.');
      return;
    }

    setCarregando(true);

    const convidado = {
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      cidade: cidade.trim(),
      perfil: respostas.objetivo,
      respostas,
      consentimento: true,
      data_consentimento: new Date().toISOString(),
      origem: 'scout-hall',
    };

    const { error } = await supabase.from('scout_registros').insert({
      tipo: 'quiz_prospecto',
      gestor_id: gestorId || 'master',
      titulo: `Lead Quiz: ${respostas.objetivo}`,
      dados: {
        convidado: {
          nome: nome.trim(),
          whatsapp: whatsapp.trim(),
          cidade: cidade.trim(),
        },
        perfil: respostas.objetivo,
        respostas,
        status_aprovacao: 'pendente',
        origem: 'quiz_publico',
      },
    });

    if (error) {
      setErro('Não foi possível concluir agora. Verifique sua conexão.');
      setCarregando(false);
      return;
    }

    setEnviado(true);
    setCarregando(false);
    setEtapa(9);
  };

  const voltar = () => {
    if (etapa === 3) {
      setEtapa(2.5);
      return;
    }
    if (etapa === 8) {
      setEtapa(3);
      return;
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
              <div className="scout-brand-subtitle">inteligência para comunidades</div>
              <a href="/sala" className="scout-gestor-link">Acesso do Gestor</a> 
            </div>
          </div>
          
          <div className="scout-header-note">
            {gestorId ? `GESTOR: ${gestorId.toUpperCase()}` : 'CONHEÇA · EXPLORE · DECIDA'}
          </div>
        </header>

        {/* ETAPA 1: SANTINHO DIGITAL */}
        {etapa === 1 && (
          <section className="scout-hero" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '10px 10px 20px 10px' }}>
            <div style={{ maxWidth: '340px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              
              <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '2px', color: '#00ff88', background: 'rgba(0,255,136,0.1)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(0,255,136,0.25)' }}>
                SANTINHO DIGITAL · RISCO ZERO
              </span>

              <div style={{ width: '100%', aspectRatio: '9/16', maxHeight: '55vh', background: '#000', borderRadius: '18px', overflow: 'hidden', border: '2px solid rgba(0,255,136,0.5)', boxShadow: '0 0 35px rgba(0,255,136,0.25)', position: 'relative' }}>
                <video
                  ref={santinhoVideoRef}
                  src="/assets/santinho.mp4"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                
                <button
                  type="button"
                  onClick={toggleAudio}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: '#00ff88',
                    border: '1px solid rgba(0, 255, 136, 0.4)',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10
                  }}
                >
                  {isMuted ? '🔇 LIGAR SOM' : '🔊 COM SOM'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setEtapa(2)}
                className="btn-destaque-neon"
              >
                ENTRAR NO SCOUT ➔
              </button>

              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                Conheça primeiro. Decida depois.
              </p>
            </div>
          </section>
        )}

        {/* ETAPA 2: MINI APN */}
        {etapa === 2 && (
          <section className="scout-content" style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: '8px', height: 'calc(100vh - 80px)', justifyContent: 'space-between' }}>
            <div className="scout-section-intro" style={{ textAlign: 'center', marginBottom: '0' }}>
              <div className="scout-eyebrow" style={{ color: '#00ff88', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                AGORA VOCÊ PODE CONHECER
              </div>
              <h2 className="scout-section-title" style={{ fontSize: '18px', margin: '2px 0 6px', lineHeight: '1.2' }}>
                O conceito por trás do CRC.
              </h2>
            </div>

            <div className="scout-video-card" style={{ width: '100%', maxWidth: '320px', margin: '0 auto', flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div className="scout-video-frame" style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(0,255,136,0.3)', background: '#000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  className="scout-video"
                  src="/assets/miniAPN.mp4"
                  onEnded={handleVideoEnded}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                >
                  Seu navegador não suporta a reprodução deste vídeo.
                </video>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '320px', margin: '0 auto', paddingTop: '8px' }}>
              <button 
                type="button" 
                className="btn-destaque-neon"
                onClick={() => setEtapa(2.5)}
                style={{ padding: '14px' }}
              >
                QUERO EXPERIMENTAR ➔
              </button>

              <button 
                type="button" 
                className="btn-voltar-sutil"
                onClick={() => setEtapa(1)}
                style={{ padding: '10px' }}
              >
                ← Voltar
              </button>
            </div>
          </section>
        )}

        {/* ETAPA 2.5: EXPERIMENTE / SIMULADOR */}
        {etapa === 2.5 && (
          <section className="scout-content scout-content-narrow">
            <div className="scout-section-intro">
              <div className="scout-eyebrow">PRÓXIMA ETAPA</div>
              <h2 className="scout-section-title">Agora experimente.</h2>
              <p className="scout-section-text">
                Você acabou de conhecer o conceito. Agora responda ao nosso Quiz rápido para alinhar seu objetivo.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                className="btn-destaque-neon"
                onClick={() => setEtapa(3)}
              >
                RESPONDER AO QUIZ DE OBJETIVO ➔
              </button>
            </div>

            <button type="button" className="btn-voltar-sutil" onClick={() => setEtapa(2)} style={{ marginTop: '12px' }}>
              ← Voltar ao vídeo
            </button>
          </section>
        )}

        {/* ETAPA 3: QUIZ DE PERFIL ENXUTO (1 ÚNICA PERGUNTAN PRINCIPAL) */}
        {etapa === 3 && perguntaAtual && (
          <section className="scout-content scout-content-narrow">
            <div className="scout-progress-head">
              <span>QUALIFICAÇÃO CRC</span>
              <strong>1/1</strong>
            </div>

            <div className="scout-progress">
              <div className="scout-progress-bar" style={{ width: '100%' }} />
            </div>

            <div className="scout-question-card">
              <h2 className="scout-question-title">{perguntaAtual.titulo}</h2>
              <p className="scout-section-text">Escolha apenas uma opção.</p>

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
                      style={selecionada ? { borderColor: 'rgba(0,255,136,.65)', background: 'rgba(0,255,136,.08)' } : undefined}
                    >
                      <span>{opcao}</span>
                      <strong>{selecionada ? '✓' : '→'}</strong>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-destaque-neon"
                  disabled={!respostaAtual}
                  onClick={continuarPergunta}
                >
                  CONTINUAR PARA CONTATO ➔
                </button>

                <button type="button" className="btn-voltar-sutil" onClick={voltar}>
                  ← Voltar
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ETAPA 8: FORMULÁRIO DE CADASTRO FINAL (SEM E-MAIL, APENAS DADOS DIRETOS) */}
        {etapa === 8 && !enviado && (
          <section className="scout-content scout-content-narrow">
            <div className="scout-section-intro">
              <div className="scout-eyebrow">CONCLUIR JORNADA</div>
              <h2 className="scout-section-title">Seus dados para contato direto:</h2>
              <p className="scout-section-text">Para que o gestor responsável possa falar com você.</p>
            </div>

            <form className="scout-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Cidade / Estado (Ex: Cabo Frio - RJ)"
                value={cidade}
                onChange={(event) => setCidade(event.target.value)}
                required
              />

              <input
                type="tel"
                placeholder="WhatsApp com DDD (Ex: 22997788554)"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                required
              />

              {erro && <div className="scout-error">{erro}</div>}

              <button type="submit" className="btn-destaque-neon" disabled={carregando} style={{ marginTop: '10px' }}>
                {carregando ? 'ENVIANDO...' : 'FINALIZAR & FALAR COM GESTOR 🚀'}
              </button>
            </form>

            <button type="button" className="btn-voltar-sutil" onClick={() => setEtapa(3)} style={{ marginTop: '12px' }}>
              ← Voltar
            </button>
          </section>
        )}

        {/* ETAPA 9: SUCESSO */}
        {etapa === 9 && enviado && (
          <section className="scout-content scout-content-narrow">
            <div className="scout-success" style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
              <div className="scout-eyebrow">CADASTRO REALIZADO</div>
              <h2 className="scout-section-title" style={{ color: '#00ff88' }}>Tudo pronto, {nome.split(' ')[0]}!</h2>
              <p className="scout-section-text" style={{ margin: '15px 0 25px' }}>
                Seu objetivo ({respostas.objetivo}) foi registrado e enviado para o gestor responsável.
              </p>
              <a
                href={`https://wa.me/5522997881122?text=${encodeURIComponent(`Olá! Acabei de responder ao Quiz do SCOUT.CRC. Meu objetivo é: ${respostas.objetivo}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', background: '#00ff88', color: '#050505', padding: '14px', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}
              >
                💬 Abrir Conversa no WhatsApp
              </a>
            </div>
          </section>
        )}

        <footer className="scout-footer">
          <span>SCOUT.CRC</span>
          <small>Conheça primeiro. Decida depois.</small>
        </footer>
      </div>

      <style jsx>{`
        .btn-destaque-neon {
          width: 100%;
          padding: 16px;
          background: #00ff88;
          color: #050505;
          font-weight: 900;
          font-size: 13px;
          border-radius: 14px;
          border: none;
          letter-spacing: 1px;
          cursor: pointer;
          box-shadow: 0 0 25px rgba(0, 255, 136, 0.35);
          transition: all 0.2s ease;
          text-align: center;
        }
        .btn-destaque-neon:hover {
          background: #26ff97;
          box-shadow: 0 0 35px rgba(0, 255, 136, 0.55);
          transform: translateY(-1px);
        }
        .btn-destaque-neon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }
        .btn-voltar-sutil {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
          font-size: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }
        .btn-voltar-sutil:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </main>
  );
}