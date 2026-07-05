import { describe, expect, it } from 'vitest'

import { repositorioAlojamientos } from '../repositories/alojamientos.js'

describe('repositorioAlojamientos', () => {
  describe('obtenerTodos', () => {
    it('devuelve todos los alojamientos', async () => {
      const todos = await repositorioAlojamientos.obtenerTodos()
      expect(todos).toHaveLength(10)
    })

    it('devuelve una copia del array (no muta el original)', async () => {
      const primeraLlamada = await repositorioAlojamientos.obtenerTodos()
      const segundaLLamada = await repositorioAlojamientos.obtenerTodos()
      expect(primeraLlamada).not.toBe(segundaLLamada)
    })
  })

  describe('obtenerPorId', () => {
    it('devuelve el alojamiento correcto por id', async () => {
      const alojamiento = await repositorioAlojamientos.obtenerPorId('bariloche')
      expect(alojamiento?.titulo).toBe('Cabañas del Lago')
      expect(alojamiento?.destino).toBe('Bariloche')
    })

    it('devuelve undefined para un id inexistente', async () => {
      const alojamiento = await repositorioAlojamientos.obtenerPorId('id-inexistente')
      expect(alojamiento).toBeUndefined()
    })

    it('devuelve undefined para id vacío', async () => {
      const alojamiento = await repositorioAlojamientos.obtenerPorId('')
      expect(alojamiento).toBeUndefined()
    })
  })

  describe('obtenerDestinos', () => {
    it('devuelve destinos únicos ordenados alfabéticamente', async () => {
      const todos = await repositorioAlojamientos.obtenerTodos()
      const destinos = repositorioAlojamientos.obtenerDestinos(todos)
      expect(destinos).toEqual([
        'Bariloche',
        'Buenos Aires',
        'Córdoba',
        'El Calafate',
        'Mar del Plata',
        'Mendoza',
        'Puerto Iguazú',
        'Puerto Madryn',
        'Salta',
        'Ushuaia',
      ])
    })

    it('no contiene duplicados', async () => {
      const todos = await repositorioAlojamientos.obtenerTodos()
      const destinos = repositorioAlojamientos.obtenerDestinos(todos)
      const sinDuplicados = new Set(destinos)
      expect(sinDuplicados.size).toBe(destinos.length)
    })
  })

  describe('filtrarPorDestino', () => {
    it('devuelve todos los alojamientos si no se especifica destino', async () => {
      const todos = await repositorioAlojamientos.obtenerTodos()
      const filtrados = repositorioAlojamientos.filtrarPorDestino(todos)
      expect(filtrados).toHaveLength(todos.length)
    })

    it('filtra por destino exacto (case insensitive)', async () => {
      const todos = await repositorioAlojamientos.obtenerTodos()
      const filtrados = repositorioAlojamientos.filtrarPorDestino(todos, 'bariloche')
      expect(filtrados).toHaveLength(1)
      expect(filtrados[0]?.id).toBe('bariloche')
    })

    it('filtra por destino con mayúsculas y minúsculas mixtas', async () => {
      const todos = await repositorioAlojamientos.obtenerTodos()
      const filtrados = repositorioAlojamientos.filtrarPorDestino(todos, 'BARILOCHE')
      expect(filtrados).toHaveLength(1)
      expect(filtrados[0]?.id).toBe('bariloche')
    })

    it('devuelve array vacío para destino sin coincidencias', async () => {
      const todos = await repositorioAlojamientos.obtenerTodos()
      const filtrados = repositorioAlojamientos.filtrarPorDestino(todos, 'Madagascar')
      expect(filtrados).toHaveLength(0)
    })

    it('no muta el array original', async () => {
      const todos = await repositorioAlojamientos.obtenerTodos()
      const copia = [...todos]
      repositorioAlojamientos.filtrarPorDestino(todos, 'Bariloche')
      expect(todos).toHaveLength(copia.length)
    })
  })
})
