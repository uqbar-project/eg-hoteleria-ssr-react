document.addEventListener('DOMContentLoaded', () => {
  const compartirBtn = document.getElementById('compartir-btn') as HTMLButtonElement | null

  if (compartirBtn && typeof navigator !== 'undefined' && navigator.share) {
    compartirBtn.classList.remove('hidden')

    compartirBtn.addEventListener('click', () => {
      navigator.share({
        title: compartirBtn.getAttribute('data-titulo') || document.title,
        url: window.location.href,
      })
    })
  }
})
