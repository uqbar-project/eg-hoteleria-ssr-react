# SSR con Remix — Buscador de Alojamientos

Proyecto didáctico de Server-Side Rendering (SSR) con Remix, TypeScript y Tailwind CSS.

## SSR con backend externo

Hoy los datos son mock, pero si el backend estuviera en otro repositorio el cambio es mínimo:

- **`app/repositories/alojamientos.ts`** — en lugar de datos mock, haría `fetch` a la API externa. Los `loader` no se enteran: llaman al repositorio, y el repositorio decide de dónde saca los datos.
- **Tipos compartidos** — el tipo `Alojamiento` se duplica o se publica como paquete NPM compartido entre repos.
- **Manejo de errores** — hay que agregar try/catch por si la API falla (timeout, 500).
- **Autenticación** — si la API requiere token, el `loader` lo pasa en headers. Como el loader corre solo en servidor, el token nunca se filtra al cliente.

Los loaders (`_index.tsx`, `accommodation.$id.tsx`) no cambian: siguen llamando al repositorio. El resto (ruteo, render, hidratación) queda igual.

## Progressive enhancement: dos vidas del formulario

El `<Form method="get">` en `_index.tsx` funciona de dos formas según si hay JavaScript o no:

### Con JavaScript (default)

Remix intercepta el submit del form, hace un `fetch` al loader, recibe **JSON** y re-renderiza solo lo que cambió. La URL se actualiza, pero no hay recarga de página. Es rápido y sin flash blanco, pero en la pestaña Network de DevTools se ve que la respuesta es JSON, no HTML.

### Sin JavaScript (progressive enhancement)

Si desactivás JavaScript, el `<Form>` se comporta como un `<form>` HTML común: hace una navegación completa (GET), el servidor devuelve **HTML** y la página se renderiza desde cero. La misma URL, el mismo resultado visual.

### Cómo probarlo

1. Abrí DevTools (`Cmd+Option+I`)
2. `Cmd+Shift+P`, escribí "disable javascript", Enter
3. Hacé una búsqueda en la página — vas a ver un page reload y HTML completo
4. Repetí el paso 2 para reactivar JS

### Por qué importa

Esto es **progressive enhancement**: la app funciona con o sin JavaScript. Es la base del SSR moderno:

| Con JS | Sin JS |
|---|---|
| `fetch` al loader → JSON | GET tradicional → HTML |
| Re-render client-side | Page reload |
| Sin flash blanco | Flash blanco breve |
| Rápido, navegación fluida | Funcional, accesible |

### Ejemplo: el loader

```ts
// app/routes/_index.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const destino = url.searchParams.get('destino') ?? ''

  const alojamientos = await repositorioAlojamientos.obtenerTodos()
  const filtrados = repositorioAlojamientos.filtrarPorDestino(alojamientos, destino || undefined)

  return { alojamientos: filtrados, destino }
  //              ^^^^^
  // Con JS: vuelve como JSON al cliente, Remix lo hidrata
  // Sin JS: el servidor serializa esto, lo mete en el HTML y lo envía completo
}
```
