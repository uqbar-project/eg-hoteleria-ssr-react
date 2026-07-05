# Plan: SSR con Remix — Buscador de Alojamientos

## Objetivo

Ejemplo didáctico de SSR (Server-Side Rendering) con Remix para mostrar:
- SEO (HTML completo con datos)
- Performance (FCP rápido, sin flash de carga)
- Open Graph / compartir en redes
- Hidratación: dos vidas del componente (server y cliente)
- Cálculos en servidor (precio total según fechas)

## Stack

- Remix (con Vite)
- TypeScript
- Tailwind CSS
- Datos mock (sin base de datos)

## Estructura de archivos

```
app/
  models/
    accommodation.ts          # Tipos + datos mock + funciones async
  routes/
    _index.tsx                # Home: buscador + listado de alojamientos
    accommodation.$id.tsx     # Detalle del alojamiento (ruta dinámica)
  root.tsx                    # Layout global
```

## Pasos para construir

1. `npx create-remix@latest` con template básico (solo TypeScript, sin Tailwind preconfigurado)
2. Instalar y configurar Tailwind CSS
3. Crear `app/models/accommodation.ts` con tipos, datos mock y funciones get
4. Crear `app/routes/_index.tsx`:
   - Formulario con destino, check-in, check-out
   - Loader que filtra y calcula precio total
   - Listado de resultados con Link al detalle
5. Crear `app/routes/accommodation.$id.tsx`:
   - Loader que busca por id (con manejo de 404)
   - Vista con imagen, descripción, servicios y reseñas
   - Botón "Compartir" con Web Share API
6. Verificar funcionamiento

## Puntos pedagógicos clave para mostrar en clase

| Demostración | Cómo hacerlo | Qué explica |
|---|---|---|
| HTML completo | Ver View Source o `curl localhost...` | SSR vs SPA: el contenido viaja en el HTML inicial |
| Loader corre en server | `console.log` dentro del loader → sale en terminal | Código server-side invisible al cliente |
| Sin JavaScript | Desactivar JS en DevTools → la página se ve igual | Progresive enhancement, contenido sin JS |
| Hydration mismatch | Poner `new Date()` en el render → error en consola | Dos vidas del componente, servidor vs cliente |
| Network con throttle | Poner "Slow 3G" y navegar | No hay flash blanco, navegación instantánea |
| SEO / Open Graph | Compartir link en WhatsApp/Telegram | Aparece título, descripción e imagen del hotel |

## Archivo de datos mock (accommodation.ts)

- 10 alojamientos: Mar del Plata, Bariloche, Buenos Aires, Mendoza, Salta, Puerto Iguazú, Córdoba, Ushuaia, El Calafate, Puerto Madryn
- Cada uno con: título, descripción corta/larga, imagen, precio por noche, servicios, reseñas
- Funciones `getAccommodations()` y `getAccommodationById()` con delay simulado de 100ms

## Guías de implementación

### Idioma
- Código en **castellano**: nombres de variables, funciones, tipos, comentarios (si los hay)
- Los nombres de archivos y rutas pueden quedar en inglés por convención de Remix (`accommodation.$id.tsx`)

### Estilo funcional
- Usar `filter`, `map`, `reduce`, `some`, `every` en lugar de `for`/`break`/`continue`
- Preferir expresiones sobre statements
- Evitar mutaciones, usar inmutabilidad

### Abstracciones
- Funciones cortas (ideal < 15 líneas)
- Cada función hace una sola cosa
- Separar lógica de negocio de la presentación
- Los `loader` deben ser delgados: delegan a funciones del modelo

### Variables
- Nombres expresivos y completos (ej: `alojamientosFiltrados` en vez de `arr` o `x`)
- Evitar abreviaturas crípticas
- Preferir nombres que se lean como oraciones

### Tooling
- `pnpm` como package manager (no npm, no yarn)
- `biome.json` para linting y formateo (reemplaza ESLint + Prettier)

### Estructura final del proyecto
```
eg-hoteleria-ssr-react/
  plans/
    01-remix-ssr-alojamientos.md
  biome.json
  package.json
  app/
    models/
      accommodation.ts
    routes/
      _index.tsx
      accommodation.$id.tsx
    root.tsx
  (resto de archivos de Remix)
```

## Notas

- No usar `useState`/`useEffect` para el formulario: el `Form` de Remix maneja todo vía URL
- El precio total se calcula en el `loader` (servidor), nunca en el cliente
- `navigator.share` para el botón compartir (solo cliente, va fuera del loader)
