# HomeHub — App do cliente (protótipo)

App mobile real, sem painel de explicações ao lado. Abra no celular (ou escaneie o QR code do link
publicado) e navegue como num aplicativo de verdade: início com categorias, carrinho, login, checkout
com endereço e pagamento, e o fluxo de **Projeto Completo** com duas IAs reais.

## Como navegar

1. **Início** — banner de frete, destaque para "Projeto Completo", grade com as 11 categorias reais do
   catálogo HomeHub, lista de serviços (Montagem, Consultoria, Entrega Expressa).
2. **Categorias comuns** (Decoração, Cozinha, Pisos...) — listagem de produtos → detalhe → adicionar ao
   carrinho, como qualquer loja.
3. **Projeto Completo** (o caminho fundo, com IA real):
   - **Concierge conversacional** — o cliente descreve o que quer em linguagem natural; um modelo de
     linguagem real extrai o briefing (ambiente, orçamento, estilo, prazo).
   - **Medida** — três caminhos: foto com IA de visão real, upload de planta/medidas já levantadas (sem IA,
     com desconto de R$ 180 pela visita técnica evitada), ou análise de demonstração.
   - **Escolha** — catálogo filtrado pelo espaço medido.
   - **Resumo** — orçamento fechado, prazo com garantia, "adicionar ao carrinho".
4. **Carrinho e checkout** — mesmo carrinho para produtos comuns e Projeto Completo. Checkout pede nome,
   CPF, endereço completo, depois forma de pagamento (à vista, cartão, ou encaminhamento a um agente de
   crédito parceiro — a HomeHub nunca aprova crédito).
5. **Confirmação e Meus Pedidos** — acompanhamento do pedido e o plano de Reforma em Etapas (a HomeHub
   sugere a próxima etapa da reforma ao concluir a atual).
6. **Suporte especializado** — botão flutuante em qualquer tela, chat com IA real. Não faz parte da
   conversão nem do business case — existe porque 53,2% dos detratores da base reclamam de falta de
   orientação técnica.
7. **Painel HomeHub** (interno, dentro de Perfil → "Painel HomeHub") — a quarta aplicação de IA, e a única
   que não atende o cliente: recomenda, com raciocínio em linguagem natural, para qual região a Fase 2 do
   roadmap deveria expandir primeiro. Os números de cada região são simulados a partir da base atual, com
   aviso claro na tela — na Fase 2 real, entram números medidos no piloto.

## O que é IA de verdade, e o que é regra de negócio

| Tela | Mecanismo |
|---|---|
| Concierge | IA real (modelo de linguagem) |
| Medida (caminho foto) | IA real (modelo de visão) |
| Medida (caminho planta/manual) | Sem IA — dado informado pelo cliente |
| Suporte especializado | IA real (modelo de linguagem) |
| Painel HomeHub — priorização de expansão | IA real (modelo de linguagem), uso interno |
| Escolha filtrada pelo vão | Regra determinística (comparação numérica) |
| Desconto à vista, parcelamento, desconto por medida própria | Regra de negócio fixa |
| Encaminhamento a crédito | Handoff para parceiro — a IA não decide |

## O que está aqui

- `src/` — o app React (Vite)
- `netlify/functions/assistente.js` — função de servidor única (dois modos: `concierge` e `suporte`)
- `netlify/functions/analisar.js` — função de servidor para a IA de visão (medição)
- `netlify.toml` — configuração de build e das rotas

## Publicar em 10 minutos: GitHub + Netlify

### 1. Subir para o GitHub

```bash
cd homehub-app
git init
git add .
git commit -m "App HomeHub - protótipo"
git remote add origin https://github.com/SEU-USUARIO/homehub-prototipo.git
git branch -M main
git push -u origin main
```

### 2. Conectar no Netlify

1. app.netlify.com → **Add new site → Import an existing project**
2. Escolha **GitHub**, selecione o repositório
3. O `netlify.toml` já configura tudo — clique em **Deploy site**

### 3. Configurar sua chave de API

1. **Site configuration → Environment variables → Add a variable**
2. Nome: `ANTHROPIC_API_KEY`, Valor: sua chave (`sk-ant-...`)
3. **Deploys → Trigger deploy → Deploy site**

Pronto — gere um QR code para a URL publicada (`algo.netlify.app`) e aponte a câmera do celular.

## Rodar localmente antes de publicar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173` — mas **abra pelo celular ou reduza a janela do navegador** para ver em
formato mobile (o layout é feito para até 430px de largura). Concierge, suporte e medida por IA **não
funcionam local** — dependem da função de servidor. Use os botões "Usar exemplo pronto" / "Usar análise
de demonstração" nessas telas.

Para testar as IAs também localmente:

```bash
npm install -g netlify-cli
netlify dev
```

Crie um `.env` na raiz com `ANTHROPIC_API_KEY=sk-ant-...` antes de rodar — já está no `.gitignore`.
