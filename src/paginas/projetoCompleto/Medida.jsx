import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Ruler, Map, ClipboardList } from "lucide-react";
import { useApp } from "../../contexto/AppState";
import AppFrame from "../../componentes/AppFrame";
import { REFERENCIAS, ANALISE_DEMO, AMBIENTES } from "../../dados/homehub";

const MODO = { ESCOLHA: 0, PLANTA_COMPLETA: 1, POR_AMBIENTE: 2 };
const SUB = { ESCOLHA: 0, FOTO: 1, MANUAL: 2, PLANTA: 3 };

export default function Medida() {
  const nav = useNavigate();
  const app = useApp();
  const [modo, setModo] = useState(MODO.ESCOLHA);
  const [indice, setIndice] = useState(0);
  const [sub, setSub] = useState(SUB.ESCOLHA);
  const [carregando, setCarregando] = useState(false);

  // estado local do ambiente em andamento (não mistura com o fluxo de Móveis Planejados)
  const [imagem, setImagem] = useState(null);
  const [mime, setMime] = useState(null);
  const [referencia, setReferencia] = useState(REFERENCIAS[0]);
  const [analise, setAnalise] = useState(null);
  const [modoDemo, setModoDemo] = useState(false);
  const [erro, setErro] = useState(null);
  const [medidas, setMedidas] = useState({ largura: "", profundidade: "", altura: "" });
  const [plantaImg, setPlantaImg] = useState(null);

  const lista = AMBIENTES.filter((a) => app.ambientesSelecionados.includes(a.id));
  const ambienteAtual = lista[indice];
  const restantes = lista.length - Object.keys(app.medidasPorAmbiente).length;

  function limparEstadoLocal() {
    setImagem(null); setMime(null); setAnalise(null); setModoDemo(false); setErro(null);
    setMedidas({ largura: "", profundidade: "", altura: "" }); setPlantaImg(null); setSub(SUB.ESCOLHA);
  }

  function avancarAmbiente() {
    limparEstadoLocal();
    if (indice + 1 < lista.length) { setIndice(indice + 1); }
    else { nav("/projeto-completo/escolha"); }
  }

  function onArquivoPlantaCompleta(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => app.setPlantaCompleta(r.result);
    r.readAsDataURL(f);
  }

  function onArquivoFoto(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setImagem(r.result); setMime(f.type); setAnalise(null); setErro(null); setModoDemo(false); };
    r.readAsDataURL(f);
  }

  function onArquivoPlantaAmbiente(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setPlantaImg(r.result);
    r.readAsDataURL(f);
  }

  async function analisarFoto() {
    setCarregando(true); setErro(null);
    try {
      const b64 = imagem.split(",")[1];
      const resp = await fetch("/api/analisar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagem: b64, mime, referenciaNome: referencia.nome, referenciaCm: referencia.cm }),
      });
      if (!resp.ok) { const t = await resp.text().catch(() => ""); throw new Error(`status ${resp.status}. ${t}`.trim()); }
      const dados = await resp.json();
      if (!dados.vao || !dados.largura) throw new Error("resposta incompleta");
      if (!Array.isArray(dados.obstrucoes)) dados.obstrucoes = [String(dados.obstrucoes || "nenhuma identificada")];
      setAnalise(dados); setModoDemo(false);
    } catch (e) {
      setErro(e.message + ". O protótipo depende de conexão com o modelo de visão.");
    } finally {
      setCarregando(false);
    }
  }

  function usarDemo() { setAnalise(ANALISE_DEMO); setModoDemo(true); setErro(null); }

  function salvarFoto() {
    app.setMedidaAmbiente(ambienteAtual.id, { origem: "foto", imagem, analise, modoDemo });
    avancarAmbiente();
  }

  function salvarManual() {
    const v = Number(medidas.largura);
    if (!v || v < 30) return;
    app.setMedidaAmbiente(ambienteAtual.id, {
      origem: "manual",
      medidaManual: { largura: v, profundidade: Number(medidas.profundidade) || null, altura: Number(medidas.altura) || null },
    });
    avancarAmbiente();
  }

  function salvarPlantaAmbiente() {
    if (!plantaImg) return;
    app.setMedidaAmbiente(ambienteAtual.id, { origem: "planta", plantaImagem: plantaImg });
    avancarAmbiente();
  }

  // ---- passo 0: planta única da casa toda, ou ambiente por ambiente ----
  if (modo === MODO.ESCOLHA) {
    return (
      <AppFrame titulo="Projeto Completo" comNavInferior={false}>
        <div className="passoIndicador"><i className="feito" /><i className="ativo" /><i /><i /><i /></div>
        <h2 className="tituloTela">Como você quer enviar as medidas?</h2>
        <p className="subtituloTela">Você escolheu {lista.length} {lista.length === 1 ? "ambiente" : "ambientes"}. Dá pra mandar uma planta única que cobre tudo, ou medir ambiente por ambiente.</p>

        <button className="opcaoMedida" onClick={() => setModo(MODO.PLANTA_COMPLETA)}>
          <span className="opcaoMedidaIcone"><Map size={20} strokeWidth={1.6} /></span>
          <span className="opcaoMedidaTexto"><b>Enviar uma planta baixa completa</b><span>Uma imagem ou PDF que já cobre todos os ambientes selecionados</span></span>
        </button>
        <button className="opcaoMedida" onClick={() => setModo(MODO.POR_AMBIENTE)}>
          <span className="opcaoMedidaIcone"><ClipboardList size={20} strokeWidth={1.6} /></span>
          <span className="opcaoMedidaTexto"><b>Ambiente por ambiente</b><span>Para cada ambiente, foto, medidas digitadas ou planta individual</span></span>
        </button>
      </AppFrame>
    );
  }

  // ---- planta única para toda a casa/apartamento/escritório ----
  if (modo === MODO.PLANTA_COMPLETA) {
    return (
      <AppFrame titulo="Projeto Completo" voltar={() => setModo(MODO.ESCOLHA)} comNavInferior={false}>
        <div className="passoIndicador"><i className="feito" /><i className="ativo" /><i /><i /><i /></div>
        <h2 className="tituloTela">Planta baixa completa</h2>
        <p className="subtituloTela">Envie a planta do imóvel inteiro, cobrindo {lista.map((a) => a.nome.toLowerCase()).join(", ")}. Ela já é suficiente pra seguir.</p>

        {app.plantaCompleta && <img className="prevImg" src={app.plantaCompleta} alt="Planta enviada" />}
        <label className="soltaArquivo">
          <b>{app.plantaCompleta ? "Trocar planta" : "Enviar planta baixa completa"}</b>
          <span>Toque para escolher uma imagem ou PDF</span>
          <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={onArquivoPlantaCompleta} />
        </label>

        {app.plantaCompleta && (
          <div className="cartao bom" style={{ marginTop: 14 }}>
            <h4>Desconto pela visita técnica evitada</h4>
            <p>Com a planta completa, a HomeHub não precisa enviar um técnico para medir cada ambiente. O valor da medição sai do orçamento.</p>
          </div>
        )}

        <div className="ctaFixo">
          <button className="btPrimario" disabled={!app.plantaCompleta} onClick={() => nav("/projeto-completo/escolha")}>
            Continuar
          </button>
        </div>
      </AppFrame>
    );
  }

  // ---- ambiente por ambiente ----
  if (!ambienteAtual) { nav("/projeto-completo/escolha"); return null; }

  const jaFeito = app.medidasPorAmbiente[ambienteAtual.id];

  if (jaFeito && sub === SUB.ESCOLHA) {
    return (
      <AppFrame titulo="Projeto Completo" comNavInferior={false}>
        <div className="passoIndicador"><i className="feito" /><i className="ativo" /><i /><i /><i /></div>
        <h2 className="tituloTela">{ambienteAtual.nome} <span className="tagCalc">medido</span></h2>
        <div className="cartaoResumo">
          <div className="linhaResumo"><span>Origem</span><b>{jaFeito.origem === "foto" ? "foto com IA" : jaFeito.origem === "manual" ? "medidas digitadas" : "planta baixa"}</b></div>
        </div>
        <div className="ctaFixo">
          <button className="btPrimario" onClick={avancarAmbiente}>
            {indice + 1 < lista.length ? "Próximo ambiente" : "Continuar para o catálogo"}
          </button>
          <button className="btSecundario" onClick={() => { app.setMedidasPorAmbiente((m) => { const c = { ...m }; delete c[ambienteAtual.id]; return c; }); limparEstadoLocal(); }}>
            Refazer medida deste ambiente
          </button>
        </div>
      </AppFrame>
    );
  }

  if (sub === SUB.ESCOLHA) {
    return (
      <AppFrame titulo="Projeto Completo" comNavInferior={false}>
        <div className="passoIndicador"><i className="feito" /><i className="ativo" /><i /><i /><i /></div>
        <p className="subtituloTela">Ambiente {indice + 1} de {lista.length}{restantes > 0 ? ` · faltam ${restantes}` : ""}</p>
        <h2 className="tituloTela">Como medir: {ambienteAtual.nome}?</h2>

        <button className="opcaoMedida" onClick={() => setSub(SUB.FOTO)}>
          <span className="opcaoMedidaIcone"><Camera size={20} strokeWidth={1.6} /></span>
          <span className="opcaoMedidaTexto"><b>Fotografar o ambiente</b><span>IA de visão estima as medidas pela foto</span></span>
        </button>
        <button className="opcaoMedida" onClick={() => setSub(SUB.MANUAL)}>
          <span className="opcaoMedidaIcone"><Ruler size={20} strokeWidth={1.6} /></span>
          <span className="opcaoMedidaTexto"><b>Digitar as medidas</b><span>Se você já sabe largura, profundidade e pé-direito</span></span>
        </button>
        <button className="opcaoMedida" onClick={() => setSub(SUB.PLANTA)}>
          <span className="opcaoMedidaIcone"><Map size={20} strokeWidth={1.6} /></span>
          <span className="opcaoMedidaTexto"><b>Enviar planta deste ambiente</b><span>Uma planta baixa só deste cômodo</span></span>
        </button>
      </AppFrame>
    );
  }

  if (sub === SUB.MANUAL) {
    const pode = medidas.largura && Number(medidas.largura) >= 30;
    return (
      <AppFrame titulo="Projeto Completo" voltar={() => setSub(SUB.ESCOLHA)} comNavInferior={false}>
        <div className="passoIndicador"><i className="feito" /><i className="ativo" /><i /><i /><i /></div>
        <h2 className="tituloTela">Medidas de {ambienteAtual.nome} (cm)</h2>
        <div className="linhaMedidas">
          <input type="number" placeholder="Largura" value={medidas.largura} onChange={(e) => setMedidas({ ...medidas, largura: e.target.value })} />
          <input type="number" placeholder="Profund." value={medidas.profundidade} onChange={(e) => setMedidas({ ...medidas, profundidade: e.target.value })} />
          <input type="number" placeholder="Pé-direito" value={medidas.altura} onChange={(e) => setMedidas({ ...medidas, altura: e.target.value })} />
        </div>
        <div className="cartao bom" style={{ marginTop: 14 }}>
          <h4>Desconto pela visita técnica evitada</h4>
          <p>Com a medida digitada, a medição profissional deste ambiente sai do orçamento.</p>
        </div>
        <div className="ctaFixo">
          <button className="btPrimario" disabled={!pode} onClick={salvarManual}>Salvar e continuar</button>
        </div>
      </AppFrame>
    );
  }

  if (sub === SUB.PLANTA) {
    return (
      <AppFrame titulo="Projeto Completo" voltar={() => setSub(SUB.ESCOLHA)} comNavInferior={false}>
        <div className="passoIndicador"><i className="feito" /><i className="ativo" /><i /><i /><i /></div>
        <h2 className="tituloTela">Planta de {ambienteAtual.nome}</h2>
        {plantaImg && <img className="prevImg" src={plantaImg} alt="Planta enviada" />}
        <label className="soltaArquivo">
          <b>{plantaImg ? "Trocar planta" : "Enviar planta deste ambiente"}</b>
          <span>Toque para escolher uma imagem ou PDF</span>
          <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={onArquivoPlantaAmbiente} />
        </label>
        <div className="ctaFixo">
          <button className="btPrimario" disabled={!plantaImg} onClick={salvarPlantaAmbiente}>Salvar e continuar</button>
        </div>
      </AppFrame>
    );
  }

  // ---- foto com IA de visão ----
  return (
    <AppFrame titulo="Projeto Completo" voltar={() => setSub(SUB.ESCOLHA)} comNavInferior={false}>
      <div className="passoIndicador"><i className="feito" /><i className="ativo" /><i /><i /><i /></div>
      <h2 className="tituloTela">Fotografe: {ambienteAtual.nome}</h2>

      {!analise && !carregando && !erro && (
        <>
          <p className="subtituloTela">Enquadre a parede inteira e inclua um objeto de tamanho conhecido para servir de escala.</p>
          {imagem && <img className="prevImg" src={imagem} alt="Foto enviada" />}
          <label className="soltaArquivo">
            <b>{imagem ? "Trocar foto" : "Enviar foto do ambiente"}</b>
            <span>Toque para escolher uma imagem</span>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={onArquivoFoto} />
          </label>
          <label className="rotuloSecao">Objeto de referência visível na foto</label>
          <select value={referencia.nome} onChange={(e) => setReferencia(REFERENCIAS.find((r) => r.nome === e.target.value))}>
            {REFERENCIAS.map((r) => <option key={r.nome}>{r.nome}</option>)}
          </select>
          <div className="ctaFixo">
            <button className="btPrimario" disabled={!imagem} onClick={analisarFoto}>Analisar ambiente</button>
            <button className="btSecundario" onClick={usarDemo}>Usar análise de demonstração</button>
          </div>
        </>
      )}

      {carregando && <div className="carregando"><div className="pulso" /><p>Analisando a imagem e estimando as dimensões</p></div>}

      {erro && !carregando && (
        <>
          <div className="cartao alerta"><h4>Não foi possível analisar</h4><p>{erro}</p></div>
          <div className="ctaFixo"><button className="btPrimario" onClick={usarDemo}>Usar análise de demonstração</button></div>
        </>
      )}

      {analise && !carregando && (
        <>
          <h3 className="secaoTitulo" style={{ marginTop: 0 }}>
            Ambiente medido {modoDemo ? <span className="tagCalc">demonstração</span> : <span className="tagIA">modelo de visão</span>}
          </h3>
          <div className="cartaoResumo">
            <div className="linhaResumo"><span>Largura da parede</span><b>{analise.largura} cm</b></div>
            <div className="linhaResumo"><span>Pé-direito estimado</span><b>{analise.altura} cm</b></div>
            <div className="linhaResumo total"><span>Vão aproveitável</span><b>{analise.vao} cm</b></div>
          </div>
          <div className="cartao alerta"><h4>Precisão declarada</h4>
            <p>Confiança {analise.confianca}. Estimativa de ordem centimétrica, a medição profissional segue existindo na execução.</p></div>
          <div className="ctaFixo">
            <button className="btPrimario" onClick={salvarFoto}>Salvar e continuar</button>
          </div>
        </>
      )}
    </AppFrame>
  );
}
