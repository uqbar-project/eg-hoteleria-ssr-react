import { differenceInCalendarDays } from 'date-fns'

export class Opinion {
  constructor(
    public autor: string,
    public texto: string,
    public puntuacion: number,
    public fecha: string,
  ) {}
}

export class Alojamiento {
  constructor(
    public id: string,
    public titulo: string,
    public descripcionCorta: string,
    public descripcionLarga: string,
    public imagen: string,
    public precioPorNoche: number,
    public destino: string,
    public servicios: string[],
    public opiniones: Opinion[],
  ) {}

  calcularPrecioTotal(checkIn: string, checkOut: string): number {
    const inicio = new Date(checkIn)
    const fin = new Date(checkOut)
    const noches = Math.max(0, differenceInCalendarDays(fin, inicio))
    return noches * this.precioPorNoche
  }

  puntajePromedio(): number {
    if (this.opiniones.length === 0) return 0
    return (
      this.opiniones.reduce((total, opinion) => total + opinion.puntuacion, 0) /
      this.opiniones.length
    )
  }
}
