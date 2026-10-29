-- Datos de ejemplo para DESARROLLO. No ejecutar en un cliente real:
-- sobrescribe los valores de `configuracion`.
-- Requiere las migraciones 001 y 002. Se puede ejecutar varias veces sin duplicar
-- datos (los ids son fijos y INSERT IGNORE salta los que ya existen).
SET NAMES utf8mb4;

INSERT IGNORE INTO categorias (id, nombre, orden) VALUES
  (1, 'Entradas', 1),
  (2, 'Platillos fuertes', 2),
  (3, 'Bebidas', 3),
  (4, 'Postres', 4);

INSERT IGNORE INTO productos (id, categoria_id, nombre, descripcion, precio, disponible) VALUES
  (1, 1, 'Guacamole tradicional',
   'Aguacate fresco preparado con jitomate, cebolla, cilantro y un toque de limón.', 85.00, 1),
  (2, 2, 'Tacos al pastor',
   'Tortillas de maíz con carne al pastor, piña, cebolla y cilantro.', 120.00, 1),
  (3, 2, 'Enchiladas verdes',
   'Tortillas rellenas, bañadas en salsa verde y acompañadas con crema y queso.', 135.00, 1),
  (4, 3, 'Agua de horchata',
   'Bebida tradicional de arroz con canela, servida bien fría.', 35.00, 1),
  (5, 3, 'Agua de jamaica',
   'Refrescante bebida de flor de jamaica preparada al estilo de la casa.', 35.00, 1),
  (6, 4, 'Flan de la casa',
   'Postre cremoso con caramelo, ideal para terminar tu comida.', 60.00, 1);

-- Las imágenes de ejemplo están en frontend/public/images.
INSERT IGNORE INTO fotos (id, producto_id, ubicacion) VALUES
  (1, 1, 'images/guacamole.jpg'),
  (2, 2, 'images/tacos.jpg'),
  (3, 3, 'images/enchiladas.jpg'),
  (4, 4, 'images/horchata.jpg'),
  (5, 5, 'images/jamaica.jpg'),
  (6, 6, 'images/flan.jpg');

UPDATE configuracion SET valor = 'Sabor de Casa' WHERE clave = 'nombre';
UPDATE configuracion SET valor = 'Una experiencia para compartir' WHERE clave = 'eslogan';
UPDATE configuracion SET valor = 'Sabor tradicional · Momentos especiales' WHERE clave = 'portada_etiqueta';
UPDATE configuracion SET valor = 'El sabor de casa,' WHERE clave = 'portada_titulo';
UPDATE configuracion SET valor = 'en cada bocado.' WHERE clave = 'portada_titulo_destacado';
UPDATE configuracion SET valor = 'Disfruta platillos preparados con ingredientes frescos, recetas tradicionales y ese sabor que siempre invita a volver.' WHERE clave = 'portada_texto';
UPDATE configuracion SET valor = 'En Sabor de Casa creemos que la comida reúne a las personas. Por eso preparamos cada platillo con dedicación, buscando ofrecer una experiencia cálida, deliciosa y llena de tradición.\n\nQueremos que cada visita se sienta como llegar a una mesa familiar: con buena comida, atención cercana y ganas de regresar.' WHERE clave = 'descripcion';
UPDATE configuracion SET valor = 'Los mejores recuerdos comienzan alrededor de una buena mesa.' WHERE clave = 'frase';
UPDATE configuracion SET valor = 'Plaza de la Constitución s/n, Centro Histórico, Ciudad de México' WHERE clave = 'direccion';
UPDATE configuracion SET valor = 'https://www.google.com/maps/search/?api=1&query=Z%C3%B3calo%2C+Ciudad+de+M%C3%A9xico' WHERE clave = 'maps_url';
UPDATE configuracion SET valor = 'https://www.google.com/maps?q=Z%C3%B3calo,+Ciudad+de+M%C3%A9xico&output=embed' WHERE clave = 'maps_embed';
UPDATE configuracion SET valor = 'Lunes a viernes: 9:00 a 22:00\nSábado y domingo: 10:00 a 23:00' WHERE clave = 'horario';
UPDATE configuracion SET valor = '55 1234 5678' WHERE clave = 'telefono';
UPDATE configuracion SET valor = '525512345678' WHERE clave = 'whatsapp';
UPDATE configuracion SET valor = 'contacto@example.com' WHERE clave = 'correo';
UPDATE configuracion SET valor = 'https://www.facebook.com/' WHERE clave = 'facebook';
UPDATE configuracion SET valor = 'https://www.instagram.com/' WHERE clave = 'instagram';
