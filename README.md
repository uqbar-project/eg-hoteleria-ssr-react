# SSR con Remix y Vanilla — Buscador de Alojamientos

[![Build Vanilla](https://github.com/uqbar-project/eg-hoteleria-ssr-react/actions/workflows/build-vanilla.yml/badge.svg)](https://github.com/uqbar-project/eg-hoteleria-ssr-react/actions/workflows/build-vanilla.yml)
[![Coverage Vanilla](https://codecov.io/gh/uqbar-project/eg-hoteleria-ssr-react/graph/badge.svg?flag=vanilla)](https://codecov.io/gh/uqbar-project/eg-hoteleria-ssr-react)
[![Build Remix](https://github.com/uqbar-project/eg-hoteleria-ssr-react/actions/workflows/build-remix.yml/badge.svg)](https://github.com/uqbar-project/eg-hoteleria-ssr-react/actions/workflows/build-remix.yml)
[![Coverage Remix](https://codecov.io/gh/uqbar-project/eg-hoteleria-ssr-react/graph/badge.svg?flag=shared)](https://codecov.io/gh/uqbar-project/eg-hoteleria-ssr-react)

Proyecto didáctico de Server-Side Rendering (SSR) con dos implementaciones
paralelas en un mismo monorepo: **Remix** (React full-stack framework) y
**Vanilla** (Node.js puro con template literals). Ambas comparten el modelo de
dominio y los datos mock en el paquete `shared/`.

## ¿Por qué SSR?

En este ejemplo cada ruta (`/`, `/accommodation/:id`) genera **HTML completo en
el servidor** y lo envía al navegador. Esto trae varias ventajas frente a una
SPA que renderiza todo con JavaScript en el cliente:

### SEO

Los crawlers de Google, Bing y redes sociales (Open Graph) reciben HTML listo
para indexar. Cada página de detalle tiene sus propias meta tags
(`og:title`, `og:description`, `og:image`) para que al compartir el link en
WhatsApp, Twitter o Slack se vea una tarjeta con imagen, título y descripción.

### Compartir en redes

Como cada alojamiento tiene una URL única (`/accommodation/bariloche`) y el
servidor devuelve HTML con meta tags OG, al pegar el link en cualquier red
social se genera una previsualización rica. No hace falta que el destinatario
tenga JavaScript activado ni que espere a que una SPA cargue para ver el
contenido.

### Menos JavaScript, más velocidad

| Aspecto | SPA típica | SSR (este proyecto) |
|---|---|---|
| Primer paint | Espera a que cargue y ejecute JS | HTML inmediato desde el servidor |
| Bundle inicial | ~150–300 KB de JS | ~1 KB (Vanilla) o ~150 KB (Remix, con hidratación progresiva) |
| Tiempo hasta interactivo | Depende de descarga + parse + ejecución JS | Navegador pinta HTML de inmediato |
| Usuarios con JS lento/desactivado | No ven nada o ven una pantalla en blanco | Ven el contenido completo igual |

En la versión **Vanilla** el servidor envía HTML puro; el único JS que existe
es un script de ~1 KB que agrega el botón "Compartir" solo si el navegador
soporta Web Share API. La página es funcional al 100 % incluso con JavaScript
desactivado.

En la versión **Remix** el HTML inicial también se genera en servidor, y luego
React se hidrata en cliente para las transiciones de navegación. Si se
desactiva JS, Remix degrada gracefulmente a navegación tradicional (cada
click recarga la página completa desde el servidor).

### Performance

> ¿Se puede medir? Sí. Los tests de frontend de este proyecto ya verifican
> tiempos de respuesta del servidor Vanilla. Como ejercicio, se podrían agregar
> benchmarks que comparen:
>
> - **TTFB** (Time To First Byte) entre Vanilla, Remix y una hipotética SPA.
> - **Tamaño de payload** de la respuesta HTML vs JSON de una API.
> - **Cantidad de requests** necesarios para renderizar la página completa.

## Estructura del monorepo

```
eg-hoteleria-ssr-react/
├── pnpm-workspace.yaml
├── package.json              # raíz: scripts, biome, vitest
├── tsconfig.json             # base compartida
├── vitest.config.ts
├── shared/                   # ♻️ modelo de dominio compartido
│   ├── package.json
│   ├── models/alojamiento.ts
│   ├── data/alojamientos.ts
│   └── repositories/alojamientos.ts
├── remix/                    # ⚛️ implementación con Remix
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── app/
│       ├── root.tsx
│       ├── tailwind.css
│       └── routes/
│           ├── _index.tsx
│           └── accommodation.$id.tsx
└── vanilla/                  # 🏗️ implementación con Node.js puro
    ├── package.json
    ├── tsconfig.json
    ├── server.ts
    ├── escapeHtml.ts
    ├── views/
    │   ├── layout.ts
    │   ├── home.ts
    │   └── detalle.ts
    └── public/
        └── client.ts
```

## Cómo ejecutar

```bash
pnpm install

# Vanilla SSR (Node + tsx, sin frameworks)
pnpm dev:vanilla        # http://localhost:3000

# Remix SSR (React full-stack)
pnpm dev:remix          # http://localhost:5173

# Tests
pnpm test               # una vez
pnpm test:watch         # modo watch
```

---

## 🏗️ Vanilla SSR

### Stack

- **Servidor**: Node.js HTTP nativo, sin frameworks.
- **Runtime**: `tsx` (TypeScript ejecutado directamente, sin compilación previa).
- **Vistas**: Template literals con `escapeHtml` para sanitización.
- **Estilos**: Tailwind CSS vía CDN.
- **Cliente**: `public/client.ts` → compilado con esbuild → `build/client.js`.

### Arquitectura

```
cliente (navegador)
  ↓  GET /, GET /accommodation/:id
servidor HTTP (server.ts)
  ↓  importa
repositorioAlojamientos  →  data mock (shared/)
  ↓  llama
views/home.ts, views/detalle.ts
  ↓  produce
HTML completo
  ↓  envía al cliente
renderizado final
```

Cada petición genera HTML completo en el servidor. El JavaScript del cliente
solo agrega hidratación progresiva (botón "Compartir" con Web Share API).

### Rutas

| Ruta | Método | Descripción |
|---|---|---|
| `/` | GET | Listado con formulario de búsqueda y filtro por destino |
| `/?destino=X&checkIn=Y&checkOut=Z` | GET | Listado filtrado con cálculo de precio |
| `/accommodation/:id` | GET | Detalle del alojamiento con OG meta tags |
| `/static/*` | GET | Archivos estáticos (desde `build/`) |
| cualquier otra | GET | 404 |

### Flujo de render

Cada ruta se maneja con una función `async` que:
1. Obtiene datos del repositorio (con un delay simulado de 100ms).
2. Pasa los datos a la función `view` correspondiente.
3. Envuelve el HTML generado en el `layout` (head, header, footer).
4. Envía la respuesta con el status HTTP adecuado.

### Archivos clave

| Archivo | Rol |
|---|---|
| `server.ts` | Ruteo, manejo de errores, sirve estáticos |
| `views/layout.ts` | Shell HTML con meta tags, OG, Tailwind CDN |
| `views/home.ts` | Template del listado con formulario y grilla de cards |
| `views/detalle.ts` | Template del detalle con servicios, opiniones, botón compartir |
| `escapeHtml.ts` | Sanitización de strings para evitar XSS |
| `public/client.ts` | Hidratación progresiva del botón compartir |

---

## ⚛️ Remix SSR

### Stack

- **Framework**: Remix v2 (React Router, SSR nativo).
- **Build**: Vite con `@remix-run/dev` y `vite-tsconfig-paths`.
- **Estilos**: Tailwind CSS v4 vía `@tailwindcss/vite`.
- **Ruteo**: File-based routing en `app/routes/`.

### Arquitectura

```
cliente (navegador)
  ↓  GET /, GET /accommodation/:id
servidor Remix
  ↓  ejecuta el loader de la ruta
loader(_index.tsx)  →  repositorioAlojamientos (shared/)
  ↓
retorna { alojamientos, destinos, ... }
  ↓
Remix renderiza el componente React a HTML
  ↓  (con JS)
fetch al loader → JSON → re-render parcial
  ↓  (sin JS)
GET tradicional → HTML completo → page reload
```

### Progressive Enhancement

El `<Form method="get">` en `_index.tsxx` funciona de dos formas según si hay
JavaScript o no:

| Con JS | Sin JS |
|---|---|
| `fetch` al loader → JSON | GET tradicional → HTML |
| Re-render client-side | Page reload |
| Sin flash blanco | Flash blanco breve |
| Rápido, navegación fluida | Funcional, accesible |

#### Cómo probarlo

1. Abrí DevTools (`Cmd+Option+I`)
2. `Cmd+Shift+P`, escribí "disable javascript", Enter
3. Hacé una búsqueda en la página — vas a ver un page reload y HTML completo
4. Repetí el paso 2 para reactivar JS

### Sin JavaScript (progressive enhancement)

Si desactivás JavaScript, el `<Form>` se comporta como un `<form>` HTML común:
hace una navegación completa (GET), el servidor devuelve **HTML** y la página se
renderiza desde cero. La misma URL, el mismo resultado visual.

### Por qué importa

Esto es **progressive enhancement**: la app funciona con o sin JavaScript. Es la
base del SSR moderno: el servidor siempre puede generar HTML completo, y el
cliente lo mejora con interactividad cuando hay JS disponible.

### Ejemplo: el loader

```ts
// remix/app/routes/_index.tsx
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

### Archivos clave

| Archivo | Rol |
|---|---|
| `app/routes/_index.tsx` | Home: loader con filtros + componente con Form y cards |
| `app/routes/accommodation.$id.tsx` | Detalle: loader con 404 + meta OG + componente |
| `app/root.tsx` | Layout shell de Remix |
| `vite.config.ts` | Config de Vite con plugins de Remix y Tailwind |

---

## 🔄 Comparativa Vanilla vs Remix

| Aspecto | Vanilla | Remix |
|---|---|---|
| **Código servidor** | Node HTTP nativo, ~160 líneas | Remix lo abstrae completamente |
| **Vistas** | Template literals (strings) | Componentes React (JSX) |
| **Ruteo** | Manual con `if/else` + regex | File-based, automático |
| **Manejo de errores** | Try/catch manual en cada ruta | Error boundaries + Response throws |
| **SEO** | Meta tags manual en layout | `meta` export por ruta + `MetaFunction` |
| **Progressive enhancement** | No aplica (siempre HTML completo) | Form → JSON con JS, HTML sin JS |
| **Hidratación** | Solo botón compartir | Todo el árbol React |
| **Bundle cliente** | ~1KB (esbuild) | ~150KB (React + Remix) |
| **Complejidad** | Baja, fácil de entender | Media, más abstracciones |
| **Flexibilidad** | Total (control absoluto) | Alta (convenciones) |

---

## 🔗 SSR con backend externo

Hoy los datos son mock, pero si el backend estuviera en otro repositorio el
cambio es mínimo:

- **`shared/repositories/alojamientos.ts`** — en lugar de datos mock, haría
  `fetch` a la API externa. Los loaders / handlers no se enteran: llaman al
  repositorio, y el repositorio decide de dónde saca los datos.
- **Tipos compartidos** — el tipo `Alojamiento` se duplica o se publica como
  paquete NPM compartido entre repos.
- **Manejo de errores** — hay que agregar try/catch por si la API falla
  (timeout, 500).
- **Autenticación** — si la API requiere token, el loader/handler lo pasa en
  headers. Como corre solo en servidor, el token nunca se filtra al cliente.

---

## 🧪 Tests

### Dominio

Los tests de dominio cubren el modelo de negocio en `shared/`:

- `Alojamiento.calcularPrecioTotal` — cálculo de precio por noches, fechas
  inválidas, misma fecha.
- `Alojamiento.puntajePromedio` — promedio de opiniones, caso sin opiniones,
  promedios no enteros.
- `repositorioAlojamientos.obtenerTodos` — cantidad, inmutabilidad.
- `repositorioAlojamientos.obtenerPorId` — búsqueda exacta, id inexistente, id
  vacío.
- `repositorioAlojamientos.obtenerDestinos` — valores únicos, orden alfabético.
- `repositorioAlojamientos.filtrarPorDestino` — filtro exacto, case insensitive,
  destino sin resultados, inmutabilidad.

### Frontend (Vanilla SSR)

Los tests de frontend inician el servidor Vanilla en un puerto aleatorio y
verifican las respuestas HTTP:

- **Home** — status 200, título, formulario, grilla de cards, enlaces a detalle.
- **Filtro** — filtrado por destino, case insensitive, mensaje sin resultados,
  cálculo de precio con fechas.
- **Detalle** — status 200, título, datos del alojamiento, meta tags OG, 404
  para id inexistente.
- **404** — ruta inexistente devuelve 404 con mensaje.

### Cómo correr los tests

```bash
pnpm test          # ejecutar una vez
pnpm test:watch    # modo watch (re-ejecuta al cambiar archivos)
```
