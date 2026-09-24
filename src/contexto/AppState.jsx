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

  // Concierge (IA texto)
  const [briefing, setBriefing] = useState(null);
  const [erroConcierge, setErroConcierge] = useState(null);

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
    if (medidaManual) return medidaManual;
    if (analise) return analise.vao;
    return null;
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
    setBriefing(null); setErroConcierge(null);
  }

  return (
    <AppCtx.Provider value={{
      imagem, setImagem, mime, setMime, referencia, setReferencia,
      analise, setAnalise, modoDemo, setModoDemo, erroAnalise, setErroAnalise,
      medidaManual, setMedidaManual, origemMedida, setOrigemMedida,
      plantaImagem, setPlantaImagem, estatura, setEstatura, vaoUtil,
      briefing, setBriefing, erroConcierge, setErroConcierge,
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
