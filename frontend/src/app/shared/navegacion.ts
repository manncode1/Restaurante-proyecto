/**
 * Desplaza la página hasta la sección con ese id. El espacio que ocupa la barra
 * fija lo reserva `scroll-margin-top` en styles.scss.
 */
export function irASeccion(id: string): void {
  const sinAnimacion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById(id)?.scrollIntoView({
    behavior: sinAnimacion ? 'auto' : 'smooth',
    block: 'start',
  });
}
