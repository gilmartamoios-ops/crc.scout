'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Modulo = {
  nome: string;
  descricao: string;
  icone: string;
};

const modulos: Modulo[] = [
  {
    nome: 'Informativos',
    descricao: 'Informes, atualizações e notícias do mercado.',
    icone: '◈',
  },
  {
    nome: 'Mentoria',
    descricao: 'Gestão de comunidade e desenvolvimento de liderança.',
    icone: '✦',
  },
  {
    nome: 'Curadoria',
    descricao: 'Ciência do produto, produtos e ativos selecionados.',
    icone: '◇',
  },
  {
    nome: 'Seu SCOUT',
    descricao: 'Sua operação de prospecção e gestão de convidados.',
    icone: '✧',
  },
];

export default function SalaPage() {
  const [moduloAtivo, setModuloAtivo] = useState<string | null>(null);
  const [moduloRestrito, setModuloRestrito] = useState<Modulo | null>(null);
  const [gestorDesbloqueado, setGestorDesbloqueado] = useState(false);

  const [gestor, setGestor] = useState<{
    id: string;
    nome: string;
    whatsapp: string;
    slug: string | null;
  } | null>(null);

  const lidarComCliqueModulo = (modulo: Modulo) => {
    if (!gestorDesbloqueado) {
      // Se for lead/convidado, abre o modal de aviso de validação/X1
      setModuloRestrito(modulo);
      return;
    }
    // Se for gestor liberado, exibe o conteúdo no centro da tela
    setModuloAtivo(modulo.nome);
  };

  useEffect(() => {
    function verificarSessao() {
      const dados = sessionStorage.getItem('scout_gestor');
      if (!dados) return;

      try {
        const gestorSalvo = JSON.parse(dados);
        if (gestorSalvo?.id && gestorSalvo?.nome) {
          setGestor(gestorSalvo);
          setGestorDesbloqueado(true);
        }
      } catch {
        sessionStorage.removeItem('scout_gestor');
      }
    }

    verificarSessao();
  }, []);

  const linkSantinho = `https://crc-scout.vercel.app/?gestor_id=${gestor?.slug || 'master'}`;

  return (
    <main className="sala-page">
      <div className="sala-shell">
        <header className="sala-header">
          <div className="sala-brand">
            <div className="sala-brand-mark">CRC</div>
            <div>
              <div className="sala-brand-name">SCOUT.CRC</div>
              <div className="sala-brand-subtitle">
                sala de operações · ambiente operacional
              </div>
            </div>
          </div>

          <div className="sala-header-status">
            {gestor ? (
              <span>GESTOR · {gestor.nome}</span>
            ) : (
              <button
                type="button"
                className="sala-chave-btn"
                onClick={() => {
                  window.location.href = '/gestor';
                }}
              >
                🔑 Chave do gestor
              </button>
            )}

            <span className="sala-status-dot" />
            AMBIENTE CRC
          </div>
        </header>

        <div className="sala-layout">
          {/* Menu Lateral */}
          <aside className="sala-sidebar">
            <div className="sala-sidebar-heading">
              <span>AMBIENTES</span>
              <small>ACESSOS</small>
            </div>

            <nav className="sala-menu">
              {modulos.map((modulo) => (
                <button
                  key={modulo.nome}
                  type="button"
                  className={`sala-menu-item ${moduloAtivo === modulo.nome ? 'active' : ''}`}
                  onClick={() => lidarComCliqueModulo(modulo)}
                >
                  <span className="sala-menu-icon">{modulo.icone}</span>
                  <span className="sala-menu-copy">
                    <strong>{modulo.nome}</strong>
                    <small>{gestorDesbloqueado ? 'acesso de gestor' : '🔒 restrito'}</small>
                  </span>
                  <span className="sala-lock">{gestorDesbloqueado ? '✦' : '⌕'}</span>
                </button>
              ))}
            </nav>

            <div className="sala-sidebar-footer">
              {gestor ? (
                <>
                  <span className="sala-visitor-tag">GESTOR DE COMUNIDADE</span>
                  <strong className="sala-gestor-name">{gestor.nome}</strong>
                  <p>Você está na sua Sala de Operações.</p>
                </>
              ) : (
                <>
                  <span className="sala-visitor-tag">CONVIDADO</span>
                  <p>Aguarde a validação do seu gestor para liberar os recursos operacionais.</p>
                </>
              )}
            </div>
          </aside>

          {/* Área Central Dinâmica */}
          <section className="sala-main">
            <div className="sala-welcome">
              <div>
                <div className="sala-eyebrow">VOCÊ JÁ ESTÁ DENTRO</div>
                <h1>
                  Bem-vindo à <span>Sala de Operações.</span>
                </h1>
                <p>
                  Este é o ambiente onde o desenvolvimento do negócio acontece. Explore, observe e descubra como tudo se conecta.
                </p>
              </div>

              <div className="sala-welcome-mark">
                <span>CRC</span>
                <small>COMUNIDADE · RELAÇÃO · CONSUMO</small>
              </div>
            </div>

            {/* Conteúdo Dinâmico Central com base na seleção do Menu */}
            <div className="sala-center-viewport">
              {/* Caso o Gestor clique em "Seu SCOUT" */}
              {gestorDesbloqueado && moduloAtivo === 'Seu SCOUT' && (
                <div className="sala-dynamic-card">
                  <span className="sala-eyebrow" style={{ color: '#00ff88' }}>ÁREA EXCLUSIVA DO GESTOR</span>
                  <h3 style={{ fontSize: '20px', margin: '8px 0 4px', color: '#fff' }}>Seu Link de Prospecção & Santinho Digital</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>
                    Partilhe o seu link personalizado abaixo. Os novos leads ficarão vinculados diretamente à sua operação.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input
                      type="text"
                      readOnly
                      value={linkSantinho}
                      style={{ flex: 1, background: '#050505', border: '1px solid rgba(0,255,136,0.3)', padding: '12px 16px', borderRadius: '10px', color: '#00ff88', fontSize: '12px' }}
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(linkSantinho)}
                      style={{ background: '#00ff88', color: '#050505', border: 'none', padding: '12px 22px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Copiar Link
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <img
                      src="/assets/santinho-digital.png"
                      alt="Santinho Digital"
                      style={{ width: '80px', borderRadius: '8px', border: '1px solid rgba(0,255,136,0.2)' }}
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#fff' }}>Peça de Atração Ativa</strong>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                        O Santinho Digital está integrado para captar leads qualificados com rastreio automático de gestor.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Caso o Gestor clique em outros módulos ativos */}
              {gestorDesbloqueado && moduloAtivo && moduloAtivo !== 'Seu SCOUT' && (
                <div className="sala-dynamic-card">
                  <span className="sala-eyebrow" style={{ color: '#00ff88' }}>MÓDULO OPERACIONAL</span>
                  <h3 style={{ fontSize: '20px', margin: '8px 0 4px', color: '#fff' }}>{moduloAtivo}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>
                    Este ambiente está configurado e pronto para receber os conteúdos e diretrizes da liderança CRC.
                  </p>
                </div>
              )}

              {/* Visual Padrão (Nenhum módulo aberto no centro): Gráfico Vetorial 3D/Neon de Comunidade */}
              {(!gestorDesbloqueado || !moduloAtivo) && (
                <div className="sala-hero-art-container">
                  <div className="sala-art-text">
                    <span className="sala-eyebrow">REDE DE CONSUMO & GESTÃO</span>
                    <h2>Conexão, Pertencimento e Escala</h2>
                    <p>O ecossistema CRC integra tecnologia de ponta, renda recorrente e desenvolvimento colaborativo.</p>
                  </div>

                  {/* Vetor 3D / Neon Estilizado de Comunidade */}
                  <svg className="sala-neon-network" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="neonGrad" x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00ff88" stopOpacity="0.8" />
                        <stop offset="1" stopColor="#2bd9ff" stopOpacity="0.4" />
                      </linearGradient>
                      <radialGradient id="glowNode" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 120) scale(150)">
                        <stop stopColor="#00ff88" stopOpacity="0.25" />
                        <stop offset="1" stopColor="#00ff88" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <circle cx="200" cy="120" r="110" fill="url(#glowNode)" />
                    {/* Linhas de conexão */}
                    <path d="M200 120L110 70M200 120L290 70M200 120L150 190M200 120L250 190M110 70L60 120M290 70L340 120M150 190L80 170M250 190L320 170" stroke="url(#neonGrad)" strokeWidth="1.5" strokeOpacity="0.6" />
                    {/* Nós da rede */}
                    <circle cx="200" cy="120" r="12" fill="#00ff88" fillOpacity="0.2" stroke="#00ff88" strokeWidth="2" />
                    <circle cx="200" cy="120" r="4" fill="#00ff88" />
                    <circle cx="110" cy="70" r="8" fill="#2bd9ff" fillOpacity="0.2" stroke="#2bd9ff" strokeWidth="1.5" />
                    <circle cx="290" cy="70" r="8" fill="#00ff88" fillOpacity="0.2" stroke="#00ff88" strokeWidth="1.5" />
                    <circle cx="150" cy="190" r="8" fill="#00ff88" fillOpacity="0.2" stroke="#00ff88" strokeWidth="1.5" />
                    <circle cx="250" cy="190" r="8" fill="#2bd9ff" fillOpacity="0.2" stroke="#2bd9ff" strokeWidth="1.5" />
                    <circle cx="60" cy="120" r="6" fill="#fff" fillOpacity="0.3" />
                    <circle cx="340" cy="120" r="6" fill="#fff" fillOpacity="0.3" />
                  </svg>
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="sala-footer">
          <span>SCOUT.CRC</span>
          <small>Conheça o ambiente. Descubra o seu lugar.</small>
        </footer>
      </div>

      {/* Modal de Validação / X1 para Leads */}
      {moduloRestrito && (
        <div className="sala-modal-backdrop" onClick={() => setModuloRestrito(null)}>
          <div className="sala-modal" onClick={(event) => event.stopPropagation()}>
            <div className="sala-modal-lock">🔒</div>
            <div className="sala-eyebrow">SALA DE OPERAÇÕES · VALIDAÇÃO PENDENTE</div>
            <h2>{moduloRestrito.nome}</h2>
            <p>{moduloRestrito.descricao}</p>

            <div className="sala-modal-message">
              Bem-vindo à Sala de Operações! Sua solicitação deu entrada no sistema.
              <br />
              <strong>Aguarde a validação do seu Gestor de referência para desbloquear este recurso no atendimento X1.</strong>
            </div>

            <button
              type="button"
              className="sala-modal-close"
              onClick={() => setModuloRestrito(null)}
            >
              Compreendido
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .sala-page {
          min-height: 100vh;
          background: radial-gradient(circle at 70% 16%, rgba(0, 255, 136, 0.08), transparent 26%), #050505;
          color: #f5f7f8;
          padding: 18px;
        }
        .sala-shell {
          min-height: calc(100vh - 36px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          background: rgba(8, 10, 10, 0.72);
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.45);
          overflow: hidden;
        }
        .sala-header {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 26px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(255, 255, 255, 0.015);
        }
        .sala-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sala-brand-mark {
          display: flex;
          width: 42px;
          height: 42px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0, 255, 136, 0.42);
          border-radius: 12px;
          color: #00ff88;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .sala-brand-name {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 2px;
        }
        .sala-brand-subtitle {
          margin-top: 3px;
          color: rgba(255, 255, 255, 0.45);
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .sala-header-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.45);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
        }
        .sala-chave-btn {
          background: rgba(0,255,136,0.1);
          border: 1px solid rgba(0,255,136,0.3);
          color: #00ff88;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 10px;
        }
        .sala-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00ff88;
          box-shadow: 0 0 14px rgba(0, 255, 136, 0.75);
        }
        .sala-layout {
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          min-height: calc(100vh - 112px);
        }
        .sala-sidebar {
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(0, 0, 0, 0.18);
        }
        .sala-sidebar-heading {
          display: flex;
          justify-content: space-between;
          padding: 22px 18px 12px;
          color: rgba(255, 255, 255, 0.42);
          font-size: 9px;
          letter-spacing: 1.7px;
        }
        .sala-menu {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 10px;
        }
        .sala-menu-item {
          display: grid;
          grid-template-columns: 30px minmax(0, 1fr) auto;
          gap: 10px;
          align-items: center;
          width: 100%;
          padding: 12px 10px;
          color: inherit;
          text-align: left;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .sala-menu-item:hover, .sala-menu-item.active {
          border-color: rgba(0, 255, 136, 0.25);
          background: rgba(0, 255, 136, 0.06);
        }
        .sala-menu-icon {
          display: flex;
          width: 30px;
          height: 30px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9px;
          color: rgba(255, 255, 255, 0.55);
          font-size: 12px;
        }
        .sala-menu-copy {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 3px;
        }
        .sala-menu-copy strong {
          font-size: 12px;
          font-weight: 700;
        }
        .sala-menu-copy small {
          color: rgba(255, 255, 255, 0.34);
          font-size: 9px;
        }
        .sala-lock {
          color: rgba(255, 255, 255, 0.28);
          font-size: 12px;
        }
        .sala-sidebar-footer {
          margin-top: auto;
          padding: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .sala-visitor-tag {
          display: inline-flex;
          padding: 6px 8px;
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 999px;
          color: #00ff88;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }
        .sala-gestor-name {
          display: block;
          margin-top: 10px;
          color: rgba(255, 255, 255, 0.88);
          font-size: 13px;
          font-weight: 700;
        }
        .sala-sidebar-footer p {
          margin-top: 10px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 10px;
          line-height: 1.5;
        }
        .sala-main {
          min-width: 0;
          padding: 28px;
        }
        .sala-welcome {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          padding-bottom: 24px;
        }
        .sala-eyebrow {
          color: rgba(255, 255, 255, 0.42);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.7px;
          text-transform: uppercase;
        }
        .sala-welcome h1 {
          max-width: 720px;
          margin: 8px 0 10px;
          font-size: clamp(28px, 4vw, 52px);
          line-height: 0.98;
          letter-spacing: -1.7px;
        }
        .sala-welcome h1 span {
          color: #00ff88;
        }
        .sala-welcome p {
          max-width: 650px;
          margin: 0;
          color: rgba(255, 255, 255, 0.55);
          font-size: 13px;
          line-height: 1.65;
        }
        .sala-welcome-mark {
          min-width: 190px;
          padding: 12px 0 0;
          text-align: right;
        }
        .sala-welcome-mark span {
          display: block;
          color: rgba(255, 255, 255, 0.07);
          font-size: 58px;
          font-weight: 900;
          line-height: 0.8;
          letter-spacing: 5px;
        }
        .sala-welcome-mark small {
          display: block;
          margin-top: 10px;
          color: rgba(255, 255, 255, 0.25);
          font-size: 8px;
          letter-spacing: 1.3px;
        }
        .sala-center-viewport {
          margin-top: 10px;
        }
        .sala-dynamic-card {
          background: rgba(0, 255, 136, 0.03);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }
        .sala-hero-art-container {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          align-items: center;
          gap: 20px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 34px;
        }
        .sala-art-text h2 {
          font-size: 22px;
          margin: 6px 0 10px;
          color: #fff;
          letter-spacing: -0.5px;
        }
        .sala-art-text p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.6;
        }
        .sala-neon-network {
          width: 100%;
          max-height: 180px;
        }
        .sala-footer {
          display: flex;
          justify-content: space-between;
          padding: 14px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.24);
          font-size: 8px;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }
        .sala-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.76);
          backdrop-filter: blur(10px);
        }
        .sala-modal {
          width: min(460px, 100%);
          padding: 30px;
          border: 1px solid rgba(0, 255, 136, 0.16);
          border-radius: 22px;
          background: #0b0f0d;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.54);
          text-align: center;
        }
        .sala-modal-lock {
          display: flex;
          width: 48px;
          height: 48px;
          margin: 0 auto 18px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 15px;
          color: #00ff88;
          font-size: 18px;
        }
        .sala-modal h2 {
          margin: 8px 0 10px;
          font-size: 28px;
        }
        .sala-modal p {
          color: rgba(255, 255, 255, 0.45);
          font-size: 12px;
          line-height: 1.5;
        }
        .sala-modal-message {
          margin-top: 18px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.025);
          color: rgba(255, 255, 255, 0.46);
          font-size: 11px;
          line-height: 1.6;
        }
        .sala-modal-message strong {
          color: #f0f3f3;
        }
        .sala-modal-close {
          width: 100%;
          margin-top: 18px;
          padding: 12px 16px;
          border: 1px solid rgba(0, 255, 136, 0.28);
          border-radius: 12px;
          background: rgba(0, 255, 136, 0.06);
          color: #00ff88;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.9px;
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}