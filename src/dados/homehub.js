// Dados centrais do app — mesma base numérica usada no deck e na planilha de auditoria.
// Fotos: Unsplash, licença gratuita, uso ilustrativo — substituir por fotografia própria da HomeHub.

const IMG = {
  hero: "https://images.unsplash.com/photo-1618832515490-e181c4794a45?w=1200&q=75&fm=jpg&fit=crop",
  planejados: "https://images.unsplash.com/photo-1630699144641-72fa7a6b8aa1?w=800&q=75&fm=jpg&fit=crop",
  prontos: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=800&q=75&fm=jpg&fit=crop",
  cozinha: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=75&fm=jpg&fit=crop",
  decoracao: "https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?w=800&q=75&fm=jpg&fit=crop",
  jardim: "https://images.unsplash.com/photo-1696846911635-83b97e53fb65?w=800&q=75&fm=jpg&fit=crop",
  ferramentas: "https://images.unsplash.com/photo-1645651964715-d200ce0939cc?w=800&q=75&fm=jpg&fit=crop",
};

export const CATEGORIAS = [
  { id: "moveis-planejados", nome: "Móveis Planejados", img: IMG.planejados },
  { id: "moveis-prontos", nome: "Móveis Prontos", img: IMG.prontos },
  { id: "decoracao", nome: "Decoração", img: IMG.decoracao },
  { id: "cozinha", nome: "Cozinha", img: IMG.cozinha },
  { id: "banheiro", nome: "Banheiro", cor: "#B7C4D6" },
  { id: "pisos", nome: "Pisos e Revestimentos", cor: "#C9BBA8" },
  { id: "organizacao", nome: "Organização", cor: "#B9C9B4" },
  { id: "iluminacao", nome: "Iluminação", cor: "#E3CA9A" },
  { id: "jardim", nome: "Jardim", img: IMG.jardim },
  { id: "ferramentas", nome: "Ferramentas", img: IMG.ferramentas },
  { id: "materiais", nome: "Materiais de Construção", cor: "#C7C2BC" },
];

export const IMG_HERO = IMG.hero;

export const SERVICOS = [
  { id: "montagem", nome: "Montagem", nota: 8.87, desc: "Executor certificado monta na sua casa." },
  { id: "consultoria", nome: "Projeto e Consultoria", nota: 8.40, desc: "Um especialista ajuda a planejar o ambiente." },
  { id: "entrega-expressa", nome: "Entrega Expressa", nota: 8.38, desc: "Receba em até 48h em regiões elegíveis." },
];

// Catálogo por categoria (produtos ilustrativos, faixa de preço real da base)
export const PRODUTOS = {
  "moveis-planejados": [
    { id: 1, nome: "Cozinha Compacta Faina", valor: 12680, montagem: 430, dias: 18, l: 160, p: 60, a: 75,
      desc: "Módulos superiores e inferiores, bancada em L.", img: IMG.planejados },
    { id: 2, nome: "Cozinha Planejada Ravel", valor: 16340, montagem: 520, dias: 21, l: 180, p: 65, a: 74,
      desc: "Armários até o teto, ilha central, iluminação embutida.", img: IMG.cozinha },
    { id: 3, nome: "Cozinha Integrada Serra", valor: 19020, montagem: 610, dias: 24, l: 200, p: 65, a: 75,
      desc: "Projeto completo com eletros embutidos.", img: IMG.planejados },
    { id: 4, nome: "Closet Modular Vertice", valor: 8420, montagem: 380, dias: 16, l: 140, p: 60, a: 240,
      desc: "Sistema modular do piso ao teto.", img: IMG.decoracao },
    { id: 5, nome: "Home Office Aro", valor: 5240, montagem: 340, dias: 14, l: 120, p: 55, a: 75,
      desc: "Bancada suspensa com passa-fios.", img: IMG.cozinha },
  ],
  "cozinha": [
    { id: 20, nome: "Panelas Tramontina Set 5pç", valor: 890, desc: "Antiaderente, indução.", img: IMG.cozinha },
    { id: 21, nome: "Coifa de Parede 90cm", valor: 1240, desc: "Inox, 2 motores.", img: IMG.cozinha },
  ],
  "banheiro": [
    { id: 30, nome: "Gabinete Suspenso 80cm", valor: 1450, desc: "MDF laqueado, cuba esculpida.", cor: "#B7C4D6" },
    { id: 31, nome: "Chuveiro Eletrônico", valor: 380, desc: "4 temperaturas, 7500W.", cor: "#B7C4D6" },
  ],
  "decoracao": [
    { id: 40, nome: "Tapete Trama Natural 2×3m", valor: 890, desc: "Fibra natural, pronto-entrega.", img: IMG.decoracao },
    { id: 41, nome: "Luminária de Piso Arco", valor: 640, desc: "Estrutura em metal, cúpula em linho.", img: IMG.decoracao },
    { id: 42, nome: "Quadro Decorativo Trio", valor: 320, desc: "Impressão em tela, moldura em madeira.", img: IMG.decoracao },
  ],
  "pisos": [
    { id: 50, nome: "Porcelanato Concreto 60×60", valor: 79, unidade: "m²", desc: "Acabamento acetinado.", cor: "#C9BBA8" },
    { id: 51, nome: "Piso Vinílico Amadeirado", valor: 65, unidade: "m²", desc: "Instalação em régua click.", cor: "#C9BBA8" },
  ],
  "organizacao": [
    { id: 60, nome: "Closet Aéreo 3 Portas", valor: 1290, desc: "Correr, espelho central.", cor: "#B9C9B4" },
    { id: 61, nome: "Kit Organizadores Gaveta", valor: 149, desc: "Acrílico, 6 peças.", cor: "#B9C9B4" },
  ],
  "iluminacao": [
    { id: 70, nome: "Pendente Industrial Trio", valor: 480, desc: "Suspensão ajustável.", cor: "#E3CA9A" },
    { id: 71, nome: "Fita LED 5m RGB", valor: 129, desc: "Controle por app.", cor: "#E3CA9A" },
  ],
  "moveis-prontos": [
    { id: 80, nome: "Sofá Retrátil 3 Lugares", valor: 3290, desc: "Suede, base reclinável.", img: IMG.prontos },
    { id: 81, nome: "Mesa de Jantar 6 Lugares", valor: 2140, desc: "Madeira maciça, tampo vidro.", img: IMG.prontos },
  ],
  "jardim": [
    { id: 90, nome: "Conjunto Mesa e Cadeiras Externas", valor: 1690, desc: "Alumínio, resistente à chuva.", img: IMG.jardim },
    { id: 91, nome: "Vaso Autoirrigável Grande", valor: 189, desc: "Reservatório de 5 dias.", img: IMG.jardim },
  ],
  "ferramentas": [
    { id: 100, nome: "Furadeira de Impacto 750W", valor: 349, desc: "Kit com 20 acessórios.", img: IMG.ferramentas },
  ],
  "materiais": [
    { id: 110, nome: "Cimento CP-II 50kg", valor: 42, desc: "Saco, uso geral.", cor: "#C7C2BC" },
  ],
};

