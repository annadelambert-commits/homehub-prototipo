import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppFrame from "../componentes/AppFrame";
import { CATEGORIAS, SERVICOS, IMG_HERO } from "../dados/homehub";

export default function Home() {
  const nav = useNavigate();
  const destaque = CATEGORIAS.slice(0, 6);
  const [busca, setBusca] = useState("");

  function irParaBusca(e) {
    e.preventDefault();
    if (busca.trim()) nav(`/busca?q=${encodeURIComponent(busca.trim())}`);
    else nav("/categorias");
  }

  return (
    <AppFrame titulo="" voltar={false}>
      <form className="buscaTopo" onSubmit={irParaBusca}>
        <span>🔍</span>
        <input type="text" placeholder="Buscar produtos, ambientes ou soluções"
          value={busca} onChange={(e) => setBusca(e.target.value)} />
        {busca && <button type="submit" className="buscaTopoBt">Buscar</button>}
      </form>

      <button className="heroFoto" style={{ backgroundImage: `linear-gradient(180deg, rgba(12,15,20,.35), rgba(12,15,20,.82)), url(${IMG_HERO})` }}
        onClick={() => nav("/comecar")}>
        <h2>Sua reforma. Do projeto à execução.</h2>
        <p>Planeje, compre e acompanhe sua reforma em um só lugar, com escopo, produtos, serviços e execução coordenados. Sai mais em conta fazer completa, mesmo em etapas.</p>
        <span className="heroCta">Começar meu projeto →</span>
      </button>

      <button className="cardDesign" onClick={() => nav("/design")}>
        <div className="cardDesignTag">✨ NOVO · IA DE DESIGN</div>
        <div className="cardDesignTxt">
          <b>Não sabe por onde começar?</b>
          <span>Fotografe o ambiente, escolha um estilo e a IA projeta sua reforma, com tudo que você precisa para realizá-la.</span>
        </div>
      </button>

      <div className="secaoTopoLinha">
        <h3 className="secaoTitulo">Comprar por categoria</h3>
        <button className="verTudo" onClick={() => nav("/categorias")}>Ver tudo</button>
      </div>
      <div className="gradeCategorias">
        {destaque.map((c) => (
          <button key={c.id} className="categoriaFoto" onClick={() => nav(`/categoria/${c.id}`)}
            style={c.img ? { backgroundImage: `url(${c.img})` } : { background: c.cor }}>
            <span className="categoriaFotoNome">{c.nome}</span>
          </button>
        ))}
      </div>

      <h3 className="secaoTitulo">Serviços HomeHub</h3>
      <div className="listaServicos">
        {SERVICOS.map((s) => (
          <div key={s.id} className="servicoRow">
            <div>
              <b>{s.nome}</b>
              <p>{s.desc}</p>
            </div>
            <span className="servicoNota">★ {s.nota.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </AppFrame>
  );
}
