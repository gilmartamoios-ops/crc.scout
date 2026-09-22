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
  const [moduloSelecionado, setModuloSelecionado] =
    useState<Modulo | null>(null);
   const [gestorDesbloqueado, setGestorDesbloqueado] = useState(false);
const [chaveAcesso, setChaveAcesso] = useState('');
const [mostrarChave, setMostrarChave] = useState(false); 
const [gestor, setGestor] = useState<{
  id: string;
  nome: string;
  whatsapp: string;
  slug: string | null;
} | null>(null);
const abrirModulo = (modulo: Modulo) => {
  if (gestorDesbloqueado) {
    setModuloSelecionado(modulo);
    return;
  }

  setModuloSelecionado(null);
  setMostrarChave(true);
};
useEffect(() => {
  async function verificarSessao() {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      return;
    }

    const dados = sessionStorage.getItem('scout_gestor');

    if (!dados) return;

    try {
      const gestorSalvo = JSON.parse(dados);

      if (gestorSalvo?.id && gestorSalvo?.nome) {
        setGestor(gestorSalvo);
      }
    } catch {
      sessionStorage.removeItem('scout_gestor');
    }
  }

  verificarSessao();
}, []);

  return (
    <main className="sala-page">
      <div className="sala-shell">
        <header className="sala-header">
          <div className="sala-brand">
            <div className="sala-brand-mark">CRC</div>

            <div>
              <div className="sala-brand-name">SCOUT.CRC</div>
              <div className="sala-brand-subtitle">
                sala de estar · ambiente operacional
              </div>
            </div>
          </div>

         <div className="sala-header-status">
  <button
    type="button"
    onClick={() => setMostrarChave(true)}
  >
    🔑 Chave do gestor
  </button>
  <span className="sala-status-dot" />
  AMBIENTE CRC
</div>
        </header>

        <div className="sala-layout">
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
                  className="sala-menu-item"
                  onClick={() => abrirModulo(modulo)}
                >
                  <span className="sala-menu-icon">{modulo.icone}</span>

                  <span className="sala-menu-copy">
                    <strong>{modulo.nome}</strong>
                    <small>acesso de gestor</small>
                  </span>

                  <span className="sala-lock">⌕</span>
                </button>
              ))}
            </nav>

            <div className="sala-sidebar-footer">
  {gestor ? (
    <>
      <span className="sala-visitor-tag">GESTOR DE COMUNIDADE</span>

      <strong className="sala-gestor-name">
        {gestor.nome}
      </strong>

      <p>
        Você está na sua Sala de Estar.
      </p>
    </>
  ) : (
    <>
      <span className="sala-visitor-tag">CONVIDADO</span>

      <p>
        Você está conhecendo o ambiente operacional do CRC.
      </p>
    </>
  )}
