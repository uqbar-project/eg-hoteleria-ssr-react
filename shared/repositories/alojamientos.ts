import { data } from '../data/alojamientos.js'
import type { Alojamiento } from '../models/alojamiento.js'

// Decisión didáctica: simula la latencia de una DB/red real para obligar
// a consumir el repositorio con async/await (manejarHome en Vanilla,
// loader en Remix). No usar en producción con datos en memoria.
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

  async obtenerDestinos(): Promise<string[]> {
    const alojamientos = await repositorioAlojamientos.obtenerTodos()
    return [...new Set(alojamientos.map((alojamiento) => alojamiento.destino))].sort()
  },

  async filtrarPorDestino(destino?: string): Promise<Alojamiento[]> {
    const alojamientos = await repositorioAlojamientos.obtenerTodos()
    if (!destino) return [...alojamientos]
    return alojamientos.filter(
      (alojamiento) => alojamiento.destino.toLowerCase() === destino.toLowerCase(),
    )
  },
}
