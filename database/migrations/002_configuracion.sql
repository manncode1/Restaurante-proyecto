-- Claves de configuración del sitio. Aquí se definen TODAS las claves que usa el
-- frontend; el panel de administración solo edita su `valor`.
--
-- INSERT IGNORE: si una clave ya existe conserva su valor, así que este archivo
-- se puede volver a ejecutar sin perder lo que el cliente ya personalizó.
-- Para agregar una clave nueva más adelante, crea otra migración con su INSERT IGNORE.
--
-- Todo lo de esta tabla es PÚBLICO (lo lee el sitio). Nada de contraseñas aquí.
-- Un valor vacío ('') oculta ese dato en la página.
SET NAMES utf8mb4;

INSERT IGNORE INTO configuracion (clave, valor) VALUES
  -- General
  ('nombre', 'Mi restaurante'),      -- Logo, pie de página y título de la pestaña
  ('eslogan', ''),                   -- Frase corta del pie de página y de la pestaña

  -- Portada
  ('portada_etiqueta', ''),          -- Texto pequeño sobre el título
  ('portada_titulo', ''),            -- Primera línea del título
  ('portada_titulo_destacado', ''),  -- Segunda línea del título (en cursiva)
  ('portada_texto', ''),             -- Párrafo bajo el título; también es la descripción para buscadores

  -- Nosotros
  ('descripcion', ''),               -- Historia del restaurante; se respetan los saltos de línea
  ('frase', ''),                     -- Cita destacada

  -- Contacto y ubicación
  ('direccion', ''),
  ('maps_url', ''),                  -- Botón "Cómo llegar": Google Maps > Compartir > Copiar vínculo
  ('maps_embed', ''),                -- Mapa: Google Maps > Compartir > Insertar un mapa (se acepta el <iframe> completo)
  ('horario', ''),                   -- Una línea por renglón: "Lunes a viernes: 9:00 a 22:00"
  ('telefono', ''),
  ('whatsapp', ''),                  -- Solo dígitos con lada de país: 525512345678
  ('correo', ''),

  -- Redes sociales (URL completa del perfil)
  ('facebook', ''),
  ('instagram', ''),
  ('tiktok', '');
