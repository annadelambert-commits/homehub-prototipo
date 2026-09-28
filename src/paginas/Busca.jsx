import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import AppFrame from "../componentes/AppFrame";
import { CATEGORIAS, PRODUTOS } from "../dados/homehub";

function brl(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }

export default function Busca() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

  const termo = q.trim().toLowerCase();

  const categoriasAchadas = useMemo(() => {
    if (!termo) return [];
    return CATEGORIAS.filter((c) => c.nome.toLowerCase().includes(termo));
  }, [termo]);

  const produtosAchados = useMemo(() => {
    if (!termo) return [];
    const resultado = [];
    for (const categoriaId of Object.keys(PRODUTOS)) {
      const cat = CATEGORIAS.find((c) => c.id === categoriaId);
      for (const p of PRODUTOS[categoriaId]) {
        if (p.nome.toLowerCase().includes(termo) || (p.desc || "").toLowerCase().includes(termo)) {
          resultado.push({ ...p, categoriaId, categoriaNome: cat ? cat.nome : categoriaId });
        }
      }
    }
    return resultado;
  }, [termo]);

  return (
    <AppFrame titulo="Buscar">
      <div className="buscaTopo" style={{ marginBottom: 18 }}>
        <span><Search size={17} strokeWidth={1.8} /></span>
        <input type="text" autoFocus placeholder="Buscar produtos, ambientes ou soluções"
          value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {!termo && <p className="vazioTxt">Digite algo para buscar em todo o catálogo.</p>}

      {termo && categoriasAchadas.length === 0 && produtosAchados.length === 0 && (
        <p className="vazioTxt">Nada encontrado para "{q}".</p>
      )}

      {categoriasAchadas.length > 0 && (
        <>
          <h3 className="secaoTitulo" style={{ marginTop: 0 }}>Categorias</h3>
          <div className="gradeCategorias">
            {categoriasAchadas.map((c) => (
              <button key={c.id} className="categoriaFoto" onClick={() => nav(`/categoria/${c.id}`)}
                style={c.img ? { backgroundImage: `url(${c.img})` } : { background: c.cor }}>
                <span className="categoriaFotoNome">{c.nome}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {produtosAchados.length > 0 && (
        <>
          <h3 className="secaoTitulo">Produtos</h3>
          <div className="gradeProdutos">
            {produtosAchados.map((p) => (
              <button key={p.categoriaId + "-" + p.id} className="produtoFotoCard"
                onClick={() => nav(`/produto/${p.categoriaId}/${p.id}`)}>
                <div className="produtoFoto" style={p.img ? { backgroundImage: `url(${p.img})` } : { background: p.cor }} />
                <div className="produtoFotoInfo">
                  <span className="produtoFotoCategoria">{p.categoriaNome.toUpperCase()}</span>
                  <b>{p.nome}</b>
                  <span className="produtoFotoPreco">{brl(p.valor)}{p.unidade ? "/" + p.unidade : ""}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </AppFrame>
  );
}
