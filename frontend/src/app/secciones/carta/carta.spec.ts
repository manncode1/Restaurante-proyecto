import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Platillo } from '../../services/menu';
import { Carta } from './carta';

const PLATILLOS: Platillo[] = [
  { id: 1, nombre: 'Guacamole', descripcion: '', precio: 85, categoria: 'Entradas', imagen: null },
  { id: 2, nombre: 'Tacos', descripcion: '', precio: 120, categoria: 'Platillos fuertes', imagen: null },
  { id: 3, nombre: 'Enchiladas', descripcion: '', precio: 135, categoria: 'Platillos fuertes', imagen: null },
  { id: 4, nombre: 'Flan', descripcion: '', precio: 60, categoria: 'Postres', imagen: null }
];

const textos = (elementos: NodeListOf<Element>) =>
  Array.from(elementos, elemento => elemento.textContent?.trim());

describe('Carta', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Carta],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
  });

  async function mostrarCarta(responder: (peticion: TestRequest) => void) {
    const fixture = TestBed.createComponent(Carta);
    fixture.detectChanges();
    responder(TestBed.inject(HttpTestingController).expectOne('backend/api/menu.php'));
    await fixture.whenStable();
    return fixture;
  }

  it('crea un filtro por cada categoría que tiene platillos, en el orden recibido', async () => {
    const fixture = await mostrarCarta(peticion => peticion.flush(PLATILLOS));
    const html = fixture.nativeElement as HTMLElement;

    expect(textos(html.querySelectorAll('.filter-button'))).toEqual([
      'Todos',
      'Entradas',
      'Platillos fuertes',
      'Postres'
    ]);
  });

  it('filtra los platillos por categoría', async () => {
    const fixture = await mostrarCarta(peticion => peticion.flush(PLATILLOS));
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelectorAll('.dish-card')).toHaveLength(4);

    html.querySelectorAll<HTMLButtonElement>('.filter-button')[2].click();
    await fixture.whenStable();

    expect(textos(html.querySelectorAll('.dish-card h3'))).toEqual(['Tacos', 'Enchiladas']);
  });

  it('avisa cuando no se pudo cargar el menú', async () => {
    const fixture = await mostrarCarta(peticion =>
      peticion.flush('Error', { status: 500, statusText: 'Internal Server Error' })
    );
    const html = fixture.nativeElement as HTMLElement;

    expect(html.textContent).toContain('No pudimos cargar el menú');
    expect(html.querySelector('.dish-card')).toBeNull();
  });
});
