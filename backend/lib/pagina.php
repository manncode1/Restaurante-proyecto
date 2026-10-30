<?php
// Metadatos del index.html para buscadores y vistas previas al compartir el enlace
// (WhatsApp, Facebook...). Lo usa frontend/public/index.php en producción.
require_once __DIR__ . '/configuracion.php';

function pagina_con_metadatos(string $html): string {
    try {
        $sitio = leer_configuracion();
    } catch (Throwable $e) {
        // Sin BD se entrega la página tal cual; Angular mostrará lo que pueda.
        error_log('index.php: no se pudo leer la configuración: ' . $e->getMessage());
        return $html;
    }

    $nombre = $sitio['nombre'] ?? '';
    $eslogan = $sitio['eslogan'] ?? '';
    $titulo = $eslogan !== '' ? "$nombre | $eslogan" : $nombre;
    $descripcion = $sitio['portada_texto'] ?? '';
    $portada = $sitio['portada_imagen'] ?? '';

    // Las vistas previas exigen URLs absolutas. APP_URL (en el .env) evita depender del Host.
    $base = rtrim(env('APP_URL') ?: url_actual(), '/') . '/';
    $imagen = $portada !== '' ? $base . ltrim($portada, '/') : '';

    $e = fn (string $texto) => htmlspecialchars($texto, ENT_QUOTES, 'UTF-8');
    $etiquetas = [
        '<meta name="description" content="' . $e($descripcion) . '" />',
        '<meta property="og:type" content="website" />',
        '<meta property="og:site_name" content="' . $e($nombre) . '" />',
        '<meta property="og:title" content="' . $e($titulo) . '" />',
        '<meta property="og:description" content="' . $e($descripcion) . '" />',
        '<meta property="og:url" content="' . $e($base) . '" />',
        '<meta property="og:locale" content="es_MX" />',
        '<meta name="twitter:card" content="summary_large_image" />',
    ];
    if ($imagen !== '') {
        $etiquetas[] = '<meta property="og:image" content="' . $e($imagen) . '" />';
        // La portada es lo más pesado de la primera pantalla: que empiece a bajar de inmediato.
        $etiquetas[] = '<link rel="preload" as="image" href="' . $e($portada) . '" fetchpriority="high" />';
    }

    // Ícono propio del restaurante en lugar del favicon por defecto.
    $icono = $sitio['icono'] ?? '';
    if ($icono !== '') {
        $html = preg_replace('~<link rel="(icon|apple-touch-icon)"[^>]*>\s*~', '', $html);
        $etiquetas[] = '<link rel="icon" href="' . $e($icono) . '" />';
        $etiquetas[] = '<link rel="apple-touch-icon" href="' . $e($icono) . '" />';
    }

    // Ficha del restaurante para Google (schema.org). array_filter quita los datos vacíos.
    $restaurante = array_filter([
        '@context' => 'https://schema.org',
        '@type' => 'Restaurant',
        'name' => $nombre,
        'description' => $descripcion,
        'url' => $base,
        'image' => $imagen,
        'address' => $sitio['direccion'] ?? '',
        'telephone' => $sitio['telefono'] ?? '',
        'email' => $sitio['correo'] ?? '',
        'hasMenu' => $base . '#menu',
        'sameAs' => array_values(array_filter([
            $sitio['facebook'] ?? '',
            $sitio['instagram'] ?? '',
            $sitio['tiktok'] ?? '',
        ])),
    ]);
    $etiquetas[] = '<script type="application/ld+json">'
        . json_encode($restaurante, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG)
        . '</script>';

    $html = preg_replace_callback('~<title>.*?</title>~s', fn () => '<title>' . $e($titulo) . '</title>', $html, 1);
    $html = preg_replace('~<meta name="description"[^>]*>~', '', $html, 1);

    return str_replace('</head>', implode("\n", $etiquetas) . "\n</head>", $html);
}

/** URL de la carpeta donde está index.php (sirve también si el sitio vive en una subcarpeta). */
function url_actual(): string {
    $https = ($_SERVER['HTTPS'] ?? 'off') !== 'off' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    $carpeta = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');

    return ($https ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . $carpeta;
}
