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
  escritorio: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=75&fm=jpg&fit=crop",
};

export const AMBIENTES = [
  { id: "cozinha", nome: "Cozinha", orc: 20000 },
  { id: "banheiro", nome: "Banheiro", orc: 8000 },
  { id: "sala", nome: "Sala de estar", orc: 12000 },
  { id: "quarto", nome: "Quarto", orc: 9000 },
  { id: "varanda", nome: "Varanda", orc: 6000 },
  { id: "jardim", nome: "Jardim", orc: 7500 },
  { id: "garagem", nome: "Garagem", orc: 5000 },
  { id: "lavanderia", nome: "Lavanderia", orc: 6500 },
  { id: "escritorio", nome: "Escritório / Home office", orc: 7500 },
  { id: "quarto-bebe", nome: "Quarto do bebê", orc: 8500 },
  { id: "quarto-crianca", nome: "Quarto de criança", orc: 8500 },
  { id: "piscina", nome: "Área da piscina", orc: 28000 },
  { id: "gourmet", nome: "Área gourmet", orc: 19000 },
];

// atalho pros itens genéricos (material, mão de obra, elétrica) que cabem em praticamente qualquer ambiente
const TODOS_AMBIENTES = AMBIENTES.map((a) => a.id);

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
  { id: "hidraulica", nome: "Hidráulica", cor: "#AEC6CF" },
  { id: "eletrica", nome: "Elétrica", cor: "#E0C68E" },
  { id: "mao-de-obra", nome: "Mão de Obra", cor: "#CBCBCB" },
  { id: "piscina", nome: "Piscina", cor: "#9FC9D3" },
  { id: "area-externa", nome: "Área Gourmet e Externa", cor: "#D9B48F" },
];

// Reforma por categoria: cada tipo de reforma específica reúne material + mão de obra automaticamente.
export const CATEGORIAS_REFORMA = [
  { id: "piso", nome: "Piso e revestimento", categorias: ["pisos", "materiais"], maoDeObraCategoria: "piso" },
  { id: "hidraulica", nome: "Hidráulica", categorias: ["hidraulica"], maoDeObraCategoria: "hidraulica" },
  { id: "eletrica", nome: "Elétrica", categorias: ["eletrica"], maoDeObraCategoria: "eletrica" },
  { id: "pintura", nome: "Pintura", categorias: ["materiais"], maoDeObraCategoria: "pintura" },
  { id: "piscina", nome: "Equipamentos de piscina", categorias: ["piscina", "hidraulica"], maoDeObraCategoria: "hidraulica" },
  { id: "gourmet", nome: "Equipamentos de área gourmet", categorias: ["area-externa", "hidraulica"], maoDeObraCategoria: "hidraulica" },
];

export const IMG_HERO = IMG.hero;

export const SERVICOS = [
  { id: "montagem", nome: "Montagem", nota: 8.87, desc: "Executor certificado monta na sua casa." },
  { id: "consultoria", nome: "Projeto e Consultoria", nota: 8.40, desc: "Um especialista ajuda a planejar o ambiente." },
  { id: "entrega-expressa", nome: "Entrega Expressa", nota: 8.38, desc: "Receba em até 48h em regiões elegíveis." },
];

