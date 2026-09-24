import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexto/AppState";
import AppFrame from "../componentes/AppFrame";

function brl(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }

export default function Checkout() {
  const nav = useNavigate();
  const app = useApp();
  const [passo, setPasso] = useState(app.endereco ? 2 : 1);
  const [form, setForm] = useState(app.endereco || {
    nome: "", cpf: "", cep: "", rua: "", numero: "", bairro: "", cidade: "", uf: "",
  });

  function campo(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function salvarEndereco() {
    app.setEndereco(form);
    setPasso(2);
  }

  function confirmarPedido() {
    app.setPedidoConfirmado({
      numero: "HH" + Math.floor(100000 + Math.random() * 900000),
      total: app.totalCarrinho(),
      forma: app.formaPagamento,
      data: new Date(),
    });
    app.setCarrinho([]);
    nav("/confirmacao");
  }

  return (
    <AppFrame titulo="Fechar pedido" comNavInferior={false}>
      <div className="passosCheckout">
        <span className={passo >= 1 ? "ativo" : ""}>1. Endereço</span>
        <span className={passo >= 2 ? "ativo" : ""}>2. Pagamento</span>
      </div>

      {passo === 1 && (
        <div className="formCheckout">
          <label>Nome completo</label>
          <input value={form.nome} onChange={(e) => campo("nome", e.target.value)} placeholder="Seu nome" />
          <label>CPF</label>
          <input value={form.cpf} onChange={(e) => campo("cpf", e.target.value)} placeholder="000.000.000-00" />
          <label>CEP</label>
          <input value={form.cep} onChange={(e) => campo("cep", e.target.value)} placeholder="00000-000" />
          <div className="linhaDupla">
            <div><label>Rua</label><input value={form.rua} onChange={(e) => campo("rua", e.target.value)} /></div>
            <div className="curta"><label>Número</label><input value={form.numero} onChange={(e) => campo("numero", e.target.value)} /></div>
          </div>
          <label>Bairro</label>
          <input value={form.bairro} onChange={(e) => campo("bairro", e.target.value)} />
          <div className="linhaDupla">
            <div><label>Cidade</label><input value={form.cidade} onChange={(e) => campo("cidade", e.target.value)} /></div>
            <div className="curta"><label>UF</label><input value={form.uf} onChange={(e) => campo("uf", e.target.value)} maxLength={2} /></div>
          </div>
          <div className="ctaFixo">
            <button className="btPrimario" disabled={!form.nome || !form.rua} onClick={salvarEndereco}>Continuar para pagamento</button>
          </div>
        </div>
      )}

      {passo === 2 && (
        <div className="formCheckout">
          <div className="cartaoResumo">
            <div className="linhaResumo"><span>Entregar em</span><b>{form.rua}, {form.numero} — {form.cidade}/{form.uf}</b></div>
            <div className="linhaResumo total"><span>Total do pedido</span><b>{brl(app.totalCarrinho())}</b></div>
          </div>

          <label className="rotuloSecao">Como você prefere pagar</label>
          {[
            { id: "avista", nome: "Pix ou débito à vista", detalhe: "5% de desconto" },
            { id: "cartao", nome: "Cartão em até 12x", detalhe: "sem juros" },
            { id: "credito", nome: "Preciso de crédito", detalhe: "encaminhamento a parceiro financeiro" },
          ].map((op) => (
            <button key={op.id} className={"opcaoPagamento" + (app.formaPagamento === op.id ? " sel" : "")}
              onClick={() => app.setFormaPagamento(op.id)}>
              <b>{op.nome}</b>
              <span>{op.detalhe}</span>
            </button>
          ))}

          {app.formaPagamento === "credito" && (
            <div className="avisoCredito">
              <b>Você será direcionado a um parceiro financeiro</b>
              <p>A HomeHub não aprova nem nega crédito — a simulação e a decisão são do parceiro.</p>
            </div>
          )}

          <div className="ctaFixo">
            <button className="btPrimario" disabled={!app.formaPagamento} onClick={confirmarPedido}>
              {app.formaPagamento === "credito" ? "Continuar para o parceiro" : "Confirmar pedido"}
            </button>
          </div>
        </div>
      )}
    </AppFrame>
  );
}
