'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Perfil = 'gestor' | 'cliente' | 'ambos' | '';

interface Respostas {
  objetivo: string;
}

export default function LandingPage() {
  // Passos da jornada: 
  // 1 = Santinho Digital
  // 2 = Mini-APN
  // 2.2 = Aviso de Rigor Técnico
  // 2.4 = Simulador de Negócio
  // 2.6 = Sala de Operações (Modo Visitante 🔒)
  // 3 = Quiz
  // 8 = Formulário de Cadastro
  // 9 = Sucesso / Tela Final Desfocada (Blur)
  const [etapa, setEtapa] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(true);

  const [respostas, setRespostas] = useState<Respostas>({
    objetivo: '',
  });

  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [gestorId, setGestorId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const santinhoVideoRef = useRef<HTMLVideoElement | null>(null);

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

  const perguntaAtual = perguntas[0];
  const respostaAtual = respostas.objetivo;

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
    setRespostas({ objetivo: valor });
  };

  const continuarPergunta = () => {
    if (!respostaAtual) return;
    setEtapa(8);
  };

  const handleVideoEnded = () => {
    setEtapa(2.2); // Avança automaticamente para o Aviso de Rigor Técnico após a Mini-APN
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro('');

    if (!nome.trim() || !whatsapp.trim() || !cidade.trim()) {
      setErro('Informe seu nome, cidade e WhatsApp para concluir.');
      return;
    }

    setCarregando(true);

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
    setEtapa(9); // Tela final com desfoque e bloqueio de retorno
  };

  const voltar = () => {
    if (etapa === 2.2) setEtapa(2);
    else if (etapa === 2.4) setEtapa(2.2);
    else if (etapa === 2.6) setEtapa(2.4);
    else if (etapa === 3) setEtapa(2.6);
    else if (etapa === 8) setEtapa(3);
  };

  return (
    <main className="scout-landing" style={{ position: 'relative', minHeight: '100vh', background: '#050505' }}>
      
      {/* SE A ETAPA FOR 9, APLICA O DESFOQUE GLOBAL NA TELA DE FUNDO */}
      <div style={etapa === 9 ? { filter: 'blur(16px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.4 } : undefined}>
        
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
                  onClick={() => setEtapa(2.2)}
                  style={{ padding: '14px' }}
                >
                  AVANÇAR PARA SIMULAÇÃO ➔
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

          {/* ETAPA 2.2: AVISO DE RIGOR TÉCNICO */}
          {etapa === 2.2 && (
            <section className="scout-content scout-content-narrow" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>📌</span>
              <div className="scout-eyebrow" style={{ color: '#00ff88', marginBottom: '8px' }}>PRECISÃO FINANCEIRA</div>
              <h2 className="scout-section-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Nota de Rigor Técnico</h2>
              <p className="scout-section-text" style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '24px' }}>
                O <strong>Simulador de Negócio</strong> a seguir baseia-se rigorosamente nas regras de cálculo, pontos e bonificações oficiais do nosso Plano de Negócios. Os valores projetados refletem a duplicação real do consumo consciente da sua futura comunidade.
              </p>
              <button
                type="button"
                className="btn-destaque-neon"
                onClick={() => setEtapa(2.4)}
              >
                ENTRAR NO SIMULADOR DE NEGÓCIO →
              </button>
              <button type="button" className="btn-voltar-sutil" onClick={voltar} style={{ marginTop: '12px' }}>
                ← Voltar
              </button>
            </section>
          )}

          {/* ETAPA 2.4: SIMULADOR DE NEGÓCIO */}
          {etapa === 2.4 && (
            <section className="scout-content scout-content-narrow" style={{ textAlign: 'center', padding: '30px 20px' }}>
              <div className="scout-eyebrow" style={{ color: '#00ff88', marginBottom: '6px' }}>PROJEÇÃO DE BONIFICAÇÃO</div>
              <h2 className="scout-section-title" style={{ fontSize: '22px', marginBottom: '16px' }}>Simulador de Negócio MMN.CRC</h2>

              <div style={{ background: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.3)', marginBottom: '24px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Duplicação Estimada:</span>
                  <strong style={{ color: '#00ff88' }}>5 Gestores na 1ª Linha</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Consumo Familiar Base:</span>
                  <strong style={{ color: '#00ff88' }}>300 Pontos/Mês</strong>
                </div>
                <div style={{ borderTop: '1px dashed rgba(0,255,136,0.2)', paddingTop: '12px', marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>Renda Recorrente:</span>
                  <strong style={{ color: '#00ff88', fontSize: '18px' }}>R$ 4.250,00 / mês</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEtapa(2.6)}
                style={{
                  background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                  color: '#050505',
                  border: 'none',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  fontWeight: '900',
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0,255,136,0.35)',
                  width: '100%',
                }}
              >
                ⚡ VISITE A SALA DE OPERAÇÕES DO SEU FUTURO NEGÓCIO →
              </button>
              <button type="button" className="btn-voltar-sutil" onClick={voltar} style={{ marginTop: '12px' }}>
                ← Voltar
              </button>
            </section>
          )}

          {/* ETAPA 2.6: SALA DE OPERAÇÕES (MODO VISITANTE 🔒) */}
          {etapa === 2.6 && (
            <section className="scout-content" style={{ padding: '20px' }}>
              <div style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ color: '#ffd700', fontSize: '11px', fontWeight: 'bold' }}>
                  🔒 MODO VISITANTE · DEGUSTAÇÃO DO COCKPIT
                </span>
                <button
                  type="button"
                  onClick={() => setEtapa(3)}
                  style={{ background: '#00ff88', color: '#050505', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: '11px', cursor: 'pointer' }}
                >
                  PREENCHER QUIZ & DESBLOQUEAR →
                </button>
              </div>

              <div style={{ opacity: 0.65, pointerEvents: 'none', background: '#0b0f0d', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', color: '#fff', margin: '0 0 4px' }}>Sala de Operações SCOUT.CRC</h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 16px' }}>Ambiente operacional restrito a Gestores de Comunidade.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.5)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <strong>Informativos 🔒</strong>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.5)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <strong>Mentoria 🔒</strong>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.5)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <strong>Curadoria 🔒</strong>
                  </div>
                </div>
              </div>
              <button type="button" className="btn-voltar-sutil" onClick={voltar} style={{ marginTop: '16px' }}>
                ← Voltar
              </button>
            </section>
          )}

          {/* ETAPA 3: QUIZ DE PERFIL ENXUTO */}
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

          {/* ETAPA 8: FORMULÁRIO DE CADASTRO FINAL */}
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

              <button type="button" className="btn-voltar-sutil" onClick={voltar} style={{ marginTop: '12px' }}>
                ← Voltar
              </button>
            </section>
          )}

          <footer className="scout-footer">
            <span>SCOUT.CRC</span>
            <small>Conheça primeiro. Decida depois.</small>
          </footer>
        </div>
      </div>

      {/* ETAPA 9: TELA FINAL COM DESFOQUE (BLUR) E RETORNO BLOQUEADO */}
      {etapa === 9 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(5,5,5,0.75)', backdropFilter: 'blur(16px)' }}>
          <div style={{ width: 'min(480px, 100%)', padding: '32px', border: '1px solid rgba(0,255,136,0.4)', borderRadius: '24px', background: '#0b0f0d', boxShadow: '0 30px 100px rgba(0,255,136,0.25)', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔒</div>
            <span style={{ color: '#00ff88', fontSize: '10px', fontWeight: '900', letterSpacing: '2px', display: 'block', marginBottom: '6px' }}>
              SOLICITAÇÃO ENVIADA COM SUCESSO!
            </span>
            <h2 style={{ fontSize: '22px', color: '#fff', margin: '0 0 12px' }}>Aguardando Validação do Gestor</h2>
            
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.6', marginBottom: '20px' }}>
              Sua Ficha de Qualificação deu entrada no sistema. O seu Gestor de Comunidade recebeu seu perfil e iniciará seu atendimento individual no X1.
            </p>

            <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', padding: '14px', borderRadius: '12px', fontSize: '11px', color: '#00ff88', fontWeight: 'bold', marginBottom: '20px' }}>
              ⚡ Não feche esta tela. Mantenha seu WhatsApp por perto para receber seu Código de Entrada.
            </div>

            <a
              href={`https://wa.me/5522997881122?text=${encodeURIComponent(`Olá! Acabei de responder ao Quiz do SCOUT.CRC. Meu objetivo é: ${respostas.objetivo}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', background: '#00ff88', color: '#050505', padding: '14px', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none', fontSize: '13px' }}
            >
              💬 Abrir Conversa no WhatsApp Agora
            </a>
          </div>
        </div>
      )}

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