// Catálogo por categoria (produtos ilustrativos, faixa de preço real da base)
// "estilo": ids de ESTILOS_DESIGN que esse item combina — ausente = combina com qualquer estilo (itens
// estruturais/utilitários, onde estética não é o critério). "faixa": "economico" | "intermediario" | "premium",
// relativo aos outros itens da mesma categoria — usado pra filtrar por prioridade (custo x acabamento).
export const PRODUTOS = {
  "moveis-planejados": [
    { id: 1, nome: "Cozinha Compacta Faina", valor: 12680, montagem: 430, dias: 18, l: 160, p: 60, a: 75,
      desc: "Módulos superiores e inferiores, bancada em L.", img: IMG.planejados, tipo: "ambiente", ambientes: ["cozinha"],
      estilo: ["moderno", "contemporaneo"], faixa: "intermediario" },
    { id: 2, nome: "Cozinha Planejada Ravel", valor: 16340, montagem: 520, dias: 21, l: 180, p: 65, a: 74,
      desc: "Armários até o teto, ilha central, iluminação embutida.", img: IMG.cozinha, tipo: "ambiente", ambientes: ["cozinha"],
      estilo: ["moderno", "contemporaneo"], faixa: "premium" },
    { id: 4, nome: "Closet Modular Vertice", valor: 8420, montagem: 380, dias: 16, l: 140, p: 60, a: 240,
      desc: "Sistema modular do piso ao teto.", img: IMG.decoracao, tipo: "movel", ambientes: ["quarto"],
      estilo: ["moderno", "contemporaneo"], faixa: "premium" },
    { id: 5, nome: "Escrivaninha Home Office Aro", valor: 2840, montagem: 220, dias: 10, l: 120, p: 55, a: 75,
      desc: "Bancada suspensa com passa-fios, para home office.", img: IMG.escritorio, tipo: "movel", ambientes: ["quarto", "sala", "escritorio"],
      estilo: ["moderno", "industrial", "escandinavo"], faixa: "economico" },
    { id: 6, nome: "Mesa de Jantar Planejada Cedro", valor: 4980, montagem: 260, dias: 12, l: 180, p: 90, a: 76,
      desc: "Tampo em madeira maciça sob medida, 6 a 8 lugares.", img: IMG.decoracao, tipo: "movel", ambientes: ["cozinha", "sala"],
      estilo: ["classico", "boho", "escandinavo"], faixa: "intermediario" },
    { id: 7, nome: "Rack de TV Planejado Horizonte", valor: 3260, montagem: 210, dias: 9, l: 220, p: 40, a: 45,
      desc: "Painel suspenso com nicho para TV e som.", img: IMG.planejados, tipo: "movel", ambientes: ["sala", "quarto"],
      estilo: ["moderno", "contemporaneo"], faixa: "intermediario" },
    { id: 8, nome: "Estante Modular Aberta Trama", valor: 3890, montagem: 240, dias: 11, l: 200, p: 35, a: 220,
      desc: "Do piso ao teto, nichos configuráveis, sem portas.", img: IMG.decoracao, tipo: "movel", ambientes: ["sala", "quarto"],
      estilo: ["boho", "escandinavo", "industrial"], faixa: "intermediario" },
    { id: 9, nome: "Painel Ripado para TV", valor: 2450, montagem: 190, dias: 9, l: 240, p: 20, a: 200,
      desc: "Ripas em madeira com iluminação embutida atrás da TV.", img: IMG.planejados, tipo: "movel", ambientes: ["sala", "quarto"],
      estilo: ["escandinavo", "contemporaneo", "boho"], faixa: "economico" },
    { id: 200, nome: "Armário Planejado para Lavanderia", valor: 3180, montagem: 260, dias: 12, l: 180, p: 45, a: 210,
      desc: "Módulos para produtos de limpeza, cesto aramado e bancada para tanque.", img: IMG.planejados, tipo: "movel", ambientes: ["lavanderia"],
      estilo: ["moderno", "contemporaneo"], faixa: "intermediario" },
    { id: 201, nome: "Guarda-roupa Infantil Planejado", valor: 3640, montagem: 280, dias: 14, l: 150, p: 55, a: 220,
      desc: "Portas coloridas, cabideiro em altura acessível para a criança.", img: IMG.planejados, tipo: "movel", ambientes: ["quarto-bebe", "quarto-crianca"],
      estilo: ["moderno", "escandinavo"], faixa: "intermediario" },
    { id: 202, nome: "Cômoda Planejada com Trocador", valor: 2380, montagem: 210, dias: 11, l: 100, p: 50, a: 95,
      desc: "Tampo acolchoado para troca de fraldas, gavetas com fecho suave.", img: IMG.planejados, tipo: "movel", ambientes: ["quarto-bebe"],
      estilo: ["escandinavo", "moderno"], faixa: "economico" },
    { id: 203, nome: "Bancada Planejada para Área Gourmet", valor: 5980, montagem: 420, dias: 18, l: 240, p: 65, a: 95,
      desc: "Bancada em granito com nicho para churrasqueira e armários em madeira tratada para área externa.", img: IMG.planejados, tipo: "ambiente", ambientes: ["gourmet"],
      estilo: ["classico", "industrial"], faixa: "intermediario" },
    { id: 204, nome: "Armário Planejado para Garagem", valor: 3420, montagem: 260, dias: 13, l: 200, p: 45, a: 200,
      desc: "Módulos altos em MDF hidrofugado para ferramentas e itens diversos.", img: IMG.planejados, tipo: "movel", ambientes: ["garagem"],
      faixa: "intermediario" },
    { id: 205, nome: "Estante Planejada para Escritório", valor: 3980, montagem: 300, dias: 14, l: 220, p: 35, a: 230,
      desc: "Nichos para livros, arquivos e equipamentos, do piso ao teto.", img: IMG.planejados, tipo: "movel", ambientes: ["escritorio"],
      estilo: ["industrial", "contemporaneo", "moderno"], faixa: "intermediario" },
  ],
  "cozinha": [
    { id: 20, nome: "Panelas Tramontina Set 5pç", valor: 890, desc: "Antiaderente, indução.", img: IMG.cozinha, ambientes: ["cozinha"], faixa: "intermediario" },
    { id: 21, nome: "Coifa de Parede 90cm", valor: 1240, desc: "Inox, 2 motores.", img: IMG.cozinha, ambientes: ["cozinha"], faixa: "intermediario" },
  ],
  "banheiro": [
    { id: 30, nome: "Gabinete Suspenso 80cm", valor: 1450, desc: "MDF laqueado, cuba esculpida.", cor: "#B7C4D6", ambientes: ["banheiro"],
      estilo: ["moderno", "contemporaneo"], faixa: "intermediario" },
    { id: 31, nome: "Chuveiro Eletrônico", valor: 380, desc: "4 temperaturas, 7500W.", cor: "#B7C4D6", ambientes: ["banheiro"], faixa: "economico" },
  ],
  "hidraulica": [
    { id: 120, nome: "Vaso Sanitário com Caixa Acoplada", valor: 890, desc: "Louça branca, sistema dual flush.", cor: "#AEC6CF", ambientes: ["banheiro"],
      estilo: ["moderno", "contemporaneo", "escandinavo"], faixa: "intermediario" },
    { id: 121, nome: "Box de Vidro Temperado (Blindex)", valor: 1290, unidade: "un", desc: "Incolor, 8mm, instalação sob medida.", cor: "#AEC6CF", ambientes: ["banheiro"],
      estilo: ["moderno", "contemporaneo"], faixa: "intermediario" },
    { id: 122, nome: "Torneira de Mesa para Banheiro", valor: 340, desc: "Monocomando, acabamento cromado.", cor: "#AEC6CF", ambientes: ["banheiro"],
      estilo: ["moderno", "contemporaneo", "industrial"], faixa: "economico" },
    { id: 123, nome: "Torneira de Cozinha com Bica Móvel", valor: 420, desc: "Monocomando, alta pressão.", cor: "#AEC6CF", ambientes: ["cozinha"],
      estilo: ["moderno", "contemporaneo", "industrial"], faixa: "economico" },
    { id: 124, nome: "Registro de Gaveta 3/4", valor: 95, desc: "Metal cromado, para chuveiro ou torneira.", cor: "#AEC6CF", ambientes: ["banheiro", "cozinha", "lavanderia", "gourmet"], faixa: "economico" },
    { id: 125, nome: "Pia de Cozinha em Inox", valor: 680, desc: "Cuba dupla, com válvulas.", cor: "#AEC6CF", ambientes: ["cozinha"], faixa: "intermediario" },
    { id: 210, nome: "Tanque de Lavar Roupa em Granito", valor: 420, desc: "Com coluna, torneira e válvula inclusas.", cor: "#AEC6CF", ambientes: ["lavanderia"], faixa: "intermediario" },
    { id: 211, nome: "Ponto Hidráulico para Máquina de Lavar", valor: 340, desc: "Instalação de entrada e saída de água, com registro dedicado.", cor: "#AEC6CF", ambientes: ["lavanderia"], faixa: "economico" },
    { id: 212, nome: "Torneira para Área Gourmet e Externa", valor: 260, desc: "Acabamento em latão, uso externo.", cor: "#AEC6CF", ambientes: ["gourmet", "varanda", "jardim"],
      estilo: ["classico", "industrial"], faixa: "economico" },
    { id: 213, nome: "Pia Externa em Inox para Área Gourmet", valor: 890, desc: "Cuba única funda, resistente à intempérie.", cor: "#AEC6CF", ambientes: ["gourmet"], faixa: "intermediario" },
    { id: 214, nome: "Bomba de Piscina 1/2 CV", valor: 1180, desc: "Motor monofásico, recirculação e filtragem.", cor: "#AEC6CF", ambientes: ["piscina"], faixa: "intermediario" },
    { id: 215, nome: "Filtro de Piscina com Areia", valor: 1420, desc: "Vaso filtrante até 40m³, com válvula seletora.", cor: "#AEC6CF", ambientes: ["piscina"], faixa: "intermediario" },
    { id: 216, nome: "Aquecedor de Piscina Elétrico", valor: 3890, desc: "Trocador de calor, mantém temperatura constante.", cor: "#AEC6CF", ambientes: ["piscina"], faixa: "premium" },
    { id: 217, nome: "Torneira Externa para Jardim", valor: 165, desc: "Com engate rápido para mangueira.", cor: "#AEC6CF", ambientes: ["jardim", "garagem", "varanda"], faixa: "economico" },
  ],
  "eletrica": [
    { id: 130, nome: "Quadro de Disjuntores 12 Circuitos", valor: 420, desc: "Com disjuntor DR, padrão NBR.", cor: "#E0C68E", ambientes: TODOS_AMBIENTES, faixa: "intermediario" },
    { id: 131, nome: "Kit Tomadas e Interruptores", valor: 189, unidade: "kit 5un", desc: "Linha branca, instalação embutida.", cor: "#E0C68E", ambientes: TODOS_AMBIENTES, faixa: "economico" },
    { id: 132, nome: "Fiação Elétrica 2,5mm", valor: 6, unidade: "m", desc: "Cabo flexível, antichama.", cor: "#E0C68E", ambientes: TODOS_AMBIENTES, faixa: "economico" },
    { id: 133, nome: "Ponto de Tomada Extra", valor: 145, unidade: "un", desc: "Inclui fiação e acabamento.", cor: "#E0C68E", ambientes: TODOS_AMBIENTES, faixa: "economico" },
    { id: 220, nome: "Ponto de Recarga para Carro Elétrico", valor: 2680, desc: "Instalação de tomada dedicada 220V com disjuntor próprio.", cor: "#E0C68E", ambientes: ["garagem"], faixa: "premium" },
    { id: 221, nome: "Refletor de LED Externo", valor: 210, desc: "IP65, resistente a chuva, 30W.", cor: "#E0C68E", ambientes: ["varanda", "jardim", "garagem", "piscina", "gourmet"], faixa: "economico" },
    { id: 222, nome: "Iluminação Subaquática de Piscina (LED RGB)", valor: 980, unidade: "un", desc: "Com controle remoto de cores.", cor: "#E0C68E", ambientes: ["piscina"], faixa: "intermediario" },
    { id: 223, nome: "Portão Eletrônico Basculante", valor: 2140, desc: "Kit motor, controle remoto e instalação.", cor: "#E0C68E", ambientes: ["garagem"], faixa: "intermediario" },
  ],
  "mao-de-obra": [
    { id: 140, nome: "Mão de Obra — Instalação de Piso", valor: 38, unidade: "m²", desc: "Assentamento e rejunte, por executor certificado.", cor: "#CBCBCB", ambientes: TODOS_AMBIENTES, categoriaReforma: "piso" },
    { id: 141, nome: "Mão de Obra — Serviço Hidráulico", valor: 620, desc: "Instalação e adequação de pontos hidráulicos do ambiente.", cor: "#CBCBCB", ambientes: TODOS_AMBIENTES, categoriaReforma: "hidraulica" },
    { id: 142, nome: "Mão de Obra — Serviço Elétrico", valor: 540, desc: "Instalação e adequação de pontos elétricos do ambiente.", cor: "#CBCBCB", ambientes: TODOS_AMBIENTES, categoriaReforma: "eletrica" },
    { id: 143, nome: "Mão de Obra — Pintura", valor: 22, unidade: "m²", desc: "Preparo de parede e duas demãos de tinta.", cor: "#CBCBCB", ambientes: TODOS_AMBIENTES, categoriaReforma: "pintura" },
  ],
  "decoracao": [
    { id: 40, nome: "Tapete Trama Natural 2×3m", valor: 890, desc: "Fibra natural, pronto-entrega.", img: IMG.decoracao, ambientes: ["sala", "quarto"],
      estilo: ["boho", "escandinavo"], faixa: "intermediario" },
    { id: 41, nome: "Luminária de Piso Arco", valor: 640, desc: "Estrutura em metal, cúpula em linho.", img: IMG.decoracao, ambientes: ["sala", "quarto"],
      estilo: ["moderno", "contemporaneo"], faixa: "intermediario" },
    { id: 42, nome: "Quadro Decorativo Trio", valor: 320, desc: "Impressão em tela, moldura em madeira.", img: IMG.decoracao, ambientes: ["sala", "quarto", "cozinha"],
      estilo: ["moderno", "contemporaneo", "escandinavo"], faixa: "economico" },
    { id: 230, nome: "Almofadas Impermeáveis para Área Externa", valor: 129, unidade: "kit 4un", desc: "Tecido resistente à água e ao sol.", img: IMG.decoracao, ambientes: ["varanda", "jardim", "gourmet", "piscina"],
      estilo: ["boho", "contemporaneo"], faixa: "economico" },
    { id: 231, nome: "Toldo Retrátil para Varanda", valor: 1890, desc: "Estrutura em alumínio, lona impermeável, acionamento manual.", img: IMG.decoracao, ambientes: ["varanda"],
      estilo: ["moderno", "contemporaneo"], faixa: "intermediario" },
    { id: 232, nome: "Papel de Parede Infantil", valor: 210, unidade: "rolo", desc: "Estampas lúdicas, atóxico, lavável.", img: IMG.decoracao, ambientes: ["quarto-bebe", "quarto-crianca"],
      estilo: ["escandinavo", "boho"], faixa: "economico" },
    { id: 233, nome: "Espelho de Corpo Inteiro com Moldura", valor: 380, desc: "Vidro temperado, moldura em madeira.", img: IMG.decoracao, ambientes: ["quarto", "escritorio"],
      estilo: ["classico", "contemporaneo"], faixa: "intermediario" },
    { id: 234, nome: "Quadro Motivacional para Escritório", valor: 180, desc: "Impressão em tela, para ambientes de trabalho.", img: IMG.decoracao, ambientes: ["escritorio"],
      estilo: ["moderno", "industrial"], faixa: "economico" },
    { id: 235, nome: "Cortina Blackout", valor: 340, unidade: "par", desc: "Bloqueio de luz, ideal para sono do bebê ou da criança.", img: IMG.decoracao, ambientes: ["quarto", "quarto-bebe", "quarto-crianca"],
      faixa: "economico" },
  ],
  "pisos": [
    { id: 50, nome: "Porcelanato Concreto 60×60", valor: 79, unidade: "m²", desc: "Acabamento acetinado.", cor: "#C9BBA8", ambientes: ["cozinha", "banheiro", "sala", "quarto", "varanda", "garagem", "escritorio", "quarto-bebe", "quarto-crianca", "gourmet", "lavanderia"],
      estilo: ["moderno", "industrial", "contemporaneo"], faixa: "intermediario" },
    { id: 51, nome: "Piso Vinílico Amadeirado", valor: 65, unidade: "m²", desc: "Instalação em régua click.", cor: "#C9BBA8", ambientes: ["sala", "quarto", "escritorio", "quarto-bebe", "quarto-crianca"],
      estilo: ["escandinavo", "boho", "classico"], faixa: "economico" },
    { id: 52, nome: "Porcelanato Polido Branco 80×80", valor: 94, unidade: "m²", desc: "Alto brilho, para ambientes secos.", cor: "#C9BBA8", ambientes: ["sala", "quarto"],
      estilo: ["moderno", "contemporaneo", "classico"], faixa: "premium" },
    { id: 53, nome: "Piso Antiderrapante para Área Molhada", valor: 71, unidade: "m²", desc: "Acabamento fosco, ideal para banheiro e cozinha.", cor: "#C9BBA8", ambientes: ["cozinha", "banheiro", "lavanderia", "piscina", "gourmet"],
      faixa: "intermediario" },
    { id: 240, nome: "Deck de Madeira Plástica para Piscina", valor: 189, unidade: "m²", desc: "Resistente à umidade e ao sol, antiderrapante.", cor: "#C9BBA8", ambientes: ["piscina", "varanda"],
      estilo: ["contemporaneo", "boho"], faixa: "premium" },
    { id: 241, nome: "Piso Epóxi para Garagem", valor: 68, unidade: "m²", desc: "Alta resistência a tráfego de veículos e óleo.", cor: "#C9BBA8", ambientes: ["garagem"], faixa: "intermediario" },
    { id: 242, nome: "Grama Sintética", valor: 59, unidade: "m²", desc: "Fibra UV resistente, drenagem integrada.", cor: "#C9BBA8", ambientes: ["jardim", "varanda"], faixa: "economico" },
  ],
  "organizacao": [
    { id: 60, nome: "Closet Aéreo 3 Portas", valor: 1290, desc: "Correr, espelho central.", cor: "#B9C9B4", ambientes: ["quarto"],
      estilo: ["moderno", "contemporaneo"], faixa: "intermediario" },
    { id: 61, nome: "Kit Organizadores Gaveta", valor: 149, desc: "Acrílico, 6 peças.", cor: "#B9C9B4", ambientes: ["cozinha", "banheiro", "quarto", "lavanderia", "garagem", "escritorio", "quarto-bebe", "quarto-crianca"], faixa: "economico" },
    { id: 250, nome: "Prateleira Suspensa para Garagem", valor: 320, unidade: "un", desc: "Aço reforçado, até 80kg por prateleira.", cor: "#B9C9B4", ambientes: ["garagem"], faixa: "economico" },
    { id: 251, nome: "Varal de Teto Retrátil", valor: 280, desc: "Sistema com roldanas, recolhe até o teto.", cor: "#B9C9B4", ambientes: ["lavanderia", "varanda"], faixa: "intermediario" },
    { id: 252, nome: "Cesto Organizador de Brinquedos", valor: 139, desc: "Fibra natural, com alças reforçadas.", cor: "#B9C9B4", ambientes: ["quarto-crianca"],
      estilo: ["boho", "escandinavo"], faixa: "economico" },
  ],
  "iluminacao": [
    { id: 70, nome: "Pendente Industrial Trio", valor: 480, desc: "Suspensão ajustável.", cor: "#E3CA9A", ambientes: ["cozinha", "sala", "gourmet"],
      estilo: ["industrial", "contemporaneo"], faixa: "intermediario" },
    { id: 71, nome: "Fita LED 5m RGB", valor: 129, desc: "Controle por app.", cor: "#E3CA9A", ambientes: TODOS_AMBIENTES, faixa: "economico" },
    { id: 260, nome: "Luminária de Mesa para Escritório", valor: 210, desc: "Braço articulado, luz regulável.", cor: "#E3CA9A", ambientes: ["escritorio"],
      estilo: ["moderno", "industrial"], faixa: "economico" },
    { id: 261, nome: "Abajur com Regulagem de Intensidade", valor: 165, desc: "Luz indireta e suave, ideal pra sono do bebê ou da criança.", cor: "#E3CA9A", ambientes: ["quarto-bebe", "quarto-crianca"],
      estilo: ["escandinavo", "boho"], faixa: "economico" },
    { id: 262, nome: "Spot Solar para Jardim", valor: 89, unidade: "un", desc: "Carregamento solar automático, sem fiação.", cor: "#E3CA9A", ambientes: ["jardim", "varanda"], faixa: "economico" },
  ],
  "moveis-prontos": [
    { id: 80, nome: "Sofá Retrátil 3 Lugares", valor: 3290, desc: "Suede, base reclinável.", img: IMG.prontos, ambientes: ["sala"],
      estilo: ["moderno", "contemporaneo"], faixa: "intermediario" },
    { id: 81, nome: "Mesa de Jantar 6 Lugares", valor: 2140, desc: "Madeira maciça, tampo vidro.", img: IMG.prontos, ambientes: ["cozinha", "sala"],
      estilo: ["classico", "contemporaneo"], faixa: "intermediario" },
    { id: 270, nome: "Conjunto de Cadeiras para Varanda", valor: 980, unidade: "par", desc: "Fibra sintética, trama impermeável.", img: IMG.prontos, ambientes: ["varanda"],
      estilo: ["boho", "contemporaneo"], faixa: "economico" },
    { id: 271, nome: "Cadeira Ergonômica de Escritório", valor: 1290, desc: "Apoio lombar, regulagem de altura e braços.", img: IMG.prontos, ambientes: ["escritorio"],
      estilo: ["moderno", "industrial"], faixa: "intermediario" },
    { id: 272, nome: "Estante para Livros e Documentos", valor: 890, desc: "5 prateleiras, madeira maciça.", img: IMG.prontos, ambientes: ["escritorio"],
      estilo: ["classico", "industrial"], faixa: "intermediario" },
    { id: 273, nome: "Berço Multifuncional", valor: 1480, desc: "Converte em mini-cama, 3 alturas de estrado.", img: IMG.prontos, ambientes: ["quarto-bebe"],
      estilo: ["escandinavo", "moderno"], faixa: "intermediario" },
    { id: 274, nome: "Poltrona de Amamentação", valor: 1190, desc: "Balanço suave, apoio para os braços.", img: IMG.prontos, ambientes: ["quarto-bebe"],
      estilo: ["escandinavo", "boho"], faixa: "intermediario" },
    { id: 275, nome: "Cama Infantil Bicama", valor: 1680, desc: "Duas camas de solteiro, uma sob a outra.", img: IMG.prontos, ambientes: ["quarto-crianca"],
      estilo: ["moderno", "escandinavo"], faixa: "intermediario" },
    { id: 276, nome: "Escrivaninha Infantil com Cadeira", valor: 720, desc: "Altura regulável, acompanha o crescimento.", img: IMG.prontos, ambientes: ["quarto-crianca"],
      estilo: ["moderno", "escandinavo"], faixa: "economico" },
    { id: 277, nome: "Espreguiçadeira para Piscina (par)", valor: 890, desc: "Estrutura em alumínio, encosto reclinável.", img: IMG.prontos, ambientes: ["piscina"],
      estilo: ["contemporaneo", "boho"], faixa: "intermediario" },
  ],
  "jardim": [
    { id: 90, nome: "Conjunto Mesa e Cadeiras Externas", valor: 1690, desc: "Alumínio, resistente à chuva.", img: IMG.jardim, ambientes: ["jardim", "varanda", "gourmet"],
      estilo: ["contemporaneo", "industrial"], faixa: "intermediario" },
    { id: 91, nome: "Vaso Autoirrigável Grande", valor: 189, desc: "Reservatório de 5 dias.", img: IMG.jardim, ambientes: ["jardim", "varanda"],
      estilo: ["boho", "escandinavo"], faixa: "economico" },
    { id: 280, nome: "Sistema de Irrigação Automática", valor: 1290, desc: "Temporizador programável, aspersores inclusos.", img: IMG.jardim, ambientes: ["jardim"], faixa: "intermediario" },
    { id: 281, nome: "Kit Paisagismo com Plantio", valor: 980, unidade: "m²", desc: "Projeto e plantio de espécies nativas de baixa manutenção.", img: IMG.jardim, ambientes: ["jardim"], faixa: "intermediario" },
    { id: 282, nome: "Rede de Proteção para Varanda", valor: 45, unidade: "m²", desc: "Fio de poliamida, homologada para segurança infantil e de pets.", img: IMG.jardim, ambientes: ["varanda"], faixa: "economico" },
  ],
  "ferramentas": [
    { id: 100, nome: "Furadeira de Impacto 750W", valor: 349, desc: "Kit com 20 acessórios.", img: IMG.ferramentas, faixa: "intermediario" },
  ],
  "materiais": [
    { id: 110, nome: "Cimento CP-II 50kg", valor: 42, desc: "Saco, uso geral.", cor: "#C7C2BC", ambientes: TODOS_AMBIENTES, categoriaReforma: "piso", faixa: "economico" },
    { id: 111, nome: "Argamassa AC-II 20kg", valor: 36, desc: "Assentamento de porcelanato e revestimentos.", cor: "#C7C2BC", ambientes: TODOS_AMBIENTES, categoriaReforma: "piso", faixa: "economico" },
    { id: 112, nome: "Tinta Acrílica Premium 18L", valor: 389, desc: "Fosca, lavável, cobertura de até 300m².", cor: "#C7C2BC", ambientes: TODOS_AMBIENTES, categoriaReforma: "pintura", faixa: "intermediario" },
    { id: 113, nome: "Massa Corrida para Parede 25kg", valor: 68, desc: "Preparo de parede antes da pintura.", cor: "#C7C2BC", ambientes: TODOS_AMBIENTES, categoriaReforma: "pintura", faixa: "economico" },
    { id: 114, nome: "Rejunte Flexível 5kg", valor: 39, desc: "Para porcelanato e cerâmica, resistente à umidade.", cor: "#C7C2BC", ambientes: TODOS_AMBIENTES, categoriaReforma: "piso", faixa: "economico" },
    { id: 115, nome: "Tinta Esmalte Sintético para Área Externa 18L", valor: 429, desc: "Resistente a sol e chuva, para portões e estruturas metálicas.", cor: "#C7C2BC", ambientes: ["varanda", "jardim", "garagem", "gourmet", "piscina"], categoriaReforma: "pintura", faixa: "intermediario" },
  ],
  "piscina": [
    { id: 290, nome: "Capa Térmica para Piscina", valor: 1890, unidade: "m²", desc: "Reduz evaporação e mantém a temperatura da água.", cor: "#9FC9D3", ambientes: ["piscina"], faixa: "premium" },
    { id: 291, nome: "Kit Tratamento de Água (Cloro e pH)", valor: 340, desc: "Cloro granulado, redutor e elevador de pH, testador.", cor: "#9FC9D3", ambientes: ["piscina"], faixa: "economico" },
    { id: 292, nome: "Escada de Piscina em Inox", valor: 980, desc: "3 degraus, fixação por parafusamento.", cor: "#9FC9D3", ambientes: ["piscina"], faixa: "intermediario" },
    { id: 293, nome: "Aspirador Automático de Piscina", valor: 2480, desc: "Robô elétrico, limpeza de fundo e paredes.", cor: "#9FC9D3", ambientes: ["piscina"], faixa: "premium" },
  ],
  "area-externa": [
    { id: 300, nome: "Churrasqueira a Carvão em Alvenaria", valor: 3480, desc: "Estrutura em tijolo revestido, grelha em aço inox.", cor: "#D9B48F", ambientes: ["gourmet"],
      estilo: ["classico", "industrial"], faixa: "intermediario" },
    { id: 301, nome: "Forno de Pizza a Lenha", valor: 4290, desc: "Cúpula em argila refratária, base em alvenaria.", cor: "#D9B48F", ambientes: ["gourmet"],
      estilo: ["classico", "boho"], faixa: "premium" },
    { id: 302, nome: "Coifa/Exaustor para Área Gourmet", valor: 1680, desc: "Inox, para churrasqueira ou fogão externo.", cor: "#D9B48F", ambientes: ["gourmet"], faixa: "intermediario" },
    { id: 303, nome: "Adega Climatizada 40 Garrafas", valor: 2190, desc: "Dupla zona de temperatura, porta de vidro.", cor: "#D9B48F", ambientes: ["gourmet"],
      estilo: ["moderno", "contemporaneo"], faixa: "premium" },
    { id: 304, nome: "Cooktop Externo a Gás", valor: 1890, desc: "2 bocas, aço inox, uso em área aberta.", cor: "#D9B48F", ambientes: ["gourmet"], faixa: "intermediario" },
    { id: 305, nome: "Mesa e Bancos para Área Gourmet", valor: 2380, desc: "Madeira de reflorestamento, 6 lugares.", cor: "#D9B48F", ambientes: ["gourmet"],
      estilo: ["boho", "contemporaneo"], faixa: "intermediario" },
  ],
};

