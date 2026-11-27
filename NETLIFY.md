# Se Conecte — apresentação pelo Netlify

Esta versão foi criada para apresentações sem PHP, MySQL, PostgreSQL ou funções de servidor. **Não é um sistema de autenticação real.**

## Publicação pelo GitHub

1. No Netlify, escolha **Add new project → Import an existing project → GitHub**.
2. Selecione `henriquegiroldodev/se-conecte` (repositório privado exige autorização).
3. Escolha a branch **netlify**. A branch **main** contém a versão PHP/MySQL original e não deve ser publicada como site estático.
4. Deixe **Base directory** vazio, configure **Build command** como `node scripts/build-netlify.mjs` e **Publish directory** como `dist`.
5. Publique. O site abrirá em `https://SEU-SITE.netlify.app/`, redirecionando para `/v2/`.
6. Caso haja 404, confira em **Deploys** se o deploy está na branch correta e em **Deploy file browser** se os arquivos `index.html` e `v2/index.html` foram publicados.

## Funcionalidades sem banco

- Dois cursos com quatro aulas cada e atividades avaliadas localmente
- Player YouTube nas primeiras aulas e textos nas demais (vídeos de terceiros podem bloquear a incorporação)
- Perfil local demonstrativo usando nome e e-mail (nenhuma senha, nenhum login real)
- Progresso de aulas, certificado demonstrativo para impressão em PDF e Banco de Talentos salvos em `localStorage`
- Acessibilidade (tamanho do texto, alto contraste, reduzir animações, botões maiores e leitura simplificada), sem leitura em voz alta
- Banco de Talentos com quatro vagas fictícias, claramente identificadas e sem candidaturas reais

**Limitações:** os dados ficam **somente no navegador e dispositivo usado**, podem ser apagados pelo usuário e não são sincronizados com servidores. Não há validação de identidade; o campo e-mail serve apenas para reabrir o perfil local. Certificados são demonstrativos e não têm validação pública. Não informe dados pessoais verdadeiros. Para produção, é necessário backend real, autenticação e armazenamento seguro.

## Rodar localmente

No diretório do projeto, execute `node scripts/build-netlify.mjs` e sirva a pasta `dist` por um servidor HTTP estático. Por exemplo: `npx serve dist`.

A versão PHP/MySQL original está preservada na branch `main` (com backup adicional em `php-mysql`). O diretório `dist` contém apenas recursos estáticos. Os arquivos PHP, SQL e as credenciais não entram na publicação Netlify.
