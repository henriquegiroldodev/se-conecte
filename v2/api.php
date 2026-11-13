<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
session_set_cookie_params(['httponly'=>true,'secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off','samesite'=>'Lax','path'=>'/']);
session_start();
require dirname(__DIR__).'/backend/config.php';
function reply(array $data,int $status=200): never {http_response_code($status);echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function payload(): array {$d=json_decode(file_get_contents('php://input'),true);return is_array($d)?$d:[];}
function userId(): int {return (int)($_SESSION['usuario_id']??0);}
function requireUser(): int {$id=userId();if(!$id)reply(['erro'=>'Faça login para continuar.'],401);return $id;}
function user(PDO $pdo,int $id): array {$s=$pdo->prepare('SELECT id,nome,email FROM usuarios WHERE id=?');$s->execute([$id]);$u=$s->fetch();if(!$u)reply(['erro'=>'Conta não encontrada.'],401);return $u;}
function courses(PDO $pdo,int $id): array {
 $q=$pdo->prepare('SELECT c.id,c.slug,c.titulo,c.descricao,c.duracao_minutos,COUNT(DISTINCT a.id) total_aulas,COUNT(DISTINCT ac.aula_id) aulas_concluidas FROM sc_cursos c LEFT JOIN sc_aulas a ON a.curso_id=c.id LEFT JOIN sc_aulas_concluidas ac ON ac.aula_id=a.id AND ac.usuario_id=? WHERE c.ativo=1 GROUP BY c.id ORDER BY c.ordem');
 $q->execute([$id]);return $q->fetchAll();
}
function certificateRows(PDO $pdo,int $id): array {
 $q=$pdo->prepare('SELECT codigo,curso_id,nome_emitido,titulo_emitido,total_aulas,emitido_em FROM sc_certificados WHERE usuario_id=? ORDER BY emitido_em DESC');
 $q->execute([$id]);return $q->fetchAll();
}
try {
 $method=$_SERVER['REQUEST_METHOD'];
 $action=$_GET['action']??'bootstrap';
 if($method==='GET' && $action==='bootstrap') {
   if(empty($_SESSION['csrf']))$_SESSION['csrf']=bin2hex(random_bytes(32));
   $id=userId();reply(['csrf'=>$_SESSION['csrf'],'usuario'=>$id?user($pdo,$id):null,'cursos'=>$id?courses($pdo,$id):[],'certificados'=>$id?certificateRows($pdo,$id):[]]);
 }
 if($method==='GET' && $action==='course') {
   $id=requireUser();
   $slug=(string)($_GET['slug']??'');
   $q=$pdo->prepare('SELECT id,slug,titulo,descricao,duracao_minutos FROM sc_cursos WHERE slug=? AND ativo=1');$q->execute([$slug]);$course=$q->fetch();
   if(!$course)reply(['erro'=>'Curso não encontrado.'],404);
   $q=$pdo->prepare('SELECT a.id,a.titulo,a.conteudo,a.video_url,a.atividade_pergunta,a.opcao_a,a.opcao_b,a.opcao_c,a.ordem,IF(ac.aula_id IS NOT NULL,1,0) concluida FROM sc_aulas a LEFT JOIN sc_aulas_concluidas ac ON ac.aula_id=a.id AND ac.usuario_id=? WHERE a.curso_id=? ORDER BY a.ordem');
   $q->execute([$id,$course['id']]);reply(['curso'=>$course,'aulas'=>$q->fetchAll()]);
 }
 if($method!=='POST')reply(['erro'=>'Método não permitido'],405);
 $d=payload();
 if(!hash_equals((string)($_SESSION['csrf']??''),(string)($_SERVER['HTTP_X_CSRF_TOKEN']??'')) || empty($_SESSION['csrf']))reply(['erro'=>'Sessão expirada. Recarregue a página.'],419);
 if($action==='register') {
   $name=trim(preg_replace('/\s+/u',' ',(string)($d['nome']??'')));
   $email=mb_strtolower(trim((string)($d['email']??'')));
   $pass=(string)($d['senha']??'');
   if(mb_strlen($name)<3||mb_strlen($name)>120||!filter_var($email,FILTER_VALIDATE_EMAIL)||strlen($email)>160||strlen($pass)<10||strlen($pass)>128)reply(['erro'=>'Informe nome, e-mail válido e senha com pelo menos 10 caracteres.'],422);
   $q=$pdo->prepare('SELECT id FROM usuarios WHERE email=?');$q->execute([$email]);if($q->fetch())reply(['erro'=>'E-mail já cadastrado.'],409);
   $q=$pdo->prepare('INSERT INTO usuarios(nome,email,senha_hash) VALUES(?,?,?)');
   $q->execute([$name,$email,password_hash($pass,PASSWORD_DEFAULT)]);
   session_regenerate_id(true);$_SESSION['usuario_id']=(int)$pdo->lastInsertId();
   reply(['ok'=>true]);
 }
 if($action==='login') {
   $q=$pdo->prepare('SELECT id,senha_hash FROM usuarios WHERE email=? LIMIT 1');$q->execute([mb_strtolower(trim((string)($d['email']??'')))]);
   $u=$q->fetch();
   if(!$u||!password_verify((string)($d['senha']??''),$u['senha_hash']))reply(['erro'=>'E-mail ou senha incorretos.'],401);
   session_regenerate_id(true);$_SESSION['usuario_id']=(int)$u['id'];reply(['ok'=>true]);
 }
 if($action==='logout') {$_SESSION=[];session_regenerate_id(true);reply(['ok'=>true]);}
 $id=requireUser();
 if($action==='lesson') {
   $lessonId=filter_var($d['aula_id']??null,FILTER_VALIDATE_INT);
   $answer=$d['resposta']??null;
   if(!$lessonId||!in_array($answer,['A','B','C'],true))reply(['erro'=>'Resposta inválida.'],422);
   $q=$pdo->prepare('SELECT a.id,a.curso_id,a.resposta_correta FROM sc_aulas a JOIN sc_cursos c ON c.id=a.curso_id AND c.ativo=1 WHERE a.id=?');$q->execute([$lessonId]);$lesson=$q->fetch();
   if(!$lesson)reply(['erro'=>'Aula não encontrada.'],404);
   if($answer!==$lesson['resposta_correta'])reply(['correta'=>false,'erro'=>'Não foi dessa vez. Revise o conteúdo e tente novamente.'],422);
   $pdo->beginTransaction();
   $q=$pdo->prepare('INSERT IGNORE INTO sc_aulas_concluidas(usuario_id,aula_id) VALUES(?,?)');$q->execute([$id,$lessonId]);
   $courseId=(int)$lesson['curso_id'];
   $q=$pdo->prepare('SELECT COUNT(*) FROM sc_aulas WHERE curso_id=?');$q->execute([$courseId]);$total=(int)$q->fetchColumn();
   $q=$pdo->prepare('SELECT COUNT(*) FROM sc_aulas_concluidas ac JOIN sc_aulas a ON a.id=ac.aula_id WHERE ac.usuario_id=? AND a.curso_id=?');$q->execute([$id,$courseId]);$done=(int)$q->fetchColumn();
   $issued=false;
   if($total>0 && $done===$total) {
     $q=$pdo->prepare('SELECT id FROM sc_certificados WHERE usuario_id=? AND curso_id=? FOR UPDATE');$q->execute([$id,$courseId]);
     if(!$q->fetch()) {
       $u=user($pdo,$id);
       $q=$pdo->prepare('SELECT titulo FROM sc_cursos WHERE id=?');$q->execute([$courseId]);$title=$q->fetchColumn();
       $bytes=random_bytes(16);$bytes[6]=chr((ord($bytes[6])&15)|64);$bytes[8]=chr((ord($bytes[8])&63)|128);$hex=bin2hex($bytes);
       $code=implode('-', [substr($hex,0,8),substr($hex,8,4),substr($hex,12,4),substr($hex,16,4),substr($hex,20)]);
       $q=$pdo->prepare('INSERT IGNORE INTO sc_certificados(codigo,usuario_id,curso_id,nome_emitido,titulo_emitido,total_aulas) VALUES(?,?,?,?,?,?)');
       $q->execute([$code,$id,$courseId,$u['nome'],$title,$total]);$issued=$q->rowCount()>0;
     }
   }
   $pdo->commit();reply(['ok'=>true,'correta'=>true,'concluidas'=>$done,'total'=>$total,'certificado_emitido'=>$issued]);
 }
 reply(['erro'=>'Rota não encontrada.'],404);
} catch (PDOException $e) {
 if($pdo->inTransaction())$pdo->rollBack();
 error_log($e->getMessage());
 reply(['erro'=>'Não foi possível concluir a operação. Confira a instalação do banco de dados.'],500);
} catch (Throwable $e) {
 if(isset($pdo)&&$pdo->inTransaction())$pdo->rollBack();
 error_log($e->getMessage());
 reply(['erro'=>'Ocorreu um erro inesperado.'],500);
}
