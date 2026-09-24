import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { PRODUTOS } from "../dados/homehub";
import { useApp } from "../contexto/AppState";
import AppFrame from "../componentes/AppFrame";

function brl(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }

export default function ProdutoDetalhe() {
  const { categoriaId, produtoId } = useParams();
  const nav = useNavigate();
  const app = useApp();
  const [adicionado, setAdicionado] = useState(false);
  const produto = (PRODUTOS[categoriaId] || []).find((p) => String(p.id) === produtoId);

  if (!produto) return <AppFrame titulo="Produto"><p className="vazioTxt">Produto não encontrado.</p></AppFrame>;

  function adicionar() {
    app.adicionarAoCarrinho({ nome: produto.nome, valor: produto.valor, montagem: produto.montagem || 0, categoriaId });
    setAdicionado(true);
  }

  return (
    <AppFrame titulo={produto.nome}>
      <div className="produtoHeroFoto" style={produto.img ? { backgroundImage: `url(${produto.img})` } : { background: produto.cor }} />
      <div className="produtoDetalheInfo">
        <h2>{produto.nome}</h2>
        <p className="produtoDetalheDesc">{produto.desc}</p>
        <div className="produtoDetalhePreco">{brl(produto.valor)}{produto.unidade ? "/" + produto.unidade : ""}</div>
        {produto.dias && <p className="produtoPrazo">Prazo estimado: {produto.dias} dias</p>}
      </div>
      <div className="ctaFixo">
        {adicionado ? (
          <button className="btPrimario" onClick={() => nav("/carrinho")}>Ver carrinho</button>
        ) : (
          <button className="btPrimario" onClick={adicionar}>Adicionar ao carrinho</button>
        )}
      </div>
    </AppFrame>
  );
}
