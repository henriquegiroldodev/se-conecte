-- Banco de Talentos: cadastro individual opcional, privado e editável.
-- Execute depois dos scripts 003 e 004. Não altera registros de cursos/certificados.
USE se_conecte;
CREATE TABLE IF NOT EXISTS sc_talentos (
  usuario_id INT NOT NULL PRIMARY KEY,
  cidade VARCHAR(120) NOT NULL DEFAULT '',
  objetivo VARCHAR(180) NOT NULL DEFAULT '',
  habilidades TEXT NULL,
  disponibilidade ENUM('presencial','remoto','hibrido','qualquer') NOT NULL DEFAULT 'qualquer',
  autorizo_contato BOOLEAN NOT NULL DEFAULT FALSE,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sc_talentos_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;
-- As vagas da tabela antiga "vagas" são DEMONSTRATIVAS.
-- Não encaminhamos candidaturas a empresas reais nem expomos dados pessoais dos alunos.
