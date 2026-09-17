# Regras e limites já definidos

## Produto e conteúdo

- O foco inicial é o modo Ranked.
- Mapas, bomb sites, operadores, estratégias e informações do jogo devem ser tratados como dados atualizáveis, não espalhados diretamente pela interface.
- Uma estratégia precisa explicar a execução e a responsabilidade dos operadores; apenas listar uma composição não é suficiente.
- O conteúdo inicial será cadastrado manualmente.
- Materiais de terceiros podem servir como referência de estudo, respeitando autoria, licença e direitos de uso.
- Textos, imagens, plantas anotadas ou outros materiais protegidos não devem ser copiados automaticamente.
- O conteúdo publicado deve ser próprio ou utilizado com permissão adequada.

## Estrutura e evolução

- Um bomb site deve poder possuir várias estratégias no futuro.
- A arquitetura não deve pressupor a relação `1 bomb = 1 estratégia`.
- A estrutura de dados deve permitir futuras marcações visuais sobre plantas 2D.
- Mudanças do jogo, como reworks, novos operadores e alterações de meta, não devem exigir a reescrita da aplicação.
- Possibilidades futuras devem ser consideradas apenas quando evitarem um bloqueio estrutural óbvio; elas não devem ser implementadas prematuramente.

## Experiência

- A interface deve ser rápida, visual, limpa, intuitiva e organizada.
- O produto não deve parecer uma enciclopédia.
- Grandes blocos de texto não devem ser necessários para compreender uma estratégia.
- Informações secundárias devem poder ser reveladas progressivamente.

## Escopo atual

- A proposta anterior da tela inicial foi descartada e removida do projeto.
- A nova tela inicial usa cards visuais para a seleção de mapas.
- A fase atual é de implementação e validação da experiência inicial.
- O MVP será desenvolvido com HTML5, CSS3, JavaScript Vanilla e JSON.
- Não serão utilizados frameworks como React, Vue ou Angular nesta fase.
- Não serão implementados backend, banco de dados ou autenticação nesta fase.
- Supabase e Vercel são possibilidades futuras e não devem ser integrados sem autorização.
- Inteligência artificial não fará parte da dependência do MVP.
- Substituição de operadores e composição automática são funcionalidades futuras.
- Ainda não estão definidos nome final, origem definitiva das plantas e decisões futuras de backend, banco, hospedagem, autenticação ou administração.

## Governança de decisões

- Decisões importantes de produto não devem ser tomadas sem aprovação quando houver alternativas relevantes.
- Funcionalidades existentes não devem ser alteradas sem necessidade.
- Complexidade e abstrações sem necessidade atual devem ser evitadas.
