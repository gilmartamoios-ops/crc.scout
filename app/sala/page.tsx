'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Modulo = {
  nome: string;
  descricao: string;
  icone: string;
  sublinks?: string[];
};

interface ConvidadoRegistro {
  id: string;
  created_at: string;
  gestor_id: string | null;
  tipo: string;
  titulo: string;
  dados: {
    convidado?: {
      nome: string;
      whatsapp: string;
      email?: string;
      cidade?: string;
    };
    perfil?: string;
    respostas?: Record<string, string>;
    status_aprovacao?: 'pendente' | 'acompanhamento' | 'solicitado_master' | 'codigo_liberado' | 'desqualificado';
    codigo_master?: string;
    origem?: string;
  };
}

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
    sublinks: ['Prospecto Digital', 'Santinho Digital', 'Feedback de Prospectos'],
  },
];

const municipiosPorEstado: Record<string, string[]> = {
  RJ: ['Cabo Frio', 'Arraial do Cabo', 'Búzios', 'Niterói', 'Rio de Janeiro', 'Campos dos Goytacazes', 'Petrópolis', 'Macaé'],
  SP: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'São José dos Campos'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Contagem'],
  ES: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica'],
};

export default function SalaPage() {
  const [moduloAtivo, setModuloAtivo] = useState<string | null>('Seu SCOUT');
  const [subModuloAtivo, setSubModuloAtivo] = useState<string | null>('Prospecto Digital');
  const [moduloRestrito, setModuloRestrito] = useState<Modulo | null>(null);
  const [gestorDesbloqueado, setGestorDesbloqueado] = useState(false);

  const [gestor, setGestor] = useState<{
    id: string;
    nome: string;
    whatsapp: string;
    email?: string;
    slug: string | null;
  } | null>(null);

  // Estados do Link 1 (Prospecto Digital)
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>('RJ');
  const [municipioSelecionado, setMunicipioSelecionado] = useState<string>('Cabo Frio');
  const [nichoPfSelecionado, setNichoPfSelecionado] = useState<'transicao' | 'liberais' | 'consumo'>('transicao');
  const [minerando, setMinerando] = useState(false);
  
  const [lotesGeradosHoje, setLotesGeradosHoje] = useState<number>(1);
  const [leadsMinerados, setLeadsMinerados] = useState<Array<{nome: string; perfil: string; regiao: string; whats: string}>>([
    { nome: 'Marcos Vinícius', perfil: 'Transição de Carreira (LinkedIn / Adm)', regiao: 'Cabo Frio - RJ', whats: '22997788554' },
    { nome: 'Tatiane Antunes', perfil: 'Profissional Liberal (Saúde & Bem-estar)', regiao: 'Cabo Frio - RJ', whats: '22988334455' },
    { nome: 'Cláudia Ribeiro', perfil: 'Consumo Inteligente & Comunidade', regiao: 'Cabo Frio - RJ', whats: '22996655443' },
    { nome: 'Roberto Carlos', perfil: 'Open to Work (LinkedIn / Logística)', regiao: 'Cabo Frio - RJ', whats: '22991122334' },
    { nome: 'Vanessa Lima', perfil: 'Transição de Carreira (Comercial)', regiao: 'Cabo Frio - RJ', whats: '22995544332' },
  ]);

  // Estados do Feedback de Prospectos
  const [leads, setLeads] = useState<ConvidadoRegistro[]>([]);
  const [carregandoLeads, setCarregandoLeads] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [buscaNome, setBuscaNome] = useState<string>('');
  const [buscaRegiao, setBuscaRegiao] = useState<string>('');

  const lidarComCliqueModulo = (modulo: Modulo) => {
    if (!gestorDesbloqueado) {
      setModuloRestrito(modulo);
      return;
    }
    setModuloAtivo(modulo.nome);
    if (modulo.sublinks && modulo.sublinks.length > 0) {
      setSubModuloAtivo(modulo.sublinks[0]);
    } else {
      setSubModuloAtivo(null);
    }
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

  const carregarLeadsScout = async () => {
    setCarregandoLeads(true);
    try {
      let query = supabase
        .from('scout_registros')
        .select('*')
        .order('created_at', { ascending: false });

      if (gestor && gestor.slug !== 'master') {
        query = query.eq('gestor_id', gestor.slug || gestor.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar leads:', error);
      } else if (data) {
        setLeads(data as ConvidadoRegistro[]);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    } finally {
      setCarregandoLeads(false);
    }
  };

  useEffect(() => {
    if (gestorDesbloqueado && moduloAtivo === 'Seu SCOUT' && subModuloAtivo === 'Feedback de Prospectos') {
      carregarLeadsScout();
    }
  }, [gestorDesbloqueado, moduloAtivo, subModuloAtivo]);

  const atualizarStatusLead = async (id: string, novoStatus: 'pendente' | 'acompanhamento' | 'solicitado_master' | 'codigo_liberado' | 'desqualificado') => {
    const leadAlvo = leads.find((l) => l.id === id);
    if (!leadAlvo) return;

    const novosDados = {
      ...leadAlvo.dados,
      status_aprovacao: novoStatus,
      data_atualizacao_status: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('scout_registros')
      .update({ dados: novosDados })
      .eq('id', id);

    if (error) {
      alert('Erro ao atualizar status do prospecto.');
      return;
    }

    setLeads((anterior) =>
      anterior.map((item) =>
        item.id === id ? { ...item, dados: novosDados } : item
      )
    );
  };

  const executarMineracaoPorNicho = (nicho: 'transicao' | 'liberais' | 'consumo') => {
    if (lotesGeradosHoje >= 3) {
      alert('🔒 Trava de Segurança da Lei das Médias: Você atingiu o limite de 3 lotes diários gerados.');
      return;
    }

    setNichoPfSelecionado(nicho);
    setMinerando(true);

    setTimeout(() => {
      const regiaoStr = `${municipioSelecionado} - ${estadoSelecionado}`;
      const baseGerada = [
        { nome: 'Carlos Eduardo', perfil: 'Transição de Carreira', regiao: regiaoStr, whats: '22998877111' },
        { nome: 'Beatriz Lima', perfil: 'Open to Work (RH)', regiao: regiaoStr, whats: '22988772222' },
        { nome: 'Marcelo Santos', perfil: 'Profissional Liberal', regiao: regiaoStr, whats: '22996655333' },
      ];

      setLeadsMinerados(baseGerada);
      setLotesGeradosHoje((prev) => prev + 1);
      setMinerando(false);
    }, 800);
  };

  const linkBaseGestor = `https://crc-scout.vercel.app/?gestor_id=${gestor?.slug || 'master'}`;

  const totalLeads = leads.length;
  const pendentesFila = leads.filter((l) => (l.dados?.status_aprovacao || 'pendente') === 'pendente').length;
  const acompanhamentoLeads = leads.filter((l) => l.dados?.status_aprovacao === 'acompanhamento').length;
  const solicitadosMaster = leads.filter((l) => l.dados?.status_aprovacao === 'solicitado_master').length;
  const codigosLiberados = leads.filter((l) => l.dados?.status_aprovacao === 'codigo_liberado').length;
  const taxaConversao = totalLeads > 0 ? Math.round((codigosLiberados / totalLeads) * 100) : 0;

  const leadsFiltrados = leads.filter((item) => {
    const nome = item.dados?.convidado?.nome?.toLowerCase() || '';
    const regiao = item.dados?.convidado?.cidade?.toLowerCase() || '';
    const status = item.dados?.status_aprovacao || 'pendente';

    const matchesNome = nome.includes(buscaNome.toLowerCase());
    const matchesRegiao = regiao.includes(buscaRegiao.toLowerCase());
    const matchesStatus = filtroStatus === 'todos' || status === filtroStatus;

    return matchesNome && matchesRegiao && matchesStatus;
  });

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              style={{
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.35)',
                color: '#00ff88',
                padding: '7px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '10px',
                letterSpacing: '1px',
              }}
            >
              ← VOLTAR AO HALL (CAPA)
            </button>

            <div className="sala-header-status">
              {gestor ? (
                <span>GESTOR · {gestor.nome}</span>
              ) : (
                <button
                  type="button"
                  className="sala-chave-btn"
                  onClick={() => { window.location.href = '/gestor'; }}
                >
                  🔑 Chave do gestor
                </button>
              )}
              <span className="sala-status-dot" />
              AMBIENTE CRC
            </div>
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
                <div key={modulo.nome} className="sala-menu-group">
                  <button
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

                  {gestorDesbloqueado && modulo.sublinks && moduloAtivo === modulo.nome && (
                    <div className="sala-sublinks">
                      {modulo.sublinks.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          className={`sala-sublink-btn ${subModuloAtivo === sub ? 'active' : ''}`}
                          onClick={() => setSubModuloAtivo(sub)}
                        >
                          ↳ {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="sala-sidebar-footer">
              {gestor ? (
                <>
                  <span className="sala-visitor-tag">GESTOR DE COMUNIDADE</span>
                  <strong className="sala-gestor-name">{gestor.nome}</strong>
                  <p>Operação SCOUT ativa com rastreio direto no Supabase.</p>
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
                <div className="sala-eyebrow">MÓDULO DE INTELIGÊNCIA</div>
                <h1>
                  Sua Central <span>SCOUT.</span>
                </h1>
                <p>
                  Prospecção, atração visual e inteligência de qualificação para o modelo CRC.
                </p>
              </div>

              <div className="sala-welcome-mark">
                <span>CRC</span>
                <small>COMUNIDADE · RELAÇÃO · CONSUMO</small>
              </div>
            </div>

            <div className="sala-center-viewport">
              {/* LINK 1: PROSPECTO DIGITAL */}
              {gestorDesbloqueado && moduloAtivo === 'Seu SCOUT' && subModuloAtivo === 'Prospecto Digital' && (
                <div className="sala-dynamic-card">
                  <span className="sala-eyebrow" style={{ color: '#00ff88' }}>SEU SCOUT · LINK 1 (MOTOR DE MINERAÇÃO PF)</span>
                  <h3 style={{ fontSize: '20px', margin: '8px 0 4px', color: '#fff' }}>Prospecto Digital (Mineração Regional Automatizada)</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>
                    O SCOUT extrai lotes de <strong>20 perfis qualificados por vez</strong> com base no Estado e Município selecionados.
                  </p>

                  <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', color: '#00ff88', fontWeight: 'bold', marginBottom: '6px' }}>
                          📍 ESTADO:
                        </label>
                        <select
                          value={estadoSelecionado}
                          onChange={(e) => {
                            const novoEstado = e.target.value;
                            setEstadoSelecionado(novoEstado);
                            setMunicipioSelecionado(municipiosPorEstado[novoEstado]?.[0] || '');
                          }}
                          style={{ width: '100%', background: '#050505', border: '1px solid rgba(0,255,136,0.3)', padding: '10px 12px', borderRadius: '10px', color: '#00ff88', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          {Object.keys(municipiosPorEstado).map((uf) => (
                            <option key={uf} value={uf}>{uf}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '10px', color: '#00ff88', fontWeight: 'bold', marginBottom: '6px' }}>
                          🏙️ MUNICÍPIO / REGIÃO:
                        </label>
                        <select
                          value={municipioSelecionado}
                          onChange={(e) => setMunicipioSelecionado(e.target.value)}
                          style={{ width: '100%', background: '#050505', border: '1px solid rgba(0,255,136,0.3)', padding: '10px 12px', borderRadius: '10px', color: '#00ff88', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          {(municipiosPorEstado[estadoSelecionado] || []).map((mun) => (
                            <option key={mun} value={mun}>{mun}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ textAlign: 'right', marginTop: '14px' }}>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', display: 'block' }}>LOTES GERADOS HOJE</span>
                        <strong style={{ fontSize: '14px', color: lotesGeradosHoje >= 3 ? '#ff4d4d' : '#00ff88' }}>
                          {lotesGeradosHoje} / 3 máx
                        </strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => executarMineracaoPorNicho('transicao')}
                        style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '11px', cursor: 'pointer', background: nichoPfSelecionado === 'transicao' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)', color: nichoPfSelecionado === 'transicao' ? '#00ff88' : 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,255,136,0.3)', fontWeight: 'bold' }}
                      >
                        {minerando && nichoPfSelecionado === 'transicao' ? '⚙️ Extraindo 20...' : '💼 Minerar Transição (LinkedIn)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => executarMineracaoPorNicho('liberais')}
                        style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '11px', cursor: 'pointer', background: nichoPfSelecionado === 'liberais' ? 'rgba(43,217,255,0.2)' : 'rgba(255,255,255,0.05)', color: nichoPfSelecionado === 'liberais' ? '#2bd9ff' : 'rgba(255,255,255,0.7)', border: '1px solid rgba(43,217,255,0.3)', fontWeight: 'bold' }}
                      >
                        {minerando && nichoPfSelecionado === 'liberais' ? '⚙️ Extraindo 20...' : '🩺 Minerar Profissionais Liberais'}
                      </button>
                      <button
                        type="button"
                        onClick={() => executarMineracaoPorNicho('consumo')}
                        style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '11px', cursor: 'pointer', background: nichoPfSelecionado === 'consumo' ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)', color: nichoPfSelecionado === 'consumo' ? '#ffd700' : 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', fontWeight: 'bold' }}
                      >
                        {minerando && nichoPfSelecionado === 'consumo' ? '⚙️ Extraindo 20...' : '🛒 Minerar Consumo Consciente'}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', color: '#fff', margin: 0 }}>
                      ⚡ Lote Ativo Minerado para {municipioSelecionado} - {estadoSelecionado} ({leadsMinerados.length} Perfis Prontos)
                    </h4>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                    {leadsMinerados.map((lead, index) => {
                      const msgSantinho = encodeURIComponent(`Olá ${lead.nome}! Notei seu perfil em ${lead.regiao} (${lead.perfil}). Convidamos você a conhecer o ecossistema CRC. Assista ao vídeo de 10s e conheça nossa comunidade: ${linkBaseGestor}`);
                      const linkWhatsSantinho = `https://wa.me/55${lead.whats}?text=${msgSantinho}`;

                      return (
                        <div
                          key={index}
                          style={{
                            background: 'rgba(0,0,0,0.4)',
                            border: '1px solid rgba(0,255,136,0.2)',
                            borderRadius: '12px',
                            padding: '14px',
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: '12px',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ color: '#fff', fontSize: '13px' }}>{lead.nome}</strong>
                              <span style={{ fontSize: '9px', background: 'rgba(0,255,136,0.15)', color: '#00ff88', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                                {lead.regiao}
                              </span>
                            </div>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>
                              🎯 <strong>Perfil:</strong> {lead.perfil}
                            </p>
                          </div>

                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(linkBaseGestor);
                                alert(`📋 Link do SCOUT copiado com sucesso!`);
                              }}
                              style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(0,255,136,0.3)',
                                color: '#00ff88',
                                fontWeight: 'bold',
                                fontSize: '11px',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              📋 Copiar Link
                            </button>

                            <a
                              href={linkWhatsSantinho}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                background: '#00ff88',
                                color: '#050505',
                                fontWeight: 'bold',
                                fontSize: '11px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              📨 Enviar Santinho Digital
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* LINK 2: SANTINHO DIGITAL */}
              {gestorDesbloqueado && moduloAtivo === 'Seu SCOUT' && subModuloAtivo === 'Santinho Digital' && (
                <div className="sala-dynamic-card">
                  <span className="sala-eyebrow" style={{ color: '#00ff88' }}>SEU SCOUT · LINK 2</span>
                  <h3 style={{ fontSize: '20px', margin: '8px 0 4px', color: '#fff' }}>Santinho Digital (Vídeo de 10s)</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                    Sua assinatura visual com link direto do seu SCOUT para disparo rápido e atração instantânea.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,255,136,0.2)' }}>
                    <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,255,136,0.3)', textAlign: 'center', padding: '10px' }}>
                      <span style={{ fontSize: '10px', color: '#00ff88', display: 'block', marginBottom: '6px' }}>VÍDEO 10s</span>
                      <video src="/assets/santinho.mp4" controls style={{ width: '100%', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#fff' }}>Link do seu CTA Exclusivo:</strong>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <input
                          type="text"
                          readOnly
                          value={linkBaseGestor}
                          style={{ flex: 1, background: '#050505', border: '1px solid rgba(0,255,136,0.3)', padding: '8px 12px', borderRadius: '8px', color: '#00ff88', fontSize: '11px' }}
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(linkBaseGestor)}
                          style={{ background: '#00ff88', color: '#050505', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                        >
                          Copiar Link
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LINK 3: FEEDBACK DE PROSPECTOS */}
              {gestorDesbloqueado && moduloAtivo === 'Seu SCOUT' && subModuloAtivo === 'Feedback de Prospectos' && (
                <div className="sala-dynamic-card">
                  
                  <div style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,0,0,0.6))', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '16px', padding: '18px 20px', marginBottom: '22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ background: '#00ff88', color: '#050505', padding: '3px 8px', borderRadius: '6px', fontWeight: '900', fontSize: '10px', letterSpacing: '1px' }}>
                        FLUXO MASTER
                      </span>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: '15px' }}>
                        Atendimento X1 e Validação de Chaves
                      </h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                      Realize o atendimento no X1. Após a qualificação, solicite a autorização de emissão de código ao <strong>Master (Gilmar)</strong> diretamente por esta central.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '22px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', display: 'block' }}>LOTE ATIVO</span>
                      <strong style={{ fontSize: '20px', color: '#00ff88' }}>{pendentesFila}</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', display: 'block' }}>ACOMPANHAMENTO</span>
                      <strong style={{ fontSize: '20px', color: '#2bd9ff' }}>{acompanhamentoLeads}</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', display: 'block' }}>AGUARDANDO MASTER</span>
                      <strong style={{ fontSize: '20px', color: '#ffd700' }}>{solicitadosMaster}</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', color: '#00ff88', letterSpacing: '1px', display: 'block' }}>CÓDIGOS LIBERADOS</span>
                      <strong style={{ fontSize: '20px', color: '#fff' }}>{codigosLiberados}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span className="sala-eyebrow" style={{ color: '#00ff88' }}>FILA ATIVA DE ATENDIMENTO</span>
                      <h3 style={{ fontSize: '18px', margin: '2px 0', color: '#fff' }}>Prospectos Qualificados no Quiz</h3>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => window.print()}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}
                        title="Imprimir Prancheta A4 de Acompanhamento"
                      >
                        🖨️ Imprimir / Baixar PDF
                      </button>

                      <button
                        onClick={carregarLeadsScout}
                        style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                      >
                        🔄 Atualizar Fila
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '20px' }} className="no-print">
                    <input
                      type="text"
                      placeholder="Buscar por nome..."
                      value={buscaNome}
                      onChange={(e) => setBuscaNome(e.target.value)}
                      style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 14px', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      placeholder="📍 Filtrar por Cidade / Estado..."
                      value={buscaRegiao}
                      onChange={(e) => setBuscaRegiao(e.target.value)}
                      style={{ background: '#050505', border: '1px solid rgba(0,255,136,0.3)', padding: '10px 14px', borderRadius: '10px', color: '#00ff88', fontSize: '12px' }}
                    />
                    <select
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value)}
                      style={{ background: '#050505', border: '1px solid rgba(0,255,136,0.3)', padding: '10px 14px', borderRadius: '10px', color: '#00ff88', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      <option value="todos">Todos os Status</option>
                      <option value="pendente">Pendentes (Fila Ativa)</option>
                      <option value="acompanhamento">Em Acompanhamento</option>
                      <option value="solicitado_master">Aguardando Master</option>
                      <option value="codigo_liberado">Códigos Liberados</option>
                      <option value="desqualificado">Desqualificados</option>
                    </select>
                  </div>

                  {carregandoLeads ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#00ff88', fontSize: '12px' }}>
                      ⚙️ Carregando prospectos da base de dados...
                    </div>
                  ) : leadsFiltrados.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                      Nenhum prospecto encontrado nesta categoria da fila.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {leadsFiltrados.map((item) => {
                        const convidado = item.dados?.convidado;
                        const whatsClean = convidado?.whatsapp?.replace(/\D/g, '') || '';
                        const statusAtual = item.dados?.status_aprovacao || 'pendente';
                        const msgWhats = encodeURIComponent(`Olá ${convidado?.nome || ''}, vi seu feedback no Quiz do SCOUT.CRC! Podemos conversar sobre seu objetivo?`);
                        const linkWhats = `https://wa.me/55${whatsClean}?text=${msgWhats}`;

                        return (
                          <div
                            key={item.id}
                            className="lead-card-printable"
                            style={{
                              background: 'rgba(0,0,0,0.5)',
                              border: '1px solid rgba(0,255,136,0.2)',
                              borderRadius: '14px',
                              padding: '16px',
                              display: 'grid',
                              gridTemplateColumns: '1fr auto',
                              gap: '14px',
                              alignItems: 'center',
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <strong style={{ color: '#fff', fontSize: '14px' }}>
                                  {convidado?.nome || 'Convidado Sem Nome'}
                                </strong>
                                <span style={{ fontSize: '9px', background: 'rgba(0,255,136,0.15)', color: '#00ff88', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(0,255,136,0.3)', fontWeight: 'bold' }}>
                                  {item.dados?.perfil?.toUpperCase() || 'RESPOSTAS QUIZ'}
                                </span>
                                
                                <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', background: statusAtual === 'codigo_liberado' ? 'rgba(0,255,136,0.2)' : statusAtual === 'solicitado_master' ? 'rgba(255,215,0,0.2)' : statusAtual === 'acompanhamento' ? 'rgba(43,217,255,0.2)' : 'rgba(255,255,255,0.08)', color: statusAtual === 'codigo_liberado' ? '#00ff88' : statusAtual === 'solicitado_master' ? '#ffd700' : statusAtual === 'acompanhamento' ? '#2bd9ff' : 'rgba(255,255,255,0.6)' }}>
                                  {statusAtual === 'codigo_liberado' ? `✦ CÓDIGO: ${item.dados.codigo_master || 'ATIVO'}` : statusAtual === 'solicitado_master' ? '🟡 AGUARDANDO CÓDIGO MASTER' : statusAtual === 'acompanhamento' ? '🔵 EM ACOMPANHAMENTO' : '⚪ PENDENTE X1'}
                                </span>
                              </div>

                              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'flex', gap: '12px', marginTop: '2px', flexWrap: 'wrap' }}>
                                <span>📱 {convidado?.whatsapp || 'Sem WhatsApp'}</span>
                                <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
                                  📍 {convidado?.cidade || 'Região não informada'}
                                </span>
                                <span>📅 {new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                              </div>

                              {item.dados?.respostas && (
                                <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
                                  <strong>Objetivo:</strong> {item.dados.respostas['objetivo'] || 'Não especificado'}
                                </div>
                              )}

                              <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }} className="no-print">
                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', alignSelf: 'center', marginRight: '4px' }}>Classificar X1:</span>
                                
                                <button
                                  onClick={() => atualizarStatusLead(item.id, 'solicitado_master')}
                                  style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  🟢 Solicitar Código ao Master
                                </button>

                                <button
                                  onClick={() => atualizarStatusLead(item.id, 'acompanhamento')}
                                  style={{ background: 'rgba(43,217,255,0.12)', border: '1px solid rgba(43,217,255,0.3)', color: '#2bd9ff', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  🔵 Acompanhamento
                                </button>

                                <button
                                  onClick={() => atualizarStatusLead(item.id, 'desqualificado')}
                                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer' }}
                                >
                                  🔴 Desqualificar
                                </button>
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '130px' }} className="no-print">
                              {whatsClean && (
                                <a
                                  href={linkWhats}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    background: '#00ff88',
                                    color: '#050505',
                                    fontWeight: 'bold',
                                    fontSize: '11px',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    display: 'block',
                                  }}
                                >
                                  💬 Iniciar X1
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Módulos Gerais */}
              {gestorDesbloqueado && moduloAtivo && moduloAtivo !== 'Seu SCOUT' && (
                <div className="sala-dynamic-card">
                  <span className="sala-eyebrow" style={{ color: '#00ff88' }}>MÓDULO OPERACIONAL</span>
                  <h3 style={{ fontSize: '20px', margin: '8px 0 4px', color: '#fff' }}>{moduloAtivo}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>
                    Ambiente dedicado à gestão de comunidade e diretrizes estratégicas.
                  </p>
                </div>
              )}

              {/* Visual Padrão */}
              {(!gestorDesbloqueado || !moduloAtivo) && (
                <div className="sala-hero-art-container">
                  <div className="sala-art-text">
                    <span className="sala-eyebrow">REDE DE CONSUMO & GESTÃO</span>
                    <h2>Conexão, Pertencimento e Escala</h2>
                    <p>O ecossistema CRC integra tecnologia de ponta, renda recorrente e desenvolvimento colaborativo.</p>
                  </div>
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

      {/* CSS ESPECIAL PARA IMPRESSÃO LIMPA E A4 */}
      <style jsx global>{`
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .sala-header, .sala-sidebar, .sala-welcome, .sala-footer, .no-print {
            display: none !important;
          }
          .sala-shell, .sala-main, .sala-dynamic-card {
            border: none !important;
            box-shadow: none !important;
            background: #fff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .lead-card-printable {
            background: #fff !important;
            border: 1px solid #ccc !important;
            color: #000 !important;
            page-break-inside: avoid;
            margin-bottom: 10px !important;
          }
          .lead-card-printable strong, .lead-card-printable span {
            color: #000 !important;
          }
        }
      `}</style>
    </main>
  );
}