// checklist "o que você já tem e não precisa trocar" — genérico por categoria, mostrado no Concierge só
// com as categorias que de fato têm item cadastrado pro(s) ambiente(s) escolhido(s) naquele momento.
export const JA_TENHO_OPCOES = [
  { categoriaId: "moveis-planejados", label: "Móveis planejados" },
  { categoriaId: "moveis-prontos", label: "Móveis prontos" },
  { categoriaId: "pisos", label: "Piso" },
  { categoriaId: "iluminacao", label: "Iluminação" },
  { categoriaId: "decoracao", label: "Decoração" },
  { categoriaId: "organizacao", label: "Organização" },
  { categoriaId: "hidraulica", label: "Louças e metais" },
  { categoriaId: "eletrica", label: "Parte elétrica" },
  { categoriaId: "cozinha", label: "Utensílios de cozinha" },
  { categoriaId: "banheiro", label: "Itens de banheiro" },
  { categoriaId: "piscina", label: "Equipamentos de piscina" },
  { categoriaId: "area-externa", label: "Equipamentos de área gourmet" },
];

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
    resumo: "Próximo ambiente sugerido pela IA. Você pode começar quando quiser.",
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
export const CLIENTES_BASE = 23000;

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

// ===== IA de Design / Render — quarta IA voltada ao cliente =====
export const ESTILOS_DESIGN = [
  { id: "moderno", nome: "Moderno", desc: "Linhas retas, poucos ornamentos, funcional" },
  { id: "boho", nome: "Boho", desc: "Fibras naturais, plantas, camadas e texturas" },
  { id: "classico", nome: "Clássico", desc: "Simetria, madeira nobre, acabamentos refinados" },
  { id: "escandinavo", nome: "Escandinavo", desc: "Claro, madeira clara, minimalista e aconchegante" },
  { id: "industrial", nome: "Industrial", desc: "Concreto, metal aparente, tons crus" },
  { id: "contemporaneo", nome: "Contemporâneo", desc: "Neutro sofisticado, misto de materiais" },
];

