import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { Menu } from '../../services/menu';

@Component({
  selector: 'app-carta',
  imports: [CurrencyPipe, MatButtonModule],
  templateUrl: './carta.html',
  styleUrl: './carta.scss'
})
export class Carta {
  private readonly menuService = inject(Menu);

  /** Petición al API con su estado: isLoading(), error(), value() y reload(). */
  protected readonly platillos = rxResource({
    stream: () => this.menuService.obtenerPlatillos(),
    defaultValue: []
  });

  // value() lanza un error si la petición falló; en ese caso no hay platillos.
  private readonly listaPlatillos = computed(() =>
    this.platillos.hasValue() ? this.platillos.value() : []
  );

  /** Categorías que tienen platillos, en el orden de la BD (categorias.orden). */
  protected readonly categorias = computed(() => [
    ...new Set(this.listaPlatillos().map(platillo => platillo.categoria))
  ]);

  /** null = "Todos". */
  protected readonly categoriaSeleccionada = signal<string | null>(null);

  protected readonly platillosFiltrados = computed(() => {
    const categoria = this.categoriaSeleccionada();
    const platillos = this.listaPlatillos();

    return categoria
      ? platillos.filter(platillo => platillo.categoria === categoria)
      : platillos;
  });

  protected ocultarImagen(event: Event): void {
    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }
}
