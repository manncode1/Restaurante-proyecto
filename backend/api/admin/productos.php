<?php
// Panel: productos del menú (incluye los no disponibles).
// GET lista | POST crea | PUT edita (con id) | DELETE ?id= borra
// Campos: categoria_id, nombre, descripcion, precio, disponible, imagen
// (imagen = ruta que devolvió subir.php, o '' para dejar el producto sin foto)
require __DIR__ . '/../../lib/admin.php';
require __DIR__ . '/../../lib/imagenes.php';

admin_iniciar(['GET', 'POST', 'PUT', 'DELETE']);
$metodo = $_SERVER['REQUEST_METHOD'];

/** Rutas de las fotos de un producto. */
function fotos_de(int $id): array {
    $consulta = db()->prepare('SELECT ubicacion FROM fotos WHERE producto_id = ? ORDER BY id');
    $consulta->execute([$id]);
    return $consulta->fetchAll(PDO::FETCH_COLUMN);
}

if ($metodo === 'GET') {
    $productos = db()->query("
        SELECT p.id, p.categoria_id, c.nombre AS categoria, p.nombre,
               COALESCE(p.descripcion, '') AS descripcion, p.precio, p.disponible,
               COALESCE((SELECT f.ubicacion FROM fotos f WHERE f.producto_id = p.id
                         ORDER BY f.id LIMIT 1), '') AS imagen
        FROM productos p
        JOIN categorias c ON c.id = p.categoria_id
        ORDER BY c.orden ASC, c.nombre ASC, p.nombre ASC, p.id ASC
    ")->fetchAll();

    foreach ($productos as &$producto) {
        $producto['precio'] = (float) $producto['precio'];
        $producto['disponible'] = (bool) $producto['disponible'];
    }
    unset($producto);

    api_responder($productos);
}

if ($metodo === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    $fotos = fotos_de($id);
    db()->prepare('DELETE FROM productos WHERE id = ?')->execute([$id]);  // fotos: ON DELETE CASCADE
    array_walk($fotos, 'borrar_imagen');
    api_responder(['ok' => true]);
}

$datos = api_entrada();
$nombre = trim((string) ($datos['nombre'] ?? ''));
$descripcion = trim((string) ($datos['descripcion'] ?? ''));
$precio = $datos['precio'] ?? null;
$categoria = (int) ($datos['categoria_id'] ?? 0);
$disponible = !empty($datos['disponible']) ? 1 : 0;
$imagen = trim((string) ($datos['imagen'] ?? ''));

if ($nombre === '' || mb_strlen($nombre) > 120) {
    admin_invalido('El nombre es obligatorio y puede tener hasta 120 caracteres.');
}
if (!is_numeric($precio) || $precio < 0 || $precio > 99999999) {
    admin_invalido('El precio debe ser un número mayor o igual a 0.');
}
if (!ruta_imagen_valida($imagen)) {
    admin_invalido('La ruta de la imagen no es válida.');
}

$valores = [$categoria, $nombre, $descripcion, round((float) $precio, 2), $disponible];

try {
    db()->beginTransaction();

    if ($metodo === 'POST') {
        db()->prepare('
            INSERT INTO productos (categoria_id, nombre, descripcion, precio, disponible)
            VALUES (?, ?, ?, ?, ?)
        ')->execute($valores);
        $id = (int) db()->lastInsertId();
    } else {
        $id = (int) ($datos['id'] ?? 0);
        db()->prepare('
            UPDATE productos
            SET categoria_id = ?, nombre = ?, descripcion = ?, precio = ?, disponible = ?
            WHERE id = ?
        ')->execute([...$valores, $id]);
    }

    // Foto: si cambió, se reemplaza el registro y después se borra el archivo anterior.
    $anteriores = fotos_de($id);
    $cambio = ($anteriores[0] ?? '') !== $imagen;
    if ($cambio) {
        db()->prepare('DELETE FROM fotos WHERE producto_id = ?')->execute([$id]);
        if ($imagen !== '') {
            db()->prepare('INSERT INTO fotos (producto_id, ubicacion) VALUES (?, ?)')->execute([$id, $imagen]);
        }
    }

    db()->commit();
} catch (PDOException $e) {
    db()->rollBack();
    if (admin_codigo_mysql($e) === 1452) {
        admin_invalido('Elige una categoría válida.');
    }
    throw $e;
}

if ($cambio) {
    array_walk($anteriores, 'borrar_imagen');
}

api_responder(['id' => $id], $metodo === 'POST' ? 201 : 200);
