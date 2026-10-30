import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Inicio } from './inicio';

describe('Inicio', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('arma la página con todas sus secciones', async () => {
    const fixture = TestBed.createComponent(Inicio);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne('backend/api/menu.php').flush([]);
    await fixture.whenStable();

    const pagina = fixture.nativeElement as HTMLElement;
    for (const id of ['inicio', 'nosotros', 'menu', 'contacto']) {
      expect(pagina.querySelector(`section#${id}`)).not.toBeNull();
    }
  });
});
