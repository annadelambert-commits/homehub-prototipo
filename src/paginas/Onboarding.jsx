import { useNavigate } from "react-router-dom";
import { Sparkles, LayoutGrid, Package, Ruler, MessageCircle, Tag } from "lucide-react";
import { useApp } from "../contexto/AppState";
import AppFrame from "../componentes/AppFrame";

const OPCOES = [
  { id: "render", Icone: Sparkles, titulo: "Ainda não sei por onde começar",
    sub: "Fotografe o ambiente e veja um render de como pode ficar" },
  { id: "projeto", Icone: LayoutGrid, titulo: "Quero um projeto completo",
    sub: "Um ambiente, vários, a casa toda, ou uma categoria específica, com orçamento fechado" },
  { id: "movel", Icone: Package, titulo: "Quero comprar só um móvel planejado",
    sub: "Já sei o que preciso, é uma peça avulsa" },
  { id: "medida", Icone: Ruler, titulo: "Preciso de ajuda com as medidas",
    sub: "Fotografar, enviar planta ou digitar as medidas do ambiente" },
  { id: "duvida", Icone: MessageCircle, titulo: "Tenho dúvidas técnicas antes de decidir",
    sub: "Falar agora com o suporte especializado" },
  { id: "preco", Icone: Tag, titulo: "Quero entender os preços antes de decidir",
    sub: "Ver o catálogo de móveis planejados com valores" },
];

export default function Onboarding() {
  const nav = useNavigate();
  const app = useApp();

  function escolher(id) {
    if (id === "render") { app.setDesignAmbiente(null); app.setDesignFoto(null); app.setDesignResultado(null); app.setDesignErro(null); nav("/design"); }
    else if (id === "projeto") { app.limparFluxoProjeto(); nav("/projeto-completo"); }
    else if (id === "movel") { app.setProdutoAtual(null); nav("/moveis-planejados"); }
    else if (id === "medida") nav("/projeto-completo/medida");
    else if (id === "duvida") app.setSuporteAberto(true);
    else if (id === "preco") nav("/categoria/moveis-planejados");
  }

  return (
    <AppFrame titulo="Vamos começar" comNavInferior={false}>
      <h2 className="tituloTela">O que você precisa agora?</h2>
      <p className="subtituloTela">Escolha a opção mais próxima da sua situação. Dá pra mudar de caminho a qualquer momento.</p>

      {OPCOES.map((o) => (
        <button key={o.id} className="opcaoMedida" onClick={() => escolher(o.id)}>
          <span className="opcaoMedidaIcone"><o.Icone size={20} strokeWidth={1.6} /></span>
          <span className="opcaoMedidaTexto"><b>{o.titulo}</b><span>{o.sub}</span></span>
        </button>
      ))}
    </AppFrame>
  );
}
