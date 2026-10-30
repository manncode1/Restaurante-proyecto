import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Configuracion } from './configuracion';

describe('Configuracion', () => {
  let service: Configuracion;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Configuracion);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('completa las claves que falten y actualiza el título de la pestaña', () => {
    service.cargar().subscribe();
    http
      .expectOne('backend/api/configuracion.php')
      .flush({ nombre: 'La Fonda', eslogan: 'Comida casera' });

    expect(service.sitio().nombre).toBe('La Fonda');
    expect(service.sitio().telefono).toBe('');
    expect(TestBed.inject(Title).getTitle()).toBe('La Fonda | Comida casera');
  });

  it('si la API falla, la app arranca igual con valores vacíos', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let terminado = false;

    service.cargar().subscribe({ complete: () => (terminado = true) });
    http
      .expectOne('backend/api/configuracion.php')
      .flush('Error', { status: 500, statusText: 'Internal Server Error' });

    expect(terminado).toBe(true);
    expect(service.sitio().nombre).toBe('');
  });
});
