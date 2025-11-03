export const formatDate = (
  fecha?: unknown,
  tipo: 'datetime' | 'date' = 'datetime'
): string => {
  if (fecha === undefined || fecha === null || fecha === '') return '';

  let dateObj: Date;

  // Soporta Timestamp de Firestore (objeto con toDate) o valores compatibles con Date
  const maybeTimestamp = fecha as { toDate?: () => Date } | any;
  if (maybeTimestamp && typeof maybeTimestamp.toDate === 'function') {
    dateObj = maybeTimestamp.toDate();
  } else {
    dateObj = new Date(fecha as any);
  }

  if (Number.isNaN(dateObj.getTime())) return '';

  const opciones = { timeZone: 'America/Bogota' as const };

  const año = dateObj.toLocaleString('en-CA', { year: 'numeric', ...opciones });
  const mes = dateObj.toLocaleString('en-CA', { month: '2-digit', ...opciones });
  const dia = dateObj.toLocaleString('en-CA', { day: '2-digit', ...opciones });
  const hora = dateObj.toLocaleString('en-CA', {
    hour: '2-digit',
    hour12: false,
    ...opciones,
  });
  const minuto = dateObj.toLocaleString('en-CA', { minute: '2-digit', ...opciones });

  if (tipo === 'date') {
    return `${año}-${mes}-${dia}`;
  } else {
    return `${año}-${mes}-${dia}T${hora}:${minuto}`;
  }
};