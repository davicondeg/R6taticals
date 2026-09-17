# Fluxo de seleção

Mapa → lado → tamanho do grupo → bomb site → táticas → detalhes da tática.

As táticas ficam em `data/tactics.json`. O primeiro cadastro, `Tisk Eu`, aparece para Clubhouse, Defesa e Quarteto. Enquanto o bombsite definitivo não for informado, `bombSiteIds: ["*"]` disponibiliza o plano para qualquer bombsite desse contexto. Sua composição inicial é Castle, Azami, Kaid e Tubarão; as funções individuais ainda serão cadastradas. Os cards do plano reutilizam os recortes da montagem de defesa definida em `data/operators.json` e esperam o arquivo `assets/images/operators/defense.png` nas dimensões originais de 1702 × 643 pixels. Cada retrato é exibido em 110 × 184 pixels, sem ampliação do print original.

Cada tática pode definir substituições encadeadas em `banReplacements`, com até três banimentos por formação. Na `Tisk Eu`, banir Castle coloca Thorn; banir Kaid coloca Bandit e banir Bandit em seguida coloca Mute no mesmo lugar. O histórico aparece acima da formação. Operadores sem substituto cadastrado não alteram a composição.

Os bomb sites ficam em `data/bomb-sites.json`, com nome em português, callout em inglês e código de andar do jogo (1F = térreo). Cards aceitam uma propriedade `image` opcional para futuras capturas do local. A imagem panorâmica é do mapa, não de um bomb site específico.

Os 78 operadores das montagens fornecidas pelo usuário ficam em `data/operators.json`. Os retratos usam recorte CSS das montagens originais; os nomes são texto HTML. Os arquivos esperados são `assets/images/operators/attack.png` e `assets/images/operators/defense.png`. Não ampliar nem recortar as montagens antes de salvá-las: os recortes dependem de suas proporções originais.

A seleção permite um operador por jogador, sem repetições. Voltar do grupo de operadores ao bomb site preserva a seleção; escolher outro bomb site limpa os operadores. Trocar o lado ou o tamanho do grupo também limpa a composição. A experiência termina com um resumo do grupo, pois estratégias ainda não foram cadastradas.

## Referências de cadastro dos bomb sites

Consultadas em 14/09/2026; nomes em português são rótulos de interface, não uma transcrição verificada da localização do jogo.

- https://github.com/wenchilin-m/r6-operator-tracker/blob/main/reference/maps.json — pares de ambientes de Banco, Café, Chalé, Clubhouse, Consulado, Fronteira, Nighthaven e Oregon.
- https://fpsjp.net/archives/549683 — plantas e andares de Cassino Calypso.
- https://alviran.net/blog/r6-kanal-callouts-guide-2026/ — pares de Kanal.
- https://alviran.net/blog/r6-theme-park-callouts-guide-2026/ — pares de Parque Temático.
- https://siege.gg/news/villa-to-replace-consulate-in-rainbow-six-sieges-competitive-map-pool — substituição de Biblioteca pelo bomb site do subsolo em Mansão.

Revisar estes dados quando houver mudanças de mapa.

## Imagens de identificação dos bomb sites

Em 14/09/2026, foram incorporadas quatro capturas do Clubhouse. A legenda de cada foto identifica o ambiente mostrado dentro do par de bombas. A ampliação para outros mapas está registrada abaixo.

Os quatro cards usam imagens de ambientes intactos do R6 Trainer, incluindo o Bar para padronizar o conjunto. São capturas de 2020, com arma e HUD; não representam a iluminação modernizada do Siege X. O crédito visível informa o ano. Fonte: https://www.r6trainer.com/callout-trainer/

- Quarto (par Academia / Quarto): https://www.r6trainer.com/wp-content/uploads/2020/07/pic_clubhouse10.jpg
- Cash: https://www.r6trainer.com/wp-content/uploads/2020/07/pic_clubhouse2.jpg
- Bar: https://www.r6trainer.com/wp-content/uploads/2020/07/pic_clubhouse22.jpg
- Church: https://www.r6trainer.com/wp-content/uploads/2020/07/pic_clubhouse37.jpg

