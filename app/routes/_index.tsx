import type { LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'

import { repositorioAlojamientos } from '~/repositories/alojamientos'

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const destino = url.searchParams.get('destino') ?? ''
  const checkIn = url.searchParams.get('checkIn') ?? ''
  const checkOut = url.searchParams.get('checkOut') ?? ''

  const todos = await repositorioAlojamientos.obtenerTodos()
  const destinos = repositorioAlojamientos.obtenerDestinos(todos)
  const filtrados = repositorioAlojamientos.filtrarPorDestino(todos, destino || undefined)

  const alojamientos = filtrados.map((alojamiento) => ({
    ...alojamiento,
    precioTotal:
      checkIn && checkOut
        ? alojamiento.calcularPrecioTotal(checkIn, checkOut)
        : alojamiento.precioPorNoche,
  }))

  return { alojamientos, destinos, destino, checkIn, checkOut }
}

export default function Index() {
  const { alojamientos, destinos, destino, checkIn, checkOut } = useLoaderData<typeof loader>()

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Buscá tu alojamiento ideal</h1>
        <p className="text-gray-600 mb-6">
          Encontrá el hospedaje perfecto para tus próximas vacaciones
        </p>

        <Form method="get" className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="destino" className="block text-sm font-medium text-gray-700 mb-1">
              Destino
            </label>
            <select
              id="destino"
              name="destino"
              defaultValue={destino}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">Todos los destinos</option>
              {destinos.map((destino) => (
                <option key={destino} value={destino}>
                  {destino}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[160px]">
            <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
              Check-in
            </label>
            <input
              id="checkIn"
              name="checkIn"
              type="date"
              defaultValue={checkIn}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div className="flex-1 min-w-[160px]">
            <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
              Check-out
            </label>
            <input
              id="checkOut"
              name="checkOut"
              type="date"
              defaultValue={checkOut}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="bg-sky-700 text-white px-6 py-2 rounded-lg hover:bg-sky-600 font-medium"
          >
            Buscar
          </button>
        </Form>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {destino ? `Alojamientos en ${destino}` : 'Todos los alojamientos'}
        </h2>

        {alojamientos.length === 0 ? (
          <p className="text-gray-500">No se encontraron alojamientos para este destino.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alojamientos.map((alojamiento) => (
              <Link
                key={alojamiento.id}
                to={`/accommodation/${alojamiento.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <img
                  src={alojamiento.imagen}
                  alt={alojamiento.titulo}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">{alojamiento.titulo}</h3>
                  <p className="text-sm text-gray-500">{alojamiento.descripcionCorta}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-gray-600">{alojamiento.destino}</span>
                    <span className="text-lg font-bold text-sky-700">
                      ${alojamiento.precioTotal.toLocaleString('es-AR')}
                    </span>
                  </div>
                  {checkIn && checkOut && (
                    <p className="text-xs text-gray-400">
                      Precio total para las fechas seleccionadas
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
