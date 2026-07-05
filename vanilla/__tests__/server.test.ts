import type { Server } from 'node:http'

import { JSDOM } from 'jsdom'

let server: Server
let baseUrl: string

function parseHTML(html: string): Document {
  return new JSDOM(html).window.document
}

async function getHTML(path: string): Promise<{ status: number; doc: Document }> {
  const response = await fetch(`${baseUrl}${path}`)
  const body = await response.text()
  return { status: response.status, doc: parseHTML(body) }
}

function queryByTestId(doc: Document, testId: string): Element | null {
  return doc.querySelector(`[data-testid="${testId}"]`)
}

describe('Vanilla SSR Server', () => {
  beforeAll(async () => {
    const { startServer } = await import('../server.js')
    const resultado = await startServer(0)
    server = resultado.server
    baseUrl = `http://localhost:${resultado.port}`
  })

  afterAll(() => {
    server.close()
  })

  describe('GET /', () => {
    it('responde con status 200', async () => {
      const { status } = await getHTML('/')
      expect(status).toBe(200)
    })

    it('incluye el título de la página en el <title>', async () => {
      const { doc } = await getHTML('/')
      expect(doc.querySelector('title')?.textContent).toBe(
        'Alojamientos - Encontrá tu hospedaje ideal',
      )
    })

    it('muestra el formulario de búsqueda con los campos esperados', async () => {
      const { doc } = await getHTML('/')
      const form = queryByTestId(doc, 'search-form')
      expect(form).not.toBeNull()
      expect(form?.querySelector('[data-testid="destino-select"]')).not.toBeNull()
      expect(form?.querySelector('[data-testid="checkin-input"]')).not.toBeNull()
      expect(form?.querySelector('[data-testid="checkout-input"]')).not.toBeNull()
    })

    it('muestra todos los alojamientos en la grilla', async () => {
      const { doc } = await getHTML('/')
      const grid = queryByTestId(doc, 'card-grid')
      expect(grid).not.toBeNull()
      expect(grid?.children.length).toBe(10)
    })

    describe('cada card tiene los datos correctos', () => {
      it('Cabañas del Lago (bariloche) — título, destino, precio por noche', async () => {
        const { doc } = await getHTML('/')
        const card = queryByTestId(doc, 'card-bariloche')
        expect(card?.textContent).toContain('Cabañas del Lago')
        expect(card?.textContent).toContain('Bariloche')
        expect(card?.textContent).toContain('$52.000')
      })

      it('Hotel Costa del Sol (mar-del-plata) — título, destino, precio por noche', async () => {
        const { doc } = await getHTML('/')
        const card = queryByTestId(doc, 'card-mar-del-plata')
        expect(card?.textContent).toContain('Hotel Costa del Sol')
        expect(card?.textContent).toContain('Mar del Plata')
        expect(card?.textContent).toContain('$45.000')
      })

      it('Palacio Recoleta (buenos-aires) — título, destino, precio por noche', async () => {
        const { doc } = await getHTML('/')
        const card = queryByTestId(doc, 'card-buenos-aires')
        expect(card?.textContent).toContain('Palacio Recoleta')
        expect(card?.textContent).toContain('Buenos Aires')
        expect(card?.textContent).toContain('$38.000')
      })
    })
  })

  describe('GET /?destino=... (filtro)', () => {
    it('filtra por destino exacto y muestra solo ese alojamiento', async () => {
      const { doc } = await getHTML('/?destino=Bariloche')
      const grid = queryByTestId(doc, 'card-grid')
      expect(grid?.children.length).toBe(1)
      const card = queryByTestId(doc, 'card-bariloche')
      expect(card?.textContent).toContain('Cabañas del Lago')
    })

    it('filtra por destino con case insensitive', async () => {
      const { doc } = await getHTML('/?destino=bariloche')
      const grid = queryByTestId(doc, 'card-grid')
      expect(grid?.children.length).toBe(1)
      expect(queryByTestId(doc, 'card-bariloche')).not.toBeNull()
    })

    it('muestra mensaje cuando no hay resultados', async () => {
      const { doc } = await getHTML('/?destino=Madagascar')
      expect(queryByTestId(doc, 'card-grid')).toBeNull()
      expect(doc.body.textContent).toContain(
        'No se encontraron alojamientos para este destino.',
      )
    })

    it('al filtrar con fechas, el precio refleja el total por noches', async () => {
      const { doc } = await getHTML(
        '/?destino=Bariloche&checkIn=2026-07-05&checkOut=2026-07-08',
      )
      const card = queryByTestId(doc, 'card-bariloche')
      // 52.000 * 3 noches = 156.000
      expect(card?.textContent).toContain('$156.000')
    })
  })

  describe('GET /accommodation/:id (detalle)', () => {
    it('responde con status 200 para un alojamiento existente', async () => {
      const { status } = await getHTML('/accommodation/bariloche')
      expect(status).toBe(200)
    })

    it('incluye el título en el <title>', async () => {
      const { doc } = await getHTML('/accommodation/bariloche')
      expect(doc.querySelector('title')?.textContent).toBe('Cabañas del Lago - Alojamientos')
    })

    it('incluye el nombre del alojamiento en el <h1> con data-testid="detail-title"', async () => {
      const { doc } = await getHTML('/accommodation/bariloche')
      const title = queryByTestId(doc, 'detail-title')
      expect(title?.textContent).toBe('Cabañas del Lago')
    })

    it('incluye el precio por noche en el detalle', async () => {
      const { doc } = await getHTML('/accommodation/bariloche')
      expect(doc.body.textContent).toContain('$52.000')
      expect(doc.body.textContent).toContain('por noche')
    })

    it('incluye la sección de servicios', async () => {
      const { doc } = await getHTML('/accommodation/bariloche')
      const servicios = queryByTestId(doc, 'services-heading')
      expect(servicios).not.toBeNull()
      expect(doc.body.textContent).toContain('Chimenea')
      expect(doc.body.textContent).toContain('Hidromasaje')
    })

    it('incluye la sección de opiniones con el número correcto', async () => {
      const { doc } = await getHTML('/accommodation/bariloche')
      const opiniones = queryByTestId(doc, 'opinions-heading')
      expect(opiniones?.textContent).toContain('Opiniones (3)')
      expect(doc.body.textContent).toContain('Pedro M.')
      expect(doc.body.textContent).toContain('Laura R.')
    })

    it('incluye meta tags OG para compartir en redes', async () => {
      const { doc } = await getHTML('/accommodation/bariloche')
      const ogTitle = doc.querySelector('meta[property="og:title"]')
      expect(ogTitle?.getAttribute('content')).toBe('Cabañas del Lago')
      const ogImage = doc.querySelector('meta[property="og:image"]')
      expect(ogImage?.getAttribute('content')).toContain('unsplash.com')
    })

    it('incluye el botón de volver', async () => {
      const { doc } = await getHTML('/accommodation/bariloche')
      expect(queryByTestId(doc, 'back-link')).not.toBeNull()
    })

    it('responde con 404 para un id inexistente', async () => {
      const { status, doc } = await getHTML('/accommodation/inexistente')
      expect(status).toBe(404)
      expect(doc.body.textContent).toContain('Alojamiento no encontrado')
      expect(queryByTestId(doc, 'back-link')).not.toBeNull()
    })
  })

  describe('GET /ruta-inexistente', () => {
    it('responde con status 404', async () => {
      const { status } = await getHTML('/ruta-inexistente')
      expect(status).toBe(404)
    })

    it('muestra mensaje de página no encontrada con link de volver', async () => {
      const { doc } = await getHTML('/ruta-inexistente')
      expect(doc.body.textContent).toContain('Página no encontrada')
      expect(doc.body.textContent).toContain('Volver al listado')
    })
  })
})
