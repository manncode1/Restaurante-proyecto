import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

interface Platillo {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CurrencyPipe, MatButtonModule, MatToolbarModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  nombreRestaurante = 'SABOR DE CASA';
  subtitulo = 'Una experiencia para compartir';

  menuMovilAbierto = false;

navegarMovil(id: string): void {
  this.menuMovilAbierto = false;
  this.irASeccion(id);
}

  categorias: string[] = [
    'Todos',
    'Entradas',
    'Platillos fuertes',
    'Bebidas',
    'Postres'
  ];

  categoriaSeleccionada = 'Todos';

  platillos: Platillo[] = [
    {
      nombre: 'Guacamole tradicional',
      descripcion: 'Aguacate fresco preparado con jitomate, cebolla, cilantro y un toque de limón.',
      precio: 85,
      categoria: 'Entradas',
      imagen: '/images/guacamole.jpg'
    },
    {
      nombre: 'Tacos al pastor',
      descripcion: 'Tortillas de maíz con carne al pastor, piña, cebolla y cilantro.',
      precio: 120,
      categoria: 'Platillos fuertes',
      imagen: '/images/tacos.jpg'
    },
    {
      nombre: 'Enchiladas verdes',
      descripcion: 'Tortillas rellenas, bañadas en salsa verde y acompañadas con crema y queso.',
      precio: 135,
      categoria: 'Platillos fuertes',
      imagen: '/images/enchiladas.jpg'
    },
    {
      nombre: 'Agua de horchata',
      descripcion: 'Bebida tradicional de arroz con canela, servida bien fría.',
      precio: 35,
      categoria: 'Bebidas',
      imagen: '/images/horchata.jpg'
    },
    {
      nombre: 'Agua de jamaica',
      descripcion: 'Refrescante bebida de flor de jamaica preparada al estilo de la casa.',
      precio: 35,
      categoria: 'Bebidas',
      imagen: '/images/jamaica.jpg'
    },
    {
      nombre: 'Flan de la casa',
      descripcion: 'Postre cremoso con caramelo, ideal para terminar tu comida.',
      precio: 60,
      categoria: 'Postres',
      imagen: '/images/flan.jpg'
    }
  ];

  get platillosFiltrados(): Platillo[] {
    if (this.categoriaSeleccionada === 'Todos') {
      return this.platillos;
    }

    return this.platillos.filter(
      platillo => platillo.categoria === this.categoriaSeleccionada
    );
  }

  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
  }

  irASeccion(id: string): void {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}