import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CampoImagen } from './campo-imagen';

describe('CampoImagen', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CampoImagen],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function crear(clave: 'icono' | null = null) {
    const fixture = TestBed.createComponent(CampoImagen);
    fixture.componentRef.setInput('clave', clave);
    await fixture.whenStable();
    return fixture;
  }

  async function elegirArchivo(fixture: ComponentFixture<CampoImagen>) {
    const campo = fixture.nativeElement.querySelector('input[type=file]') as HTMLInputElement;
    // jsdom no tiene DataTransfer: basta con una lista con el archivo.
    const archivo = new File(['x'], 'foto.jpg', { type: 'image/jpeg' });
    Object.defineProperty(campo, 'files', { value: [archivo], configurable: true });
    campo.dispatchEvent(new Event('change'));
  }

  it('foto de producto: sube y deja la ruta para guardarla con el formulario', async () => {
    const fixture = await crear();
    await elegirArchivo(fixture);

    const peticion = http.expectOne('backend/api/admin/subir.php');
    expect(peticion.request.headers.get('X-Panel')).toBe('1');
    peticion.flush({ ruta: 'backend/uploads/a.jpg' });
    await fixture.whenStable();

    expect(fixture.componentInstance.ruta()).toBe('backend/uploads/a.jpg');
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe(
      'backend/uploads/a.jpg',
    );
  });

  it('foto de producto: si se reemplaza antes de guardar, descarta la anterior', async () => {
    const fixture = await crear();
    await elegirArchivo(fixture);
    http.expectOne('backend/api/admin/subir.php').flush({ ruta: 'backend/uploads/a.jpg' });
    await fixture.whenStable();

    await elegirArchivo(fixture);
    http.expectOne('backend/api/admin/subir.php').flush({ ruta: 'backend/uploads/b.jpg' });

    const descarte = http.expectOne((r) => r.method === 'DELETE');
    expect(descarte.request.params.get('ruta')).toBe('backend/uploads/a.jpg');
    descarte.flush({ ok: true });
    expect(fixture.componentInstance.ruta()).toBe('backend/uploads/b.jpg');
  });

  it('ícono: se guarda en cuanto se sube', async () => {
    const fixture = await crear('icono');
    await elegirArchivo(fixture);

    http
      .expectOne('backend/api/admin/imagen-sitio.php?clave=icono')
      .flush({ ruta: 'backend/uploads/logo.png' });
    await fixture.whenStable();

    expect(fixture.componentInstance.ruta()).toBe('backend/uploads/logo.png');
    expect(fixture.nativeElement.textContent).toContain('Imagen guardada.');
  });

  it('muestra el error del servidor', async () => {
    const fixture = await crear();
    await elegirArchivo(fixture);

    http
      .expectOne('backend/api/admin/subir.php')
      .flush({ error: 'Formato no permitido.' }, { status: 422, statusText: 'Unprocessable' });
    await fixture.whenStable();

    expect(fixture.componentInstance.ruta()).toBe('');
    expect(fixture.nativeElement.textContent).toContain('Formato no permitido.');
  });
});
