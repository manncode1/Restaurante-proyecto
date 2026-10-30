import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Admin, Categoria, Producto, ProductoForm, mensajeError } from '../../../services/admin';
import { CampoImagen } from '../campo-imagen/campo-imagen';

// Sin diseño a propósito: solo la funcionalidad.
@Component({
  selector: 'app-productos',
  imports: [CurrencyPipe, FormsModule, CampoImagen],
  templateUrl: './productos.html',
})
export class Productos {
  private readonly admin = inject(Admin);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);
  /** Producto que se está creando o editando; null = formulario cerrado. */
  protected readonly form = signal<ProductoForm | null>(null);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');

  /** Foto que tenía el producto al abrir el formulario. */
  private imagenOriginal = '';

  constructor() {
    this.cargar();
  }

  protected nuevo(): void {
    this.abrir({
      categoria_id: this.categorias()[0]?.id ?? 0,
      nombre: '',
      descripcion: '',
      precio: 0,
      disponible: true,
      imagen: '',
    });
  }

  protected editar(producto: Producto): void {
    const { categoria, ...datos } = producto;
    this.abrir({ ...datos });
  }

  protected cancelar(): void {
    // Si se subió una foto que no se guardó, se descarta (el servidor no borra fotos en uso).
    const imagen = this.form()?.imagen;
    if (imagen && imagen !== this.imagenOriginal) {
      this.admin.descartarImagen(imagen).subscribe();
    }
    this.form.set(null);
  }

  protected guardar(evento: Event, producto: ProductoForm): void {
    evento.preventDefault();
    this.admin.guardarProducto(producto).subscribe({
      next: () => this.terminar(producto.id ? 'Producto actualizado.' : 'Producto creado.'),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  protected borrar(producto: Producto): void {
    if (!confirm(`¿Borrar "${producto.nombre}"?`)) {
      return;
    }
    this.admin.borrarProducto(producto.id).subscribe({
      next: () => this.terminar('Producto borrado.'),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  private abrir(producto: ProductoForm): void {
    this.mensaje.set('');
    this.error.set('');
    this.imagenOriginal = producto.imagen;
    this.form.set(producto);
  }

  private terminar(mensaje: string): void {
    this.form.set(null);
    this.error.set('');
    this.mensaje.set(mensaje);
    this.cargar();
  }

  private cargar(): void {
    forkJoin([this.admin.productos(), this.admin.categorias()]).subscribe({
      next: ([productos, categorias]) => {
        this.productos.set(productos);
        this.categorias.set(categorias);
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
