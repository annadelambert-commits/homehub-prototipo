import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { House, LayoutGrid, Layers, Wrench, CircleCheck, Puzzle } from "lucide-react";
import { useApp } from "../../contexto/AppState";
import AppFrame from "../../componentes/AppFrame";
import { AMBIENTES, CATEGORIAS_REFORMA, INCENTIVO_FASEADO } from "../../dados/homehub";

const TIPOS_REFORMA = [
  { id: "unico", Icone: LayoutGrid, titulo: "Um ambiente", sub: "Reformar um cômodo específico" },
  { id: "multi", Icone: Layers, titulo: "Vários ambientes", sub: "Escolher mais de um cômodo, do jeito que você quiser" },
  { id: "completa", Icone: House, titulo: "Casa completa", sub: "Todos os ambientes, com desconto de reforma completa" },
  { id: "categoria", Icone: Wrench, titulo: "Uma categoria específica", sub: "Ex.: só o piso, só a parte elétrica, só a hidráulica" },
];

export default function Concierge() {
  const nav = useNavigate();
  const app = useApp();
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [avancou, setAvancou] = useState(app.ambientesSelecionados.length > 0);
  const [tipoReforma, setTipoReforma] = useState(null);

  async function enviarConcierge() {
    if (!texto.trim()) return;
    setCarregando(true); app.setErroConcierge(null);
    try {
      const resp = await fetch("/api/assistente", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "concierge", mensagem: texto.trim() }),
      });
      if (!resp.ok) throw new Error("status " + resp.status);
      const dados = await resp.json();
      if (!dados.ambiente) throw new Error("resposta incompleta");
      app.setBriefing(dados);
      // se o cliente já escolheu explicitamente "categoria específica" nos botões, isso vale mais que a
      // leitura da IA sobre o texto livre — só deixa a IA decidir o escopo nos outros formatos de reforma
      if (tipoReforma !== "categoria") {
        app.setEscopoFoco(dados.escopo === "categoria" ? "categoria" : "completo");
        app.setCategoriaFoco(dados.escopo === "categoria" ? dados.categoria : null);
      }
    } catch {
      app.setErroConcierge("Não foi possível falar com o concierge agora. Confira a chave da API no Netlify, ou use o exemplo pronto abaixo.");
    } finally {
      setCarregando(false);
    }
  }

  const [categoriaEscolhida, setCategoriaEscolhida] = useState(null);

  const selecionados = AMBIENTES.filter((a) => app.ambientesSelecionados.includes(a.id));
  const nomeAmbientes = selecionados.map((a) => a.nome.toLowerCase()).join(", ");
  const orcTotal = selecionados.reduce((s, a) => s + a.orc, 0) || 10000;

  function toggleAmbiente(id) {
    app.setAmbientesSelecionados((sel) => sel.includes(id) ? sel.filter((s) => s !== id) : [...sel, id]);
  }

  function escolherTipoReforma(id) {
    setTipoReforma(id);
    app.setEscopoFoco(id === "categoria" ? "categoria" : "completo");
    if (id === "unico") { app.setAmbientesSelecionados([]); app.setReformaCompleta(false); app.setCategoriaFoco(null); }
    else if (id === "multi") { app.setAmbientesSelecionados([]); app.setReformaCompleta(false); app.setCategoriaFoco(null); }
    else if (id === "completa") { app.setAmbientesSelecionados(AMBIENTES.map((a) => a.id)); app.setReformaCompleta(true); app.setCategoriaFoco(null); }
    else if (id === "categoria") { app.setAmbientesSelecionados([]); app.setReformaCompleta(false); setCategoriaEscolhida(null); }
  }

  function escolherCategoriaReforma(cat) {
    setCategoriaEscolhida(cat);
    app.setCategoriaFoco(cat.id);
  }

  function confirmarAmbientes() {
    if (app.ambientesSelecionados.length > 1) app.setReformaCompleta(true);
    app.setProjetoAtivoId(app.ambientesSelecionados[0]);
    setAvancou(true);
  }

  function usarExemplo() {
    app.setBriefing({
      ambiente: nomeAmbientes, orcamento: orcTotal, estilo: "moderno", prazo_dias: 45, prioridade: "funcionalidade",
      resumo: `Entendi: reforma de ${nomeAmbientes}, estilo moderno, orçamento de R$ ${orcTotal.toLocaleString("pt-BR")}, prazo de 45 dias e foco em funcionalidade.`,
    });
    if (tipoReforma !== "categoria") { app.setEscopoFoco("completo"); app.setCategoriaFoco(null); }
    app.setErroConcierge(null);
  }

  function irParaMedida() {
    nav("/projeto-completo/medida");
  }

  function escolherOrcamentoFinal() {
    app.setOrcamentoFinal(true);
    if (selecionados.length <= 1) irParaMedida();
  }

  function escolherFaseado() {
    app.setOrcamentoFinal(false);
    if (selecionados.length <= 1) { app.setAmbienteFaseInicial(app.ambientesSelecionados[0] || null); irParaMedida(); }
  }

  function confirmarAmbienteFase(id) {
    app.setAmbienteFaseInicial(id);
    irParaMedida();
  }

  // ---- passo 0a: que tipo de reforma ----
  if (!avancou && !tipoReforma) {
    return (
      <AppFrame titulo="Projeto Completo" comNavInferior={false}>
        <div className="passoIndicador"><i className="ativo" /><i /><i /><i /><i /></div>
        <h2 className="tituloTela">O que você quer reformar?</h2>
        <p className="subtituloTela">Escolha o formato que melhor descreve sua reforma. Dá pra mudar de ideia depois.</p>

        {TIPOS_REFORMA.map((t) => (
          <button key={t.id} className="opcaoMedida" onClick={() => escolherTipoReforma(t.id)}>
            <span className="opcaoMedidaIcone"><t.Icone size={20} strokeWidth={1.6} /></span>
            <span className="opcaoMedidaTexto"><b>{t.titulo}</b><span>{t.sub}</span></span>
          </button>
        ))}

        <div className="cartao bom" style={{ marginTop: 4 }}>
          <h4>Reforma completa custa menos, mesmo em etapas</h4>
          <p>{INCENTIVO_FASEADO.texto} Você decide o ritmo, de acordo com orçamento e crédito disponíveis. Nenhum ambiente fica bloqueado.</p>
        </div>
      </AppFrame>
    );
  }

  // ---- passo 0b: categoria específica (piso, hidráulica, elétrica, pintura) ----
  if (!avancou && tipoReforma === "categoria" && !categoriaEscolhida) {
    return (
      <AppFrame titulo="Projeto Completo" voltar={() => setTipoReforma(null)} comNavInferior={false}>
        <div className="passoIndicador"><i className="ativo" /><i /><i /><i /><i /></div>
        <h2 className="tituloTela">Qual categoria você quer reformar?</h2>
        <p className="subtituloTela">Ao escolher, já reunimos material e mão de obra necessários pra essa frente.</p>
        <div className="gradeAmbientes">
          {CATEGORIAS_REFORMA.map((c) => (
            <button key={c.id} className="ambienteChip" onClick={() => escolherCategoriaReforma(c)}>{c.nome}</button>
          ))}
        </div>
      </AppFrame>
    );
  }

  // ---- passo 0c: quais ambientes recebem essa reforma (único, multi ou categoria) ----
  if (!avancou && (tipoReforma === "unico" || tipoReforma === "multi" || (tipoReforma === "categoria" && categoriaEscolhida))) {
    const unico = tipoReforma === "unico";
    return (
      <AppFrame titulo="Projeto Completo" voltar={() => { if (tipoReforma === "categoria") setCategoriaEscolhida(null); else setTipoReforma(null); }} comNavInferior={false}>
        <div className="passoIndicador"><i className="ativo" /><i /><i /><i /><i /></div>
        <h2 className="tituloTela">
          {unico ? "Qual ambiente?" : tipoReforma === "categoria" ? `${categoriaEscolhida.nome}: em quais ambientes?` : "Quais ambientes?"}
        </h2>
        <p className="subtituloTela">{unico ? "Escolha o cômodo que você quer reformar." : "Escolha um ou mais ambientes."}</p>

        <div className="gradeAmbientes">
          {AMBIENTES.map((a) => (
            <button key={a.id} className={"ambienteChip" + (app.ambientesSelecionados.includes(a.id) ? " sel" : "")}
              onClick={() => unico ? app.setAmbientesSelecionados([a.id]) : toggleAmbiente(a.id)}>{a.nome}</button>
          ))}
        </div>

        <div className="ctaFixo">
          <button className="btPrimario" disabled={app.ambientesSelecionados.length === 0} onClick={confirmarAmbientes}>Continuar</button>
        </div>
      </AppFrame>
    );
  }

  // ---- passo 0d: casa completa já confirma direto ----
  if (!avancou && tipoReforma === "completa") {
    return (
      <AppFrame titulo="Projeto Completo" voltar={() => setTipoReforma(null)} comNavInferior={false}>
        <div className="passoIndicador"><i className="ativo" /><i /><i /><i /><i /></div>
        <h2 className="tituloTela">Casa completa</h2>
        <p className="subtituloTela">Todos os ambientes entram no projeto, com o maior desconto de pacote fechado.</p>
        <div className="gradeAmbientes">
          {AMBIENTES.map((a) => (
            <button key={a.id} className="ambienteChip sel" style={{ pointerEvents: "none" }}>{a.nome}</button>
          ))}
        </div>
        <div className="ctaFixo">
          <button className="btPrimario" onClick={confirmarAmbientes}>Continuar</button>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame titulo="Projeto Completo" voltar={() => setAvancou(false)} comNavInferior={false}>
      <div className="passoIndicador"><i className="feito" /><i className="ativo" /><i /><i /><i /></div>
      <h2 className="tituloTela">Conte como quer sua reforma de {nomeAmbientes}</h2>
      {!app.briefing && (
        <>
          <p className="subtituloTela">Descreva com suas palavras: orçamento, estilo, o que for importante. A IA organiza isso num projeto.</p>
          <textarea className="chatInput" rows={4} value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder={`Ex.: Quero reformar ${nomeAmbientes}, algo moderno, com bastante espaço de armazenamento.`} />
          <div className="ctaFixo">
            <button className="btPrimario" disabled={!texto.trim() || carregando} onClick={enviarConcierge}>
              {carregando ? "Consultando a IA…" : "Enviar para o concierge"}
            </button>
            <button className="btSecundario" onClick={usarExemplo}>Usar exemplo pronto</button>
          </div>
          {app.erroConcierge && <div className="cartao alerta" style={{ marginTop: 12 }}><p>{app.erroConcierge}</p></div>}
        </>
      )}
      {app.briefing && (
        <>
          <div className="cartao bom"><h4>Briefing estruturado pela IA</h4><p>{app.briefing.resumo}</p></div>
          <div className="cartaoResumo">
            <div className="linhaResumo"><span>Ambiente(s)</span><b>{app.briefing.ambiente}</b></div>
            <div className="linhaResumo"><span>Orçamento</span><b>{app.briefing.orcamento ? "R$ " + app.briefing.orcamento.toLocaleString("pt-BR") : "não informado"}</b></div>
            <div className="linhaResumo"><span>Estilo</span><b>{app.briefing.estilo || "não informado"}</b></div>
            <div className="linhaResumo"><span>Prazo desejado</span><b>{app.briefing.prazo_dias ? app.briefing.prazo_dias + " dias" : "não informado"}</b></div>
          </div>

          {app.escopoFoco === "categoria" && app.categoriaFoco && (
            <div className="cartao bom">
              <h4>Entendi, é uma frente específica</h4>
              <p>Vou levar você direto pras opções relevantes assim que a medida estiver pronta, sem misturar com o resto do projeto.</p>
            </div>
          )}

          {app.briefing.orcamento && app.orcamentoFinal === null && selecionados.length > 0 && (
            <>
              <h3 className="secaoTitulo">Sobre o orçamento</h3>
              <p className="subtituloTela">
                R$ {app.briefing.orcamento.toLocaleString("pt-BR")} é o valor final que você quer fechar hoje, ou prefere fechar
                um preço agora com desconto e reformar em etapas, começando por um ambiente?
              </p>
              <button className="opcaoMedida" onClick={escolherOrcamentoFinal}>
                <span className="opcaoMedidaIcone"><CircleCheck size={20} strokeWidth={1.6} /></span>
                <span className="opcaoMedidaTexto"><b>É o orçamento final</b><span>Fechamos {nomeAmbientes} de uma vez só</span></span>
              </button>
              <button className="opcaoMedida" onClick={escolherFaseado}>
                <span className="opcaoMedidaIcone"><Puzzle size={20} strokeWidth={1.6} /></span>
                <span className="opcaoMedidaTexto"><b>Quero fazer em etapas</b><span>{INCENTIVO_FASEADO.texto}</span></span>
              </button>
            </>
          )}

          {app.orcamentoFinal === false && !app.ambienteFaseInicial && selecionados.length > 1 && (
            <>
              <h3 className="secaoTitulo">Qual ambiente você quer começar primeiro?</h3>
              <div className="gradeAmbientes">
                {selecionados.map((a) => (
                  <button key={a.id} className="ambienteChip" onClick={() => confirmarAmbienteFase(a.id)}>{a.nome}</button>
                ))}
              </div>
            </>
          )}

          {(app.orcamentoFinal !== null || !app.briefing.orcamento || selecionados.length === 0) &&
            (app.orcamentoFinal !== false || app.ambienteFaseInicial || selecionados.length <= 1) && (
            <div className="ctaFixo">
              <button className="btPrimario" onClick={irParaMedida}>Continuar</button>
              <button className="btSecundario" onClick={() => { app.setBriefing(null); app.setOrcamentoFinal(null); app.setAmbienteFaseInicial(null); }}>Recomeçar a conversa</button>
            </div>
          )}
        </>
      )}
    </AppFrame>
  );
}
