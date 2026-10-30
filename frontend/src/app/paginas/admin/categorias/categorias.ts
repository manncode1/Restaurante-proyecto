import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Admin, Categoria, CategoriaForm, mensajeError } from '../../../services/admin';

// Sin diseño a propósito: solo la funcionalidad.
@Component({
  selector: 'app-categorias',
  imports: [FormsModule],
  templateUrl: './categorias.html',
})
export class Categorias {
  private readonly admin = inject(Admin);

  protected readonly categorias = signal<Categoria[]>([]);
  /** Categoría que se está creando o editando; null = formulario cerrado. */
  protected readonly form = signal<CategoriaForm | null>(null);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');

  constructor() {
    this.cargar();
  }

  /** Las nuevas quedan al final; luego se acomodan con las flechas. */
  protected nueva(): void {
    this.abrir({ nombre: '' });
  }

  protected editar(categoria: Categoria): void {
    this.abrir({ id: categoria.id, nombre: categoria.nombre });
  }

  /** Sube (-1) o baja (+1) una categoría un lugar y guarda el orden completo. */
  protected mover(indice: number, direccion: -1 | 1): void {
    const lista = [...this.categorias()];
    const destino = indice + direccion;
    [lista[indice], lista[destino]] = [lista[destino], lista[indice]];
    this.categorias.set(lista);

    this.admin.ordenarCategorias(lista.map((c) => c.id)).subscribe({
      next: () => this.cargar(),
      error: (e) => {
        this.error.set(mensajeError(e));
        this.cargar();
      },
    });
  }

  protected cancelar(): void {
    this.form.set(null);
  }

  protected guardar(evento: Event, categoria: CategoriaForm): void {
    evento.preventDefault();
    this.admin.guardarCategoria(categoria).subscribe({
      next: () => this.terminar(categoria.id ? 'Categoría actualizada.' : 'Categoría creada.'),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  protected borrar(categoria: Categoria): void {
    if (!confirm(`¿Borrar la categoría "${categoria.nombre}"?`)) {
      return;
    }
    this.admin.borrarCategoria(categoria.id).subscribe({
      next: () => this.terminar('Categoría borrada.'),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  private abrir(categoria: CategoriaForm): void {
    this.mensaje.set('');
    this.error.set('');
    this.form.set(categoria);
  }

  private terminar(mensaje: string): void {
    this.form.set(null);
    this.error.set('');
    this.mensaje.set(mensaje);
    this.cargar();
  }

  private cargar(): void {
    this.admin.categorias().subscribe({
      next: (categorias) => this.categorias.set(categorias),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
