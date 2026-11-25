<?php
// Banco de dados Se Conecte. No XAMPP padrão, root não possui senha.
// Em hospedagem, prefira configurar as variáveis SC_DB_* em vez de editar este arquivo.
$host=getenv('SC_DB_HOST')?:'127.0.0.1';
$db=getenv('SC_DB_NAME')?:'se_conecte';
$user=getenv('SC_DB_USER')?:'root';
$pass=getenv('SC_DB_PASS')!==false?getenv('SC_DB_PASS'):'';
$port=getenv('SC_DB_PORT')?:'3306';
$dsn="mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";
try {
  $pdo=new PDO($dsn,$user,$pass,[
    PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES=>false,
  ]);
} catch(PDOException $e) {
  error_log('Falha MySQL Se Conecte: '.$e->getMessage());
  if(!empty($scDiagnostic))throw $e;
  header('Content-Type: application/json; charset=utf-8');
  http_response_code(503);
  exit(json_encode(['erro'=>'Banco de dados indisponível. Inicie o MySQL e confira backend/config.php.'],JSON_UNESCAPED_UNICODE));
}
