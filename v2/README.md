# Se Conecte — Plataforma de Cursos

## Design restaurado

A interface da v2 recupera a identidade da primeira versão: painel do aluno com destaque azul, menu lateral, cards coloridos, página de progresso e layout de login com duas colunas. A API real, os vídeos e certificados permanecem na v2. Os estilos adicionais estão em `v2/theme-original.css`; a antiga interface demonstrativa segue arquivada em `legacy.html`.


A versão principal agora abre a plataforma de cursos na pasta `v2/`. A versão demonstrativa anterior foi preservada em `legacy.html` apenas como referência e não deve ser usada para avaliar progresso real.

## Acessibilidade e Banco de Talentos

- A barra superior oferece **Meu Modo** (texto A/A+/A++, alto contraste, animações reduzidas, botões maiores e leitura simplificada) e **Ouvir página**, que utiliza as vozes disponíveis no navegador. As preferências são armazenadas localmente por conta, nesse navegador.
- O menu lateral inclui **Banco de Talentos**. O aluno cadastra cidade, objetivo, habilidades e modalidade de trabalho. O perfil é privado e salvo no MySQL; existe uma caixa opcional de autorização de contato para uso futuro, que não publica os dados.
- As vagas mostradas são **apenas exemplos**, identificados como demonstrativos. Não existe candidaturas reais, contato com empresas ou divulgação pública de perfis nesta etapa.

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
4. Abra **Banco de Talentos**, salve cidade, objetivo e habilidades; recarregue para confirmar que os dados foram mantidos.
5. Faça logout, crie outra conta e verifique que o perfil profissional da primeira conta não aparece.
6. Conclua as atividades e confira o progresso e a emissão do certificado no banco.
7. Verifique o layout no celular e no computador.

Os testes de integração com o MySQL do computador precisam ser executados localmente; os arquivos no GitHub não alteram automaticamente o banco já importado no XAMPP.
