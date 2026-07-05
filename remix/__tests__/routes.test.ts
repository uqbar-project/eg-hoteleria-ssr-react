import { describe, expect, it } from 'vitest'

import { loader as indexLoader } from '../app/routes/_index.js'
import { loader as detailLoader } from '../app/routes/accommodation.$id.js'

describe('Remix _index loader', () => {
  it('devuelve todos los alojamientos y destinos sin filtro', async () => {
    const result = await indexLoader({
      request: new Request('http://localhost/'),
      params: {},
      context: {},
    })
    expect(result.alojamientos).toHaveLength(10)
    expect(result.destinos).toHaveLength(10)
    expect(result.destino).toBe('')
    expect(result.checkIn).toBe('')
    expect(result.checkOut).toBe('')
  })

  it('filtra por destino exacto', async () => {
    const result = await indexLoader({
      request: new Request('http://localhost/?destino=Bariloche'),
      params: {},
      context: {},
    })
    expect(result.alojamientos).toHaveLength(1)
    expect(result.alojamientos[0]?.id).toBe('bariloche')
    expect(result.alojamientos[0]?.titulo).toBe('Cabañas del Lago')
    expect(result.destino).toBe('Bariloche')
  })

  it('filtra por destino con case insensitive', async () => {
    const result = await indexLoader({
      request: new Request('http://localhost/?destino=bariloche'),
      params: {},
      context: {},
    })
    expect(result.alojamientos).toHaveLength(1)
    expect(result.alojamientos[0]?.id).toBe('bariloche')
  })

  it('calcula precioTotal cuando se pasan checkIn y checkOut', async () => {
    const result = await indexLoader({
      request: new Request(
        'http://localhost/?destino=Bariloche&checkIn=2026-07-05&checkOut=2026-07-08',
      ),
      params: {},
      context: {},
    })
    expect(result.alojamientos[0]?.precioTotal).toBe(156000)
  })

  it('devuelve precioPorNoche cuando no hay fechas', async () => {
    const result = await indexLoader({
      request: new Request('http://localhost/?destino=Bariloche'),
      params: {},
      context: {},
    })
    expect(result.alojamientos[0]?.precioTotal).toBe(52000)
  })

  it('devuelve array vacío para destino sin resultados', async () => {
    const result = await indexLoader({
      request: new Request('http://localhost/?destino=Madagascar'),
      params: {},
      context: {},
    })
    expect(result.alojamientos).toHaveLength(0)
  })
})

describe('Remix accommodation.$id loader', () => {
  it('devuelve el alojamiento para un id existente', async () => {
    const alojamiento = await detailLoader({
      request: new Request('http://localhost/accommodation/bariloche'),
      params: { id: 'bariloche' },
      context: {},
    })
    expect(alojamiento.id).toBe('bariloche')
    expect(alojamiento.titulo).toBe('Cabañas del Lago')
    expect(alojamiento.precioPorNoche).toBe(52000)
    expect(alojamiento.destino).toBe('Bariloche')
  })

  it('lanza 404 para un id inexistente', async () => {
    try {
      await detailLoader({
        request: new Request('http://localhost/accommodation/inexistente'),
        params: { id: 'inexistente' },
        context: {},
      })
      expect.fail('El loader debería haber lanzado un 404')
    } catch (error) {
      expect(error).toBeInstanceOf(Response)
      expect((error as Response).status).toBe(404)
    }
  })
})
