import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Configuracion, Sitio } from '../../services/configuracion';
import { Contacto } from './contacto';

describe('Contacto', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Contacto],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
  });

  async function mostrarContacto(valores: Partial<Sitio>): Promise<HTMLElement> {
    TestBed.inject(Configuracion).cargar().subscribe();
    TestBed.inject(HttpTestingController)
      .expectOne('backend/api/configuracion.php')
      .flush(valores);

    const fixture = TestBed.createComponent(Contacto);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('muestra solo los datos y redes que tienen valor', async () => {
    const html = await mostrarContacto({
      telefono: '55 1234 5678',
      instagram: 'https://www.instagram.com/ejemplo'
    });

    expect(html.querySelector('a[href="tel:5512345678"]')).not.toBeNull();
    expect(html.textContent).not.toContain('Dirección');
    expect(Array.from(html.querySelectorAll('.social-links a'), a => a.textContent)).toEqual([
      'Instagram'
    ]);
  });

  it('acepta el código <iframe> completo que da Google Maps', async () => {
    const html = await mostrarContacto({
      maps_embed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18" width="600"></iframe>'
    });

    expect(html.querySelector('iframe')?.getAttribute('src')).toBe(
      'https://www.google.com/maps/embed?pb=!1m18'
    );
  });

  it('no incrusta mapas de otros sitios', async () => {
    const html = await mostrarContacto({ maps_embed: 'https://sitio-desconocido.com/mapa' });

    expect(html.querySelector('iframe')).toBeNull();
  });
});
