# Se Conecte

Plataforma de cursos de inclusão digital.

O projeto atual utiliza a **interface profissional em `v2/`**, com elementos visuais inspirados na primeira versão, mas com backend PHP e banco MySQL para salvar os dados dos alunos.

## Funcionalidades

- Cadastro e login de alunos.
- Dois cursos: **Uso Básico do Computador** e **Segurança na Internet e no Celular**.
- Progresso individual por aula, começando em 0% para novas contas.
- Player preparado para incluir videoaulas.
- Acessibilidade: controle de fonte, contraste, botões maiores, redução de animações e leitura em voz alta.
- Banco de Talentos com perfil privado por aluno.
- Certificado digital ligado à conta, com visualização e impressão em PDF.

## Como instalar

Veja [v2/README.md](v2/README.md) para instruções do XAMPP e importação dos arquivos SQL, incluindo `database/006_banco_talentos.sql`.

Depois de configurar o Apache e o MySQL, acesse `http://localhost/se-conecte/`.

As páginas demonstrativas da versão anterior não fazem parte da aplicação ativa. Recursos como vagas fictícias, gamificação fictícia e cursos antigos não foram reaproveitados.

## Situação

A implementação está disponível para testes locais. Ainda é necessário validar os fluxos completos com o MySQL instalado, segurança de produção e compatibilidade dos navegadores antes da publicação pública.
