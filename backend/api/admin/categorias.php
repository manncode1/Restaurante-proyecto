<?php
// Panel: categorías del menú.
// GET lista | POST crea {nombre} (queda al final) | PUT renombra {id, nombre}
// PUT {ordenar: [id, id, ...]} guarda el orden nuevo (1, 2, 3...) | DELETE ?id= borra
require __DIR__ . '/../../lib/admin.php';

admin_iniciar(['GET', 'POST', 'PUT', 'DELETE']);
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    api_responder(db()->query('
        SELECT c.id, c.nombre, c.orden, COUNT(p.id) AS productos
        FROM categorias c
        LEFT JOIN productos p ON p.categoria_id = c.id
        GROUP BY c.id, c.nombre, c.orden
        ORDER BY c.orden ASC, c.nombre ASC
    ')->fetchAll());
}

if ($metodo === 'DELETE') {
    try {
        db()->prepare('DELETE FROM categorias WHERE id = ?')->execute([(int) ($_GET['id'] ?? 0)]);
    } catch (PDOException $e) {
        if (admin_codigo_mysql($e) === 1451) {
            api_responder(['error' => 'La categoría tiene productos: muévelos a otra o bórralos primero.'], 409);
        }
        throw $e;
    }
    api_responder(['ok' => true]);
}

$datos = api_entrada();

// Reordenar: se numeran de nuevo todas, así no quedan huecos ni números repetidos.
if ($metodo === 'PUT' && isset($datos['ordenar'])) {
    if (!is_array($datos['ordenar'])) {
        admin_invalido('Orden no válido.');
    }
    $actualizar = db()->prepare('UPDATE categorias SET orden = ? WHERE id = ?');
    db()->beginTransaction();
    foreach (array_values($datos['ordenar']) as $posicion => $id) {
        $actualizar->execute([$posicion + 1, (int) $id]);
    }
    db()->commit();
    api_responder(['ok' => true]);
}

$nombre = trim((string) ($datos['nombre'] ?? ''));
if ($nombre === '' || mb_strlen($nombre) > 60) {
    admin_invalido('El nombre es obligatorio y puede tener hasta 60 caracteres.');
}

try {
    if ($metodo === 'POST') {
        db()->prepare('
            INSERT INTO categorias (nombre, orden)
            SELECT ?, COALESCE(MAX(orden), 0) + 1 FROM categorias
        ')->execute([$nombre]);
        api_responder(['id' => (int) db()->lastInsertId()], 201);
    }

    $id = (int) ($datos['id'] ?? 0);
    db()->prepare('UPDATE categorias SET nombre = ? WHERE id = ?')->execute([$nombre, $id]);
    api_responder(['id' => $id]);
} catch (PDOException $e) {
    if (admin_codigo_mysql($e) === 1062) {
        api_responder(['error' => 'Ya existe una categoría con ese nombre.'], 409);
    }
    throw $e;
}
