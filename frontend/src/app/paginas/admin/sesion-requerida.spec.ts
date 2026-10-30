import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { sesionRequerida } from './sesion-requerida';

describe('sesionRequerida', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  function revisar(respuesta: { usuario: string | null }) {
    const resultado = TestBed.runInInjectionContext(() =>
      sesionRequerida({} as never, {} as never),
    ) as Observable<boolean | UrlTree>;
    const promesa = firstValueFrom(resultado);
    TestBed.inject(HttpTestingController).expectOne('backend/api/sesion.php').flush(respuesta);
    return promesa;
  }

  it('deja pasar con sesión iniciada', async () => {
    expect(await revisar({ usuario: 'admin' })).toBe(true);
  });

  it('sin sesión manda al login', async () => {
    const destino = await revisar({ usuario: null });
    expect(TestBed.inject(Router).serializeUrl(destino as UrlTree)).toBe('/admin');
  });
});
