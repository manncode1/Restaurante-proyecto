<?php
// Solo en producción: entrega la app de Angular con el título, la descripción y la vista
// previa del restaurante ya escritos en el HTML. WhatsApp, Facebook y los buscadores no
// ejecutan JavaScript, así que Angular no puede hacerlo por ellos. (ng serve no usa este archivo.)
$html = file_get_contents(__DIR__ . '/index.html');
$metadatos = __DIR__ . '/backend/lib/pagina.php';

if (is_file($metadatos)) {
    require $metadatos;
    $html = pagina_con_metadatos($html);
}

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache');
echo $html;
