<?php
header('Content-Type: application/json; charset=utf-8');require __DIR__.'/config.php';session_start();
$action=$_GET['action']??'';$method=$_SERVER['REQUEST_METHOD'];
function out($d,$s=200){http_response_code($s);echo json_encode($d,JSON_UNESCAPED_UNICODE);exit;}
function body(){return json_decode(file_get_contents('php://input'),true)?:[];}
if($action==='login'&&$method==='POST'){$d=body();$q=$pdo->prepare('SELECT id,nome,email,senha_hash,xp,nivel FROM usuarios WHERE email=? LIMIT 1');$q->execute([$d['email']??'']);$u=$q->fetch();if(!$u||!password_verify($d['senha']??'',$u['senha_hash']))out(['erro'=>'Credenciais inválidas'],401);unset($u['senha_hash']);$_SESSION['usuario_id']=$u['id'];out(['usuario'=>$u]);}
if($action==='cursos')out($pdo->query('SELECT id,slug,titulo,categoria,descricao,duracao_minutos,xp FROM cursos WHERE ativo=1 ORDER BY id')->fetchAll());
if($action==='vagas')out($pdo->query('SELECT id,titulo,empresa,modalidade,cidade,descricao FROM vagas WHERE ativa=1 ORDER BY id DESC')->fetchAll());
out(['erro'=>'Rota não encontrada'],404);
