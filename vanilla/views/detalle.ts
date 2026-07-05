import { escapeHtml } from '../escapeHtml.js'

import type { Alojamiento } from '../../shared/models/alojamiento.js'

interface DetalleViewProps {
  alojamiento: Alojamiento
}

export function detalleView(props: DetalleViewProps): string {
  const { alojamiento } = props

  return `
    <div class="space-y-8">
      <a href="/" data-testid="back-link" class="inline-flex items-center text-sm text-sky-700 hover:text-sky-600">&larr; Volver al listado</a>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <img
          src="${escapeHtml(alojamiento.imagen)}"
          alt="${escapeHtml(alojamiento.titulo)}"
          class="w-full h-80 object-cover"
        />

        <div class="p-6 space-y-6">
          <div class="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900" data-testid="detail-title">${escapeHtml(alojamiento.titulo)}</h1>
              <p class="text-gray-500 mt-1">${escapeHtml(alojamiento.destino)}</p>
            </div>
            <div class="text-right">
              <p class="text-3xl font-bold text-sky-700">$${alojamiento.precioPorNoche.toLocaleString('es-AR')}</p>
              <p class="text-sm text-gray-400">por noche</p>
            </div>
          </div>

          <p class="text-gray-700 leading-relaxed">${escapeHtml(alojamiento.descripcionLarga)}</p>

          <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-3" data-testid="services-heading">Servicios</h2>
            <div class="flex flex-wrap gap-2">
              ${alojamiento.servicios.map((servicio) => `<span class="bg-sky-50 text-sky-700 text-sm px-3 py-1 rounded-full">${escapeHtml(servicio)}</span>`).join('')}
            </div>
          </div>

          <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-3" data-testid="opinions-heading">Opiniones (${alojamiento.opiniones.length})</h2>
            <div class="space-y-4">
              ${alojamiento.opiniones.map((opinion) => `
                <div class="border-b border-gray-100 pb-4 last:border-0">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-medium text-gray-900">${escapeHtml(opinion.autor)}</span>
                    <div class="flex items-center gap-1">
                      <span class="text-yellow-500">${'★'.repeat(opinion.puntuacion)}</span>
                      <span class="text-gray-300">${'★'.repeat(5 - opinion.puntuacion)}</span>
                    </div>
                  </div>
                  <p class="text-gray-600 text-sm">${escapeHtml(opinion.texto)}</p>
                  <p class="text-xs text-gray-400 mt-1">${escapeHtml(opinion.fecha)}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <button
            id="compartir-btn"
            type="button"
            data-titulo="${escapeHtml(alojamiento.titulo)}"
            class="hidden bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            Compartir
          </button>
        </div>
      </div>
    </div>

    <script src="/static/client.js"></script>
  `
}
