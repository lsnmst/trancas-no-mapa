# Tranças no Mapa — Arquivo das Tranças

Mapa interativo do mapeamento nacional das trancistas brasileiras (2021 /
2023 / 2026) e seu registro iconográfico. Vite + Svelte + Leaflet.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173/trancas-no-mapa/` (o `base` do Vite já está
configurado para bater com o path do GitHub Pages — ver `vite.config.js`).

Sem nenhuma configuração extra, o app roda com o **snapshot local**
(`src/lib/data/dataset.json`), gerado a partir do CSV que você exportou do
Kobo. 638 dos 645 registros do CSV entraram nesse snapshot; 7 foram
descartados por terem `estado`/coordenadas corrompidos na exportação
(`2023_36`, `2023_55`, `2023_87`, `2026_150`, `2026_165`, `2026_295`,
`2026_328` — vale conferir esses direto no Kobo).

O snapshot **não tem fotos** (o CSV exportado não traz anexos) — a galeria
só aparece preenchida quando o modo "ao vivo" (Kobo) está ativo.

## Ativando os dados em tempo real (Kobo)

O app nunca fala com a API do Kobo diretamente do navegador (o token
ficaria exposto). Ele fala com um Cloudflare Worker que você hospeda, que
por sua vez fala com o Kobo usando o token guardado como secret.

### 1. Deploy do worker

```bash
cd worker
npx wrangler deploy
npx wrangler secret put KOBO_TOKEN   # cole o token do Kobo quando pedido
```

Confira/ajuste em `worker/wrangler.toml`:
- `KOBO_ASSET_UID` — já está com `ac95zLVxtHiKLZvE4y3Sv8` (o formulário
  citado no mockup). Troque se o UID mudar.
- `ALLOWED_ORIGIN` — já está com `https://lsnmst.github.io`; ajuste se o
  domínio final for outro.

O worker expõe:
- `GET /` → `{ count, results: [...envios brutos do Kobo] }` (pagina
  automaticamente por todos os envios do formulário)
- `GET /api/media?url=...` → repassa uma imagem anexada, autenticado

### 2. Apontar o app pro worker

Crie um `.env.local` na raiz (não é commitado):

```
VITE_KOBO_PROXY_URL=https://trancas-no-mapa-kobo-proxy.SEU-SUBDOMINIO.workers.dev
```

Com essa variável definida, `initData()` (`src/lib/stores/dataStore.js`)
busca do Kobo ao carregar; se a busca falhar por qualquer motivo, cai de
volta pro snapshot local automaticamente (e mostra isso na barra amarela
de baixo: "amostra local" vs "dados em tempo real · kobo").

Ao fazer o deploy de produção (GitHub Actions, Cloudflare Pages, etc.),
defina a mesma variável de ambiente lá.

## Deploy no GitHub Pages

```bash
npm run build
```

Isso gera `dist/` já com todos os caminhos prefixados por
`/trancas-no-mapa/`, batendo com `https://lsnmst.github.io/trancas-no-mapa/`.
Publique o conteúdo de `dist/` na branch/ação que você já usa pro Pages
(ex.: `gh-pages` ou um workflow do Actions com `actions/deploy-pages`).

Se algum dia o repositório mudar de nome, rode o build com
`VITE_BASE=/novo-nome/ npm run build` (ou edite o default em
`vite.config.js`).

## Estrutura

```
src/
  App.svelte                 # roteamento: Home / Estado / Cidade
  lib/
    api/kobo.js               # cliente do worker proxy
    data/
      estados.js              # nomes, siglas, offsets de rótulo p/ estados pequenos
      brazil-states.geo.json  # geometria dos 26 estados + DF
      dataset.json            # snapshot gerado do CSV
    stores/
      dataStore.js            # carrega live-ou-snapshot
      routeStore.js            # router baseado em History API
    utils/
      koboFields.js            # rótulos/ordem das opções (onde, geração, etc.)
      parseKobo.js              # normaliza um envio bruto do Kobo
      aggregate.js               # contagens por estado/cidade, % pros gráficos
      geo.js                      # bbox, centróide, ponto-dentro-do-polígono
    components/
      BrazilMap.svelte           # página 1
      StateCityMap.svelte         # mapa usado nas páginas 2/3 e 4
      Sidebar.svelte, BottomBar.svelte, StatsPanel.svelte,
      CircleChart.svelte, Gallery.svelte
    views/
      HomeView.svelte, MapView.svelte
worker/
  index.js            # Cloudflare Worker (proxy Kobo + mídia)
  wrangler.toml
```

## Decisões de design (e as perguntas abertas do mockup)

- **Distrito Federal e estados pequenos com números de 3 dígitos**: o
  selo de contagem é desenhado num ponto deslocado do centróide
  (`ESTADOS[...].labelOffset` em `src/lib/data/estados.js`), ligado por uma
  linha guia pontilhada até o estado real. Ajuste os offsets ali se algum
  número ainda ficar apertado.
- **Pontos fora da fronteira do estado** (página do estado/cidade): em vez
  de esconder, ficam com um estilo "apagado" (cinza, menor, mais
  transparente) — calculado com um point-in-polygon simples em
  `src/lib/utils/geo.js`, sem depender do turf.
- **Zoom livre até a escala da cidade, mas preso ao estado**: cada mapa
  calcula `fitBounds` e usa esse zoom resultante como `minZoom`, permitindo
  ainda mais alguns níveis de zoom (`maxZoom`) e travando o pan com
  `maxBounds`.
- **Mapa sem tiles de fundo**: o mockup pede um mapa "limpo" (sem
  OpenStreetMap por trás), então o Leaflet é usado só pela geometria/
  interação, sem camada de tiles — evita também depender de um provedor de
  tiles externo em produção.

## Regenerando o snapshot a partir de um novo CSV

Não há script automatizado ainda — o `dataset.json` atual foi gerado uma
vez a partir do CSV exportado do Kobo (colunas com `;` como separador,
sub-colunas booleanas tipo `onde/Espaço coletivo ou comunitário`). Se quiser
regenerar, o mais simples é rodar o modo "ao vivo" (seção acima), que já
normaliza os dados na mesma forma — o snapshot é só uma rede de segurança
para quando o Kobo estiver fora do ar ou sem proxy configurado.
