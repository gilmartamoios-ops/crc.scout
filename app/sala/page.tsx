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
    status_aprovacao?: 'pendente' | 'aprovado' | 'acompanhamento' | 'desqualificado';
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

  // Estados do Link 1 (Prospecto Digital - Nichos)
  const [nichoSelecionado, setNichoSelecionado] = useState<'mmn' | 'saude' | 'consumo'>('mmn');

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

  const atualizarStatusLead = async (id: string, novoStatus: 'aprovado' | 'acompanhamento' | 'desqualificado') => {
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

  const linkScoutGestor = `https://crc-scout.vercel.app/?gestor_id=${gestor?.slug || 'master'}&nicho=${nichoSelecionado}`;

  const totalLeads = leads.length;
  const pendentesFila = leads.filter((l) => (l.dados?.status_aprovacao || 'pendente') === 'pendente').length;
  const acompanhamentoLeads = leads.filter((l) => l.dados?.status_aprovacao === 'acompanhamento').length;
  const fechadosLeads = leads.filter((l) => l.dados?.status_aprovacao === 'aprovado').length;
  const taxaConversao = totalLeads > 0 ? Math.round((fechadosLeads / totalLeads) * 100) : 0;

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
              onClick={() => {
                window.location.href = '/';
              }}
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
              {/* LINK 1: PROSPECTO DIGITAL COM NICHOS OPERACIONAIS CLICÁVEIS */}
              {gestorDesbloqueado && moduloAtivo === 'Seu SCOUT' && subModuloAtivo === 'Prospecto Digital' && (
                <div className="sala-dynamic-card">
                  <span className="sala-eyebrow" style={{ color: '#00ff88' }}>SEU SCOUT · LINK 1</span>
                  <h3 style={{ fontSize: '20px', margin: '8px 0 4px', color: '#fff' }}>Prospecto Digital (Motor de Atração por Nicho)</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>
                    Superando a primeira trava do iniciante: selecione abaixo o nicho de atuação para gerar sua estratégia direcionada e link de captação exclusivo.
                  </p>

                  {/* SELETORES DE NICHO CLICÁVEIS */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    
                    {/* NICHO 1: MMN / LIDERANÇA */}
                    <button
                      type="button"
                      onClick={() => setNichoSelecionado('mmn')}
                      style={{
                        padding: '16px',
                        background: nichoSelecionado === 'mmn' ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.02)',
                        borderRadius: '12px',
                        border: nichoSelecionado === 'mmn' ? '2px solid #00ff88' : '1px solid rgba(255,255,255,0.08)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ fontSize: '10px', color: '#00ff88', fontWeight: 'bold' }}>NICHO 01</span>
                      <h4 style={{ margin: '4px 0', fontSize: '14px', color: '#fff' }}>Líderes & Redes MMN</h4>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Foco em retenção, plano de carreira e transição para comunidades.</p>
                    </button>

                    {/* NICHO 2: SAÚDE / ESTÉTICA */}
                    <button
                      type="button"
                      onClick={() => setNichoSelecionado('saude')}
                      style={{
                        padding: '16px',
                        background: nichoSelecionado === 'saude' ? 'rgba(43,217,255,0.12)' : 'rgba(255,255,255,0.02)',
                        borderRadius: '12px',
                        border: nichoSelecionado === 'saude' ? '2px solid #2bd9ff' : '1px solid rgba(255,255,255,0.08)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ fontSize: '10px', color: '#2bd9ff', fontWeight: 'bold' }}>NICHO 02</span>
                      <h4 style={{ margin: '4px 0', fontSize: '14px', color: '#fff' }}>Saúde, Estética & Ozônio</h4>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Foco na ciência dos produtos, bem-estar e curadoria avançada.</p>
                    </button>

                    {/* NICHO 3: CONSUMO INTELIGENTE */}
                    <button
                      type="button"
                      onClick={() => setNichoSelecionado('consumo')}
                      style={{
                        padding: '16px',
                        background: nichoSelecionado === 'consumo' ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.02)',
                        borderRadius: '12px',
                        border: nichoSelecionado === 'consumo' ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.08)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ fontSize: '10px', color: '#ffd700', fontWeight: 'bold' }}>NICHO 03</span>
                      <h4 style={{ margin: '4px 0', fontSize: '14px', color: '#fff' }}>Consumo Consciente</h4>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Foco em economia doméstica inteligente e qualidade de vida.</p>
                    </button>
                  </div>

                  {/* PAINEL DINÂMICO DA ESTRATÉGIA DO NICHO SELECIONADO */}
                  <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#00ff88', fontSize: '13px' }}>
                        🎯 ESTRATÉGIA ATIVA: {nichoSelecionado === 'mmn' ? 'LIDERANÇA & MMN' : nichoSelecionado === 'saude' ? 'SAÚDE & ESTÉTICA (OZÔNIO)' : 'CONSUMO INTELIGENTE'}
                      </strong>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '6px' }}>
                        ID: {gestor?.slug || 'master'}
                      </span>
                    </div>

                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: '1.6' }}>
                      {nichoSelecionado === 'mmn' && 'Abordagem voltada para profissionais cansados de rotatividade de redes. O argumento central é a construção de uma Comunidade de Relacionamento de Consumo (CRC) sustentável, com retenção real baseada em pertencimento e não apenas em promessas de ganho rápido.'}
                      {nichoSelecionado === 'saude' && 'Abordagem voltada para profissionais de estética e saúde que desejam agregar valor científico aos seus clientes através das linhas de ozonioterapia e suplementação de alta performance da Ozonteck.'}
                      {nichoSelecionado === 'consumo' && 'Abordagem voltada para famílias e indivíduos que buscam otimizar o orçamento mensal transformando o consumo diário obrigatório em fonte de valor e participação na comunidade.'}
                    </p>

                    {/* LINK DE CAPTAÇÃO EXCLUSIVO PARA O NICHO */}
                    <div style={{ marginTop: '6px' }}>
                      <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>
                        LINK DE CAPTAÇÃO EXCLUSIVO PARA ESTE NICHO:
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          readOnly
                          value={linkScoutGestor}
                          style={{ flex: 1, background: '#050505', border: '1px solid rgba(0,255,136,0.3)', padding: '10px 12px', borderRadius: '8px', color: '#00ff88', fontSize: '11px' }}
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(linkScoutGestor)}
                          style={{ background: '#00ff88', color: '#050505', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                        >
                          Copiar Link
                        </button>
                      </div>
                    </div>
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
                          value={`https://crc-scout.vercel.app/?gestor_id=${gestor?.slug || 'master'}`}
                          style={{ flex: 1, background: '#050505', border: '1px solid rgba(0,255,136,0.3)', padding: '8px 12px', borderRadius: '8px', color: '#00ff88', fontSize: '11px' }}
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(`https://crc-scout.vercel.app/?gestor_id=${gestor?.slug || 'master'}`)}
                          style={{ background: '#00ff88', color: '#050505', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                        >
                          Copiar Link
                        </button>
                      </div>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', display: 'block', marginTop: '6px' }}>
                        ID do Gestor Vinculado: <code style={{ color: '#00ff88' }}>{gestor?.slug || 'master'}</code>
                      </span>
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
                        CONCEITO OPERACIONAL
                      </span>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: '15px' }}>
                        O SCOUT opera sob a Lei das Médias
                      </h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                      O sucesso na construção da comunidade não vem de acumular centenas de conversas rasas, mas da <strong>constância e foco na qualidade do X1</strong>. O SCOUT limita sua fila ativa a um <strong>lote diário de até 5 prospectos quentes por vez</strong> para evitar a obesidade de leads. Conclua ou classifique o atendimento para liberar o próximo lote com taxa máxima de conversão!
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '22px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', display: 'block' }}>LOTE ATIVO (MÁX 5)</span>
                      <strong style={{ fontSize: '20px', color: '#00ff88' }}>{pendentesFila}</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', display: 'block' }}>EM ACOMPANHAMENTO</span>
                      <strong style={{ fontSize: '20px', color: '#2bd9ff' }}>{acompanhamentoLeads}</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', display: 'block' }}>FECHADOS OZONTECK</span>
                      <strong style={{ fontSize: '20px', color: '#00ff88' }}>{fechadosLeads}</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', color: '#00ff88', letterSpacing: '1px', display: 'block' }}>TAXA DE EFICIÊNCIA</span>
                      <strong style={{ fontSize: '20px', color: '#fff' }}>{taxaConversao}%</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span className="sala-eyebrow" style={{ color: '#00ff88' }}>FILA ATIVA DE ATENDIMENTO</span>
                      <h3 style={{ fontSize: '18px', margin: '2px 0', color: '#fff' }}>Prospectos Qualificados no Quiz</h3>
                    </div>
                    <button
                      onClick={carregarLeadsScout}
                      style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                    >
                      🔄 Atualizar Fila
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '20px' }}>
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
                      <option value="aprovado">Fechados (Ozonteck)</option>
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
                                
                                <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', background: statusAtual === 'aprovado' ? 'rgba(0,255,136,0.2)' : statusAtual === 'acompanhamento' ? 'rgba(43,217,255,0.2)' : 'rgba(255,255,255,0.08)', color: statusAtual === 'aprovado' ? '#00ff88' : statusAtual === 'acompanhamento' ? '#2bd9ff' : 'rgba(255,255,255,0.6)' }}>
                                  {statusAtual === 'aprovado' ? '🟢 FECHADO' : statusAtual === 'acompanhamento' ? '🟡 ACOMPANHAMENTO' : '⚪ PENDENTE X1'}
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

                              <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', alignSelf: 'center', marginRight: '4px' }}>Classificar X1:</span>
                                <button
                                  onClick={() => atualizarStatusLead(item.id, 'aprovado')}
                                  style={{ background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  🟢 Fechou Ozonteck
                                </button>
                                <button
                                  onClick={() => atualizarStatusLead(item.id, 'acompanhamento')}
                                  style={{ background: 'rgba(43,217,255,0.12)', border: '1px solid rgba(43,217,255,0.3)', color: '#2bd9ff', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  🟡 Acompanhamento
                                </button>
                                <button
                                  onClick={() => atualizarStatusLead(item.id, 'desqualificado')}
                                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer' }}
                                >
                                  🔴 Desqualificar
                                </button>
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '130px' }}>
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
                              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                                ID: {item.gestor_id || 'master'}
                              </span>
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

      {/* Modal Restrito */}
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
          grid-template-columns: 260px minmax(0, 1fr);
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
          gap: 4px;
          padding: 0 10px;
        }
        .sala-menu-group {
          display: flex;
          flex-direction: column;
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
          transition: all 0.2s ease;
        }
        .sala-menu-item:hover, .sala-menu-item.active {
          border-color: rgba(0, 255, 136, 0.25);
          background: rgba(0, 255, 136, 0.06);
        }
        .sala-sublinks {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding-left: 36px;
          padding-top: 4px;
          padding-bottom: 6px;
        }
        .sala-sublink-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          text-align: left;
          font-size: 11px;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .sala-sublink-btn:hover, .sala-sublink-btn.active {
          color: #00ff88;
          background: rgba(0, 255, 136, 0.04);
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
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 34px;
        }
        .sala-art-text h2 {
          font-size: 22px;
          margin: 6px 0 10px;
          color: #fff;
        }
        .sala-art-text p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.6;
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