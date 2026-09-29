import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexto/AppState";
import AppFrame from "../../componentes/AppFrame";
import { PRODUTOS, CATEGORIAS, CATEGORIAS_REFORMA, AMBIENTES } from "../../dados/homehub";

function brl0(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }

// faixas de preço aceitáveis pra cada prioridade — custo-benefício puxa pro econômico, estética
// aceita pagar mais por acabamento, rapidez não filtra por faixa (o que importa ali é entrega, não preço)
const FAIXAS_POR_PRIORIDADE = {
  custo: ["economico", "intermediario"],
  estetica: ["intermediario", "premium"],
  rapidez: null, // sem filtro de faixa
};

function itemCombina(p, { estilo, faixasAceitas }) {
  const passaEstilo = !estilo || !Array.isArray(p.estilo) || p.estilo.includes(estilo);
  const passaFaixa = !faixasAceitas || !p.faixa || faixasAceitas.includes(p.faixa);
  return passaEstilo && passaFaixa;
}

// alguns itens com tipo "ambiente" (ex.: "Cozinha Compacta Faina" x "Cozinha Planejada Ravel") são pacotes
// alternativos pro MESMO ambiente — o cliente escolhe um, não os dois. Sem isso, os dois combinam com o
// filtro de estilo/faixa e entram juntos no carrinho, dobrando o projeto sem o cliente ter pedido isso.
// Mantém só o melhor match por ambiente (conforme a prioridade); os demais só voltam a aparecer no "ver
// todas as opções" (que usa a lista sem filtro nenhum).
function dedupPacotesDeAmbiente(itens, ambientesSelecionados, prioridade) {
  const ordemFaixa = prioridade === "estetica" ? ["premium", "intermediario", "economico"]
    : prioridade === "custo" ? ["economico", "intermediario", "premium"]
    : ["intermediario", "premium", "economico"];
  const descartados = new Set();
  for (const amb of ambientesSelecionados) {
    const candidatos = itens.filter((p) => p.tipo === "ambiente" && Array.isArray(p.ambientes) && p.ambientes.includes(amb));
    if (candidatos.length <= 1) continue;
    const ordenados = [...candidatos].sort((a, b) => ordemFaixa.indexOf(a.faixa) - ordemFaixa.indexOf(b.faixa));
    ordenados.slice(1).forEach((c) => descartados.add(c.id));
  }
  return descartados.size === 0 ? itens : itens.filter((p) => !descartados.has(p.id));
}

