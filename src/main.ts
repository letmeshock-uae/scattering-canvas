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

  // Текст прозрачен по цвету — невидим, но живёт в DOM для выделения курсором
  root.classList.add('is-captured')
  // Canvas ниже DOM-слоя; события мыши/тача слушаются на window — пробиваются всегда
  glCanvas.style.pointerEvents = 'none'

  const particles = new ParticleSystem(glCanvas)
  await particles.init(snapshot)

  createPanel(particles)
}

bootstrap()
