import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { House, LayoutGrid, Layers, Wrench, CircleCheck, Puzzle } from "lucide-react";
import { useApp } from "../../contexto/AppState";
import AppFrame from "../../componentes/AppFrame";
import { AMBIENTES, CATEGORIAS_REFORMA, INCENTIVO_FASEADO, ESTILOS_DESIGN, PALETAS_DESIGN, JA_TENHO_OPCOES, PRODUTOS } from "../../dados/homehub";

const PRIORIDADES = [
  { id: "custo", titulo: "Custo-benefício", sub: "Quero o melhor preço, sem abrir mão do essencial" },
  { id: "estetica", titulo: "Acabamento e estética", sub: "Prefiro pagar mais por acabamento e visual melhores" },
  { id: "rapidez", titulo: "Rapidez de entrega", sub: "Quero o que estiver disponível mais rápido" },
];

const TIPOS_REFORMA = [
  { id: "unico", Icone: LayoutGrid, titulo: "Um ambiente", sub: "Reformar um cômodo específico" },
  { id: "multi", Icone: Layers, titulo: "Vários ambientes", sub: "Escolher mais de um cômodo, do jeito que você quiser" },
  { id: "completa", Icone: House, titulo: "Casa completa", sub: "Todos os ambientes, com desconto de reforma completa" },
  { id: "categoria", Icone: Wrench, titulo: "Uma categoria específica", sub: "Ex.: só o piso, só a parte elétrica, só a hidráulica" },
];

// tenta casar o texto livre que a IA extraiu (ex.: "cozinha", "banheiro pequeno") com um id cadastrado em
// AMBIENTES, comparando pelo nome — usado pra corrigir o ambiente selecionado quando o cliente descreve um
// ambiente diferente do que clicou antes na grade de chips.
function encontrarAmbientePorTexto(texto) {
  if (!texto) return null;
  const norm = texto.toLowerCase();
  const candidatos = [...AMBIENTES].sort((a, b) => b.nome.length - a.nome.length);
  return candidatos.find((a) => norm.includes(a.nome.toLowerCase())) || null;
}

