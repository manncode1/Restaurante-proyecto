<?php
// Platillos disponibles, ordenados por categoría (categorias.orden) y dentro de ella alfabéticamente.
require __DIR__ . '/../lib/api.php';

api_iniciar(['GET']);

$sql = "
    SELECT
        p.id,
        p.nombre,
        COALESCE(p.descripcion, '') AS descripcion,
        p.precio,
        c.nombre AS categoria,
        (
            SELECT f.ubicacion
            FROM fotos f
            WHERE f.producto_id = p.id
            ORDER BY f.id ASC
            LIMIT 1
        ) AS imagen
    FROM productos p
    JOIN categorias c ON c.id = p.categoria_id
    WHERE p.disponible = 1
    ORDER BY c.orden ASC, c.nombre ASC, p.nombre ASC, p.id ASC
";

$platillos = db()->query($sql)->fetchAll();

foreach ($platillos as &$platillo) {
    $platillo['precio'] = (float) $platillo['precio'];
}
unset($platillo);

api_responder($platillos);
