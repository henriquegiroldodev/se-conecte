# Publicar no Netlify

A branch netlify mantém a interface v2 e substitui a API PHP por uma função Node.js. A main continua disponível para XAMPP.

1. Crie um banco PostgreSQL (por exemplo, Neon, https://neon.tech/). Confira os limites do plano gratuito.
2. No editor SQL do banco novo, execute database/netlify.sql. O script cria as tabelas e os dois cursos com oito aulas. Não importa contas do MySQL antigo.
3. No Netlify, escolha Add new project / Import an existing project / GitHub. Autorize o acesso ao repositório privado se necessário. Escolha henriquegiroldodev/se-conecte e a branch netlify.
4. Build command: npm run build. Publish directory: dist. A configuração netlify.toml já define ambos.
5. Em Environment variables, configure DATABASE_URL com a string de conexão PostgreSQL (incluindo SSL exigido pelo provedor) e SESSION_SECRET com uma chave aleatória de pelo menos 32 caracteres. Gere uma chave com node -e "console.log(require('crypto').randomBytes(32).toString('hex'))". Não publique as credenciais no GitHub.
6. Faça o deploy ou redeploy após salvar as variáveis.
7. Abra o endereço HTTPS fornecido pelo Netlify. Cadastre uma conta de teste, abra os dois cursos, teste os vídeos, responda às atividades e confirme o progresso, certificados e Banco de Talentos após sair e entrar.

O build publica somente a interface e os logos; SQL, PHP e documentação não são servidos publicamente. A API usa consultas parametrizadas, bcrypt, cookie assinado HttpOnly/Secure e token CSRF. Ainda é necessário testar a integração real, implementar limitação de tentativas, revogação de sessões e revisar LGPD antes de receber alunos reais. Os dois links de vídeo existentes são referências não verificadas; as demais aulas aguardam vídeos. O banco novo começa sem alunos. Não execute scripts de reset.

Para alterar um vídeo, use o editor SQL do PostgreSQL:
```sql
UPDATE sc_aulas SET video_url='https://www.youtube.com/watch?v=SEU_ID'
WHERE curso_id=(SELECT id FROM sc_cursos WHERE slug='primeiros-passos') AND ordem=1;
```
