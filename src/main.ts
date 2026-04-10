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
  root.style.opacity = '0'

  const particles = new ParticleSystem(glCanvas)
  await particles.init(snapshot)

  glCanvas.style.pointerEvents = 'auto'

  createPanel(particles)
}

bootstrap()
