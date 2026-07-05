import { JSDOM } from 'jsdom'

import React from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { loader as indexLoader } from '../app/routes/_index.js'
import { loader as detailLoader } from '../app/routes/accommodation.$id.js'

const mockUseLoaderData = vi.hoisted(() => vi.fn())

vi.mock('@remix-run/react', () => ({
  useLoaderData: mockUseLoaderData,
  Link: ({ to, children, ...props }: Record<string, unknown>) =>
    React.createElement('a', { href: to, ...props }, children as React.ReactNode),
  Form: ({ children, ...props }: Record<string, unknown>) =>
    React.createElement('form', props, children as React.ReactNode),
}))

import Index from '../app/routes/_index.js'
import AccommodacionDetalle from '../app/routes/accommodation.$id.js'

function parseHTML(html: string): Document {
  return new JSDOM(html).window.document
}

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

describe('Remix accommodation.$id meta', () => {
  it('devuelve meta tags para un alojamiento existente', async () => {
    const { meta } = await import('../app/routes/accommodation.$id.js')
    const alojamiento = await detailLoader({
      request: new Request('http://localhost/accommodation/bariloche'),
      params: { id: 'bariloche' },
      context: {},
    })
    const tags = meta({ data: alojamiento })
    expect(tags).toContainEqual({
      title: 'Cabañas del Lago - Alojamientos',
    })
    expect(tags).toContainEqual({
      name: 'description',
      content: 'Cabañas de montaña con vista al lago Nahuel Huapi',
    })
    expect(tags).toContainEqual({
      property: 'og:title',
      content: 'Cabañas del Lago',
    })
  })

  it('devuelve título fallback cuando no hay data', async () => {
    const { meta } = await import('../app/routes/accommodation.$id.js')
    const tags = meta({ data: null })
    expect(tags).toContainEqual({ title: 'Alojamiento no encontrado' })
  })
})

describe('Remix Index component', () => {
  beforeEach(() => {
    mockUseLoaderData.mockReset()
  })

  it('renderiza el título principal', () => {
    mockUseLoaderData.mockReturnValue({
      alojamientos: [],
      destinos: [],
      destino: '',
      checkIn: '',
      checkOut: '',
    })

    const html = renderToString(<Index />)
    const doc = parseHTML(html)
    expect(doc.querySelector('h1')?.textContent).toBe('Buscá tu alojamiento ideal')
    expect(doc.querySelector('h2')?.textContent).toBe('Todos los alojamientos')
  })

  it('muestra el mensaje de vacío cuando no hay alojamientos', () => {
    mockUseLoaderData.mockReturnValue({
      alojamientos: [],
      destinos: ['Bariloche'],
      destino: 'Madagascar',
      checkIn: '',
      checkOut: '',
    })

    const html = renderToString(<Index />)
    const doc = parseHTML(html)
    expect(doc.body.textContent).toContain('No se encontraron alojamientos para este destino.')
    expect(doc.querySelector('h2')?.textContent).toContain('Madagascar')
  })

  it('muestra el título filtrado cuando hay destino', () => {
    mockUseLoaderData.mockReturnValue({
      alojamientos: [],
      destinos: ['Bariloche'],
      destino: 'Bariloche',
      checkIn: '',
      checkOut: '',
    })

    const html = renderToString(<Index />)
    const doc = parseHTML(html)
    expect(doc.querySelector('h2')?.textContent).toBe('Alojamientos en Bariloche')
  })
})

describe('Remix AccommodacionDetalle component', () => {
  beforeEach(() => {
    mockUseLoaderData.mockReset()
  })

  it('renderiza el título, precio y datos del alojamiento', async () => {
    const alojamiento = await detailLoader({
      request: new Request('http://localhost/accommodation/bariloche'),
      params: { id: 'bariloche' },
      context: {},
    })
    mockUseLoaderData.mockReturnValue(alojamiento)

    const html = renderToString(<AccommodacionDetalle />)
    const doc = parseHTML(html)
    expect(doc.querySelector('h1')?.textContent).toBe('Cabañas del Lago')
    expect(doc.body.textContent).toContain('$52.000')
    expect(doc.body.textContent).toContain('por noche')
    expect(doc.body.textContent).toContain('Chimenea')
    expect(doc.body.textContent).toContain('Opiniones (3)')
    expect(doc.body.textContent).toContain('Pedro M.')
  })

  it('incluye un link de volver al listado', () => {
    mockUseLoaderData.mockReturnValue({
      id: 'test',
      titulo: 'Test',
      destino: 'Test',
      descripcionCorta: '',
      descripcionLarga: '',
      imagen: '',
      precioPorNoche: 100,
      servicios: [],
      opiniones: [],
      puntajePromedio: 0,
      calcularPrecioTotal: () => 0,
    })

    const html = renderToString(<AccommodacionDetalle />)
    const doc = parseHTML(html)
    const backLink = doc.querySelector('a')
    expect(backLink?.getAttribute('href')).toBe('/')
    expect(backLink?.textContent).toContain('Volver al listado')
  })
})
