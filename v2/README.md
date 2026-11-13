# Se Conecte — Plataforma de Cursos

A versão principal agora abre a plataforma de cursos na pasta `v2/`. A versão demonstrativa anterior foi preservada em `legacy.html` apenas como referência e não deve ser usada para avaliar progresso real.

## Cursos disponíveis

1. **Uso Básico do Computador** — 4 aulas sobre componentes, mouse, teclado, arquivos e navegação.
2. **Segurança na Internet e no Celular** — 4 aulas sobre senhas, WhatsApp, golpes, privacidade e proteção de dispositivos.

O catálogo exibe **somente esses dois cursos**. Para novas contas, o progresso começa em **0%**. Uma aula só conta como concluída após a resposta correta na atividade. O progresso é salvo por usuário no MySQL; ele não pode ser modificado pelo indicador visual.

## Instalar localmente (XAMPP)

1. Coloque o repositório em `htdocs/se-conecte`.
2. Inicie Apache e MySQL.
3. Em uma instalação nova, importe `database/se_conecte.sql`, depois `database/003_plataforma_profissional.sql` e por fim `database/004_cursos_videos.sql`.
4. Para uma instalação v2 existente, importe **somente** `database/004_cursos_videos.sql` (uma vez).
5. Ajuste a conexão em `backend/config.php`.
6. Acesse `http://localhost/se-conecte/` ou `http://localhost/se-conecte/v2/`.

**Limpar progresso de teste:** o arquivo `database/005_reset_dados_demo.sql` remove **todos os registros de aulas concluídas e certificados da v2 de todas as contas**. Ele é DESTRUTIVO e deve ser executado manualmente apenas em ambiente de testes, após backup, caso deseje zerar contas já existentes. Não é executado automaticamente pela aplicação. A conta e os cursos são preservados.

## Como adicionar vídeos

O player já está incluído em cada aula. Sem URL, aparece um aviso "Videoaula em preparação", sem vídeo fictício.

No phpMyAdmin, após importar a migração 004, execute por exemplo:

```sql
USE se_conecte;
UPDATE sc_aulas SET video_url='https://www.youtube.com/watch?v=XXXXXXXXXXX'
WHERE curso_id=(SELECT id FROM sc_cursos WHERE slug='primeiros-passos') AND ordem=1;
```

Substitua `XXXXXXXXXXX` pelo ID real do vídeo. São suportadas URLs HTTPS de YouTube (`watch`, `youtu.be` ou `embed`) e arquivos locais da mesma origem com extensão `.mp4` ou `.webm`. Não use URLs de serviços desconhecidos. O vídeo aparecerá automaticamente após recarregar a página.

## Certificado digital

A rota `#/certificado-modelo` mostra uma **prévia ilustrativa com marca d'água "MODELO — SEM VALIDADE"**. Há um link para o modelo na área **Meus certificados**. Certificados reais são emitidos após concluir todas as aulas de um curso e ficam vinculados ao ID do aluno no banco. Incluem nome, curso, data, quantidade de aulas e código único, com impressão ou "Salvar como PDF" pelo navegador.

## Estrutura

- `index.html`: encaminha à versão profissional `v2/`.
- `legacy.html`: versão demonstrativa antiga, arquivada.
- `v2/index.html`: interface responsiva, cursos, player, certificado.
- `v2/api.php`: contas e progresso autenticados.
- `assets/brand/`: logotipos SVG.
- `database/003_plataforma_profissional.sql`: estrutura inicial.
- `database/004_cursos_videos.sql`: nomes oficiais, conteúdo de segurança e coluna de vídeo.
- `database/005_reset_dados_demo.sql`: reset manual de registros demonstrativos.

## Antes de publicar

Testar cadastro, login, conclusão de aulas, certificados e mídia em PHP/MySQL real. Ainda é necessário implementar recuperação e verificação de e-mail, limitar tentativas de login, configurar HTTPS, backup, política de privacidade/LGPD e validação pública dos certificados. A versão não foi homologada para produção.
