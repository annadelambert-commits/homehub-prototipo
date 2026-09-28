import { useNavigate, useLocation } from "react-router-dom";
import { House, LayoutGrid, FolderKanban, ShoppingCart, CircleUserRound } from "lucide-react";

const ITENS = [
  { rota: "/", label: "Início", Icone: House },
  { rota: "/categorias", label: "Categorias", Icone: LayoutGrid },
  { rota: "/projetos", label: "Projetos", Icone: FolderKanban },
  { rota: "/carrinho", label: "Carrinho", Icone: ShoppingCart },
  { rota: "/perfil", label: "Conta", Icone: CircleUserRound },
];

export default function BottomNav({ carrinhoQtd }) {
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <nav className="navInferior">
      {ITENS.map((it) => {
        const ativo = it.rota === "/" ? loc.pathname === "/" : loc.pathname.startsWith(it.rota);
        const Icone = it.Icone;
        return (
          <button key={it.rota} className={"navItem" + (ativo ? " ativo" : "")} onClick={() => nav(it.rota)}>
            <span className="navIcone">
              <Icone size={19} strokeWidth={1.7} />
              {it.rota === "/carrinho" && carrinhoQtd > 0 && <span className="navBadge">{carrinhoQtd}</span>}
            </span>
            <span className="navLabel">{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
