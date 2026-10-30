-- Aplicar UMA VEZ, depois de se_conecte.sql, em uma cópia de desenvolvimento.
-- Não é executada automaticamente pelo protótipo e não remove dados existentes.
USE se_conecte;
ALTER TABLE preferencias_acessibilidade
  ADD COLUMN leitura_voz BOOLEAN NOT NULL DEFAULT 1,
  ADD COLUMN botoes_maiores BOOLEAN NOT NULL DEFAULT 0,
  ADD COLUMN destacar_acoes BOOLEAN NOT NULL DEFAULT 0,
  ADD COLUMN primeiro_acesso_concluido BOOLEAN NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS itens_trilha (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  slug VARCHAR(60) NOT NULL,
  tipo ENUM('aula','simulacao') NOT NULL,
  titulo VARCHAR(160) NOT NULL,
  ordem TINYINT UNSIGNED NOT NULL,
  total_opcoes TINYINT UNSIGNED NOT NULL DEFAULT 3,
  resposta_correta TINYINT UNSIGNED NOT NULL,
  xp TINYINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_item(curso_id,tipo,slug),
  FOREIGN KEY(curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS eventos_aprendizagem (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  item_id INT NOT NULL,
  resposta_indice TINYINT UNSIGNED NOT NULL,
  correta BOOLEAN NOT NULL,
  xp TINYINT UNSIGNED NOT NULL,
  concluido_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_conclusao_usuario(usuario_id,item_id),
  FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY(item_id) REFERENCES itens_trilha(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS conclusoes_trilhas (
  usuario_id INT NOT NULL,
  curso_id INT NOT NULL,
  concluido_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(usuario_id,curso_id),
  FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY(curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);
INSERT INTO cursos(slug,titulo,categoria,descricao,duracao_minutos,xp)
SELECT 'seguranca-digital','Segurança Digital: proteja-se na internet','Segurança digital',
'Aprenda a reconhecer golpes, proteger seus dados e usar a internet com mais segurança.',90,355
WHERE NOT EXISTS(SELECT 1 FROM cursos WHERE slug='seguranca-digital');
SET @curso_seguranca=(SELECT id FROM cursos WHERE slug='seguranca-digital' LIMIT 1);
INSERT INTO itens_trilha(curso_id,slug,tipo,titulo,ordem,resposta_correta,xp) VALUES
(@curso_seguranca,'internet','aula','Segurança na internet',1,1,35),
(@curso_seguranca,'whatsapp','aula','Golpes no WhatsApp',2,1,35),
(@curso_seguranca,'pix','aula','PIX e falsos pagamentos',3,2,35),
(@curso_seguranca,'links','aula','Links e sites falsos',4,0,35),
(@curso_seguranca,'contas','aula','Senhas e contas',5,1,35),
(@curso_seguranca,'suporte','aula','Falsos bancos e falso suporte',6,2,35),
(@curso_seguranca,'perfis','aula','Redes sociais e perfis falsos',7,2,35),
(@curso_seguranca,'confirme','aula','O que fazer quando desconfiar',8,1,35),
(@curso_seguranca,'familiar','simulacao','Falso familiar no WhatsApp',1,2,15),
(@curso_seguranca,'banco','simulacao','Falso banco',2,1,15),
(@curso_seguranca,'promocao','simulacao','Promoção falsa',3,2,15),
(@curso_seguranca,'suporte','simulacao','Falso suporte técnico',4,0,15),
(@curso_seguranca,'codigo','simulacao','Pedido de código de confirmação',5,1,15)
ON DUPLICATE KEY UPDATE titulo=VALUES(titulo);
