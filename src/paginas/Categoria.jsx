import { useParams, useNavigate } from "react-router-dom";
import { CATEGORIAS, PRODUTOS } from "../dados/homehub";
import { useApp } from "../contexto/AppState";
import AppFrame from "../componentes/AppFrame";

function brl(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }

export default function Categoria() {
  const { categoriaId } = useParams();
  const nav = useNavigate();
  const app = useApp();
  const cat = CATEGORIAS.find((c) => c.id === categoriaId);
  const produtos = PRODUTOS[categoriaId] || [];
  const ehPlanejados = categoriaId === "moveis-planejados";

  function adicionarRapido(p, e) {
    e.stopPropagation();
    app.adicionarAoCarrinho({ nome: p.nome, valor: p.valor, montagem: p.montagem || 0, categoriaId });
  }

  return (
    <AppFrame titulo={cat ? cat.nome : "Categoria"}>
      {ehPlanejados && (
        <button className="pgBanner" onClick={() => nav("/projeto-completo")}>
          <span className="pgTag">HOMEHUB PROJETO GARANTIDO</span>
          <h3>Uma reforma coordenada de ponta a ponta.</h3>
          <p>Comece por uma etapa, defina escopo, preço e prazo, e conte com produtos + serviços + acompanhamento.</p>
          <div className="pgChips">
            <span>Escopo validado</span><span>Preço definido</span><span>Prazo acompanhado</span><span>Execução certificada</span>
          </div>
          <span className="heroCta">Montar meu projeto →</span>
        </button>
      )}

      <h3 className="secaoTitulo" style={{ marginTop: ehPlanejados ? 4 : 0 }}>
        {ehPlanejados ? "Mais buscados" : "Produtos"}
      </h3>
      <div className="gradeProdutos">
        {produtos.map((p) => (
          <button key={p.id} className="produtoFotoCard" onClick={() => nav(`/produto/${categoriaId}/${p.id}`)}>
            <div className="produtoFoto" style={p.img ? { backgroundImage: `url(${p.img})` } : { background: p.cor }} />
            <div className="produtoFotoInfo">
              <span className="produtoFotoCategoria">{cat ? cat.nome.toUpperCase() : ""}</span>
              <b>{p.nome}</b>
              <span className="produtoFotoPreco">{brl(p.valor)}{p.unidade ? "/" + p.unidade : ""}</span>
              <button className="btAdicionarMini" onClick={(e) => adicionarRapido(p, e)}>Adicionar ao carrinho</button>
            </div>
          </button>
        ))}
        {produtos.length === 0 && <p className="vazioTxt">Nenhum produto cadastrado nesta categoria ainda.</p>}
      </div>
    </AppFrame>
  );
}
