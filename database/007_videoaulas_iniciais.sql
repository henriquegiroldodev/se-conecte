-- Migração incremental segura para quem já instalou 003, 004 e 006.
-- Não exclui nem reinicia alunos, aulas concluídas, certificados ou talentos.
USE se_conecte;

-- Links públicos de aulas introdutórias para testar o player integrado.
-- Só preenche URLs vazias; não sobrescreve nenhum vídeo já configurado.
UPDATE sc_aulas a JOIN sc_cursos c ON c.id=a.curso_id
SET a.video_url='https://www.youtube.com/watch?v=JdSTF0iYYhI'
WHERE c.slug='primeiros-passos' AND a.ordem=1 AND (a.video_url IS NULL OR TRIM(a.video_url)='');

UPDATE sc_aulas a JOIN sc_cursos c ON c.id=a.curso_id
SET a.video_url='https://www.youtube.com/watch?v=KvPtIl-Gz2E'
WHERE c.slug='seguranca-digital' AND a.ordem=1 AND (a.video_url IS NULL OR TRIM(a.video_url)='');

-- Para substituir vídeos depois:
-- UPDATE sc_aulas a JOIN sc_cursos c ON c.id=a.curso_id
-- SET a.video_url='https://www.youtube.com/watch?v=SEU_ID'
-- WHERE c.slug='primeiros-passos' AND a.ordem=1;
-- Vídeos externos: Prime Cursos do Brasil e Curso em Vídeo, respectivamente.
-- São materiais de referência; o certificado emitido pertence apenas ao Se Conecte.
