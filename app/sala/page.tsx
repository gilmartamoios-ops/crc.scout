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
    <div style={{ minHeight: '100vh', background: '#050505', color: '#f5f7f8', padding: '18px', fontFamily: 'sans-serif' }}>
      <div style={{ minHeight: 'calc(100vh - 36px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', background: 'rgba(8, 10, 10, 0.95)', overflow: 'hidden' }}>
        
        {/* Topo / Header */}
        <header style={{ minHeight: '76px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', borderBottom: '1px solid rgba(255, 255, 255, 0.07)', background: 'rgba(255, 255, 255, 0.015)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 255, 136, 0.42)', borderRadius: '12px', color: '#00ff88', fontWeight: 'bold', fontSize: '11px' }}>CRC</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', letterSpacing: '2px' }}>SCOUT.CRC</div>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase' }}>sala de operações · ambiente operacional</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.35)', color: '#00ff88', padding: '7px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '10px' }}
            >
              ← VOLTAR AO HALL (CAPA)
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.45)', fontSize: '10px', fontWeight: 'bold' }}>
              {gestor ? (
                <span>GESTOR · {gestor.nome}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => { window.location.href = '/gestor'; }}
                  style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '10px' }}
                >
                  🔑 Chave do gestor
                </button>
              )}
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 14px rgba(0, 255, 136, 0.75)' }} />
              AMBIENTE CRC
            </div>
          </div>
        </header>

        {/* Layout Principal: Menu Lateral + Seção Conteúdo */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', minHeight: 'calc(100vh - 112px)' }}>
          
          {/* Aside / Menu Lateral */}
          <aside style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255, 255, 255, 0.07)', background: 'rgba(0, 0, 0, 0.3)', padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 8px', color: 'rgba(255, 255, 255, 0.42)', fontSize: '9px', letterSpacing: '1px' }}>
              <span>AMBIENTES</span>
              <small>ACESSOS</small>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {modulos.map((modulo) => (
                <div key={modulo.nome}>
                  <button
                    type="button"
                    onClick={() => lidarComCliqueModulo(modulo)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px',
                      background: moduloAtivo === modulo.nome ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                      border: moduloAtivo === modulo.nome ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid transparent',
                      borderRadius: '12px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{modulo.icone}</span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '12px' }}>{modulo.nome}</strong>
                      <small style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>{gestorDesbloqueado ? 'acesso de gestor' : '🔒 restrito'}</small>
                    </div>
                  </button>

                  {gestorDesbloqueado && modulo.sublinks && moduloAtivo === modulo.nome && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '24px', paddingTop: '6px' }}>
                      {modulo.sublinks.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setSubModuloAtivo(sub)}
                          style={{
                            background: subModuloAtivo === sub ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                            border: 'none',
                            color: subModuloAtivo === sub ? '#00ff88' : 'rgba(255,255,255,0.5)',
                            fontSize: '11px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          ↳ {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              {gestor ? (
                <>
                  <span style={{ fontSize: '8px', background: 'rgba(0, 255, 136, 0.2)', color: '#00ff88', padding: '4px 8px', borderRadius: '10px', fontWeight: 'bold' }}>GESTOR DE COMUNIDADE</span>
                  <strong style={{ display: 'block', marginTop: '8px', fontSize: '13px', color: '#fff' }}>{gestor.nome}</strong>
                  <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px' }}>Operação SCOUT ativa com rastreio direto no Supabase.</p>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '8px', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', padding: '4px 8px', borderRadius: '10px' }}>CONVIDADO</span>
                  <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '6px' }}>Aguarde validação do gestor.</p>
                </>
              )}
            </div>
          </aside>

          {/* Área Principal de Trabalho */}
          <section style={{ padding: '28px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', letterSpacing: '1px' }}>MÓDULO DE INTELIGÊNCIA</span>
                <h1 style={{ fontSize: '32px', margin: '4px 0', color: '#fff' }}>Sua Central <span style={{ color: '#00ff88' }}>SCOUT.</span></h1>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Prospecção, atração visual e inteligência de qualificação para o modelo CRC.</p>
              </div>
            </div>

            {/* CONTEÚDO DINÂMICO DOS SUBLINKS */}
            {gestorDesbloqueado && moduloAtivo === 'Seu SCOUT' && subModuloAtivo === 'Prospecto Digital' && (
              <div style={{ background: 'rgba(0, 255, 136, 0.02)', border: '1px solid rgba(0, 255, 136, 0.2)', borderRadius: '20px', padding: '24px' }}>
                <span style={{ fontSize: '9px', color: '#00ff88', fontWeight: 'bold' }}>SEU SCOUT · LINK 1 (MOTOR DE MINERAÇÃO PF)</span>
                <h3 style={{ fontSize: '20px', margin: '6px 0', color: '#fff' }}>Prospecto Digital (Mineração Regional Automatizada)</h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>
                  O SCOUT extrai lotes de <strong>20 perfis qualificados por vez</strong> com base no Estado e Município selecionados.
                </p>

                <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: '#00ff88', fontWeight: 'bold', marginBottom: '4px' }}>📍 ESTADO:</label>
                      <select
                        value={estadoSelecionado}
                        onChange={(e) => {
                          const novo = e.target.value;
                          setEstadoSelecionado(novo);
                          setMunicipioSelecionado(municipiosPorEstado[novo]?.[0] || '');
                        }}
                        style={{ width: '100%', background: '#050505', border: '1px solid rgba(0,255,136,0.3)', padding: '10px', borderRadius: '10px', color: '#00ff88', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        {Object.keys(municipiosPorEstado).map((uf) => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: '#00ff88', fontWeight: 'bold', marginBottom: '4px' }}>🏙️ MUNICÍPIO / REGIÃO:</label>
                      <select
                        value={municipioSelecionado}
                        onChange={(e) => setMunicipioSelecionado(e.target.value)}
                        style={{ width: '100%', background: '#050505', border: '1px solid rgba(0,255,136,0.3)', padding: '10px', borderRadius: '10px', color: '#00ff88', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        {(municipiosPorEstado[estadoSelecionado] || []).map((mun) => (
                          <option key={mun} value={mun}>{mun}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', display: 'block' }}>LOTES GERADOS HOJE</span>
                      <strong style={{ fontSize: '14px', color: lotesGeradosHoje >= 3 ? '#ff4d4d' : '#00ff88' }}>{lotesGeradosHoje} / 3 máx</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => executarMineracaoPorNicho('transicao')} style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '11px', cursor: 'pointer', background: nichoPfSelecionado === 'transicao' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)', color: nichoPfSelecionado === 'transicao' ? '#00ff88' : '#fff', border: '1px solid rgba(0,255,136,0.3)', fontWeight: 'bold' }}>
                      {minerando && nichoPfSelecionado === 'transicao' ? '⚙️ Extraindo...' : '💼 Minerar Transição (LinkedIn)'}
                    </button>
                    <button onClick={() => executarMineracaoPorNicho('liberais')} style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '11px', cursor: 'pointer', background: nichoPfSelecionado === 'liberais' ? 'rgba(43,217,255,0.2)' : 'rgba(255,255,255,0.05)', color: nichoPfSelecionado === 'liberais' ? '#2bd9ff' : '#fff', border: '1px solid rgba(43,217,255,0.3)', fontWeight: 'bold' }}>
                      {minerando && nichoPfSelecionado === 'liberais' ? '⚙️ Extraindo...' : '🩺 Minerar Profissionais Liberais'}
                    </button>
                    <button onClick={() => executarMineracaoPorNicho('consumo')} style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '11px', cursor: 'pointer', background: nichoPfSelecionado === 'consumo' ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)', color: nichoPfSelecionado === 'consumo' ? '#ffd700' : '#fff', border: '1px solid rgba(255,215,0,0.3)', fontWeight: 'bold' }}>
                      {minerando && nichoPfSelecionado === 'consumo' ? '⚙️ Extraindo...' : '🛒 Minerar Consumo Consciente'}
                    </button>
                  </div>
                </div>

                {/* Lista de perfis */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {leadsMinerados.map((lead, idx) => {
                    const msgSantinho = encodeURIComponent(`Olá ${lead.nome}! Notei seu perfil em ${lead.regiao} (${lead.perfil}). Convidamos você a conhecer o ecossistema CRC. Assista ao vídeo de 10s e conheça nossa comunidade: ${linkBaseGestor}`);
                    const linkWhatsSantinho = `https://wa.me/55${lead.whats}?text=${msgSantinho}`;

                    return (
                      <div key={idx} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#fff', fontSize: '13px' }}>{lead.nome}</strong>
                          <span style={{ fontSize: '9px', background: 'rgba(0,255,136,0.15)', color: '#00ff88', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px', fontWeight: 'bold' }}>{lead.regiao}</span>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>🎯 <strong>Perfil:</strong> {lead.perfil}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(linkBaseGestor);
                              alert('📋 Link do SCOUT copiado com sucesso!');
                            }}
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', fontWeight: 'bold', fontSize: '11px', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            📋 Copiar Link
                          </button>
                          <a
                            href={linkWhatsSantinho}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ background: '#00ff88', color: '#050505', fontWeight: 'bold', fontSize: '11px', padding: '8px 12px', borderRadius: '8px', textDecoration: 'none' }}
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

            {/* SUBLINK SANTINHO DIGITAL */}
            {gestorDesbloqueado && moduloAtivo === 'Seu SCOUT' && subModuloAtivo === 'Santinho Digital' && (
              <div style={{ background: 'rgba(0, 255, 136, 0.02)', border: '1px solid rgba(0, 255, 136, 0.2)', borderRadius: '20px', padding: '24px' }}>
                <span style={{ fontSize: '9px', color: '#00ff88', fontWeight: 'bold' }}>SEU SCOUT · LINK 2</span>
                <h3 style={{ fontSize: '20px', margin: '6px 0', color: '#fff' }}>Santinho Digital (Vídeo de 10s)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '12px', marginTop: '16px' }}>
                  <div style={{ background: '#000', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <video src="/assets/santinho.mp4" controls style={{ width: '100%', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#fff' }}>Link do seu CTA Exclusivo:</strong>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <input type="text" readOnly value={linkBaseGestor} style={{ flex: 1, background: '#050505', border: '1px solid rgba(0,255,136,0.3)', padding: '8px', borderRadius: '8px', color: '#00ff88', fontSize: '11px' }} />
                      <button onClick={() => navigator.clipboard.writeText(linkBaseGestor)} style={{ background: '#00ff88', color: '#050505', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>
                        Copiar Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBLINK FEEDBACK DE PROSPECTOS */}
            {gestorDesbloqueado && moduloAtivo === 'Seu SCOUT' && subModuloAtivo === 'Feedback de Prospectos' && (
              <div style={{ background: 'rgba(0, 255, 136, 0.02)', border: '1px solid rgba(0, 255, 136, 0.2)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '9px', color: '#00ff88', fontWeight: 'bold' }}>FILA ATIVA DE ATENDIMENTO</span>
                    <h3 style={{ fontSize: '18px', margin: '2px 0', color: '#fff' }}>Prospectos Qualificados no Quiz</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => window.print()} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                      🖨️ Imprimir / Baixar PDF
                    </button>
                    <button onClick={carregarLeadsScout} style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                      🔄 Atualizar Fila
                    </button>
                  </div>
                </div>

                {carregandoLeads ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#00ff88' }}>⚙️ Carregando prospectos...</div>
                ) : leadsFiltrados.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Nenhum prospecto encontrado.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {leadsFiltrados.map((item) => {
                      const convidado = item.dados?.convidado;
                      const whatsClean = convidado?.whatsapp?.replace(/\D/g, '') || '';
                      const msgWhats = encodeURIComponent(`Olá ${convidado?.nome || ''}, vi seu feedback no Quiz do SCOUT.CRC! podemos conversar?`);
                      const linkWhats = `https://wa.me/55${whatsClean}?text=${msgWhats}`;

                      return (
                        <div key={item.id} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: '#fff' }}>{convidado?.nome || 'Convidado Sem Nome'}</strong>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>📱 {convidado?.whatsapp} | 📍 {convidado?.cidade}</p>
                          </div>
                          <div>
                            <a href={linkWhats} target="_blank" rel="noopener noreferrer" style={{ background: '#00ff88', color: '#050505', fontWeight: 'bold', fontSize: '11px', padding: '8px 12px', borderRadius: '8px', textDecoration: 'none' }}>
                              💬 Iniciar X1
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}