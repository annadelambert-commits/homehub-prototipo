import { useNavigate } from "react-router-dom";
import AppFrame from "../componentes/AppFrame";
import { CATEGORIAS } from "../dados/homehub";

export default function Categorias() {
  const nav = useNavigate();
  return (
    <AppFrame titulo="Categorias">
      <div className="gradeCategorias" style={{ marginTop: 4 }}>
        {CATEGORIAS.map((c) => (
          <button key={c.id} className="categoriaFoto" onClick={() => nav(`/categoria/${c.id}`)}
            style={c.img ? { backgroundImage: `url(${c.img})` } : { background: c.cor }}>
            <span className="categoriaFotoNome">{c.nome}</span>
          </button>
        ))}
      </div>
    </AppFrame>
  );
}