export const REFERENCIAS = [
  { nome: "Porta padrão (altura)", cm: 210 },
  { nome: "Tomada de parede (largura)", cm: 12 },
  { nome: "Folha A4 na vertical", cm: 29.7 },
  { nome: "Rodapé (altura)", cm: 15 },
  { nome: "Piso 60×60 cm", cm: 60 },
];

export const ANALISE_DEMO = {
  largura: 312, altura: 262, profundidade: 58, vao: 284, confianca: "média",
  obstrucoes: ["tomada a 32 cm do piso, parede direita", "saída hidráulica a 45 cm da parede esquerda"],
  observacao: "Parede livre entre o vão da porta e o canto oposto. O vão já desconta o recuo necessário para a tubulação existente.",
};

// Reforma em Etapas — plano macro do cliente. TODOS os ambientes ficam sempre acessíveis;
// não há bloqueio de navegação. O que muda é a condição comercial de quem segue o plano sugerido.
export const PROJETOS_REFORMA = [
  { id: "cozinha", nome: "Cozinha", status: "ativo",
    resumo: "Categoria de maior ticket médio (R$ 14.622) e maior margem (48,1%) da base.",
    orcamentoSugerido: 20000 },
  { id: "banheiro", nome: "Banheiro", status: "sugerido",
    resumo: "Próximo ambiente sugerido pela IA — você pode começar quando quiser.",
    orcamentoSugerido: 8000 },
  { id: "sala", nome: "Sala de estar", status: "planejado",
    resumo: "Terceira etapa do plano de reforma, ainda não iniciada.",
    orcamentoSugerido: 12000 },
];

// Incentivo comercial por seguir o plano faseado — condição real, não bloqueio.
export const INCENTIVO_FASEADO = {
  desconto: 8,
  texto: "8% de desconto em cada nova etapa iniciada em até 90 dias da anterior.",
};

export const REC_ANO = 175369820;

// Painel interno de priorização de expansão (Fase 2 do roadmap) — não é tela de cliente.
// Números são uma simulação a partir da base atual de 23.000 clientes; a etiqueta na tela
// deixa isso explícito. Na Fase 2 real, esses números são substituídos por dado do piloto.
export const REGIOES_EXPANSAO = [
  { id: "bh", nome: "Belo Horizonte, MG", clientesPotenciais: 1840, ticketMedio: 15200, executoresCertificados: 14, notaSatisfacao: 8.6 },
  { id: "rj", nome: "Rio de Janeiro, RJ", clientesPotenciais: 2650, ticketMedio: 16800, executoresCertificados: 19, notaSatisfacao: 8.1 },
  { id: "es", nome: "Vitória, ES", clientesPotenciais: 520, ticketMedio: 13900, executoresCertificados: 5, notaSatisfacao: 8.7 },
  { id: "pr", nome: "Curitiba, PR", clientesPotenciais: 1310, ticketMedio: 16100, executoresCertificados: 17, notaSatisfacao: 8.8 },
  { id: "rs", nome: "Porto Alegre, RS", clientesPotenciais: 1490, ticketMedio: 14700, executoresCertificados: 12, notaSatisfacao: 8.3 },
  { id: "sc", nome: "Florianópolis, SC", clientesPotenciais: 680, ticketMedio: 17400, executoresCertificados: 6, notaSatisfacao: 8.9 },
];