export const PALETAS_DESIGN = [
  { id: "neutra", nome: "Neutros quentes", cores: ["#EDE6DC", "#C9B79C", "#8A7B68", "#4A4238"] },
  { id: "fria", nome: "Frios serenos", cores: ["#EAF0F2", "#B7C9D3", "#5E7C8B", "#2E4550"] },
  { id: "terrosa", nome: "Terrosa", cores: ["#F0E4D4", "#D8A47F", "#A85E3C", "#5C3A28"] },
  { id: "verde", nome: "Verde natureza", cores: ["#EDF1E6", "#B8CBA0", "#6E8B5A", "#38492C"] },
  { id: "vibrante", nome: "Vibrante", cores: ["#F5EFe6", "#E8A03C", "#C4472F", "#1F3A4D"] },
];

// imagens ilustrativas de "depois" (render de demonstração), por estilo — Unsplash, uso ilustrativo
const RENDER = {
  moderno: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=75&fm=jpg&fit=crop",
  boho: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=75&fm=jpg&fit=crop",
  classico: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=75&fm=jpg&fit=crop",
  escandinavo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=75&fm=jpg&fit=crop",
  industrial: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=900&q=75&fm=jpg&fit=crop",
  contemporaneo: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=900&q=75&fm=jpg&fit=crop",
};
export function renderPorEstilo(id) { return RENDER[id] || RENDER.moderno; }

