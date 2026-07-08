import { existsSync, readFileSync } from 'node:fs'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { repositorioAlojamientos } from '../shared/repositories/alojamientos.js'
import { detalleView } from './views/detalle.js'
import { homeView } from './views/home.js'
import { layout } from './views/layout.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BUILD_DIR = join(__dirname, 'build')
const SHARED_PUBLIC_DIR = join(__dirname, '..', 'shared', 'public')

const MIME_TYPES: Record<string, string> = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
}

interface LayoutParams {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  content: string
}

const server = createServer(async (request: IncomingMessage, response: ServerResponse) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
  const pathname = url.pathname

  try {
    if (pathname === '/favicon.ico') {
      servirArchivoEstatico(response, pathname, SHARED_PUBLIC_DIR)
      return
    }

    if (pathname.startsWith('/static/')) {
      servirArchivoEstatico(response, pathname, BUILD_DIR)
      return
    }

    if (pathname === '/') {
      await manejarHome(response, url)
      return
    }

    const coincidenciaDetalle = pathname.match(/^\/accommodation\/(.+)$/)
    if (coincidenciaDetalle) {
      await manejarDetalle(response, coincidenciaDetalle[1] || '')
      return
    }

    responderConLayout(response, 404, {
      title: 'Página no encontrada',
      content:
        '<p class="text-gray-500">Página no encontrada.</p><a href="/" class="text-sky-700 hover:text-sky-600">&larr; Volver al listado</a>',
    })
  } catch (error) {
    console.error('Error:', error)
    responderConLayout(response, 500, {
      title: 'Error del servidor',
      content: '<p class="text-gray-500">Ocurrió un error inesperado.</p>',
    })
  }
})

async function manejarHome(response: ServerResponse, url: URL): Promise<void> {
  const destino = url.searchParams.get('destino') || ''
  const checkIn = url.searchParams.get('checkIn') || ''
  const checkOut = url.searchParams.get('checkOut') || ''

  const todosLosAlojamientos = await repositorioAlojamientos.obtenerTodos()
  const destinosDisponibles = repositorioAlojamientos.obtenerDestinos(todosLosAlojamientos)
  const alojamientosFiltrados = repositorioAlojamientos.filtrarPorDestino(
    todosLosAlojamientos,
    destino || undefined,
  )

  const alojamientos = alojamientosFiltrados.map((alojamiento) => ({
    ...alojamiento,
    precioTotal:
      checkIn && checkOut
        ? alojamiento.calcularPrecioTotal(checkIn, checkOut)
        : alojamiento.precioPorNoche,
  }))

  const content = homeView({
    alojamientos,
    destinos: destinosDisponibles,
    destino,
    checkIn,
    checkOut,
  })

  responderConLayout(response, 200, {
    title: destino ? `Alojamientos en ${destino}` : 'Alojamientos - Encontrá tu hospedaje ideal',
    description: 'Buscá y compará alojamientos en los mejores destinos',
    content,
  })
}

async function manejarDetalle(response: ServerResponse, id: string): Promise<void> {
  const alojamiento = await repositorioAlojamientos.obtenerPorId(id)

  if (!alojamiento) {
    responderConLayout(response, 404, {
      title: 'Alojamiento no encontrado',
      content:
        '<p class="text-gray-500">Alojamiento no encontrado.</p><a href="/" data-testid="back-link" class="text-sky-700 hover:text-sky-600">&larr; Volver al listado</a>',
    })
    return
  }

  const content = detalleView({ alojamiento })

  responderConLayout(response, 200, {
    title: `${alojamiento.titulo} - Alojamientos`,
    description: alojamiento.descripcionCorta,
    ogTitle: alojamiento.titulo,
    ogDescription: alojamiento.descripcionCorta,
    ogImage: alojamiento.imagen,
    content,
  })
}

function servirArchivoEstatico(
  response: ServerResponse,
  pathname: string,
  baseDir = BUILD_DIR,
): void {
  const prefix = pathname.startsWith('/static/') ? '/static/' : '/'
  const rutaRelativa = pathname.slice(prefix.length)
  const filePath = join(baseDir, rutaRelativa)

  if (!existsSync(filePath)) {
    response.writeHead(404)
    response.end('Not found')
    return
  }

  const extension = extname(filePath)
  const contentType = MIME_TYPES[extension] || 'application/octet-stream'
  const content = readFileSync(filePath)
  response.writeHead(200, { 'Content-Type': contentType })
  response.end(content)
}

function responderConLayout(response: ServerResponse, status: number, options: LayoutParams): void {
  const html = layout(options)
  response.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' })
  response.end(html)
}

const DEFAULT_PORT = Number(process.env.PORT) || 3000

export function startServer(port = DEFAULT_PORT): Promise<{ server: Server; port: number }> {
  return new Promise((resolve) => {
    server.listen(port, () => {
      const address = server.address()
      const actualPort = typeof address === 'object' && address ? address.port : port
      console.log(`Servidor corriendo en http://localhost:${actualPort}`)
      resolve({ server, port: actualPort })
    })
  })
}

if (!process.env.VITEST) {
  startServer()
}
