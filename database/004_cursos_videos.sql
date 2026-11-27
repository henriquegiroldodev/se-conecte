-- Atualizacao da plataforma profissional: executar APOS 003_plataforma_profissional.sql.
-- Preserva o historico existente. Para limpar dados de teste, consulte 005_reset_dados_demo.sql.
USE se_conecte;
ALTER TABLE sc_aulas ADD COLUMN video_url VARCHAR(500) NULL DEFAULT NULL AFTER conteudo;
UPDATE sc_cursos SET titulo='Uso Básico do Computador',descricao='Aprenda a utilizar o computador: componentes, mouse, teclado, arquivos, pastas e primeiros passos na internet.',duracao_minutos=90,ordem=1,ativo=1 WHERE slug='primeiros-passos';
UPDATE sc_cursos SET titulo='Segurança na Internet e no Celular',descricao='Aprenda a navegar com segurança, reconhecer golpes digitais e proteger informações no celular e computador.',duracao_minutos=80,ordem=2,ativo=1 WHERE slug='seguranca-digital';
UPDATE sc_cursos SET ativo=0 WHERE slug NOT IN ('primeiros-passos','seguranca-digital');
UPDATE sc_aulas SET titulo='Golpes na internet e no WhatsApp',conteudo='Golpistas podem enviar links falsos por WhatsApp, SMS, e-mail ou redes sociais. Desconfie de urgência, pedido de PIX e supostos familiares com número novo. Antes de transferir dinheiro ou enviar dados, confirme por ligação em um contato já conhecido.',atividade_pergunta='Alguém pede dinheiro por WhatsApp, dizendo ser familiar. O que fazer?',opcao_a='Confirmar por outro contato já conhecido',opcao_b='Enviar o dinheiro imediatamente',opcao_c='Compartilhar seu código de verificação',resposta_correta='A'
WHERE curso_id=(SELECT id FROM sc_cursos WHERE slug='seguranca-digital') AND ordem=2;
UPDATE sc_aulas SET titulo='Privacidade e proteção do celular',conteudo='Configure um bloqueio de tela com PIN forte ou biometria, mantenha os aplicativos atualizados e instale-os apenas de lojas confiáveis. Revise permissões de câmera, microfone e localização. Evite compartilhar documentos e dados bancários.',atividade_pergunta='Qual medida ajuda a proteger o celular?',opcao_a='Desativar atualizações',opcao_b='Usar bloqueio de tela e manter aplicativos atualizados',opcao_c='Informar sua senha a desconhecidos',resposta_correta='B'
WHERE curso_id=(SELECT id FROM sc_cursos WHERE slug='seguranca-digital') AND ordem=3;
UPDATE sc_aulas SET titulo='Navegação segura e proteção de contas',conteudo='Use senhas longas e diferentes, ative a autenticação em duas etapas e faça backups. Desconfie de sites que imitam lojas ou bancos. O cadeado HTTPS protege a conexão, mas não garante que o site seja legítimo.',atividade_pergunta='Qual hábito ajuda a proteger suas contas?',opcao_a='Reutilizar a mesma senha',opcao_b='Compartilhar códigos recebidos por SMS',opcao_c='Ativar autenticação em duas etapas',resposta_correta='C'
WHERE curso_id=(SELECT id FROM sc_cursos WHERE slug='seguranca-digital') AND ordem=4;
-- Para vincular vídeos posteriormente:
-- UPDATE sc_aulas SET video_url='https://www.youtube.com/watch?v=SEU_VIDEO' WHERE id=1;
-- Também são aceitos links YouTube youtu.be, /embed/ e caminhos relativos .mp4/.webm.
