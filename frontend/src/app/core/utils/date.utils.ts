/**
 * Devuelve la fecha actual como 'YYYY-MM-DD' usando la zona horaria LOCAL del navegador.
 * Usar en lugar de `new Date().toISOString().split('T')[0]` que siempre usa UTC.
 */
export function localDateStr(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const dd   = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Devuelve la fecha y hora como 'YYYY-MM-DDTHH:mm' usando la zona horaria LOCAL.
 * Útil para campos <input type="datetime-local">.
 */
export function localDateTimeStr(date: Date = new Date()): string {
  const hh  = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${localDateStr(date)}T${hh}:${min}`;
}
