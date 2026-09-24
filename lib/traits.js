// Cada característica es una pista que el juego puede revelar sobre el
// amigo secreto de un jugador. El admin elige un valor por persona.
export const TRAIT_DEFS = [
  { key: 'genero', label: 'Género', options: ['Hombre', 'Mujer'] },
  {
    key: 'cabello',
    label: 'Color de cabello',
    options: ['Negro', 'Castaño', 'Rubio', 'Canoso', 'Rojizo'],
  },
  { key: 'gafas', label: '¿Usa gafas?', options: ['Sí', 'No'] },
  { key: 'barba', label: '¿Tiene barba o bigote?', options: ['Sí', 'No'] },
  {
    key: 'edad',
    label: 'Rango de edad',
    options: ['Niño/a', 'Joven', 'Adulto', 'Mayor'],
  },
  {
    key: 'accesorio',
    label: '¿Usa gorra, sombrero o pañoleta en la foto?',
    options: ['Sí', 'No'],
  },
  {
    key: 'estatura',
    label: 'Estatura aproximada',
    options: ['Baja', 'Media', 'Alta'],
  },
];

export function emptyTraits() {
  const t = {};
  for (const def of TRAIT_DEFS) t[def.key] = def.options[0];
  return t;
}
