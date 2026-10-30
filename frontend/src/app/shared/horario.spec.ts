import { HORAS, leerHorario, lineasHorario } from './horario';

const semana = (lv: object | null, sd: object | null) =>
  JSON.stringify({
    lunes: lv,
    martes: lv,
    miercoles: lv,
    jueves: lv,
    viernes: lv,
    sabado: sd,
    domingo: sd,
  });

describe('horario', () => {
  it('agrupa los días seguidos con el mismo horario', () => {
    const valor = semana({ abre: '09:00', cierra: '22:00' }, { abre: '10:00', cierra: '23:30' });

    expect(lineasHorario(valor)).toEqual([
      'Lunes a viernes: 9:00 a 22:00',
      'Sábado y domingo: 10:00 a 23:30',
    ]);
  });

  it('marca los días cerrados', () => {
    expect(lineasHorario(semana({ abre: '13:00', cierra: '18:00' }, null))).toEqual([
      'Lunes a viernes: 13:00 a 18:00',
      'Sábado y domingo: Cerrado',
    ]);
  });

  it('no muestra nada si está vacío o todo cerrado', () => {
    expect(lineasHorario('')).toEqual([]);
    expect(lineasHorario(semana(null, null))).toEqual([]);
  });

  it('muestra tal cual un horario escrito a mano', () => {
    expect(lineasHorario('Lunes: 9 a 5\nMartes: 10 a 6')).toEqual([
      'Lunes: 9 a 5',
      'Martes: 10 a 6',
    ]);
  });

  it('descarta horas inválidas', () => {
    expect(leerHorario('{"lunes":{"abre":"9","cierra":"25:00"}}')?.lunes).toBeNull();
  });

  it('ofrece las horas cada media hora', () => {
    expect(HORAS).toHaveLength(48);
    expect(HORAS.slice(0, 3)).toEqual(['00:00', '00:30', '01:00']);
  });
});
