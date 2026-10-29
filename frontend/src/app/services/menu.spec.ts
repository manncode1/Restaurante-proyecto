import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Menu, Platillo } from './menu';

describe('Menu', () => {
  let service: Menu;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(Menu);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('pide los platillos a la API con una ruta relativa', () => {
    const platillo: Platillo = {
      id: 1,
      nombre: 'Tacos al pastor',
      descripcion: '',
      precio: 120,
      categoria: 'Platillos fuertes',
      imagen: null
    };
    let recibidos: Platillo[] = [];

    service.obtenerPlatillos().subscribe(platillos => (recibidos = platillos));
    const peticion = http.expectOne('backend/api/menu.php');
    peticion.flush([platillo]);

    expect(peticion.request.method).toBe('GET');
    expect(recibidos).toEqual([platillo]);
  });
});
