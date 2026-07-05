import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import type { Server } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { JSDOM } from 'jsdom'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BUILD_DIR = join(__dirname, '..', 'build')
const TEST_FILE = join(BUILD_DIR, '__test-static.js')

function parseHTML(html: string): Document {
  return new JSDOM(html).window.document
}

describe('Vanilla SSR - Static files', () => {
  let server: Server
  let baseUrl: string

  beforeAll(async () => {
    mkdirSync(BUILD_DIR, { recursive: true })
    writeFileSync(TEST_FILE, 'console.log("ok")')

    const { startServer } = await import('../server.js')
    const resultado = await startServer(0)
    server = resultado.server
    baseUrl = `http://localhost:${resultado.port}`
  })

  afterAll(() => {
    rmSync(TEST_FILE)
    server.close()
  })

  it('sirve un archivo estático existente con content-type correcto', async () => {
    const response = await fetch(`${baseUrl}/static/__test-static.js`)
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/javascript')
    const text = await response.text()
    expect(text).toBe('console.log("ok")')
  })

  it('responde 404 para archivo estático inexistente', async () => {
    const response = await fetch(`${baseUrl}/static/no-existe.js`)
    expect(response.status).toBe(404)
  })
})

describe('Vanilla SSR - Error 500', () => {
  let server: Server
  let baseUrl: string

  beforeAll(async () => {
    const { startServer } = await import('../server.js')
    const resultado = await startServer(0)
    server = resultado.server
    baseUrl = `http://localhost:${resultado.port}`
  })

  afterAll(() => {
    server.close()
  })

  it('responde con 500 y mensaje de error cuando repositorio falla', async () => {
    // Sobrescribimos obtenerTodos para que lance
    const { repositorioAlojamientos } = await import('../../shared/repositories/alojamientos.js')
    const original = repositorioAlojamientos.obtenerTodos.bind(repositorioAlojamientos)
    repositorioAlojamientos.obtenerTodos = () => Promise.reject(new Error('Fallo simulado'))

    try {
      const response = await fetch(`${baseUrl}/`)
      expect(response.status).toBe(500)
      const html = await response.text()
      const doc = parseHTML(html)
      expect(doc.querySelector('title')?.textContent).toBe('Error del servidor')
      expect(doc.body.textContent).toContain('Ocurrió un error inesperado')
    } finally {
      repositorioAlojamientos.obtenerTodos = original
    }
  })
})
