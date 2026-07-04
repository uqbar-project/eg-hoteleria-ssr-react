import { data } from '~/data/alojamientos'
import type { Alojamiento } from '~/models/alojamiento'

function demorar(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms))
}

export const repositorioAlojamientos = {
  async obtenerTodos(): Promise<Alojamiento[]> {
    await demorar(100)
    return [...data]
  },

  async obtenerPorId(id: string): Promise<Alojamiento | undefined> {
    await demorar(100)
    return data.find((alojamiento) => alojamiento.id === id)
  },

  obtenerDestinos(alojamientos: Alojamiento[]): string[] {
    return [...new Set(alojamientos.map((alojamiento) => alojamiento.destino))].sort()
  },

  filtrarPorDestino(alojamientos: Alojamiento[], destino?: string): Alojamiento[] {
    if (!destino) return [...alojamientos]
    return alojamientos.filter(
      (alojamiento) => alojamiento.destino.toLowerCase() === destino.toLowerCase(),
    )
  },
}
