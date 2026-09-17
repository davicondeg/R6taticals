# R6 Hub

Hub visual de estratégias para Rainbow Six Siege: mapa → lado → tamanho do grupo → bomb site → operadores.

## Executar localmente

O navegador precisa acessar o projeto por um servidor local para que o arquivo JSON seja carregado.

```powershell
python -m http.server 4173
```

Depois, acesse `http://localhost:4173`.

## Estrutura

- `index.html`: estrutura da tela inicial.
- `assets/css/styles.css`: identidade visual e responsividade.
- `assets/js/app.js`: carregamento, busca e fluxo completo de seleção.
- `assets/css/operators.css`: cards de operadores e bomb sites.
- `assets/images/maps`: imagens AVIF usadas nos cards.
- `assets/images/operators`: montagens de ataque e defesa para os retratos dos cards.
- `data/maps.json`: dados exibidos pela interface.
- `data/bomb-sites.json`: nomes, andares e callouts dos bomb sites; aceita imagem opcional por local.
- `data/operators.json`: operadores por lado e coordenadas de recorte das montagens.
- `docs/contexto`: contexto e decisões do produto.
