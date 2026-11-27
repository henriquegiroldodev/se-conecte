-- Execute apos database/se_conecte.sql. Preserva tabelas antigas.
USE se_conecte;

CREATE TABLE IF NOT EXISTS sc_cursos (
 id INT AUTO_INCREMENT PRIMARY KEY,
 slug VARCHAR(80) NOT NULL UNIQUE,
 titulo VARCHAR(160) NOT NULL,
 descricao TEXT NOT NULL,
 duracao_minutos SMALLINT UNSIGNED NOT NULL,
 ordem TINYINT UNSIGNED NOT NULL DEFAULT 1,
 ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sc_aulas (
 id INT AUTO_INCREMENT PRIMARY KEY,
 curso_id INT NOT NULL,
 titulo VARCHAR(160) NOT NULL,
 conteudo TEXT NOT NULL,
 atividade_pergunta VARCHAR(255) NOT NULL,
 opcao_a VARCHAR(255) NOT NULL,
 opcao_b VARCHAR(255) NOT NULL,
 opcao_c VARCHAR(255) NOT NULL,
 resposta_correta CHAR(1) NOT NULL,
 ordem TINYINT UNSIGNED NOT NULL,
 UNIQUE KEY uq_sc_aula_ordem(curso_id,ordem),
 CONSTRAINT fk_sc_aula_curso FOREIGN KEY(curso_id) REFERENCES sc_cursos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sc_aulas_concluidas (
 usuario_id INT NOT NULL,
 aula_id INT NOT NULL,
 concluida_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(usuario_id,aula_id),
 CONSTRAINT fk_sc_concluida_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
 CONSTRAINT fk_sc_concluida_aula FOREIGN KEY(aula_id) REFERENCES sc_aulas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sc_certificados (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 codigo CHAR(36) NOT NULL UNIQUE,
 usuario_id INT NOT NULL,
 curso_id INT NOT NULL,
 nome_emitido VARCHAR(120) NOT NULL,
 titulo_emitido VARCHAR(160) NOT NULL,
 total_aulas SMALLINT UNSIGNED NOT NULL,
 emitido_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_sc_cert_usuario_curso(usuario_id,curso_id),
 CONSTRAINT fk_sc_cert_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
 CONSTRAINT fk_sc_cert_curso FOREIGN KEY(curso_id) REFERENCES sc_cursos(id)
) ENGINE=InnoDB;

INSERT INTO sc_cursos(slug,titulo,descricao,duracao_minutos,ordem) VALUES
('primeiros-passos','Primeiros Passos no Computador','Aprenda a reconhecer os componentes, utilizar mouse e teclado, trabalhar com arquivos e acessar a internet.',90,1),
('seguranca-digital','Segurança Digital','Proteja suas contas, reconheça golpes e aprenda a navegar com mais segurança.',80,2)
ON DUPLICATE KEY UPDATE titulo=VALUES(titulo), descricao=VALUES(descricao), duracao_minutos=VALUES(duracao_minutos), ordem=VALUES(ordem), ativo=1;

INSERT INTO sc_aulas(curso_id,titulo,conteudo,atividade_pergunta,opcao_a,opcao_b,opcao_c,resposta_correta,ordem)
SELECT c.id, d.titulo,d.conteudo,d.pergunta,d.a,d.b,d.c,d.correta,d.ordem FROM
(
SELECT 'primeiros-passos' slug,1 ordem,'Conhecendo o computador' titulo,'Um computador possui monitor, teclado, mouse e uma unidade de processamento. O monitor mostra informações; o teclado permite digitar; o mouse ajuda a selecionar itens. Ligue e desligue pelo comando do sistema para evitar perda de dados.' conteudo,'Qual componente permite digitar textos?' pergunta,'Monitor' a,'Teclado' b,'Caixa de som' c,'B' correta
UNION ALL SELECT 'primeiros-passos',2,'Utilizando o mouse e o teclado','Clique uma vez para selecionar; dê dois cliques quando precisar abrir um arquivo; o clique direito apresenta opções. Use Enter para confirmar e Backspace para apagar. Pratique escrevendo seu nome em um editor de texto.','Qual tecla costuma apagar o caractere anterior?','Backspace','Shift','Caps Lock','A'
UNION ALL SELECT 'primeiros-passos',3,'Arquivos e pastas','Arquivos guardam documentos, imagens e outros conteúdos. Pastas organizam esses arquivos. Crie uma pasta chamada Estudos e salve um documento dentro dela; renomeie-o com um título fácil de reconhecer.','Para que servem as pastas?','Aumentar a velocidade da internet','Organizar arquivos','Substituir as senhas','B'
UNION ALL SELECT 'primeiros-passos',4,'Navegando na internet','O navegador abre páginas da internet. Digite o endereço na barra superior e utilize a pesquisa para encontrar informações. Confira o endereço do site e evite baixar arquivos desconhecidos.','Onde digitamos o endereço de um site?','Na barra de endereços','Na lixeira','No relógio','A'
UNION ALL SELECT 'seguranca-digital',1,'Senhas e autenticação','Use senhas longas e diferentes para cada serviço. Um gerenciador de senhas ajuda a guardá-las. Quando disponível, ative a verificação em duas etapas. Nunca compartilhe códigos de confirmação.','Qual hábito ajuda a proteger suas contas?','Usar a mesma senha em tudo','Compartilhar códigos por mensagem','Ativar verificação em duas etapas','C'
UNION ALL SELECT 'seguranca-digital',2,'Reconhecendo golpes','Golpistas podem criar mensagens com urgência, promessas de prêmios ou pedidos de dinheiro. Confirme a identidade do remetente por outro canal e não abra links inesperados. Bancos não solicitam senha por mensagem.','Uma mensagem urgente pede transferência. O que fazer?','Confirmar por um canal confiável','Transferir imediatamente','Enviar sua senha','A'
UNION ALL SELECT 'seguranca-digital',3,'Privacidade e dados pessoais','Compartilhe apenas as informações necessárias. Revise as permissões de aplicativos, ajuste a privacidade das redes sociais e evite publicar documentos, endereços ou dados financeiros.','O que é mais seguro publicar em uma rede social?','Uma foto do cartão bancário','Apenas informações que você decidiu tornar públicas','Uma senha de acesso','B'
UNION ALL SELECT 'seguranca-digital',4,'Atualizações e navegação segura','Atualizações corrigem problemas de segurança. Prefira lojas oficiais para instalar aplicativos, mantenha o sistema atualizado e faça cópias de segurança dos arquivos importantes. HTTPS protege a conexão, mas não prova que o site é honesto.','Por que atualizar programas?','Para corrigir falhas e melhorar a segurança','Para divulgar senhas','Para desativar a proteção','A'
) d JOIN sc_cursos c ON c.slug=d.slug
ON DUPLICATE KEY UPDATE titulo=VALUES(titulo),conteudo=VALUES(conteudo),atividade_pergunta=VALUES(atividade_pergunta),opcao_a=VALUES(opcao_a),opcao_b=VALUES(opcao_b),opcao_c=VALUES(opcao_c),resposta_correta=VALUES(resposta_correta);
