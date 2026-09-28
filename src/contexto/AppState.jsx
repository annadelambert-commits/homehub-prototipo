import { createContext, useContext, useState } from "react";
import { PROJETOS_REFORMA } from "../dados/homehub";

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  // Medição por IA (visão)
  const [imagem, setImagem] = useState(null);
  const [mime, setMime] = useState(null);
  const [referencia, setReferencia] = useState({ nome: "Porta padrão (altura)", cm: 210 });
  const [analise, setAnalise] = useState(null);
  const [modoDemo, setModoDemo] = useState(false);
  const [erroAnalise, setErroAnalise] = useState(null);
  const [medidaManual, setMedidaManual] = useState(null);
  const [origemMedida, setOrigemMedida] = useState(null); // 'ia' | 'manual' | 'demo'
  const [plantaImagem, setPlantaImagem] = useState(null);
  const [estatura, setEstatura] = useState(170);

  // Medição por ambiente (fluxo Projeto Completo, multi-ambiente)
  const [medidasPorAmbiente, setMedidasPorAmbiente] = useState({}); // { cozinha: {tipo, largura, profundidade, altura, vao, confianca}, ... }
  const [plantaCompleta, setPlantaCompleta] = useState(null); // planta baixa única que cobre todos os ambientes selecionados

  // Concierge (IA texto)
  const [briefing, setBriefing] = useState(null);
  const [erroConcierge, setErroConcierge] = useState(null);
  const [ambientesSelecionados, setAmbientesSelecionados] = useState([]); // array de ids: ['cozinha','banheiro',...]
  const [reformaCompleta, setReformaCompleta] = useState(false);
  const [ambienteFaseInicial, setAmbienteFaseInicial] = useState(null); // qual ambiente começa, quando é faseado
  const [orcamentoFinal, setOrcamentoFinal] = useState(null); // true = valor fechado, false = faseado com desconto por etapa, null = ainda não perguntado
  const [escopoFoco, setEscopoFoco] = useState(null); // 'completo' | 'categoria', ex.: cliente só quer trocar o piso
  const [categoriaFoco, setCategoriaFoco] = useState(null); // id da categoria, ex.: 'pisos', quando escopoFoco === 'categoria'
  const [itensProjeto, setItensProjeto] = useState([]); // itens escolhidos no fluxo Projeto Completo (multi-seleção, com quantidade)

  // IA de Design / Render
  const [designAmbiente, setDesignAmbiente] = useState(null); // id do ambiente escolhido antes do estilo/paleta
  const [designFoto, setDesignFoto] = useState(null);
  const [designEstilo, setDesignEstilo] = useState(null);
  const [designPaleta, setDesignPaleta] = useState(null);
  const [designResultado, setDesignResultado] = useState(null); // { render, resumo, itens }
  const [designErro, setDesignErro] = useState(null);

  // Carrinho e loja
  const [carrinho, setCarrinho] = useState([]);
  const [produtoAtual, setProdutoAtual] = useState(null);

  // Login e checkout
  const [usuario, setUsuario] = useState(null);
  const [endereco, setEndereco] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState(null);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);

  // Reforma em Etapas — plano pós-compra
  const [projetos, setProjetos] = useState(PROJETOS_REFORMA);
  const [projetoAtivoId, setProjetoAtivoId] = useState("cozinha");

  // Suporte especializado (IA texto) — não entra em nenhuma métrica de conversão
  const [suporteAberto, setSuporteAberto] = useState(false);
  const [suporteMsgs, setSuporteMsgs] = useState([]);
  const [suporteErro, setSuporteErro] = useState(null);

  function adicionarAoCarrinho(item) {
    setCarrinho((c) => [...c, { ...item, chaveCarrinho: Date.now() + Math.random() }]);
  }
  function removerDoCarrinho(chave) {
    setCarrinho((c) => c.filter((i) => i.chaveCarrinho !== chave));
  }
  function totalCarrinho() {
    return carrinho.reduce((s, i) => s + (i.valor || 0) + (i.montagem || 0), 0);
  }
  function vaoUtil() {
    if (medidaManual) return typeof medidaManual === "object" ? medidaManual.largura : medidaManual;
    if (analise) return analise.vao;
    return null;
  }
  function toggleItemProjeto(item) {
    setItensProjeto((its) => {
      const existe = its.find((i) => i.id === item.id && i.categoriaId === item.categoriaId);
      if (existe) return its.filter((i) => !(i.id === item.id && i.categoriaId === item.categoriaId));
      return [...its, { ...item, quantidade: 1 }];
    });
  }
  function setQuantidadeItem(id, categoriaId, quantidade) {
    setItensProjeto((its) => its.map((i) =>
      i.id === id && i.categoriaId === categoriaId ? { ...i, quantidade: Math.max(1, quantidade) } : i
    ));
  }
  function totalItensProjeto() {
    return itensProjeto.reduce((s, i) => s + ((i.valor || 0) + (i.montagem || 0)) * (i.quantidade || 1), 0);
  }
  // desconto de pacote fechado: cresce com o número de itens do projeto, cai progressivamente se o cliente tira itens
  function descontoPacote() {
    const n = itensProjeto.length;
    if (n >= 6) return { pct: 12, label: "pacote fechado completo" };
    if (n >= 4) return { pct: 8, label: "pacote fechado parcial" };
    if (n >= 2) return { pct: 4, label: "combo de itens" };
    return { pct: 0, label: null };
  }
  function setMedidaAmbiente(ambienteId, dados) {
    setMedidasPorAmbiente((m) => ({ ...m, [ambienteId]: dados }));
  }
  function concluirProjetoAtivo() {
    setProjetos((ps) => ps.map((p) => {
      if (p.id === projetoAtivoId) return { ...p, status: "concluido" };
      if (p.status === "sugerido") return { ...p, status: "ativo" };
      return p;
    }));
  }
  function limparFluxoProjeto() {
    setImagem(null); setMime(null); setAnalise(null); setModoDemo(false);
    setErroAnalise(null); setMedidaManual(null); setOrigemMedida(null); setPlantaImagem(null);
    setBriefing(null); setErroConcierge(null); setAmbientesSelecionados([]); setReformaCompleta(false);
    setItensProjeto([]); setMedidasPorAmbiente({}); setPlantaCompleta(null); setAmbienteFaseInicial(null);
    setOrcamentoFinal(null); setEscopoFoco(null); setCategoriaFoco(null);
  }

  return (
    <AppCtx.Provider value={{
      imagem, setImagem, mime, setMime, referencia, setReferencia,
      analise, setAnalise, modoDemo, setModoDemo, erroAnalise, setErroAnalise,
      medidaManual, setMedidaManual, origemMedida, setOrigemMedida,
      plantaImagem, setPlantaImagem, estatura, setEstatura, vaoUtil,
      medidasPorAmbiente, setMedidasPorAmbiente, setMedidaAmbiente, plantaCompleta, setPlantaCompleta,
      briefing, setBriefing, erroConcierge, setErroConcierge,
      ambientesSelecionados, setAmbientesSelecionados, reformaCompleta, setReformaCompleta,
      ambienteFaseInicial, setAmbienteFaseInicial,
      orcamentoFinal, setOrcamentoFinal, escopoFoco, setEscopoFoco, categoriaFoco, setCategoriaFoco,
      itensProjeto, setItensProjeto, toggleItemProjeto, setQuantidadeItem, totalItensProjeto, descontoPacote,
      designAmbiente, setDesignAmbiente,
      designFoto, setDesignFoto, designEstilo, setDesignEstilo, designPaleta, setDesignPaleta,
      designResultado, setDesignResultado, designErro, setDesignErro,
      carrinho, setCarrinho, adicionarAoCarrinho, removerDoCarrinho, totalCarrinho,
      produtoAtual, setProdutoAtual,
      usuario, setUsuario, endereco, setEndereco, formaPagamento, setFormaPagamento,
      pedidoConfirmado, setPedidoConfirmado,
      projetos, setProjetos, projetoAtivoId, setProjetoAtivoId, concluirProjetoAtivo,
      limparFluxoProjeto,
      suporteAberto, setSuporteAberto, suporteMsgs, setSuporteMsgs, suporteErro, setSuporteErro,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp precisa estar dentro de <AppProvider>");
  return ctx;
}