// mesma lógica pro estilo: só usa o que a IA leu no texto livre pra completar a escolha quando o
// cliente não marcou nenhum chip de estilo — o chip, quando existe, é o sinal mais confiável.
function encontrarEstiloPorTexto(texto) {
  if (!texto) return null;
  const norm = texto.toLowerCase();
  return ESTILOS_DESIGN.find((e) => norm.includes(e.nome.toLowerCase()) || norm.includes(e.id)) || null;
}

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
      // manda pra IA só o que ainda não sabemos — ambiente, estilo, paleta e prioridade já vieram dos chips
      // nas etapas anteriores, então isso vai como contexto confirmado, não como algo pra IA re-descobrir
      // (ou pior, "esquecer" e perguntar de novo) a partir do texto livre do cliente.
      const estiloNome = ESTILOS_DESIGN.find((e) => e.id === app.projetoEstilo)?.nome;
      const paletaNome = PALETAS_DESIGN.find((p) => p.id === app.projetoPaleta)?.nome;
      const prioridadeNome = PRIORIDADES.find((p) => p.id === app.projetoPrioridade)?.titulo;
      const partesContexto = [`ambiente(s) = ${nomeAmbientes}`];
      if (estiloNome) partesContexto.push(`estilo escolhido = ${estiloNome}`);
      if (paletaNome) partesContexto.push(`paleta escolhida = ${paletaNome}`);
      if (prioridadeNome) partesContexto.push(`prioridade = ${prioridadeNome}`);
      const contexto = `[Já sei: ${partesContexto.join("; ")}.]\n\n`;

      const resp = await fetch("/api/assistente", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "concierge", mensagem: contexto + texto.trim() }),
      });
      if (!resp.ok) throw new Error("status " + resp.status);
      const dados = await resp.json();
      if (!dados.ambiente) throw new Error("resposta incompleta");
      app.setBriefing(dados);
      // se o cliente descreveu um ambiente diferente do que tinha clicado nos chips antes (ex.: clicou banheiro
      // sem querer, mas escreveu "reforma da cozinha"), o texto livre é a fonte mais confiável da intenção real —
      // corrige a seleção pra bater com o que a IA entendeu, só no fluxo de ambiente único.
      if (tipoReforma === "unico") {
        const ambienteDetectado = encontrarAmbientePorTexto(dados.ambiente);
        if (ambienteDetectado && !app.ambientesSelecionados.includes(ambienteDetectado.id)) {
          app.setAmbientesSelecionados([ambienteDetectado.id]);
        }
      }
      // se o cliente já escolheu explicitamente "categoria específica" nos botões, isso vale mais que a
      // leitura da IA sobre o texto livre — só deixa a IA decidir o escopo nos outros formatos de reforma
      if (tipoReforma !== "categoria") {
        app.setEscopoFoco(dados.escopo === "categoria" ? "categoria" : "completo");
        app.setCategoriaFoco(dados.escopo === "categoria" ? dados.categoria : null);
      }
      // se o cliente não marcou nenhum chip de estilo, mas descreveu um estilo no texto livre, usa o que a IA leu
      if (!app.projetoEstilo && dados.estilo) {
        const estiloDetectado = encontrarEstiloPorTexto(dados.estilo);
        if (estiloDetectado) app.setProjetoEstilo(estiloDetectado.id);
      }
      // categorias que o cliente disse explicitamente que não quer (ex.: "não quero elétrica nem iluminação")
      // usam o mesmo mecanismo de exclusão do checklist "já tenho" — a tela de escolha de itens já sabe
      // pular categorias marcadas ali, então não precisa de um caminho novo pra isso.
      if (Array.isArray(dados.excluir) && dados.excluir.length > 0) {
        const chave = chaveJaTem();
        const atuais = app.itensJaTem[chave] || [];
        const validas = dados.excluir.filter((c) => typeof c === "string" && !atuais.includes(c));
        if (validas.length > 0) {
          app.setItensJaTem((m) => ({ ...m, [chave]: [...(m[chave] || []), ...validas] }));
        }
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
    const estiloNome = ESTILOS_DESIGN.find((e) => e.id === app.projetoEstilo)?.nome || "moderno";
    app.setBriefing({
      ambiente: nomeAmbientes, orcamento: orcTotal, estilo: estiloNome, prazo_dias: 45, prioridade: "funcionalidade",
      resumo: `Entendi: reforma de ${nomeAmbientes}, estilo ${estiloNome}, orçamento de R$ ${orcTotal.toLocaleString("pt-BR")}, prazo de 45 dias e foco em funcionalidade.`,
    });
    if (tipoReforma !== "categoria") { app.setEscopoFoco("completo"); app.setCategoriaFoco(null); }
    app.setErroConcierge(null);
  }

  function irParaMedida() {
    nav("/projeto-completo/medida");
  }

  // só mostra no checklist "já tenho" as categorias que de fato têm item cadastrado pra algum dos
  // ambientes escolhidos — não faz sentido perguntar se o cliente "já tem" organização se não vamos
  // sugerir nenhum item de organização pra esse ambiente.
  const jaTenhoOpcoesRelevantes = JA_TENHO_OPCOES.filter((op) =>
    PRODUTOS[op.categoriaId]?.some((p) => Array.isArray(p.ambientes) && p.ambientes.some((a) => app.ambientesSelecionados.includes(a)))
  );
  function chaveJaTem() { return app.ambientesSelecionados.join("+") || "geral"; }
  const jaTenhoSelecionados = app.itensJaTem[chaveJaTem()] || [];

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
          <p className="subtituloTela">Antes de descrever com suas palavras, escolha o que já sabemos sobre o seu gosto — isso ajuda a IA a montar um carrinho que combina com você.</p>

          <h3 className="secaoTitulo">Qual estilo mais te representa?</h3>
          <div className="gradeAmbientes">
            {ESTILOS_DESIGN.map((e) => (
              <button key={e.id} className={"ambienteChip" + (app.projetoEstilo === e.id ? " sel" : "")}
                onClick={() => app.setProjetoEstilo(app.projetoEstilo === e.id ? null : e.id)}>{e.nome}</button>
            ))}
          </div>

          <h3 className="secaoTitulo">E a paleta de cores?</h3>
          <div className="gradeAmbientes">
            {PALETAS_DESIGN.map((p) => (
              <button key={p.id} className={"ambienteChip" + (app.projetoPaleta === p.id ? " sel" : "")}
                onClick={() => app.setProjetoPaleta(app.projetoPaleta === p.id ? null : p.id)}>{p.nome}</button>
            ))}
          </div>

          <h3 className="secaoTitulo">O que pesa mais pra você?</h3>
          <div className="gradeAmbientes">
            {PRIORIDADES.map((pr) => (
              <button key={pr.id} className={"ambienteChip" + (app.projetoPrioridade === pr.id ? " sel" : "")}
                onClick={() => app.setProjetoPrioridade(app.projetoPrioridade === pr.id ? null : pr.id)}
                title={pr.sub}>{pr.titulo}</button>
            ))}
          </div>

          {jaTenhoOpcoesRelevantes.length > 0 && (
            <>
              <h3 className="secaoTitulo">Você já tem algo que não precisa trocar?</h3>
              <p className="subtituloTela">Marque o que já está pronto — a gente não sugere item novo pra isso.</p>
              <div className="gradeAmbientes">
                {jaTenhoOpcoesRelevantes.map((op) => (
                  <button key={op.categoriaId} className={"ambienteChip" + (jaTenhoSelecionados.includes(op.categoriaId) ? " sel" : "")}
                    onClick={() => app.toggleItemJaTem(chaveJaTem(), op.categoriaId)}>{op.label}</button>
                ))}
              </div>
            </>
          )}

          <h3 className="secaoTitulo">Restrições ou preferências especiais (opcional)</h3>
          <p className="subtituloTela">Descreva com suas palavras: orçamento, o que for importante. A IA organiza isso num projeto.</p>
          <textarea className="chatInput" rows={4} value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder={`Ex.: Quero reformar ${nomeAmbientes}, com bastante espaço de armazenamento, orçamento de R$ ${orcTotal.toLocaleString("pt-BR")}.`} />
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
            {/* ambiente e estilo já são conhecidos com certeza (chips escolhidos antes) — mostra isso em vez do
                que a IA leu do texto livre, que pode "esquecer" informação que não foi repetida na mensagem */}
            <div className="linhaResumo"><span>Ambiente(s)</span><b>{nomeAmbientes}</b></div>
            <div className="linhaResumo"><span>Orçamento</span><b>{app.briefing.orcamento ? "R$ " + app.briefing.orcamento.toLocaleString("pt-BR") : "não informado"}</b></div>
            <div className="linhaResumo"><span>Estilo</span><b>{ESTILOS_DESIGN.find((e) => e.id === app.projetoEstilo)?.nome || app.briefing.estilo || "não informado"}</b></div>
            {app.projetoPaleta && (
              <div className="linhaResumo"><span>Paleta de cores</span><b>{PALETAS_DESIGN.find((p) => p.id === app.projetoPaleta)?.nome}</b></div>
            )}
            {app.projetoPrioridade && (
              <div className="linhaResumo"><span>Prioridade</span><b>{PRIORIDADES.find((p) => p.id === app.projetoPrioridade)?.titulo}</b></div>
            )}
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
