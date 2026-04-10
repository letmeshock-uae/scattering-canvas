import html2canvas from 'html2canvas'

/**
 * Рендерит DOM-элемент в offscreen canvas через html2canvas.
 * Игнорируем #gl-canvas чтобы html2canvas не занял его 2D-контекст
 * раньше, чем Three.js создаст WebGL-контекст.
 */
export async function captureElement(el: HTMLElement): Promise<HTMLCanvasElement> {
  const w = window.innerWidth
  const h = window.innerHeight

  return html2canvas(el, {
    backgroundColor: '#0a0a0a',
    width: w,
    height: h,
    scale: window.devicePixelRatio,
    useCORS: true,
    allowTaint: false,
    ignoreElements: (element) => element.id === 'gl-canvas'
  })
}
