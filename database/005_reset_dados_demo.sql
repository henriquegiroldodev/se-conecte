-- OPCIONAL E DESTRUTIVO: somente em ambiente de testes, após backup.
-- Remove TODO o progresso e certificados dos cursos v2 de TODAS as contas.
-- NÃO executar em produção e NÃO importar automaticamente.
USE se_conecte;
START TRANSACTION;
DELETE FROM sc_certificados;
DELETE FROM sc_aulas_concluidas;
COMMIT;
-- Contas, cursos e aulas permanecem intactos. O progresso passa a 0%.