// itens que compõem o projeto gerado pela IA — cada item do render vira item do pacote
export const PROJETO_DESIGN_ITENS = [
  { id: "d1", nome: "Sofá 3 lugares em linho", cat: "Móveis prontos", valor: 3290, tipo: "produto" },
  { id: "d2", nome: "Mesa de centro em madeira", cat: "Móveis prontos", valor: 780, tipo: "produto" },
  { id: "d3", nome: "Tapete de fibra natural 2×3m", cat: "Decoração", valor: 890, tipo: "produto" },
  { id: "d4", nome: "Painel ripado para TV (planejado)", cat: "Móveis planejados", valor: 2450, tipo: "produto" },
  { id: "d5", nome: "Luminária de piso", cat: "Iluminação", valor: 640, tipo: "produto" },
  { id: "d6", nome: "Cortina de linho + trilho", cat: "Decoração", valor: 1120, tipo: "produto" },
  { id: "d7", nome: "Kit quadros e objetos decorativos", cat: "Decoração", valor: 560, tipo: "produto" },
  { id: "d8", nome: "Tinta e pintura das paredes", cat: "Materiais", valor: 890, tipo: "material" },
  { id: "d9", nome: "Montagem e instalação (mão de obra)", cat: "Serviço", valor: 1400, tipo: "servico" },
  { id: "d10", nome: "Projeto e consultoria de ambientação", cat: "Serviço", valor: 600, tipo: "servico" },
];

// desconto de pacote: fechar tudo junto sai mais barato que item a item
export const DESCONTO_PACOTE = 0.12;
