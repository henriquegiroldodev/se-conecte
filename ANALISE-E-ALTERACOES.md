# Se Conecte: analise e melhoria da tela Aprender

> Histórico da evolução inicial. A etapa posterior de inclusão, voz, ajuda e Segurança Digital está documentada em [MELHORIAS-INCLUSAO-SEGURANCA.md](MELHORIAS-INCLUSAO-SEGURANCA.md), incluindo as novas integrações de progresso e as correções de tamanho de texto e navegação por teclado.

## Estrutura encontrada
- index.html: login, estrutura de navegacao, area principal e dialogo Meu Modo.
- assets/css/styles.css: tokens de cores, espacamento, bordas, componentes e breakpoints compartilhados. O Dashboard corresponde a rota inicio.
- assets/js/app.js: rotas por hash, renderizacao, eventos, progresso local e acessibilidade.
- assets/js/data.js: catalogo, categorias, usuario e vagas demonstrativos.
- backend/api.php e config.php: API PHP/PDO com login e consultas de cursos e vagas. A interface ainda nao consome a API.
- database/se_conecte.sql: estrutura de usuarios, preferencias, cursos, aulas, progresso, competencias e vagas.
- manifest.webmanifest e sw.js: base PWA com cache local. O manifest ainda nao possui icones.

## Alteracoes
- index.html: template semantico da tela Aprender com banner, categorias, busca, filtros, contador e catalogo. Sem scripts ou estilos novos embutidos.
- styles.css: estilos restritos a Aprender, usando os tokens e componentes existentes. Layout responsivo, selecao visivel, foco e suporte ao modo de acessibilidade existente.
- app.js: reutiliza courseCard e bar. Retoma a aula conforme percentual e numero de aulas, combina busca sem acentos com categoria e andamento, sincroniza categoria na URL e oferece limpeza de filtros e estado vazio.
- sw.js: cache v2 e limpeza de caches antigos do Se Conecte na ativacao. Uma aba existente pode precisar ser fechada para ativar a nova versao.

## Preservacao
Dashboard e demais fluxos foram mantidos. Sem framework novo, migracao de dados ou mudancas na API/banco. As telas antigas continuam usando seus templates JavaScript; a nova estrutura estatica de Aprender fica no HTML.

## Verificacao
Executada verificacao automatizada em Chrome headless com dados demonstrativos: catalogo inicial (4 cursos), busca sem acentos, nao iniciados, estado vazio de concluidos, categoria e URL, limpeza de filtros, link de retomada e renderizacao de todas as rotas existentes. Todas essas verificacoes passaram. PHP lint passou nos dois arquivos do backend. Nao foi realizada validacao visual em diferentes dispositivos nem integracao com MySQL.

## Pontos para continuar o desenvolvimento
- Login/cadastro e perfil no frontend sao demonstrativos. Integrar autenticacao real e persistencia com a API.
- XP, conquistas, passaporte e resultado do exercicio possuem valores demonstrativos; atualizar a partir de dados reais.
- A regra antiga de progresso das aulas usa blocos de 20%, independente da quantidade de aulas. A retomada nova usa o numero de aulas; unificar essa regra em uma etapa futura.
- O quiz apresenta uma pergunta e indica 1 de 3. Player, compartilhamento e oportunidades usam avisos demonstrativos.
- Leitura de JSON do armazenamento nao trata valores corrompidos. Tratar em evolucao de robustez.
- Completar os icones PWA e testar funcionamento offline, acessibilidade e backend antes da publicacao.

## Como conferir
Abra index.html, entre com o login preenchido e selecione Aprender. Para testar PWA, execute php -S localhost:8000 na pasta e abra http://localhost:8000.


## Correção de visibilidade e revisão das cinco telas

A regra `.auth { display: grid }` sobrescrevia a apresentação nativa do atributo `hidden`. Foi adicionada a regra global `[hidden] { display: none !important }`, preservando a alternância de autenticação já implementada. O teste anterior validava renderização, mas não verificava estilos computados; o novo teste cobre essa falha.

Início, Aprender, Meu progresso, Passaporte Digital e Oportunidades possuem rotas próprias e continuam reutilizando o mesmo Design System. A navegação agora identifica a tela em `main.dataset.page`, atualiza o título do documento e indica o item atual com `aria-current`. As telas de curso e aula mantêm Aprender selecionado. Foram corrigidas as iniciais duplicadas do cabeçalho e adicionados rótulos ao menu e à leitura de página.

Meu progresso mostra totais de cursos em andamento e concluídos e oferece um estado inicial sem cursos. As evidências do Passaporte usam os percentuais atuais dos cursos, em vez do percentual fixo anterior. Os demais números demonstrativos permanecem como descritos acima. A saída limpa o conteúdo do painel e encerra a leitura de voz. O cache da PWA passou para v3.

Verificação: 40 checagens passaram no Chrome em desktop e outras 40 em viewport de iframe com 390 px. Incluem estilos computados de login/painel, cinco telas, navegação selecionada, ausência de overflow horizontal, busca, filtros, retomada, demais rotas e saída. A captura desktop foi inspecionada visualmente. Banco/API não foram exercitados nesta alteração.

Teste reutilizável: `tests/ui-smoke.html`, servido na mesma origem do projeto; acrescente `?mobile` para a largura de 390 px. O teste simula entrada e saída na sessão demonstrativa e termina em Início. A captura está em `tests/dashboard-desktop.png`.
