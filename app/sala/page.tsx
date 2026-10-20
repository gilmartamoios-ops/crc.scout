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
    status_aprovacao?: 'pendente' | 'acompanhamento' | 'solicitado_master' | 'codigo_liberado' | 'desqualificado' | 'nao_interesse';
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

const estadosBrasil = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function SalaPage() {
  const [moduloAtivo, setModuloAtivo] = useState<string | null>('Seu SCOUT');
  const [subModuloAtivo, setSubModuloAtivo] = useState<string | null>('Prospecto Digital');
  const [moduloRestrito, setModuloRestrito] = useState<Modulo | null>(null);
  const [gestorDesbloqueado, setGestorDesbloqueado] = useState(false);
  const [modoVisitante, setModoVisitante] = useState(false);

// Detecta automaticamente se veio ?modo=visitante na URL
useEffect(() => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('modo') === 'visitante') {
      setModoVisitante(true);
    }
  }
}, []);
  const [gestor, setGestor] = useState<{
    id: string;
    nome: string;
    whatsapp: string;
    email?: string;
    slug: string | null;
  } | null>(null);

  // Estados do Prospecto Digital (IBGE + Garimpo Territorial por Pilar)
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>('RJ');
  const [municipiosDoEstado, setMunicipiosDoEstado] = useState<string[]>([]);
  const [municipioSelecionado, setMunicipioSelecionado] = useState<string>('Cabo Frio');
  const [carregandoCidades, setCarregandoCidades] = useState<boolean>(false);
  const [nichoPfSelecionado, setNichoPfSelecionado] = useState<'transicao' | 'liberais' | 'consumo'>('transicao');
  const [perfisGarimpados, setPerfisGarimpados] = useState<Array<{ nome: string; perfil: string; regiao: string; whats: string }>>([]);
  const [executouGarimpo, setExecutouGarimpo] = useState<boolean>(false);

  // Estados do Feedback de Prospectos Reais (Supabase)
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

  // Consome a API do IBGE para carregar 100% dos municípios reais do Estado selecionado
  useEffect(() => {
    async function carregarMunicipiosIBGE() {
      setCarregandoCidades(true);
      try {
        const resposta = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado}/municipios`);
        const dados = await resposta.json();
        const nomesCidades = dados.map((cidade: { nome: string }) => cidade.nome).sort();
        setMunicipiosDoEstado(nomesCidades);
        if (nomesCidades.length > 0) {
          setMunicipioSelecionado(nomesCidades[0]);
        }
      } catch (erro) {
        console.error('Erro ao buscar municípios do IBGE:', erro);
      } finally {
        setCarregandoCidades(false);
      }
    }

    carregarMunicipiosIBGE();
  }, [estadoSelecionado]);

  // Executa o garimpo de mercado estruturado por pilar na cidade selecionada
  const executarGarimpoTerritorial = () => {
    const regiaoStr = `${municipioSelecionado} - ${estadoSelecionado}`;
    setExecutouGarimpo(true);

    if (nichoPfSelecionado === 'transicao') {
      setPerfisGarimpados([
        { nome: 'Carlos Eduardo', perfil: 'Transição de Carreira (LinkedIn / Adm)', regiao: regiaoStr, whats: '22998877111' },
        { nome: 'Beatriz Lima', perfil: 'Open to Work (LinkedIn / RH)', regiao: regiaoStr, whats: '22988772222' },
        { nome: 'Marcelo Santos', perfil: 'Transição de Carreira (Comercial)', regiao: regiaoStr, whats: '22996655333' },
        { nome: 'Ana Paula', perfil: 'Open to Work (LinkedIn / Finanças)', regiao: regiaoStr, whats: '22995544444' },
        { nome: 'Lucas Gabriel', perfil: 'Transição de Carreira (Logística)', regiao: regiaoStr, whats: '22994433555' },
        { nome: 'Larissa Manoela', perfil: 'Open to Work (LinkedIn / Atendimento)', regiao: regiaoStr, whats: '22993322666' },
        { nome: 'Felipe Neto', perfil: 'Transição de Carreira (Marketing)', regiao: regiaoStr, whats: '22992211777' },
        { nome: 'Juliana Paes', perfil: 'Open to Work (LinkedIn / Produção)', regiao: regiaoStr, whats: '22991100888' },
        { nome: 'Renato Aragão', perfil: 'Transição de Carreira (Gestão)', regiao: regiaoStr, whats: '22990099999' },
        { nome: 'Camila Pitanga', perfil: 'Open to Work (LinkedIn / Projetos)', regiao: regiaoStr, whats: '22989988888' },
        { nome: 'Wagner Moura', perfil: 'Transição de Carreira (Tecnologia)', regiao: regiaoStr, whats: '22988877777' },
        { nome: 'Alice Braga', perfil: 'Open to Work (LinkedIn / Vendas)', regiao: regiaoStr, whats: '22987766666' },
        { nome: 'Rodrigo Santoro', perfil: 'Transição de Carreira (Consultoria)', regiao: regiaoStr, whats: '22986655555' },
        { nome: 'Sônia Braga', perfil: 'Open to Work (LinkedIn / Operações)', regiao: regiaoStr, whats: '22985544444' },
        { nome: 'Lázaro Ramos', perfil: 'Transição de Carreira (Supervisão)', regiao: regiaoStr, whats: '22984433333' },
        { nome: 'Taís Araújo', perfil: 'Open to Work (LinkedIn / Comunicação)', regiao: regiaoStr, whats: '22983322222' },
        { nome: 'Cauã Reymond', perfil: 'Transição de Carreira (Negócios)', regiao: regiaoStr, whats: '22982211111' },
        { nome: 'Grazi Massafera', perfil: 'Open to Work (LinkedIn / Relacionamento)', regiao: regiaoStr, whats: '22981100000' },
        { nome: 'Matheus Nachtergaele', perfil: 'Transição de Carreira (Estratégia)', regiao: regiaoStr, whats: '22980099999' },
        { nome: 'Marjorie Estiano', perfil: 'Open to Work (LinkedIn / Planejamento)', regiao: regiaoStr, whats: '22979988888' },
      ]);
    } else if (nichoPfSelecionado === 'liberais') {
      setPerfisGarimpados([
        { nome: 'Dra. Mônica Sousa', perfil: 'Profissional Liberal (Estética Avançada)', regiao: regiaoStr, whats: '22991112233' },
        { nome: 'Dr. Roberto Alves', perfil: 'Profissional Liberal (Quiropraxia)', regiao: regiaoStr, whats: '22992223344' },
        { nome: 'Prof. Carla Dias', perfil: 'Educadora Física / Personal Trainer', regiao: regiaoStr, whats: '22993334455' },
        { nome: 'Nutri. Patrícia Gomes', perfil: 'Profissional Liberal (Nutrição Funcional)', regiao: regiaoStr, whats: '22994445566' },
        { nome: 'Terapeuta Hugo Leonardo', perfil: 'Terapeuta Holístico & Bem-estar', regiao: regiaoStr, whats: '22995556677' },
        { nome: 'Enf. Kelly Cristina', perfil: 'Enfermeira Esteta / Ozonioterapia', regiao: regiaoStr, whats: '22996667788' },
        { nome: 'Dr. Bruno Mars', perfil: 'Fisioterapeuta Desportivo', regiao: regiaoStr, whats: '22997778899' },
        { nome: 'Psicóloga Amanda Costa', perfil: 'Profissional Liberal (Psicoterapia)', regiao: regiaoStr, whats: '22998889900' },
        { nome: 'Consultora Vanessa Lopes', perfil: 'Coach de Desenvolvimento Humano', regiao: regiaoStr, whats: '22999900011' },
        { nome: 'Esteticista Brenda Song', perfil: 'Especialista em Cuidados Faciais', regiao: regiaoStr, whats: '22981112233' },
        { nome: 'Dr. Arthur Aguiar', perfil: 'Nutricionista Esportivo', regiao: regiaoStr, whats: '22982223344' },
        { nome: 'Prof. Larissa Manoela', perfil: 'Instrutora de Yoga & Pilates', regiao: regiaoStr, whats: '22983334455' },
        { nome: 'Terapeuta Marcela Temer', perfil: 'Acupunturista & Saúde Integrativa', regiao: regiaoStr, whats: '22984445566' },
        { nome: 'Dr. Fernando Rocha', perfil: 'Médico Integrativo', regiao: regiaoStr, whats: '22985556677' },
        { nome: 'Massoterapeuta Cátia Paganote', perfil: 'Especialista em Drenagem', regiao: regiaoStr, whats: '22986667788' },
        { nome: 'Enf. Daniel Rocha', perfil: 'Enfermeiro Cuidador Especializado', regiao: regiaoStr, whats: '22987778899' },
        { nome: 'Prof. Sabrina Sato', perfil: 'Personal Trainer Online', regiao: regiaoStr, whats: '22988889900' },
        { nome: 'Nutri. Gisele Bündchen', perfil: 'Consultora de Alimentos Orgânicos', regiao: regiaoStr, whats: '22989990011' },
        { nome: 'Fisioterapeuta Kaká', perfil: 'Reabilitação Motora', regiao: regiaoStr, whats: '22980001122' },
        { nome: 'Psicólogo Neymar Jr', perfil: 'Desenvolvimento Mental e Alta Performance', regiao: regiaoStr, whats: '22979992233' },
      ]);
    } else {
      setPerfisGarimpados([
        { nome: 'Família Mendonça', perfil: 'Consumo Consciente & Economia Doméstica', regiao: regiaoStr, whats: '22991002003' },
        { nome: 'Casal Alvarenga', perfil: 'Busca de Renda Recorrente para o Lar', regiao: regiaoStr, whats: '22992003004' },
        { nome: 'Dona Maria de Lourdes', perfil: 'Consumidora Focada em Longevidade', regiao: regiaoStr, whats: '22993004005' },
        { nome: 'Senhor João Pedro', perfil: 'Comunidade de Consumo Inteligente', regiao: regiaoStr, whats: '22994005006' },
        { nome: 'Tatiane e Márcio', perfil: 'Redução de Custos com Produtos de Limpeza', regiao: regiaoStr, whats: '22995006007' },
        { nome: 'Família Silveira', perfil: 'Alimentação Saudável & Bem-estar', regiao: regiaoStr, whats: '22996007008' },
        { nome: 'Casal Belchior', perfil: 'Gestão Financeira Familiar', regiao: regiaoStr, whats: '22997008009' },
        { nome: 'Dona Cida', perfil: 'Consumo Colaborativo de Bairro', regiao: regiaoStr, whats: '22998009010' },
        { nome: 'Família Albuquerque', perfil: 'Qualidade de Vida e Prevenção', regiao: regiaoStr, whats: '22999010011' },
        { nome: 'Casal Xavier', perfil: 'Economia Doméstica Inteligente', regiao: regiaoStr, whats: '22981011012' },
        { nome: 'Dona Neusa', perfil: 'Mãe de Família Focada em Saúde', regiao: regiaoStr, whats: '22982012013' },
        { nome: 'Família Goulart', perfil: 'Consumo Sustentável', regiao: regiaoStr, whats: '22983013014' },
        { nome: 'Casal Buarque', perfil: 'Empreendedorismo em Família', regiao: regiaoStr, whats: '22984014015' },
        { nome: 'Dona Zuleide', perfil: 'Rede de Consumo Solidário', regiao: regiaoStr, whats: '22985015016' },
        { nome: 'Família Caymmi', perfil: 'Bem-estar e Longevidade em Casa', regiao: regiaoStr, whats: '22986016017' },
        { nome: 'Casal Jobim', perfil: 'Descontos em Produtos de Consumo Diário', regiao: regiaoStr, whats: '22987017018' },
        { nome: 'Dona Ivone', perfil: 'Comunidade Ativa de Consumidores', regiao: regiaoStr, whats: '22988018019' },
        { nome: 'Família Veloso', perfil: 'Troca de Hábitos de Consumo', regiao: regiaoStr, whats: '22989019020' },
        { nome: 'Casal Gil', perfil: 'Qualidade de Vida e Economia', regiao: regiaoStr, whats: '22980020021' },
        { nome: 'Dona Elis', perfil: 'Membro Fundador de Comunidade Local', regiao: regiaoStr, whats: '22979021022' },
      ]);
    }
  };

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
        console.error('Erro ao buscar dados reais:', error);
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

  const atualizarStatusLead = async (id: string, novoStatus: 'pendente' | 'acompanhamento' | 'solicitado_master' | 'codigo_liberado' | 'desqualificado' | 'nao_interesse') => {
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
      alert('Erro ao atualizar status do prospecto no banco.');
      return;
    }

    setLeads((anterior) =>
      anterior.map((item) =>
        item.id === id ? { ...item, dados: novosDados } : item
      )
    );
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

                  {(gestorDesbloqueado || modoVisitante) && modulo.sublinks && moduloAtivo === modulo.nome && (
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

          {/* Área Central Operacional */}
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

            <div className="sala-center-viewport" style={{ position: 'relative', overflow: 'hidden' }}>
              
              {/* CONTEÚDO DE FUNDO (Se for visitante, fica desfocado e cego para cliques) */}
              <div style={modoVisitante && !gestorDesbloqueado ? { filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.8 } : undefined}>
                
                {/* SUBLINK 1: PROSPECTO DIGITAL */}
                {(gestorDesbloqueado || modoVisitante) && moduloAtivo === 'Seu SCOUT' && subModuloAtivo === 'Prospecto Digital' && (
                  <div className="sala-dynamic-card">
                    {/* CABEÇALHO EXATO SOLICITADO */}
                    <h3 style={{ fontSize: '20px', margin: '0 0 4px', color: '#fff' }}>Prospecto Digital</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                      filtre sua busca para encontrar novos Gestores de Comunidade
                    </p>

              </div>

              
              {modoVisitante && !gestorDesbloqueado && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(5, 5, 5, 0.85)',
                  backdropFilter: 'blur(6px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '24px',
                  zIndex: 99
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
                  <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>
                    Tecnologia Exclusiva de Inteligência Territorial
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', maxWidth: '400px', lineHeight: '1.5', marginBottom: '24px' }}>
                    Você está visualizando a ferramenta real de automação. Para destravar a execução operacional e liberar os contatos, preencha sua Ficha de Qualificação.
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => { window.location.href = '/?etapa=quiz'; }}
                    style={{
                      background: '#00ff88',
                      color: '#050505',
                      border: 'none',
                      padding: '14px 28px',
                      borderRadius: '12px',
                      fontWeight: '900',
                      fontSize: '12px',
                      cursor: 'pointer',
                      letterSpacing: '0.5px',
                      boxShadow: '0 0 25px rgba(0,255,136,0.4)',
                    }}
                  >
                    PREENCHER QUIZ & DESBLOQUEAR FERRAMENTA →
                  </button>
                </div>
              )}

                  {/* CARD EXPLICATIVO DA LEI DAS MÉDIAS */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.06), rgba(0,0,0,0.5))', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '14px', padding: '16px 18px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px' }}>📊</span>
                      <strong style={{ color: '#00ff88', fontSize: '13px', letterSpacing: '0.5px' }}>
                        O SCOUT DO CRC OPERA SEGUNDO A LEI DAS MÉDIAS.
                      </strong>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.5' }}>
                      <strong>A Lei das Médias é o princípio de que, quanto maior o número de pessoas apresentadas ao negócio, maior a probabilidade de resultados.</strong>
                    </p>
                    <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                      Exemplo: de cada 20 pessoas abordadas, 4 demonstram interesse.
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', lineHeight: '1.5' }}>
                      A qualidade da abordagem e o perfil das pessoas influenciam os resultados.
                    </p>
                  </div>

                  {/* SELETORES */}
                  <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '16px', padding: '20px', marginBottom: '22px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '14px', alignItems: 'center', marginBottom: '18px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', color: '#00ff88', fontWeight: 'bold', marginBottom: '6px' }}>📍 ESTADO (UF):</label>
                        <select
                          value={estadoSelecionado}
                          onChange={(e) => setEstadoSelecionado(e.target.value)}
                          style={{ width: '100%', background: '#050505', border: '1px solid rgba(0,255,136,0.3)', padding: '10px 12px', borderRadius: '10px', color: '#00ff88', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          {estadosBrasil.map((uf) => (
                            <option key={uf} value={uf}>{uf}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '10px', color: '#00ff88', fontWeight: 'bold', marginBottom: '6px' }}>
                          🏙️ MUNICÍPIO ({carregandoCidades ? 'Carregando IBGE...' : `${municipiosDoEstado.length} cidades`}):
                        </label>
                        <select
                          value={municipioSelecionado}
                          onChange={(e) => setMunicipioSelecionado(e.target.value)}
                          disabled={carregandoCidades}
                          style={{ width: '100%', background: '#050505', border: '1px solid rgba(0,255,136,0.3)', padding: '10px 12px', borderRadius: '10px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          {municipiosDoEstado.map((cidade) => (
                            <option key={cidade} value={cidade}>{cidade}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', marginBottom: '10px' }}>
                      PILAR DE ATRAÇÃO SELECIONADO:
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setNichoPfSelecionado('transicao')}
                        style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer', background: nichoPfSelecionado === 'transicao' ? 'rgba(0,255,136,0.18)' : 'rgba(255,255,255,0.03)', color: nichoPfSelecionado === 'transicao' ? '#00ff88' : '#fff', border: nichoPfSelecionado === 'transicao' ? '1px solid #00ff88' : '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}
                      >
                        <strong style={{ display: 'block', fontSize: '12px' }}>💼 Transição Profissional</strong>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNichoPfSelecionado('liberais')}
                        style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer', background: nichoPfSelecionado === 'liberais' ? 'rgba(43,217,255,0.18)' : 'rgba(255,255,255,0.03)', color: nichoPfSelecionado === 'liberais' ? '#2bd9ff' : '#fff', border: nichoPfSelecionado === 'liberais' ? '1px solid #2bd9ff' : '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}
                      >
                        <strong style={{ display: 'block', fontSize: '12px' }}>🩺 Saúde & Ozonioterapia</strong>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNichoPfSelecionado('consumo')}
                        style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer', background: nichoPfSelecionado === 'consumo' ? 'rgba(255,215,0,0.18)' : 'rgba(255,255,255,0.03)', color: nichoPfSelecionado === 'consumo' ? '#ffd700' : '#fff', border: nichoPfSelecionado === 'consumo' ? '1px solid #ffd700' : '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}
                      >
                        <strong style={{ display: 'block', fontSize: '12px' }}>🛒 Consumo Consciente</strong>
                      </button>
                    </div>
                  </div>

                  {/* BOTÃO DE GARIMPO DIGITAL DE TERRITÓRIO */}
                  <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={executarGarimpoTerritorial}
                      style={{
                        background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                        color: '#050505',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: '900',
                        fontSize: '12px',
                        cursor: 'pointer',
                        letterSpacing: '0.5px',
                        boxShadow: '0 4px 15px rgba(0,255,136,0.3)',
                      }}
                    >
                      ⚡ EXECUTAR GARIMPO DIGITAL DE TERRITÓRIO
                    </button>
                  </div>

                  {/* LISTAGEM DOS PERFIS ALVO GARIMPADOS */}
                  {executouGarimpo && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '14px', color: '#fff', margin: 0 }}>
                          ⚡ Lote Ativo para {municipioSelecionado} - {estadoSelecionado} ({perfisGarimpados.length} Perfis Alvo Prontos)
                        </h4>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                          💡 Copie o link ou envie o Santinho Digital diretamente
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                        {perfisGarimpados.map((lead, index) => {
                          const msgSantinho = encodeURIComponent(`Olá ${lead.nome}! Notei seu perfil em ${lead.regiao} (${lead.perfil}). Convidamos você a conhecer o ecossistema CRC. Assista ao vídeo e conheça nossa comunidade: ${linkBaseGestor}`);
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
                                  🎯 <strong>Perfil Alvo:</strong> {lead.perfil}
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
                </div>
              )}

              {/* SUBLINK 2: SANTINHO DIGITAL */}
              {gestorDesbloqueado && moduloAtivo === 'Seu SCOUT' && subModuloAtivo === 'Santinho Digital' && (
                <div className="sala-dynamic-card">
                  <span className="sala-eyebrow" style={{ color: '#00ff88' }}>SEU SCOUT · LINK 2</span>
                  <h3 style={{ fontSize: '20px', margin: '8px 0 4px', color: '#fff' }}>Santinho Digital (Vídeo de 10s)</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>
                    Sua assinatura visual com vídeo de alta conversão para atração rápida.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.3)' }}>
                    <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,255,136,0.3)', textAlign: 'center', padding: '10px' }}>
                      <span style={{ fontSize: '10px', color: '#00ff88', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>VÍDEO 10s · ATRAÇÃO</span>
                      <video src="/assets/santinho.mp4" controls style={{ width: '100%', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#fff', display: 'block', marginBottom: '8px' }}>Seu Link Exclusivo de Atribuição (Gestor):</strong>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <input
                          type="text"
                          readOnly
                          value={linkBaseGestor}
                          style={{ flex: 1, background: '#050505', border: '1px solid rgba(0,255,136,0.3)', padding: '10px 14px', borderRadius: '10px', color: '#00ff88', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(linkBaseGestor);
                            alert('📋 Link exclusivo copiado para a área de transferência!');
                          }}
                          style={{ background: '#00ff88', color: '#050505', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Copiar Link
                        </button>
                      </div>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                        ID do Gestor Registrado no Banco: <code style={{ color: '#00ff88' }}>{gestor?.slug || 'master'}</code>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBLINK 3: FEEDBACK DE PROSPECTOS REAIS (SUPABASE) */}
              {gestorDesbloqueado && moduloAtivo === 'Seu SCOUT' && subModuloAtivo === 'Feedback de Prospectos' && (
                <div className="sala-dynamic-card">
                  
                  <div style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,0,0,0.6))', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '16px', padding: '18px 20px', marginBottom: '22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ background: '#00ff88', color: '#050505', padding: '3px 8px', borderRadius: '6px', fontWeight: '900', fontSize: '10px', letterSpacing: '1px' }}>
                        CENTRAL REAL DE ATENDIMENTO
                      </span>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: '15px' }}>
                        Gestão de Prospectos & Liberação Master
                      </h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                      Os prospectos listados abaixo preencheram o Quiz pelo seu link exclusivo. Realize o atendimento no X1 e utilize a prancheta abaixo para gerenciar a fila e solicitar a emissão do Código de Entrada ao <strong>Master (Gilmar)</strong>.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '22px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', display: 'block' }}>TOTAL REAL</span>
                      <strong style={{ fontSize: '20px', color: '#fff' }}>{totalLeads}</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', display: 'block' }}>PENDENTES X1</span>
                      <strong style={{ fontSize: '20px', color: '#00ff88' }}>{pendentesFila}</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', display: 'block' }}>ACOMPANHAMENTO</span>
                      <strong style={{ fontSize: '20px', color: '#2bd9ff' }}>{acompanhamentoLeads}</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', color: '#ffd700', letterSpacing: '1px', display: 'block' }}>AGUARDANDO MASTER</span>
                      <strong style={{ fontSize: '20px', color: '#ffd700' }}>{solicitadosMaster}</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', color: '#00ff88', letterSpacing: '1px', display: 'block' }}>CÓDIGOS LIBERADOS</span>
                      <strong style={{ fontSize: '20px', color: '#00ff88' }}>{codigosLiberados}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span className="sala-eyebrow" style={{ color: '#00ff88' }}>FILA ATIVA DO SUPABASE</span>
                      <h3 style={{ fontSize: '18px', margin: '2px 0', color: '#fff' }}>Registros Reais Cadastrados</h3>
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
                        🔄 Atualizar Fila Real
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
                      <option value="nao_interesse">Não Tenho Interesse (72h+)</option>
                      <option value="desqualificado">Desqualificados</option>
                    </select>
                  </div>

                  {carregandoLeads ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#00ff88', fontSize: '12px' }}>
                      ⚙️ Conectando ao Supabase e buscando registros reais...
                    </div>
                  ) : leadsFiltrados.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '12px', border: '1px dashed rgba(0,255,136,0.2)', borderRadius: '14px', background: 'rgba(0,0,0,0.3)' }}>
                      <strong style={{ color: '#fff', display: 'block', fontSize: '14px', marginBottom: '6px' }}>Sua fila de prospectos reais está limpa.</strong>
                      Divulgue seu link exclusivo ou Santinho Digital para capturar novos cadastros diretamente no Quiz.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {leadsFiltrados.map((item) => {
                        const convidado = item.dados?.convidado;
                        const whatsClean = convidado?.whatsapp?.replace(/\D/g, '') || '';
                        const statusAtual = item.dados?.status_aprovacao || 'pendente';
                        const msgWhats = encodeURIComponent(`Olá ${convidado?.nome || ''}, recebi seu cadastro no Quiz do SCOUT.CRC! Podemos conversar sobre seu objetivo?`);
                        const linkWhats = `https://wa.me/55${whatsClean}?text=${msgWhats}`;

                        // Cálculo de tempo para alerta visual de 72h
                        const dataCriacao = new Date(item.created_at).getTime();
                        const horasDecorridas = (Date.now() - dataCriacao) / (1000 * 60 * 60);
                        const passouDe72h = horasDecorridas >= 72 && statusAtual === 'pendente';

                        return (
                          <div
                            key={item.id}
                            className="lead-card-printable"
                            style={{
                              background: 'rgba(0,0,0,0.5)',
                              border: passouDe72h ? '1px solid rgba(255,100,100,0.4)' : '1px solid rgba(0,255,136,0.2)',
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
                                  {convidado?.nome || 'Convidado Real'}
                                </strong>
                                <span style={{ fontSize: '9px', background: 'rgba(0,255,136,0.15)', color: '#00ff88', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(0,255,136,0.3)', fontWeight: 'bold' }}>
                                  {item.dados?.perfil?.toUpperCase() || 'RESPOSTAS QUIZ'}
                                </span>
                                
                                <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', background: statusAtual === 'codigo_liberado' ? 'rgba(0,255,136,0.2)' : statusAtual === 'solicitado_master' ? 'rgba(255,215,0,0.2)' : statusAtual === 'acompanhamento' ? 'rgba(43,217,255,0.2)' : statusAtual === 'nao_interesse' ? 'rgba(255,100,100,0.2)' : 'rgba(255,255,255,0.08)', color: statusAtual === 'codigo_liberado' ? '#00ff88' : statusAtual === 'solicitado_master' ? '#ffd700' : statusAtual === 'acompanhamento' ? '#2bd9ff' : statusAtual === 'nao_interesse' ? '#ff6464' : 'rgba(255,255,255,0.6)' }}>
                                  {statusAtual === 'codigo_liberado' ? `✦ CÓDIGO: ${item.dados.codigo_master || 'ATIVO'}` : statusAtual === 'solicitado_master' ? '🟡 AGUARDANDO CÓDIGO MASTER' : statusAtual === 'acompanhamento' ? '🔵 EM ACOMPANHAMENTO' : statusAtual === 'nao_interesse' ? '🔴 NÃO TENHO INTERESSE (72H+)' : '⚪ PENDENTE X1'}
                                </span>

                                {passouDe72h && (
                                  <span style={{ fontSize: '8px', background: 'rgba(255,100,100,0.2)', color: '#ff6464', padding: '2px 6px', borderRadius: '6px', border: '1px solid rgba(255,100,100,0.4)', fontWeight: 'bold' }}>
                                    ⚠️ +72H SEM RESPOSTA
                                  </span>
                                )}
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
                                  <strong>Objetivo Declarado:</strong> {item.dados.respostas['objetivo'] || 'Não especificado'}
                                </div>
                              )}

                              <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }} className="no-print">
                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', alignSelf: 'center', marginRight: '4px' }}>Gerir Fila:</span>
                                
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
                                  onClick={() => atualizarStatusLead(item.id, 'nao_interesse')}
                                  style={{ background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', color: '#ff6464', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  🔴 Não Tenho Interesse
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
          border-radius: 99px;
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