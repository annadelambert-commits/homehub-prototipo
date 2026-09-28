import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Ruler, PenLine } from "lucide-react";
import { useApp } from "../contexto/AppState";
import AppFrame from "../componentes/AppFrame";
import { REFERENCIAS, ANALISE_DEMO, PRODUTOS } from "../dados/homehub";

function brl0(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }
function brl(v) { return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

const PASSO = { INTRO: 0, FOTO: 1, PLANTA: 2, MANUAL: 3, MEDIDO: 4, CATALOGO: 5, RESUMO: 6, CONFIRMA: 7 };

export default function MoveisPlanejados() {
  const nav = useNavigate();
  const app = useApp();
  const [passo, setPasso] = useState(PASSO.INTRO);
  const [carregando, setCarregando] = useState(false);
  const [medidas, setMedidas] = useState({ largura: "", profundidade: "", altura: "" });
  // se o cliente veio de um produto específico (catálogo/detalhe), guarda esse produto — capturado só na
  // primeira renderização, pra não ser confundido com uma escolha feita mais tarde dentro do próprio fluxo
  const [preSelecionado] = useState(() => app.produtoAtual);

  function onArquivo(e, destino) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      if (destino === "foto") { app.setImagem(r.result); app.setMime(f.type); app.setAnalise(null); app.setErroAnalise(null); }
      else app.setPlantaImagem(r.result);
    };
    r.readAsDataURL(f);
  }

  async function analisarFoto() {
    setCarregando(true); app.setErroAnalise(null);
    try {
      const b64 = app.imagem.split(",")[1];
      const resp = await fetch("/api/analisar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagem: b64, mime: app.mime, referenciaNome: app.referencia.nome, referenciaCm: app.referencia.cm }),
      });
      if (!resp.ok) throw new Error("status " + resp.status);
      const dados = await resp.json();
      if (!dados.vao || !dados.largura) throw new Error("incompleto");
      app.setAnalise(dados); app.setOrigemMedida("ia");
      setPasso(PASSO.MEDIDO);
    } catch {
      app.setErroAnalise("Não foi possível analisar agora. Confira a chave da API no Netlify, ou use a análise de demonstração.");
    } finally { setCarregando(false); }
  }
  function usarDemo() { app.setAnalise(ANALISE_DEMO); app.setOrigemMedida("demo"); setPasso(PASSO.MEDIDO); }

  function confirmarComPlanta() {
    // a planta já é suficiente pra seguir; medidas exatas ficam pra validação técnica
    app.setAnalise(null);
    app.setOrigemMedida("planta");
    setPasso(PASSO.MEDIDO);
  }

  function confirmarManual() {
    if (!medidas.largura || !medidas.altura) return;
    app.setAnalise({
      largura: Number(medidas.largura), altura: Number(medidas.altura),
      profundidade: Number(medidas.profundidade) || 60,
      vao: Number(medidas.largura), confianca: "informada por você",
    });
    app.setOrigemMedida("manual");
    setPasso(PASSO.MEDIDO);
  }

  function confirmarPlanta() {
    // a planta sozinha já é suficiente; medidas digitadas são opcionais, só refinam
    if (medidas.largura && medidas.altura) { confirmarManual(); return; }
    confirmarComPlanta();
  }

  function solicitarOrcamento() {
    if (preSelecionado) { app.setProdutoAtual(preSelecionado); setPasso(PASSO.CONFIRMA); }
    else setPasso(PASSO.CATALOGO);
  }

  function adicionarMovelAoCarrinho() {
    const p = app.produtoAtual;
    if (!p) return;
    const clienteJaMediu = app.origemMedida === "manual" || app.origemMedida === "planta";
    const medicao = clienteJaMediu ? 0 : 180;
    app.adicionarAoCarrinho({ nome: p.nome, valor: p.valor, montagem: p.montagem + medicao, categoriaId: "moveis-planejados" });
    setPasso(PASSO.RESUMO);
  }

  const a = app.analise;
  const vao = app.vaoUtil();
  const catalogoMoveis = PRODUTOS["moveis-planejados"].filter((p) => p.tipo === "movel");

  return (
    <AppFrame titulo="Móveis Planejados" comNavInferior={false}>
      {passo === PASSO.INTRO && (
        <>
          <h2 className="tituloTela">{preSelecionado ? preSelecionado.nome : "Vamos medir seu ambiente"}</h2>
          <p className="subtituloTela">
            {preSelecionado
              ? "Esse é um móvel planejado, feito sob medida. Antes de ir pro carrinho, precisamos do espaço disponível — escolha como prefere medir."
              : "Móveis planejados são feitos sob medida. Escolha como prefere medir o ambiente."}
          </p>

          <button className="opcaoMedida" onClick={() => setPasso(PASSO.FOTO)}>
            <span className="opcaoMedidaIcone"><Camera size={20} strokeWidth={1.6} /></span>
            <span className="opcaoMedidaTexto"><b>Fotografar o ambiente</b><span>A IA de visão estima as medidas pela foto</span></span>
          </button>
          <button className="opcaoMedida" onClick={() => setPasso(PASSO.PLANTA)}>
            <span className="opcaoMedidaIcone"><Ruler size={20} strokeWidth={1.6} /></span>
            <span className="opcaoMedidaTexto"><b>Enviar a planta do ambiente</b><span>Já tem a planta baixa? Envie e complemente as medidas</span></span>
          </button>
          <button className="opcaoMedida" onClick={() => setPasso(PASSO.MANUAL)}>
            <span className="opcaoMedidaIcone"><PenLine size={20} strokeWidth={1.6} /></span>
            <span className="opcaoMedidaTexto"><b>Digitar as medidas do ambiente</b><span>Informe largura, profundidade e pé-direito</span></span>
          </button>

          <div className="cartao" style={{ marginTop: 14 }}>
            <h4>Precisa de ajuda antes de decidir?</h4>
            <p>O suporte especializado por IA está no botão flutuante, em qualquer tela.</p>
          </div>
        </>
      )}

      {passo === PASSO.FOTO && (
        <>
          <h2 className="tituloTela">Fotografe o ambiente</h2>
          <p className="subtituloTela">Enquadre a parede inteira e inclua um objeto de tamanho conhecido para servir de escala.</p>
          {app.imagem && <img className="prevImg" src={app.imagem} alt="Foto" />}
          <label className="soltaArquivo">
            <b>{app.imagem ? "Trocar foto" : "Enviar foto do ambiente"}</b>
            <span>Toque para escolher</span>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onArquivo(e, "foto")} />
          </label>
          <label className="rotuloSecao">Objeto de referência na foto</label>
          <select value={app.referencia.nome} onChange={(e) => app.setReferencia(REFERENCIAS.find((r) => r.nome === e.target.value))}>
            {REFERENCIAS.map((r) => <option key={r.nome}>{r.nome}</option>)}
          </select>
          {carregando && <div className="carregando"><div className="pulso" /><p>Analisando o ambiente…</p></div>}
          {app.erroAnalise && !carregando && <div className="cartao alerta" style={{ marginTop: 12 }}><p>{app.erroAnalise}</p></div>}
          {!carregando && (
            <div className="ctaFixo">
              <button className="btPrimario" disabled={!app.imagem} onClick={analisarFoto}>Analisar com IA</button>
              <button className="btSecundario" onClick={usarDemo}>Usar análise de demonstração</button>
            </div>
          )}
        </>
      )}

      {passo === PASSO.PLANTA && (
        <>
          <h2 className="tituloTela">Envie a planta do ambiente</h2>
          <p className="subtituloTela">Como você já tem a planta, a HomeHub não precisa mandar um técnico medir. Isso vira desconto no orçamento.</p>
          {app.plantaImagem && <img className="prevImg" src={app.plantaImagem} alt="Planta" />}
          <label className="soltaArquivo">
            <b>{app.plantaImagem ? "Trocar planta" : "Enviar planta baixa"}</b>
            <span>Imagem ou PDF</span>
            <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={(e) => onArquivo(e, "planta")} />
          </label>
          <label className="rotuloSecao">Medidas do espaço do móvel (cm), opcional</label>
          <div className="linhaMedidas">
            <input type="number" placeholder="Largura" value={medidas.largura} onChange={(e) => setMedidas({ ...medidas, largura: e.target.value })} />
            <input type="number" placeholder="Profund." value={medidas.profundidade} onChange={(e) => setMedidas({ ...medidas, profundidade: e.target.value })} />
            <input type="number" placeholder="Pé-direito" value={medidas.altura} onChange={(e) => setMedidas({ ...medidas, altura: e.target.value })} />
          </div>
          <div className="ctaFixo">
            <button className="btPrimario" disabled={!app.plantaImagem} onClick={confirmarPlanta}>Continuar</button>
          </div>
        </>
      )}

      {passo === PASSO.MANUAL && (
        <>
          <h2 className="tituloTela">Medidas do espaço do móvel</h2>
          <p className="subtituloTela">
            {preSelecionado
              ? `Não precisa medir o ambiente inteiro — só o vão onde ${preSelecionado.nome} vai ficar: a parede ou o espaço livre disponível para o móvel.`
              : "Móvel planejado é feito sob medida pro espaço dele, não pro ambiente inteiro. Informe a largura, profundidade e altura do vão disponível."}
          </p>
          <label className="rotuloSecao">Largura do vão disponível (cm)</label>
          <input className="inputCheio" type="number" placeholder="Ex.: 320" value={medidas.largura} onChange={(e) => setMedidas({ ...medidas, largura: e.target.value })} />
          <label className="rotuloSecao">Profundidade do espaço (cm)</label>
          <input className="inputCheio" type="number" placeholder="Ex.: 250" value={medidas.profundidade} onChange={(e) => setMedidas({ ...medidas, profundidade: e.target.value })} />
          <label className="rotuloSecao">Pé-direito / altura disponível (cm)</label>
          <input className="inputCheio" type="number" placeholder="Ex.: 270" value={medidas.altura} onChange={(e) => setMedidas({ ...medidas, altura: e.target.value })} />
          <div className="ctaFixo">
            <button className="btPrimario" disabled={!medidas.largura || !medidas.altura} onClick={confirmarManual}>Confirmar medidas</button>
          </div>
        </>
      )}

      {passo === PASSO.MEDIDO && (a || app.origemMedida === "planta") && (
        <>
          <h2 className="tituloTela">Ambiente medido {app.origemMedida === "ia" ? <span className="tagIA">IA de visão</span> : app.origemMedida === "demo" ? <span className="tagCalc">demonstração</span> : app.origemMedida === "planta" ? <span className="tagCalc">pela planta enviada</span> : <span className="tagCalc">informado por você</span>}</h2>
          {a ? (
            <div className="cartaoResumo">
              <div className="linhaResumo"><span>Largura</span><b>{a.largura} cm</b></div>
              <div className="linhaResumo"><span>Profundidade</span><b>{a.profundidade} cm</b></div>
              <div className="linhaResumo"><span>Pé-direito</span><b>{a.altura} cm</b></div>
            </div>
          ) : (
            <div className="cartaoResumo">
              <div className="linhaResumo"><span>Planta baixa</span><b>Recebida</b></div>
            </div>
          )}
          {(app.origemMedida === "manual" || app.origemMedida === "planta") && (
            <div className="cartao bom"><h4>Sem custo de visita técnica</h4><p>Você já enviou a medida (planta ou digitada). A taxa de medição não entra no orçamento.</p></div>
          )}
          <div className="cartao">
            <h4>Próximo passo: seu orçamento sob medida</h4>
            <p>Agora que o ambiente está medido, descreva como você quer o móvel (estilo, portas, prateleiras, cor) e a IA monta o orçamento com base nas medidas e nas suas especificações.</p>
          </div>
          <div className="ctaFixo">
            <button className="btPrimario" onClick={solicitarOrcamento}>Ver móveis que cabem →</button>
            <button className="btSecundario" onClick={() => setPasso(PASSO.INTRO)}>Refazer medida</button>
          </div>
        </>
      )}

      {passo === PASSO.CATALOGO && (
        <>
          <h2 className="tituloTela">{vao ? `O que cabe no seu vão de ${vao} cm` : "Escolha o móvel"}</h2>
          {!vao && <div className="cartao alerta"><p>Medida exata ainda pendente de validação. Mostrando o catálogo completo.</p></div>}
          {catalogoMoveis.map((p) => {
            const cabe = !vao || p.l <= vao;
            return (
              <button key={p.id} className={"produtoCard largo" + (app.produtoAtual?.id === p.id ? " sel" : "")}
                disabled={!cabe} onClick={() => app.setProdutoAtual(p)}>
                <div className="produtoImg foto" style={{ backgroundImage: `url(${p.img})` }} />
                <div className="produtoInfo">
                  <b>{p.nome}</b>
                  <span className="produtoDesc">{p.l} × {p.p} × {p.a} cm. {p.desc}</span>
                  <span className="produtoPreco">{brl0(p.valor)}</span>
                  {vao && <span className={"tagCabe " + (cabe ? "sim" : "nao")}>{cabe ? `cabe, sobram ${vao - p.l} cm` : "não cabe"}</span>}
                </div>
              </button>
            );
          })}
          <div className="ctaFixo">
            <button className="btPrimario" disabled={!app.produtoAtual} onClick={adicionarMovelAoCarrinho}>Continuar</button>
          </div>
        </>
      )}

      {passo === PASSO.CONFIRMA && app.produtoAtual && (() => {
        const p = app.produtoAtual;
        const cabe = !vao || !p.l || p.l <= vao;
        return (
          <>
            <h2 className="tituloTela">Conferindo o espaço</h2>
            <div className="produtoCard largo sel" style={{ pointerEvents: "none" }}>
              <div className="produtoImg foto" style={{ backgroundImage: `url(${p.img})` }} />
              <div className="produtoInfo">
                <b>{p.nome}</b>
                <span className="produtoDesc">{p.l ? `${p.l} × ${p.p} × ${p.a} cm. ` : ""}{p.desc}</span>
                <span className="produtoPreco">{brl0(p.valor)}</span>
                {vao && p.l && <span className={"tagCabe " + (cabe ? "sim" : "nao")}>{cabe ? `cabe no espaço, sobram ${vao - p.l} cm` : "não cabe no espaço medido"}</span>}
              </div>
            </div>
            {cabe ? (
              <div className="cartao bom"><h4>Esse móvel cabe no seu espaço</h4><p>As medidas informadas são compatíveis. A medição final é confirmada na execução.</p></div>
            ) : (
              <div className="cartao alerta"><h4>Esse móvel não cabe no espaço medido</h4><p>Escolha outra opção do catálogo que caiba no vão disponível.</p></div>
            )}
            <div className="ctaFixo">
              <button className="btPrimario" disabled={!cabe} onClick={adicionarMovelAoCarrinho}>Adicionar ao carrinho</button>
              <button className="btSecundario" onClick={() => setPasso(PASSO.CATALOGO)}>Ver outras opções que cabem</button>
            </div>
          </>
        );
      })()}

      {passo === PASSO.RESUMO && app.produtoAtual && (
        <>
          <h2 className="tituloTela">{app.produtoAtual.nome}</h2>
          <div className="cartaoResumo">
            <div className="linhaResumo"><span>Móvel planejado</span><b>{brl(app.produtoAtual.valor)}</b></div>
            <div className="linhaResumo"><span>Montagem e medição</span><b>{brl(app.produtoAtual.montagem)}</b></div>
            <div className="linhaResumo total"><span>Total</span><b>{brl(app.produtoAtual.valor + app.produtoAtual.montagem)}</b></div>
          </div>
          <div className="cartao bom"><h4>Adicionado ao carrinho</h4><p>Você pode continuar comprando ou fechar o pedido.</p></div>
          <div className="ctaFixo">
            <button className="btPrimario" onClick={() => nav("/carrinho")}>Ver carrinho</button>
            <button className="btSecundario" onClick={() => nav("/categoria/moveis-planejados")}>Continuar comprando</button>
          </div>
        </>
      )}
    </AppFrame>
  );
}
