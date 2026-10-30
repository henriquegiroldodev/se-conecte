<?php
declare(strict_types=1);

/** Preparação para uma futura API autenticada. Não cria endpoints públicos.
 * O controlador deve obter usuarioId da sessão, nunca de um campo enviado pelo cliente,
 * verificar CSRF em escritas e validar autenticação antes de usar este repositório.
 * Requer a migração 002. Respostas são índices, nunca texto ou dados pessoais.
 */
final class LearningRepository
{
    public function __construct(private PDO $pdo) {}

    public function preferences(int $usuarioId): ?array
    {
        $query = $this->pdo->prepare('SELECT tamanho_texto,alto_contraste,reduzir_animacoes,modo_aprender_mais,leitura_voz,botoes_maiores,destacar_acoes,primeiro_acesso_concluido FROM preferencias_acessibilidade WHERE usuario_id=?');
        $query->execute([$usuarioId]);
        return $query->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function savePreferences(int $usuarioId, array $value): void
    {
        $font = $value['font'] ?? 'normal';
        if (!in_array($font, ['normal','large','extra'], true)) throw new InvalidArgumentException('Tamanho de texto inválido.');
        $flags = [];
        foreach (['contrast','motion','easy','voice','targets','highlight','onboarded'] as $key) {
            $flag = $value[$key] ?? ($key === 'voice');
            if (!is_bool($flag)) throw new InvalidArgumentException('Preferência inválida.');
            $flags[] = (int)$flag;
        }
        $sql = 'INSERT INTO preferencias_acessibilidade(usuario_id,tamanho_texto,alto_contraste,reduzir_animacoes,modo_aprender_mais,leitura_voz,botoes_maiores,destacar_acoes,primeiro_acesso_concluido) VALUES(?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE tamanho_texto=VALUES(tamanho_texto),alto_contraste=VALUES(alto_contraste),reduzir_animacoes=VALUES(reduzir_animacoes),modo_aprender_mais=VALUES(modo_aprender_mais),leitura_voz=VALUES(leitura_voz),botoes_maiores=VALUES(botoes_maiores),destacar_acoes=VALUES(destacar_acoes),primeiro_acesso_concluido=VALUES(primeiro_acesso_concluido)';
        $this->pdo->prepare($sql)->execute(array_merge([$usuarioId,$font],$flags));
    }

    public function progress(int $usuarioId): array
    {
        $query = $this->pdo->prepare('SELECT i.slug,i.tipo,e.resposta_indice,e.correta,e.xp,e.concluido_em FROM eventos_aprendizagem e JOIN itens_trilha i ON i.id=e.item_id JOIN cursos c ON c.id=i.curso_id WHERE e.usuario_id=? AND c.slug=? ORDER BY i.tipo,i.ordem');
        $query->execute([$usuarioId,'seguranca-digital']);
        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Chamar somente ao concluir a aula/prática. XP e gabarito vêm do servidor. */
    public function complete(int $usuarioId, string $tipo, string $slug, int $answer): array
    {
        if (!in_array($tipo,['aula','simulacao'],true)) throw new InvalidArgumentException('Tipo inválido.');
        $this->pdo->beginTransaction();
        try {
            // Serializa conclusões do mesmo usuário para evitar XP duplicado em pedidos simultâneos.
            $lock = $this->pdo->prepare('SELECT id FROM usuarios WHERE id=? FOR UPDATE');
            $lock->execute([$usuarioId]);
            if (!$lock->fetchColumn()) throw new InvalidArgumentException('Usuário não encontrado.');
            $query = $this->pdo->prepare('SELECT i.* FROM itens_trilha i JOIN cursos c ON c.id=i.curso_id WHERE c.slug=? AND i.tipo=? AND i.slug=?');
            $query->execute(['seguranca-digital',$tipo,$slug]);
            $item = $query->fetch(PDO::FETCH_ASSOC);
            if (!$item || $answer < 0 || $answer >= (int)$item['total_opcoes']) throw new InvalidArgumentException('Resposta inválida.');
            $exists = $this->pdo->prepare('SELECT id FROM eventos_aprendizagem WHERE usuario_id=? AND item_id=?');
            $exists->execute([$usuarioId,$item['id']]);
            $xp = 0;
            if (!$exists->fetchColumn()) {
                $xp = (int)$item['xp'];
                $this->pdo->prepare('INSERT INTO eventos_aprendizagem(usuario_id,item_id,resposta_indice,correta,xp) VALUES(?,?,?,?,?)')->execute([$usuarioId,$item['id'],$answer,(int)($answer === (int)$item['resposta_correta']),$xp]);
                $this->pdo->prepare("UPDATE usuarios SET nivel=CASE WHEN xp+? >= 1500 THEN 'Conectado' ELSE nivel END,xp=xp+? WHERE id=?")->execute([$xp,$xp,$usuarioId]);
            }
            $total = $this->pdo->prepare('SELECT COUNT(*) FROM itens_trilha WHERE curso_id=?');
            $total->execute([$item['curso_id']]); $count = (int)$total->fetchColumn();
            $done = $this->pdo->prepare('SELECT COUNT(*) FROM eventos_aprendizagem e JOIN itens_trilha i ON e.item_id=i.id WHERE e.usuario_id=? AND i.curso_id=?');
            $done->execute([$usuarioId,$item['curso_id']]); $completed = (int)$done->fetchColumn();
            $percent = $count ? (int)round($completed / $count * 100) : 0;
            $this->pdo->prepare('INSERT INTO progresso(usuario_id,curso_id,percentual) VALUES(?,?,?) ON DUPLICATE KEY UPDATE percentual=VALUES(percentual)')->execute([$usuarioId,$item['curso_id'],$percent]);
            if ($percent === 100) {
                $this->pdo->prepare('INSERT IGNORE INTO conclusoes_trilhas(usuario_id,curso_id) VALUES(?,?)')->execute([$usuarioId,$item['curso_id']]);
                $this->pdo->exec("INSERT IGNORE INTO competencias(nome) VALUES('Segurança Digital')");
                $competencia = $this->pdo->query("SELECT id FROM competencias WHERE nome='Segurança Digital' LIMIT 1")->fetchColumn();
                $this->pdo->prepare('INSERT INTO usuario_competencias(usuario_id,competencia_id,nivel) VALUES(?,?,5) ON DUPLICATE KEY UPDATE nivel=GREATEST(nivel,5)')->execute([$usuarioId,$competencia]);
            }
            $this->pdo->commit();
            return ['xp_added'=>$xp,'percent'=>$percent,'complete'=>$percent === 100];
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $error;
        }
    }
}
