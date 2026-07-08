import { escapeHtml } from '../escapeHtml.js'

interface LayoutOptions {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  content: string
}

export function layout(options: LayoutOptions): string {
  const { title, description, ogTitle, ogDescription, ogImage, content } = options

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/favicon.ico" />
  <title>${escapeHtml(title || 'Alojamientos')}</title>
  <meta name="description" content="${escapeHtml(description || 'Buscá y compará alojamientos en los mejores destinos')}" />
  <meta property="og:title" content="${escapeHtml(ogTitle || title || 'Alojamientos')}" />
  <meta property="og:description" content="${escapeHtml(ogDescription || description || 'Encontrá tu hospedaje ideal')}" />
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ''}
  <meta property="og:type" content="website" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-900 antialiased">
  <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
    <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/" class="text-xl font-bold text-sky-700 hover:text-sky-600">Alojamientos</a>
    </div>
  </header>
  <main class="max-w-6xl mx-auto px-4 py-8">${content}</main>
</body>
</html>`
}
