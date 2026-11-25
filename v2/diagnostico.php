<?php
declare(strict_types=1);
/* Diagnóstico técnico sem credenciais ou dados de usuários. Remover/restringir em produção. */
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
function esc(string $s): string {return htmlspecialchars($s,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
function row(string $name,bool $ok,string $detail=''): string {
 return '<tr><th scope="row">'.esc($name).'</th><td class="'.($ok?'ok':'bad').'">'.($ok?'OK':'PENDENTE').'</td><td>'.esc($detail).'</td></tr>';
}
$results='';
$phpOk=PHP_VERSION_ID>=80100;
$results.=row('PHP 8.1 ou superior',$phpOk,'Versão encontrada: '.PHP_VERSION);
$pdoOk=extension_loaded('pdo_mysql');
$results.=row('Extensão pdo_mysql',$pdoOk,$pdoOk?'Extensão disponível':'Habilite pdo_mysql no PHP');
$dbOk=false;
if($pdoOk){
 try{
   $scDiagnostic=true;
   require dirname(__DIR__).'/backend/config.php';
   $dbOk=isset($pdo)&&$pdo instanceof PDO;
 }catch(Throwable $e){error_log('Se Conecte diagnostico: '.$e->getMessage());}
}
$results.=row('Conexão MySQL',$dbOk,$dbOk?'Banco de dados acessível':'Verifique Apache/MySQL e backend/config.php');
if($dbOk){
 $names=['usuarios','sc_cursos','sc_aulas','sc_aulas_concluidas','sc_certificados','sc_talentos'];
 $placeholders=implode(',',array_fill(0,count($names),'?'));
 $q=$pdo->prepare('SELECT table_name FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name IN ('.$placeholders.')');
 $q->execute($names);
 $actual=array_map('strtolower',$q->fetchAll(PDO::FETCH_COLUMN));
 foreach($names as $table)$results.=row('Tabela '.$table,in_array($table,$actual,true),'');
 $hasCourses=in_array('sc_cursos',$actual,true);
 $hasLessons=in_array('sc_aulas',$actual,true);
 if($hasCourses){
  $q=$pdo->query("SELECT slug FROM sc_cursos WHERE ativo=1 ORDER BY ordem");
  $slugs=$q->fetchAll(PDO::FETCH_COLUMN);
  $ok=count($slugs)===2&&in_array('primeiros-passos',$slugs,true)&&in_array('seguranca-digital',$slugs,true);
  $results.=row('Dois cursos ativos',$ok,implode(', ',$slugs));
 }
 if($hasLessons){
  $q=$pdo->prepare('SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=? AND column_name=?');
  $q->execute(['sc_aulas','video_url']);$hasVideo=(bool)$q->fetchColumn();
  $results.=row('Campo video_url',$hasVideo,$hasVideo?'Player conectado ao banco':'Importe 004_cursos_videos.sql');
  if($hasVideo){
   $videos=(int)$pdo->query("SELECT COUNT(*) FROM sc_aulas a JOIN sc_cursos c ON c.id=a.curso_id WHERE c.ativo=1 AND a.video_url IS NOT NULL AND TRIM(a.video_url)<>''")->fetchColumn();
   $results.=row('Vídeos configurados',$videos>0,$videos.' aula(s) com URL. Para ativar as 2 primeiras, importe 007_videoaulas_iniciais.sql.');
  }
 }
}
?>
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Diagnóstico | Se Conecte</title><style>body{font-family:system-ui,Arial,sans-serif;background:#f6f8fc;color:#101828;margin:0;padding:32px 16px}.wrap{max-width:880px;margin:auto}.brand{max-width:230px;width:100%;height:auto}.panel{background:#fff;padding:26px;border:1px solid #e5e7eb;border-radius:16px;margin-top:20px}h1{font-size:29px}p{color:#667085;line-height:1.6}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px;border-bottom:1px solid #e5e7eb;font-size:14px}th{font-weight:600}.ok{color:#137333;font-weight:750}.bad{color:#b3261e;font-weight:750}a{color:#0b57d0}@media(max-width:580px){th,td{font-size:12px;padding:9px 5px}}</style></head><body><main class="wrap"><img class="brand" alt="Se Conecte" src="../assets/brand/logo-horizontal.svg"><div class="panel"><h1>Diagnóstico da instalação</h1><p>Verificação do PHP, tabelas do MySQL e configuração das videoaulas. Esta página não altera dados.</p><table><thead><tr><th>Verificação</th><th>Estado</th><th>Detalhes</th></tr></thead><tbody><?=$results?></tbody></table><p>Se houver alguma pendência, consulte <code>v2/README.md</code>. Após configurar tudo, abra <a href="./">a plataforma</a>.</p><p><small>Por segurança, remova ou restrinja esta página antes de publicar na internet.</small></p></div></main></body></html>
