import { injectContent } from './content'
import { captureElement } from './capture'
import { ParticleSystem } from './particles'
import { createPanel }    from './panel'

async function bootstrap() {
  const root     = document.getElementById('portfolio-root')!
  const content  = document.getElementById('content-layer')!
  const glCanvas = document.getElementById('gl-canvas') as HTMLCanvasElement

  injectContent(content)
  await document.fonts.ready

  const snapshot = await captureElement(root)

  root.classList.add('is-captured')
  glCanvas.style.pointerEvents = 'none'

  const particles = new ParticleSystem(glCanvas)
  await particles.init(snapshot)

  createPanel(particles)

  // При resize пересобираем частицы под новый viewport
  let resizeTimer = 0
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(async () => {
      // Временно убираем is-captured чтобы html2canvas увидел реальные цвета
      root.classList.remove('is-captured')
      const newSnapshot = await captureElement(root)
      root.classList.add('is-captured')
      await particles.rebuild(newSnapshot)
    }, 300)
  })
}

bootstrap()