</div>
          </aside>

          <section className="sala-main">
            <div className="sala-welcome">
              <div>
                <div className="sala-eyebrow">
                  VOCÊ JÁ ESTÁ DENTRO
                </div>

                <h1>
                  Bem-vindo à <span>Sala de Estar.</span>
                </h1>

                <p>
                  Este é o ambiente onde o desenvolvimento do negócio
                  acontece. Explore, observe e descubra como tudo se conecta.
                </p>
              </div>

              <div className="sala-welcome-mark">
                <span>CRC</span>
                <small>COMUNIDADE · RELAÇÃO · CONSUMO</small>
              </div>
            </div>

            <div className="sala-room">
              <div className="sala-banner">
                <div className="sala-banner-copy">
                  <span>CRC</span>

                  <strong>
                    Uma estrutura para
                    <br />
                    desenvolver comunidades.
                  </strong>

                  <small>
                    Explore o ambiente antes de decidir ocupar um lugar nele.
                  </small>
                </div>

                <svg
                  className="sala-banner-art"
                  viewBox="0 0 520 320"
                  role="img"
                  aria-label="Arte vetorial abstrata do ambiente CRC"
                >
                  <defs>
                    <linearGradient
                      id="crcGlow"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#00ff88" />
                      <stop offset="100%" stopColor="#2bd9ff" />
                    </linearGradient>

                    <radialGradient id="crcAura">
                      <stop offset="0%" stopColor="#00ff88" stopOpacity=".28" />
                      <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  <circle
                    cx="360"
                    cy="150"
                    r="140"
                    fill="url(#crcAura)"
                  />

                  <circle
                    cx="360"
                    cy="150"
                    r="94"
                    fill="none"
                    stroke="url(#crcGlow)"
                    strokeOpacity=".38"
                    strokeWidth="1"
                  />

                  <circle
                    cx="360"
                    cy="150"
                    r="64"
                    fill="none"
                    stroke="url(#crcGlow)"
                    strokeOpacity=".58"
                    strokeWidth="1"
                  />

                  <circle
                    cx="360"
                    cy="150"
                    r="34"
                    fill="none"
                    stroke="url(#crcGlow)"
                    strokeWidth="2"
                  />

                  <circle cx="360" cy="150" r="7" fill="#00ff88" />

                  <line
                    x1="360"
                    y1="116"
                    x2="360"
                    y2="56"
                    stroke="#00ff88"
                    strokeOpacity=".48"
                  />

                  <line
                    x1="394"
                    y1="150"
                    x2="452"
                    y2="150"
                    stroke="#2bd9ff"
                    strokeOpacity=".48"
                  />

                  <line
                    x1="336"
                    y1="174"
                    x2="287"
                    y2="224"
                    stroke="#00ff88"
                    strokeOpacity=".38"
                  />

                  <circle cx="360" cy="56" r="5" fill="#00ff88" />
                  <circle cx="452" cy="150" r="5" fill="#2bd9ff" />
                  <circle cx="287" cy="224" r="5" fill="#00ff88" />

                  <path
                    d="M220 150 C250 95 290 95 320 150 C290 205 250 205 220 150Z"
                    fill="none"
                    stroke="white"
                    strokeOpacity=".14"
                  />

                  <path
                    d="M400 90 C438 110 438 190 400 210"
                    fill="none"
                    stroke="white"
                    strokeOpacity=".12"
                  />
                </svg>
              </div>

              <div className="sala-table-zone">
                <div className="sala-table-copy">
                  <span className="sala-eyebrow">
                    A MESA ESTÁ SERVIDA
                  </span>

                  <h2>
                    Tudo o que um gestor precisa,
                    <br />
                    organizado em um só ambiente.
                  </h2>

                  <p>
                    Ferramentas, conhecimento, acompanhamento, comunidade e
                    desenvolvimento estão aqui — visíveis, organizados e
                    preparados para quem possui as chaves.
                  </p>
                </div>

                <div className="sala-table-scene">
                  <div className="sala-chair-main">
                    <span>RESERVADO</span>
                    <strong>SEU LUGAR</strong>
                  </div>

                  <div className="sala-table">
                    <div className="sala-table-surface">
                      <div className="sala-place place-one" />
                      <div className="sala-place place-two" />
                      <div className="sala-place place-three" />
                      <div className="sala-place place-four" />

                      <div className="sala-center-piece">
                        <span>CRC</span>
                        <small>mesa de operações</small>
                      </div>
                    </div>

                    <div className="sala-table-leg left" />
                    <div className="sala-table-leg right" />
                  </div>
                </div>
              </div>

              <div className="sala-door-grid">
                <div className="sala-door-title">
                  <span className="sala-eyebrow">
                    OUTROS CÔMODOS
                  </span>

                  <h2>
                    A casa é maior
                    <br />
                    do que você viu até aqui.
                  </h2>
                </div>

                <div className="sala-door-list">
                  {modulos.slice(0, 6).map((modulo) => (
                    <button
                      key={modulo.nome}
                      type="button"
                      className="sala-door"
                      onClick={() => abrirModulo(modulo)}
                    >
                      <span className="sala-door-symbol">
                        {modulo.icone}
                      </span>

                      <span>
                        <strong>{modulo.nome}</strong>
                        <small>{modulo.descricao}</small>
                      </span>

                      <span className="sala-door-lock">⌕</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sala-bottom-note">
                <span>
                  O ambiente é o mesmo.
                  <strong> A chave muda o que você pode fazer.</strong>
                </span>

                <span className="sala-bottom-line" />
              </div>
            </div>
          </section>
        </div>

        <footer className="sala-footer">
          <span>SCOUT.CRC</span>
          <small>
            Conheça o ambiente. Descubra o seu lugar.
          </small>
        </footer>
      </div>

      {moduloSelecionado && (
        <div
          className="sala-modal-backdrop"
          onClick={() => setModuloSelecionado(null)}
        >
          <div
            className="sala-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sala-modal-lock">⌕</div>

            <div className="sala-eyebrow">ACESSO RESTRITO</div>

            <h2>{moduloSelecionado.nome}</h2>

            <p>{moduloSelecionado.descricao}</p>

            <div className="sala-modal-message">
              Este equipamento faz parte da rotina operacional dos gestores
              CRC.
              <br />
              <strong>Você já consegue vê-lo. A chave vem depois.</strong>
            </div>

            <button
              type="button"
              className="sala-modal-close"
              onClick={() => setModuloSelecionado(null)}
            >
              Voltar à Sala
            </button>
          </div>
        </div>
      )}

      {mostrarChave && (
        <div
          className="sala-modal-backdrop"
          onClick={() => setMostrarChave(false)}
        >
          <div
            className="sala-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sala-modal-lock">⌕</div>

            <div className="sala-eyebrow">ACESSO DE GESTOR</div>

            <h2>Você possui a chave?</h2>

            <p>
              Este ambiente é reservado aos gestores CRC.
            </p>

            <div className="sala-modal-message">
              Digite sua chave de acesso para liberar os ambientes
              operacionais.
            </div>

            <input
              type="text"
              value={chaveAcesso}
              onChange={(event) => setChaveAcesso(event.target.value)}
              placeholder="Digite sua chave"
              className="sala-chave-input"
              autoFocus
            />

            <button
              type="button"
              className="sala-modal-close"
              onClick={() => {
                if (chaveAcesso.trim()) {
                  setGestorDesbloqueado(true);
                  setMostrarChave(false);
                  setChaveAcesso('');
                }
              }}
            >
              Liberar acesso
            </button>

            <button
              type="button"
              className="sala-modal-close"
              onClick={() => {
                setMostrarChave(false);
                setChaveAcesso('');
              }}
            >
              Voltar à Sala
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .sala-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 70% 16%,
              rgba(0, 255, 136, 0.08),
              transparent 26%
            ),
            #050505;
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
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        .sala-menu-item:hover {
          border-color: rgba(0, 255, 136, 0.12);
          background: rgba(0, 255, 136, 0.04);
          transform: translateX(2px);
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
  line-height: 1.3;
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

        .sala-room {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 22px;
          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(0, 255, 136, 0.06),
              transparent 28%
            ),
            rgba(255, 255, 255, 0.018);
        }

        .sala-banner {
          display: grid;
          grid-template-columns: minmax(240px, 0.9fr) minmax(280px, 1.1fr);
          min-height: 260px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          background:
            linear-gradient(
              115deg,
              rgba(0, 255, 136, 0.06),
              transparent 32%
            ),
            rgba(255, 255, 255, 0.01);
        }

        .sala-banner-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 34px;
        }

        .sala-banner-copy > span {
          margin-bottom: 10px;
          color: #00ff88;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .sala-banner-copy strong {
          font-size: clamp(25px, 3vw, 42px);
          line-height: 1.04;
          letter-spacing: -1.2px;
        }

        .sala-banner-copy small {
          max-width: 390px;
          margin-top: 15px;
          color: rgba(255, 255, 255, 0.42);
          font-size: 11px;
          line-height: 1.6;
        }

        .sala-banner-art {
          width: 100%;
          height: 100%;
          min-height: 260px;
        }

        .sala-table-zone {
          display: grid;
          grid-template-columns: minmax(260px, 0.95fr) minmax(300px, 1.05fr);
          align-items: center;
          gap: 20px;
          padding: 38px 34px 34px;
        }

        .sala-table-copy h2 {
          margin: 9px 0 11px;
          font-size: clamp(20px, 2.4vw, 30px);
          line-height: 1.1;
          letter-spacing: -0.8px;
        }

        .sala-table-copy p {
          max-width: 480px;
          color: rgba(255, 255, 255, 0.43);
          font-size: 12px;
          line-height: 1.65;
        }

        .sala-table-scene {
          position: relative;
          min-height: 290px;
        }

        .sala-table {
          position: absolute;
          left: 50%;
          top: 62px;
          width: min(92%, 460px);
          height: 136px;
          transform: translateX(-50%);
        }

        .sala-table-surface {
          position: relative;
          width: 100%;
          height: 100%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 42% 42% 18% 18% / 30% 30% 18% 18%;
          background:
            radial-gradient(
              circle at 50% 50%,
              rgba(0, 255, 136, 0.08),
              transparent 40%
            ),
            linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.08),
              rgba(255, 255, 255, 0.02)
            );
          box-shadow:
            0 28px 60px rgba(0, 0, 0, 0.35),
            inset 0 0 0 1px rgba(0, 255, 136, 0.04);
        }

        .sala-table-leg {
          position: absolute;
          top: 86px;
          width: 10px;
          height: 125px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.07);
        }

        .sala-table-leg.left {
          left: 18%;
          transform: rotate(3deg);
        }

        .sala-table-leg.right {
          right: 18%;
          transform: rotate(-3deg);
        }

        .sala-place {
          position: absolute;
          width: 50px;
          height: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.025);
        }

        .place-one {
          left: 18%;
          top: 26px;
        }

        .place-two {
          right: 18%;
          top: 26px;
        }

        .place-three {
          left: 20%;
          bottom: 25px;
        }

        .place-four {
          right: 20%;
          bottom: 25px;
        }

        .sala-center-piece {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }

        .sala-center-piece span {
          color: #00ff88;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .sala-center-piece small {
          color: rgba(255, 255, 255, 0.28);
          font-size: 7px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .sala-chair-main {
          position: absolute;
          right: 8%;
          bottom: 0;
          z-index: 3;
          width: 108px;
          height: 116px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0, 255, 136, 0.26);
          border-radius: 22px 22px 16px 16px;
          background:
            linear-gradient(
              160deg,
              rgba(0, 255, 136, 0.1),
              rgba(255, 255, 255, 0.03)
            );
          box-shadow: 0 20px 35px rgba(0, 0, 0, 0.34);
        }

        .sala-chair-main::before {
          content: '';
          position: absolute;
          inset: -9px 16px 60px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 0;
          border-radius: 18px 18px 10px 10px;
        }

        .sala-chair-main span {
          color: rgba(255, 255, 255, 0.32);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .sala-chair-main strong {
          margin-top: 6px;
          color: #00ff88;
          font-size: 11px;
          letter-spacing: 1.5px;
        }

        .sala-door-grid {
          display: grid;
          grid-template-columns: minmax(220px, 0.8fr) minmax(320px, 1.2fr);
          gap: 24px;
          padding: 0 34px 34px;
        }

        .sala-door-title h2 {
          margin-top: 8px;
          font-size: clamp(21px, 2.5vw, 32px);
          line-height: 1.05;
          letter-spacing: -0.9px;
        }

        .sala-door-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .sala-door {
          display: grid;
          grid-template-columns: 34px minmax(0, 1fr) auto;
          gap: 10px;
          align-items: center;
          padding: 13px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.018);
          color: inherit;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sala-door:hover {
          border-color: rgba(0, 255, 136, 0.18);
          background: rgba(0, 255, 136, 0.035);
        }

        .sala-door-symbol {
          display: flex;
          width: 34px;
          height: 34px;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          color: #00ff88;
          font-size: 12px;
        }

        .sala-door span:nth-child(2) {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 4px;
        }

        .sala-door strong {
          font-size: 11px;
        }

        .sala-door small {
          color: rgba(255, 255, 255, 0.33);
          font-size: 9px;
          line-height: 1.4;
        }

        .sala-door-lock {
          color: rgba(255, 255, 255, 0.24);
          font-size: 11px;
        }

        .sala-bottom-note {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 34px 22px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.32);
          font-size: 10px;
        }

        .sala-bottom-note strong {
          color: rgba(255, 255, 255, 0.62);
        }

        .sala-bottom-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(
            90deg,
            rgba(0, 255, 136, 0.25),
            transparent
          );
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
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(0, 255, 136, 0.08),
              transparent 34%
            ),
            #0b0f0d;
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

