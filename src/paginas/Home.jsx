import { useNavigate } from "react-router-dom";
import AppFrame from "../componentes/AppFrame";
import { CATEGORIAS, SERVICOS, IMG_HERO } from "../dados/homehub";

export default function Home() {
  const nav = useNavigate();
  const destaque = CATEGORIAS.slice(0, 6);

  return (
    <AppFrame titulo="" voltar={false}>
      <div className="buscaTopo">
        <span>🔍</span>
        <input type="text" placeholder="Buscar produtos, ambientes ou soluções" readOnly
          onClick={() => nav("/categorias")} />
      </div>

      <button className="heroFoto" style={{ backgroundImage: `linear-gradient(180deg, rgba(12,15,20,.35), rgba(12,15,20,.82)), url(${IMG_HERO})` }}
        onClick={() => nav("/projeto-completo")}>
        <h2>Sua reforma. Do projeto à execução.</h2>
        <p>Planeje, compre e acompanhe sua reforma em um só lugar — com escopo, produtos, serviços e execução coordenados.</p>
        <span className="heroCta">Começar meu projeto →</span>
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
