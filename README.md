# SSR con Remix — Buscador de Alojamientos

Proyecto didáctico de Server-Side Rendering (SSR) con Remix, TypeScript y Tailwind CSS.

## SSR con backend externo

Hoy los datos son mock, pero si el backend estuviera en otro repositorio el cambio es mínimo:

- **`app/repositories/alojamientos.ts`** — en lugar de datos mock, haría `fetch` a la API externa. Los `loader` no se enteran: llaman al repositorio, y el repositorio decide de dónde saca los datos.
- **Tipos compartidos** — el tipo `Alojamiento` se duplica o se publica como paquete NPM compartido entre repos.
- **Manejo de errores** — hay que agregar try/catch por si la API falla (timeout, 500).
- **Autenticación** — si la API requiere token, el `loader` lo pasa en headers. Como el loader corre solo en servidor, el token nunca se filtra al cliente.

Los loaders (`_index.tsx`, `accommodation.$id.tsx`) no cambian: siguen llamando al repositorio. El resto (ruteo, render, hidratación) queda igual.
