<?php
// Crea un usuario del panel o cambia su contraseña. Solo desde la consola:
//   php backend/scripts/crear_usuario.php <usuario> <contraseña>
if (PHP_SAPI !== 'cli') {
    exit;
}
require __DIR__ . '/../config/config.php';

[, $usuario, $password] = $argv + [null, '', ''];
if ($usuario === '' || strlen($password) < 8) {
    fwrite(STDERR, "Uso: php backend/scripts/crear_usuario.php <usuario> <contraseña de 8+ caracteres>\n");
    exit(1);
}

db()->prepare(
    'INSERT INTO usuarios (usuario, password_hash) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)'
)->execute([$usuario, password_hash($password, PASSWORD_DEFAULT)]);

echo "Usuario '$usuario' listo.\n";
