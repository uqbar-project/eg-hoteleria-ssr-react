import { escapeHtml } from '../escapeHtml.js'

interface AlojamientoVista {
  id: string
  titulo: string
  descripcionCorta: string
  imagen: string
  destino: string
  precioTotal: number
}

interface HomeViewProps {
  alojamientos: AlojamientoVista[]
  destinos: string[]
  destino: string
  checkIn: string
  checkOut: string
}

export function homeView(props: HomeViewProps): string {
  const { alojamientos, destinos, destino, checkIn, checkOut } = props

  return `
    <div class="space-y-8">
      <section>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Busc\u00e1 tu alojamiento ideal</h1>
        <p class="text-gray-600 mb-6">Encontr\u00e1 el hospedaje perfecto para tus pr\u00f3ximas vacaciones</p>

        <form method="get" class="flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[200px]">
            <label for="destino" class="block text-sm font-medium text-gray-700 mb-1">Destino</label>
            <select
              id="destino"
              name="destino"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">Todos los destinos</option>
              ${destinos.map((destinoOpcion) => `<option value="${escapeHtml(destinoOpcion)}" ${destinoOpcion === destino ? 'selected' : ''}>${escapeHtml(destinoOpcion)}</option>`).join('')}
            </select>
          </div>

          <div class="flex-1 min-w-[160px]">
            <label for="checkIn" class="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
            <input
              id="checkIn"
              name="checkIn"
              type="date"
              value="${escapeHtml(checkIn)}"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div class="flex-1 min-w-[160px]">
            <label for="checkOut" class="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
            <input
              id="checkOut"
              name="checkOut"
              type="date"
              value="${escapeHtml(checkOut)}"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            class="bg-sky-700 text-white px-6 py-2 rounded-lg hover:bg-sky-600 font-medium"
          >
            Buscar
          </button>
        </form>
      </section>

      <section>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          ${destino ? `Alojamientos en ${escapeHtml(destino)}` : 'Todos los alojamientos'}
        </h2>

        ${alojamientos.length === 0
          ? '<p class="text-gray-500">No se encontraron alojamientos para este destino.</p>'
          : `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${alojamientos.map((alojamiento) => `
                <a href="/accommodation/${escapeHtml(alojamiento.id)}" class="flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <img src="${escapeHtml(alojamiento.imagen)}" alt="${escapeHtml(alojamiento.titulo)}" class="w-full h-48 object-cover" />
                  <div class="flex flex-col flex-1 p-4 gap-2">
                    <h3 class="text-lg font-semibold text-gray-900">${escapeHtml(alojamiento.titulo)}</h3>
                    <p class="text-sm text-gray-500 flex-1">${escapeHtml(alojamiento.descripcionCorta)}</p>
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-600">${escapeHtml(alojamiento.destino)}</span>
                      <span class="text-lg font-bold text-sky-700">$${alojamiento.precioTotal.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </a>
              `).join('')}
            </div>`
        }
      </section>
    </div>
  `
}
