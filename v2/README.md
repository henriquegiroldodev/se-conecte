# Se Conecte — Plataforma de Cursos

## Aparência antiga, funcionalidades novas

O projeto usa a identidade visual original como referência: azul e laranja, logo, menu lateral, cards e painel inicial. A implementação é a **v2 conectada ao MySQL**, e não a interface antiga de demonstração.

Escopo funcional: cadastro/login real; **somente dois cursos**; progresso individual; player de vídeos pronto; exercícios; acessibilidade; Banco de Talentos privado; certificado digital ligado à conta. Não foram restaurados pontos, níveis fictícios, Passaporte Digital separado, catálogo antigo ou vagas de exemplo.

## Acessibilidade e Banco de Talentos

- A barra superior oferece **Meu Modo** (texto A/A+/A++, alto contraste, animações reduzidas, botões maiores e leitura simplificada) e **Ouvir página**, que utiliza as vozes disponíveis no navegador. As preferências são armazenadas localmente por conta, nesse navegador.
- O menu lateral inclui **Banco de Talentos**. O aluno cadastra cidade, objetivo, habilidades e modalidade de trabalho. O perfil é privado e salvo no MySQL; existe uma caixa opcional de autorização de contato para uso futuro, que não publica os dados.
- O Banco de Talentos é um cadastro privado de habilidades, não uma vitrine pública. Não existem candidaturas reais nem vagas demonstrativas na interface.

**Migração necessária para o Banco de Talentos:** após os scripts 003 e 004, importe `database/006_banco_talentos.sql` uma única vez. Este script cria `sc_talentos` e não apaga usuários, cursos, progresso ou certificados.

## Cursos disponíveis

1. **Uso Básico do Computador** — 4 aulas sobre componentes, mouse, teclado, arquivos e navegação.
2. **Segurança na Internet e no Celular** — 4 aulas sobre senhas, WhatsApp, golpes, privacidade e proteção de dispositivos.

O catálogo exibe **somente esses dois cursos**. Para novas contas, o progresso começa em **0%**. Uma aula só conta como concluída após a resposta correta na atividade. O progresso é salvo por usuário no MySQL; ele não pode ser modificado pelo indicador visual.

## Instalar localmente (XAMPP)

1. Coloque o repositório em `htdocs/se-conecte`.
2. Inicie Apache e MySQL.
3. Em uma instalação nova, importe `database/se_conecte.sql`, depois `database/003_plataforma_profissional.sql` depois `database/004_cursos_videos.sql` e, por fim, `database/006_banco_talentos.sql`.
4. Se você **já importou** os scripts 003 e 004 e a plataforma abre normalmente, importe **somente** `database/006_banco_talentos.sql` (uma vez), sem repetir as migrações anteriores.
5. Ajuste a conexão em `backend/config.php`.
6. Acesse `http://localhost/se-conecte/` ou `http://localhost/se-conecte/v2/`.

**Limpar progresso de teste:** o arquivo `database/005_reset_dados_demo.sql` remove **todos os registros de aulas concluídas e certificados da v2 de todas as contas**. Ele é DESTRUTIVO e deve ser executado manualmente apenas em ambiente de testes, após backup, caso deseje zerar contas já existentes. Não é executado automaticamente pela aplicação. A conta e os cursos são preservados.

## Ativação do banco de dados e vídeo de teste

Se o Se Conecte **já abre no XAMPP** e você já importou os arquivos 003, 004 e 006, **não recrie o banco**. Atualize os arquivos do projeto e importe **apenas** `database/007_videoaulas_iniciais.sql`, em phpMyAdmin → banco `se_conecte` → Importar.

O script 007 apenas cadastra um link do YouTube para a primeira aula de cada curso, **se o campo ainda estiver vazio**. Ele não apaga contas, progresso, certificado ou perfil profissional e não substitui vídeos já escolhidos.

Para verificar o ambiente, abra `http://localhost/se-conecte/v2/diagnostico.php`. A página mostra se PHP, MySQL, tabelas, campo `video_url` e vídeos cadastrados estão disponíveis. Ela não exibe senhas nem nomes de alunos. **Remova ou restrinja o diagnóstico antes de publicar em um servidor aberto.**

Em uma instalação nova, use esta ordem: `database/se_conecte.sql`, `003_plataforma_profissional.sql`, `004_cursos_videos.sql`, `006_banco_talentos.sql`, `007_videoaulas_iniciais.sql`.

