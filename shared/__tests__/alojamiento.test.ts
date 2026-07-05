import { describe, expect, it } from 'vitest'

import { Alojamiento, Opinion } from '../models/alojamiento.js'

function crearAlojamiento(opiniones: Opinion[] = [], precioPorNoche = 1000): Alojamiento {
  return new Alojamiento(
    'test-id',
    'Test',
    'Descripción corta',
    'Descripción larga',
    'https://example.com/img.jpg',
    precioPorNoche,
    'Test Destino',
    ['WiFi'],
    opiniones,
  )
}

describe('Alojamiento', () => {
  describe('calcularPrecioTotal', () => {
    it('calcula el precio total multiplicando noches por precio por noche', () => {
      const alojamiento = crearAlojamiento([], 2000)
      const total = alojamiento.calcularPrecioTotal('2026-07-05', '2026-07-08')
      expect(total).toBe(6000)
    })

    it('devuelve 0 si checkOut es anterior a checkIn', () => {
      const alojamiento = crearAlojamiento([], 1000)
      const total = alojamiento.calcularPrecioTotal('2026-07-08', '2026-07-05')
      expect(total).toBe(0)
    })

    it('devuelve 0 si checkIn y checkOut son el mismo día', () => {
      const alojamiento = crearAlojamiento([], 1000)
      const total = alojamiento.calcularPrecioTotal('2026-07-05', '2026-07-05')
      expect(total).toBe(0)
    })
  })

  describe('puntajePromedio', () => {
    it('calcula el promedio de puntuaciones de opiniones', () => {
      const alojamiento = crearAlojamiento([
        new Opinion('A', 'Texto', 5, '2026-01-01'),
        new Opinion('B', 'Texto', 3, '2026-01-01'),
      ])
      expect(alojamiento.puntajePromedio()).toBe(4)
    })

    it('devuelve 5 si todas las opiniones tienen puntuación 5', () => {
      const alojamiento = crearAlojamiento([
        new Opinion('A', 'Texto', 5, '2026-01-01'),
        new Opinion('B', 'Texto', 5, '2026-01-01'),
      ])
      expect(alojamiento.puntajePromedio()).toBe(5)
    })

    it('devuelve 0 si no hay opiniones', () => {
      const alojamiento = crearAlojamiento([])
      expect(alojamiento.puntajePromedio()).toBe(0)
    })

    it('redondea correctamente cuando el promedio no es entero', () => {
      const alojamiento = crearAlojamiento([
        new Opinion('A', 'Texto', 4, '2026-01-01'),
        new Opinion('B', 'Texto', 3, '2026-01-01'),
      ])
      expect(alojamiento.puntajePromedio()).toBe(3.5)
    })
  })
})