Os nomes das quatro salas foram conferidos no catálogo público do Callout Trainer e as imagens foram inspecionadas visualmente. Servem para identificar o ambiente, não como instruções da estratégia do grupo. Não foi identificada licença aberta na página consultada; registrar a fonte não equivale a uma licença.

## Ampliação das imagens — 15/09/2026

Adicionadas 28 capturas do mesmo catálogo para Banco, Café, Chalé, Kanal, Mansão, Oregon e Parque Temático. Cada imagem foi conferida visualmente e associada a uma sala do par; corredores homônimos foram descartados. Os arquivos JPEG originais ficam no projeto, sem depender de carregamento externo.

São referências visuais de 2020, não uma validação da aparência ou geometria atual dos mapas. O catálogo registra os reworks de Chalé e Oregon de 2020: https://www.r6trainer.com/change-log/

Em 15/09/2026, Consulado e Fronteira foram corrigidos para quatro bombsites. Foram restaurados `Tellers/Servers` no Consulado e `Customs Inspection/Supply Room` na Fronteira; as rotações foram conferidas em https://stratbook.gg/maps/consulate, https://liquipedia.net/rainbowsix/Consulate, https://liquipedia.net/rainbowsix/Border e https://stratbook.gg/maps/border. Todos os 12 mapas cadastrados possuem quatro bombsites.

As imagens de Consulado, Fronteira, Laboratório Nighthaven e Cassino Calypso foram padronizadas com material da EAA FPS. Fontes: https://fpsjp.net/archives/451465, https://fpsjp.net/archives/384252, https://fpsjp.net/archives/434964 e https://fpsjp.net/archives/549683. Consulado e Laboratório usam vistas dos bombsites; Fronteira usa capturas dos ambientes pós-rework. No Cassino Calypso, a fonte oferece plantas por piso: os dois bombsites do 1F compartilham a mesma planta e são diferenciados pelo nome do card.

| Mapa | Ambiente exibido | Captura original |
| --- | --- | --- |
| cafe | Lounge de Coquetéis / Cocktail | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_kafe15.jpg |
| cafe | Sala de Leitura / Reading | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_kafe19.jpg |
| cafe | Sala de Mineração / Mining | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_kafe25.jpg |
| cafe | Cozinha / Cooking | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_kafe45.jpg |
| banco | Sala do CEO / CEO Office | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_bank8.jpg |
| banco | Área Aberta / Open Area | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_bank17.jpg |
| banco | Arquivos / Archives | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_bank64.jpg |
| banco | Armários / Lockers | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_bank74.jpg |
| chale | Quarto Principal / Master Bedroom | https://www.r6trainer.com/wp-content/uploads/2020/09/pic_chalet264.jpg |
| chale | Sala de Jogos / Gaming | https://www.r6trainer.com/wp-content/uploads/2020/09/pic_chalet239.jpg |
| chale | Sala de Jantar / Dining | https://www.r6trainer.com/wp-content/uploads/2020/09/pic_chalet227.jpg |
| chale | Adega / Wine Cellar | https://www.r6trainer.com/wp-content/uploads/2020/09/pic_chalet208.jpg |
| kanal | Servidores / Server | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_kanal61.jpg |
| kanal | Sala de Mapas / Map Room | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_kanal44.jpg |
| kanal | Guarda Costeira / Coast Guard | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_kanal19.jpg |
| kanal | Suprimentos / Supply | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_kanal6.jpg |
| parque | Creche / Day Care | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_themepark8.jpg |
| parque | Iniciação / Initiation | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_themepark26.jpg |
| parque | Sala do Trono / Throne | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_themepark43.jpg |
| parque | Laboratório / Lab | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_themepark55.jpg |
| mansao | Sala de Aviação / Aviator | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_villa27.jpg |
| mansao | Sala de Estátuas / Statuary | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_villa20.jpg |
| mansao | Sala de Jantar / Dining | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_villa67.jpg |
| mansao | Depósito de Arte / Art Storage | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_villa80.jpg |
| oregon | Dormitório / Dorm Main Hall | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_oregon57.jpg |
| oregon | Sala de Jantar / Dining | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_oregon34.jpg |
| oregon | Sala de Reuniões / Meeting | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_oregon41.jpg |
| oregon | Lavanderia / Laundry | https://www.r6trainer.com/wp-content/uploads/2020/07/pic_oregon13.jpg |