Os vídeos de referência são de canais externos (Prime Cursos do Brasil e Curso em Vídeo). Confira se permitem incorporação. O certificado emitido é do **Se Conecte**, e não dos produtores desses vídeos.

## Como adicionar vídeos

O player já está incluído em cada aula. Sem URL, aparece um aviso "Videoaula em preparação", sem vídeo fictício.

No phpMyAdmin, após importar a migração 004, execute por exemplo:

```sql
USE se_conecte;
UPDATE sc_aulas SET video_url='https://www.youtube.com/watch?v=XXXXXXXXXXX'
WHERE curso_id=(SELECT id FROM sc_cursos WHERE slug='primeiros-passos') AND ordem=1;
```

Substitua `XXXXXXXXXXX` pelo ID real do vídeo. Na primeira aula dos dois cursos, o arquivo 007 preenche exemplos se o campo ainda estiver vazio. São suportadas URLs HTTPS de YouTube (`watch`, `youtu.be` ou `embed`) e arquivos locais da mesma origem com extensão `.mp4` ou `.webm`. Não use URLs de serviços desconhecidos. O vídeo aparecerá automaticamente após recarregar a página.

## Certificado digital

A rota `#/certificado-modelo` mostra uma **prévia ilustrativa com marca d'água "MODELO — SEM VALIDADE"**. Há um link para o modelo na área **Meus certificados**. Certificados reais são emitidos após concluir todas as aulas de um curso e ficam vinculados ao ID do aluno no banco. Incluem nome, curso, data, quantidade de aulas e código único, com impressão ou "Salvar como PDF" pelo navegador.

## Estrutura

- `index.html`: encaminha à versão profissional `v2/`.

- `v2/index.html`: interface responsiva, cursos, player, certificado.
- `v2/api.php`: contas, progresso e Banco de Talentos autenticados.
- `v2/accessibility.js`: recursos de acessibilidade e leitura em voz alta.
- `database/006_banco_talentos.sql`: perfil profissional privado do aluno.
- `assets/brand/`: logotipos SVG.
- `database/003_plataforma_profissional.sql`: estrutura inicial.
- `database/004_cursos_videos.sql`: nomes oficiais, conteúdo de segurança e coluna de vídeo.
- `database/005_reset_dados_demo.sql`: reset manual de registros demonstrativos.

## Antes de publicar

Testar cadastro, login, conclusão de aulas, certificados e mídia em PHP/MySQL real. Ainda é necessário implementar recuperação e verificação de e-mail, limitar tentativas de login, configurar HTTPS, backup, política de privacidade/LGPD e validação pública dos certificados. A versão não foi homologada para produção.

## Verificar funcionamento

1. Cadastre uma conta nova e confira que os dois cursos começam em 0%.
2. Abra **Meu Modo**, aumente a fonte e ative alto contraste; feche e reabra para verificar o estado.
3. Clique **Ouvir página** em um navegador compatível com síntese de voz.
4. Abra **Banco de Talentos**, salve cidade, objetivo e habilidades; recarregue para confirmar que os dados foram mantidos. Confira as certificações na página **Meus certificados**.
5. Faça logout, crie outra conta e verifique que o perfil profissional da primeira conta não aparece.
6. Conclua as atividades e confira o progresso e a emissão do certificado no banco.
7. Verifique o layout no celular e no computador.

Os testes de integração com o MySQL do computador precisam ser executados localmente; os arquivos no GitHub não alteram automaticamente o banco já importado no XAMPP.

## Teste de aceitação antes de entregar

1. Abra `v2/diagnostico.php` e verifique todos os itens. Se faltar tabela, importe a migração indicada.
2. Crie uma conta nova e confira que ambos os cursos iniciam em 0%.
3. Entre na primeira aula de **Uso Básico do Computador** e confirme o player do YouTube. Repita para **Segurança na Internet e no Celular**.
4. Responda incorretamente à atividade e confirme que a aula não é concluída. Depois responda corretamente e verifique o progresso ao recarregar.
5. Conclua as quatro aulas, abra **Meus certificados**, confira a vinculação à conta e experimente **Imprimir/Salvar como PDF**.
6. Salve um perfil no **Banco de Talentos**, saia e entre novamente para conferir persistência. Em outra conta, confira que o perfil não aparece.
7. Teste acessibilidade (Meu Modo, tamanho do texto, contraste e leitura por voz) e a navegação no celular.
8. Para entrega pública, ainda são necessários HTTPS, limite de tentativas de login, política LGPD, recuperação de senha e revisão de segurança.
