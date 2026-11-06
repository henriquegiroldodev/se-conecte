# Se Conecte — versão profissional (v2)

Portal educacional com dois cursos: **Primeiros Passos no Computador** e **Segurança Digital**. Interface clara, adaptável a celulares, com menos elementos decorativos.

## Instalação local (XAMPP)

1. Coloque o repositório dentro de `htdocs/se-conecte`.
2. Inicie o **Apache** e o **MySQL**.
3. Acesse o phpMyAdmin e importe **primeiro** `database/se_conecte.sql` e **depois** `database/003_plataforma_profissional.sql`.
4. Configure usuário, senha e banco no arquivo `backend/config.php`, conforme sua instalação.
5. Abra `http://localhost/se-conecte/v2/` (não abra o HTML diretamente como arquivo).

## Funcionalidades da v2

- Cadastro e login em PHP com senha protegida por hash.
- Sessão autenticada no servidor.
- Dois cursos, cada um com quatro aulas e atividades de múltipla escolha.
- Registro do progresso por usuário e por aula no MySQL.
- Resposta correta obrigatória para concluir cada aula.
- Emissão automática de certificado após concluir todas as aulas.
- Certificado vinculado ao ID da conta, com nome, título, data e código único.
- Área **Meus certificados** com impressão / Salvar como PDF.
- Saída da conta, estados vazios e tratamento de erros.

## Estrutura

- `v2/index.html`: interface do estudante.
- `v2/api.php`: cadastro, login, cursos, aulas e certificados.
- `database/003_plataforma_profissional.sql`: tabelas complementares e conteúdo dos dois cursos.
- `backend/config.php`: conexão PDO com MySQL.

A v2 é independente da interface antiga, que foi preservada para comparação. As tabelas `sc_*` não apagam dados anteriores.

## Limitações antes da publicação na internet

Esta é uma versão funcional **para instalação e testes locais**, não uma auditoria de segurança ou homologação de produção. Antes de abrir para usuários reais, configurar HTTPS, credenciais por variáveis de ambiente, recuperação de senha, verificação de e-mail, rate limiting de login, política de privacidade/LGPD, backup, testes automatizados e revisão de segurança. O certificado ainda **não possui página de validação pública**. A impressão em PDF depende do navegador.

O design foi inspirado em princípios gerais de clareza e simplicidade de interfaces educacionais; não usa logotipos nem identidade visual oficial do Google.