export default function Escolha() {
  const nav = useNavigate();
  const app = useApp();

  const nomeAmbientes = AMBIENTES.filter((a) => app.ambientesSelecionados.includes(a.id))
    .map((a) => a.nome.toLowerCase()).join(", ") || "seu ambiente";

  const focoCategoria = app.escopoFoco === "categoria" && app.categoriaFoco;
  const categoriaReformaInfo = focoCategoria ? CATEGORIAS_REFORMA.find((c) => c.id === app.categoriaFoco) : null;

  // mesma chave usada no Concierge pra guardar o checklist "já tenho" — combinação dos ambientes desse projeto
  const chaveJaTem = app.ambientesSelecionados.join("+") || "geral";
  const categoriasJaTem = app.itensJaTem[chaveJaTem] || [];
  const faixasAceitas = FAIXAS_POR_PRIORIDADE[app.projetoPrioridade] ?? null;

  // categorias cujo filtro de estilo/faixa foi manualmente ignorado pelo cliente (botão "ver todas as opções")
  const [categoriasExpandidas, setCategoriasExpandidas] = useState([]);
  function expandirCategoria(categoriaId) {
    setCategoriasExpandidas((c) => c.includes(categoriaId) ? c : [...c, categoriaId]);
  }

  // agrupa por categoria os itens relevantes para os ambientes escolhidos. No modo "reforma por categoria"
  // (ex.: só o piso), já reúne material + mão de obra daquela frente; no modo geral, tudo que é cabível
  // pros ambientes escolhidos entra automaticamente (o cliente edita/remove depois). Categorias marcadas
  // como "já tenho" no Concierge não entram. Dentro de cada categoria, aplica o filtro de estilo/faixa de
  // preço (conforme prioridade) — se isso zerar os itens, marca semCombinacao pra mostrar o aviso na tela,
  // e mostra a lista completa (não filtrada) só se o cliente pedir "ver todas as opções".
  const grupos = useMemo(() => {
    const out = [];
    const criterios = { estilo: app.projetoEstilo, faixasAceitas };

    function montarGrupo(categoriaId, itensBase) {
      if (categoriasJaTem.includes(categoriaId)) return;
      if (itensBase.length === 0) return;
      let itensFiltrados = itensBase.filter((p) => itemCombina(p, criterios));
      const semCombinacao = itensFiltrados.length === 0;
      const expandido = categoriasExpandidas.includes(categoriaId);
      if (!expandido) itensFiltrados = dedupPacotesDeAmbiente(itensFiltrados, app.ambientesSelecionados, app.projetoPrioridade);
      // sem combinação: só mostra a lista completa depois que o cliente clica "ver todas as opções"
      const itens = expandido ? itensBase : itensFiltrados;
      const cat = CATEGORIAS.find((c) => c.id === categoriaId);
      out.push({ categoriaId, categoriaNome: cat ? cat.nome : categoriaId, itens, semCombinacao: semCombinacao && !expandido, expandido });
    }

    if (categoriaReformaInfo) {
      const categoriasAlvo = [...categoriaReformaInfo.categorias, "mao-de-obra"];
      for (const categoriaId of categoriasAlvo) {
        if (!PRODUTOS[categoriaId]) continue;
        const itensBase = PRODUTOS[categoriaId].filter((p) =>
          Array.isArray(p.ambientes) && p.ambientes.some((a) => app.ambientesSelecionados.includes(a)) &&
          (p.categoriaReforma === undefined || p.categoriaReforma === categoriaReformaInfo.id)
        );
        montarGrupo(categoriaId, itensBase);
      }
    } else {
      for (const categoriaId of Object.keys(PRODUTOS)) {
        if (categoriaId === "mao-de-obra") continue; // mão de obra por sistema só entra no modo "categoria específica"
        const itensBase = PRODUTOS[categoriaId].filter((p) =>
          Array.isArray(p.ambientes) && p.ambientes.some((a) => app.ambientesSelecionados.includes(a))
        );
        montarGrupo(categoriaId, itensBase);
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.ambientesSelecionados, categoriaReformaInfo, app.projetoEstilo, faixasAceitas, categoriasJaTem, categoriasExpandidas]);

  // o projeto já vem com tudo que é cabível (já filtrado por estilo/faixa) pré-selecionado no carrinho; o
  // cliente edita/remove a partir daí. Só preenche automaticamente quando o carrinho do projeto está vazio,
  // pra não sobrescrever remoções manuais nem reagir de novo quando o cliente clica "ver todas as opções".
  useEffect(() => {
    if (app.itensProjeto.length === 0 && grupos.length > 0) {
      grupos.forEach((g) => g.itens.forEach((p) => app.toggleItemProjeto({ ...p, categoriaId: g.categoriaId })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.ambientesSelecionados, categoriaReformaInfo]);

  function estaSelecionado(p, categoriaId) {
    return app.itensProjeto.some((i) => i.id === p.id && i.categoriaId === categoriaId);
  }

  function quantidadeDe(p, categoriaId) {
    const it = app.itensProjeto.find((i) => i.id === p.id && i.categoriaId === categoriaId);
    return it ? it.quantidade || 1 : 1;
  }

  function toggle(p, categoriaId) {
    app.toggleItemProjeto({ ...p, categoriaId });
  }

  function mudarQtd(p, categoriaId, delta, e) {
    e.stopPropagation();
    app.setQuantidadeItem(p.id, categoriaId, quantidadeDe(p, categoriaId) + delta);
  }

  return (
    <AppFrame titulo="Projeto Completo" comNavInferior={false}>
      <div className="passoIndicador"><i className="feito" /><i className="feito" /><i className="ativo" /><i /><i /></div>
      <h2 className="tituloTela">{categoriaReformaInfo ? `${categoriaReformaInfo.nome} para ${nomeAmbientes}` : `Seu projeto de ${nomeAmbientes}`}</h2>
      <p className="subtituloTela">
        {categoriaReformaInfo
          ? "Já reunimos o material e a mão de obra dessa frente. Você pode remover ou ajustar qualquer item."
          : "Já reunimos tudo que é necessário pra esse projeto. Remova ou ajuste a quantidade do que não quiser."}
      </p>

      {grupos.map((g) => (
        <div key={g.categoriaId}>
          <h3 className="secaoTitulo">{g.categoriaNome}</h3>
          {g.semCombinacao && (
            <div className="cartao alerta" style={{ marginBottom: 8 }}>
              <p>Nenhum item de {g.categoriaNome.toLowerCase()} combina exatamente com o estilo/prioridade escolhidos. Veja as outras opções disponíveis:</p>
              <button className="btSecundario" onClick={() => expandirCategoria(g.categoriaId)}>Ver todas as opções</button>
            </div>
          )}
          {g.itens.map((p) => {
            const sel = estaSelecionado(p, g.categoriaId);
            const qtd = quantidadeDe(p, g.categoriaId);
            return (
              <button key={p.id} className={"produtoCard largo" + (sel ? " sel" : "")} onClick={() => toggle(p, g.categoriaId)}>
                {p.img ? (
                  <div className="produtoImg foto" style={{ backgroundImage: `url(${p.img})` }} />
                ) : (
                  <div className="produtoImg" style={{ background: p.cor }} />
                )}
                <div className="produtoInfo">
                  <b>{p.nome}</b>
                  <span className="produtoDesc">{p.desc}</span>
                  <span className="produtoPreco">{brl0(p.valor)}{p.unidade ? "/" + p.unidade : ""}</span>
                  {sel ? (
                    <div className="seletorQtd" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => mudarQtd(p, g.categoriaId, -1, e)} disabled={qtd <= 1}>−</button>
                      <span>{qtd}{p.unidade ? " " + p.unidade : "×"}</span>
                      <button onClick={(e) => mudarQtd(p, g.categoriaId, 1, e)}>+</button>
                      <button type="button" className="tagCabe sim btRemoverInline" style={{ marginLeft: "auto" }}
                        onClick={(e) => { e.stopPropagation(); toggle(p, g.categoriaId); }}>
                        ✕ remover
                      </button>
                    </div>
                  ) : (
                    <span className="tagCabe mov">toque para adicionar</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ))}

      {grupos.length === 0 && <p className="vazioTxt">Nenhum item cadastrado para esse ambiente ainda.</p>}

      {app.itensProjeto.length > 0 && (() => {
        const desconto = app.descontoPacote();
        return (
          <div className="cartaoResumo" style={{ position: "sticky", bottom: 84 }}>
            <div className="linhaResumo total"><span>{app.itensProjeto.length} {app.itensProjeto.length === 1 ? "item selecionado" : "itens selecionados"}</span><b>{brl0(app.totalItensProjeto())}</b></div>
            {desconto.pct > 0 && (
              <div className="linhaResumo"><span>{desconto.label}</span><b style={{ color: "var(--ok)" }}>−{desconto.pct}% no fechamento</b></div>
            )}
          </div>
        );
      })()}

      <div className="ctaFixo">
        <button className="btPrimario" disabled={app.itensProjeto.length === 0} onClick={() => nav("/projeto-completo/resumo")}>
          Continuar
        </button>
      </div>
    </AppFrame>
  );
}