.sala-chave-input {
  color: #111;
  background: #fff;
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

        @media (max-width: 980px) {
          .sala-layout {
            grid-template-columns: 1fr;
          }

          .sala-sidebar {
            border-right: 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          }

          .sala-menu {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .sala-sidebar-footer {
            display: none;
          }

          .sala-banner,
          .sala-table-zone,
          .sala-door-grid {
            grid-template-columns: 1fr;
          }

          .sala-welcome {
            align-items: flex-start;
            flex-direction: column;
          }

          .sala-welcome-mark {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .sala-page {
            padding: 8px;
          }

          .sala-shell {
            min-height: calc(100vh - 16px);
            border-radius: 18px;
          }

          .sala-header {
            min-height: 66px;
            padding: 0 16px;
          }

          .sala-main {
            padding: 16px;
          }

          .sala-menu {
            grid-template-columns: 1fr;
          }

          .sala-banner-copy,
          .sala-table-zone,
          .sala-door-grid,
          .sala-bottom-note {
            padding-left: 20px;
            padding-right: 20px;
          }

          .sala-banner {
            min-height: 220px;
          }

          .sala-banner-art {
            min-height: 200px;
          }

          .sala-table-scene {
  min-height: 250px;
}

.sala-door-list {
            grid-template-columns: 1fr;
          }

          .sala-footer {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
    </main>
  );
}