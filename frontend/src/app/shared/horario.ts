/**
 * Horario del restaurante. Se guarda en la clave `horario` como JSON por día:
 * {"lunes": {"abre": "09:00", "cierra": "22:00"}, "domingo": null, ...} (null = cerrado).
 * El panel lo edita con listas de horas y el sitio lo muestra agrupado.
 */
export const DIAS = [
  { clave: 'lunes', nombre: 'Lunes' },
  { clave: 'martes', nombre: 'Martes' },
  { clave: 'miercoles', nombre: 'Miércoles' },
  { clave: 'jueves', nombre: 'Jueves' },
  { clave: 'viernes', nombre: 'Viernes' },
  { clave: 'sabado', nombre: 'Sábado' },
  { clave: 'domingo', nombre: 'Domingo' },
] as const;

export type DiaClave = (typeof DIAS)[number]['clave'];
export interface Rango {
  abre: string;
  cierra: string;
}
export type Horario = Record<DiaClave, Rango | null>;

/** Opciones de las listas: de 00:00 a 23:30 cada media hora. */
export const HORAS = Array.from({ length: 48 }, (_, i) => {
  const horas = String(Math.floor(i / 2)).padStart(2, '0');
  return `${horas}:${i % 2 ? '30' : '00'}`;
});

const HORA_VALIDA = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Lee el JSON guardado. Devuelve null si el valor está vacío o no es un horario válido. */
export function leerHorario(valor: string): Horario | null {
  let datos: unknown;
  try {
    datos = JSON.parse(valor);
  } catch {
    return null;
  }
  if (!datos || typeof datos !== 'object') {
    return null;
  }

  const horario = {} as Horario;
  for (const { clave } of DIAS) {
    const rango = (datos as Record<string, Partial<Rango> | null>)[clave];
    horario[clave] =
      rango && HORA_VALIDA.test(rango.abre ?? '') && HORA_VALIDA.test(rango.cierra ?? '')
        ? { abre: rango.abre!, cierra: rango.cierra! }
        : null;
  }
  return horario;
}

/**
 * Renglones para mostrar en el sitio, agrupando días seguidos con el mismo horario:
 * ["Lunes a viernes: 9:00 a 22:00", "Sábado y domingo: 10:00 a 23:00"].
 * Si el valor no es JSON (texto escrito a mano), se muestra tal cual.
 */
export function lineasHorario(valor: string): string[] {
  if (!valor.trim()) {
    return [];
  }
  const horario = leerHorario(valor);
  if (!horario) {
    return valor.split('\n').filter((linea) => linea.trim());
  }

  const grupos: { dias: string[]; rango: Rango | null }[] = [];
  for (const { clave, nombre } of DIAS) {
    const rango = horario[clave];
    const anterior = grupos.at(-1);
    if (anterior && JSON.stringify(anterior.rango) === JSON.stringify(rango)) {
      anterior.dias.push(nombre);
    } else {
      grupos.push({ dias: [nombre], rango });
    }
  }

  // Si todos los días están cerrados no se muestra nada.
  if (grupos.every((grupo) => !grupo.rango)) {
    return [];
  }

  return grupos.map(({ dias, rango }) => {
    const ultimo = dias.at(-1)!.toLowerCase();
    const etiqueta =
      dias.length === 1 ? dias[0] : `${dias[0]} ${dias.length === 2 ? 'y' : 'a'} ${ultimo}`;
    return `${etiqueta}: ${rango ? `${hora(rango.abre)} a ${hora(rango.cierra)}` : 'Cerrado'}`;
  });
}

/** "09:00" → "9:00" */
function hora(valor: string): string {
  return valor.replace(/^0(\d)/, '$1');
}
