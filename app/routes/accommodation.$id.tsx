import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import { repositorioAlojamientos } from '~/repositories/alojamientos'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: 'Alojamiento no encontrado' }]
  }

  return [
    { title: `${data.titulo} - Alojamientos` },
    { name: 'description', content: data.descripcionCorta },
    { property: 'og:title', content: data.titulo },
    { property: 'og:description', content: data.descripcionCorta },
    { property: 'og:image', content: data.imagen },
    { property: 'og:type', content: 'website' },
  ]
}

export async function loader({ params }: LoaderFunctionArgs) {
  const alojamiento = await repositorioAlojamientos.obtenerPorId(params.id ?? '')

  if (!alojamiento) {
    throw new Response(null, { status: 404, statusText: 'No encontrado' })
  }

  return alojamiento
}

export default function AccommodacionDetalle() {
  const alojamiento = useLoaderData<typeof loader>()

  return (
    <div className="space-y-8">
      <Link to="/" className="inline-flex items-center text-sm text-sky-700 hover:text-sky-600">
        &larr; Volver al listado
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <img
          src={alojamiento.imagen}
          alt={alojamiento.titulo}
          className="w-full h-80 object-cover"
        />

        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{alojamiento.titulo}</h1>
              <p className="text-gray-500 mt-1">{alojamiento.destino}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-sky-700">
                ${alojamiento.precioPorNoche.toLocaleString('es-AR')}
              </p>
              <p className="text-sm text-gray-400">por noche</p>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed">{alojamiento.descripcionLarga}</p>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Servicios</h2>
            <div className="flex flex-wrap gap-2">
              {alojamiento.servicios.map((servicio) => (
                <span
                  key={servicio}
                  className="bg-sky-50 text-sky-700 text-sm px-3 py-1 rounded-full"
                >
                  {servicio}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Opiniones ({alojamiento.opiniones.length})
            </h2>
            <div className="space-y-4">
              {alojamiento.opiniones.map((opinion) => (
                <div
                  key={opinion.autor + opinion.fecha}
                  className="border-b border-gray-100 pb-4 last:border-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{opinion.autor}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">{'★'.repeat(opinion.puntuacion)}</span>
                      <span className="text-gray-300">{'★'.repeat(5 - opinion.puntuacion)}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{opinion.texto}</p>
                  <p className="text-xs text-gray-400 mt-1">{opinion.fecha}</p>
                </div>
              ))}
            </div>
          </div>

          <CompartirBoton titulo={alojamiento.titulo} />
        </div>
      </div>
    </div>
  )
}

function CompartirBoton({ titulo }: { titulo: string }) {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return null
  }

  return (
    <button
      type="button"
      onClick={() =>
        navigator.share({
          title: titulo,
          url: window.location.href,
        })
      }
      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
    >
      Compartir
    </button>
  )
}
