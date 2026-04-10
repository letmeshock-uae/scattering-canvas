import * as THREE from 'three'
import vertexShader from './shaders/particle.vert.glsl?raw'
import fragmentShader from './shaders/particle.frag.glsl?raw'

export interface ParticleParams {
  step:           number  // плотность: размер сетки (1 = максимум)
  proximityRadius: number  // радиус влияния курсора в NDC
  scatterDist:    number  // дальность разлёта
  enterLerp:      number  // скорость набора ховера
  exitLerp:       number  // скорость сброса ховера
}

// На touch-устройствах ограничиваем количество частиц для GPU мобильного
const IS_TOUCH = navigator.maxTouchPoints > 0
const PARTICLE_LIMIT = IS_TOUCH ? 400_000 : 1_500_000

const DEFAULT_PARAMS: ParticleParams = {
  step:            1,
  proximityRadius: 0.55,
  scatterDist:     0.8,
  enterLerp:       0.10,
  exitLerp:        0.06,
}

export class ParticleSystem {
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private renderer: THREE.WebGLRenderer
  private material: THREE.ShaderMaterial | null = null
  private hoverTarget = 0
  private hover       = 0
  private raf         = 0
  private startTime   = performance.now()
  private mouseNDC    = new THREE.Vector2(-99, -99)
  private sourceCanvas: HTMLCanvasElement | null = null

  params: ParticleParams = { ...DEFAULT_PARAMS }

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.scene  = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    window.addEventListener('mousemove',    this.onMouseMove)
    document.addEventListener('mouseleave', this.onMouseLeave)
    window.addEventListener('touchstart',  this.onTouchStart, { passive: true })
    window.addEventListener('touchmove',   this.onTouchMove,  { passive: true })
    window.addEventListener('touchend',    this.onTouchEnd)
    window.addEventListener('touchcancel', this.onTouchEnd)
    window.addEventListener('resize',      this.onResize)

    this.animate()
  }

  async init(sourceCanvas: HTMLCanvasElement) {
    this.sourceCanvas = sourceCanvas
    await this.buildGeometry(sourceCanvas)
  }

  /** Пересоздаёт геометрию с текущим this.params.step */
  async rebuild() {
    if (!this.sourceCanvas) return
    // Чистим старую сцену
    this.scene.clear()
    this.material = null
    await this.buildGeometry(this.sourceCanvas)
  }

  private async buildGeometry(sourceCanvas: HTMLCanvasElement) {
    const texture = new THREE.CanvasTexture(sourceCanvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    texture.flipY     = false

    const W    = window.innerWidth
    const H    = window.innerHeight
    // Auto-step: на мобиле лимит 400k частиц, на десктопе 1.5M
    const autoStep = Math.max(1, Math.round(Math.sqrt((W * H) / PARTICLE_LIMIT)))
    const STEP = Math.max(this.params.step, autoStep)
    const cols  = Math.floor(W / STEP)
    const rows  = Math.floor(H / STEP)
    const count = cols * rows

    const origins = new Float32Array(count * 2)
    const r1      = new Float32Array(count)
    const r2      = new Float32Array(count)

    for (let i = 0, row = 0; row < rows; row++) {
      for (let c = 0; c < cols; c++, i++) {
        origins[i * 2]     = c / cols
        origins[i * 2 + 1] = row / rows
        r1[i] = Math.random()
        r2[i] = Math.random()
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    geo.setAttribute('aOrigin',  new THREE.BufferAttribute(origins, 2))
    geo.setAttribute('aR1',      new THREE.BufferAttribute(r1, 1))
    geo.setAttribute('aR2',      new THREE.BufferAttribute(r2, 1))

    const dpr = Math.min(window.devicePixelRatio, 2)

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uHover:           { value: this.hover },
        uTime:            { value: 0 },
        uMouse:           { value: this.mouseNDC },
        uTexture:         { value: texture },
        uStep:            { value: STEP },
        uDpr:             { value: dpr },
        uProximityRadius: { value: this.params.proximityRadius },
        uScatterDist:     { value: this.params.scatterDist },
      },
      transparent: true,
      depthWrite:  false,
      depthTest:   false
    })

    this.scene.add(new THREE.Points(geo, this.material))
  }

  private setPointer(clientX: number, clientY: number) {
    this.hoverTarget = 1
    this.mouseNDC.set(
      (clientX / window.innerWidth)  *  2 - 1,
      (clientY / window.innerHeight) * -2 + 1
    )
  }

  private onMouseMove  = (e: MouseEvent) => { this.setPointer(e.clientX, e.clientY) }
  private onMouseLeave = () => { this.hoverTarget = 0; this.mouseNDC.set(-99, -99) }

  private onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0]
    if (t) this.setPointer(t.clientX, t.clientY)
  }
  private onTouchMove = (e: TouchEvent) => {
    const t = e.touches[0]
    if (t) this.setPointer(t.clientX, t.clientY)
  }
  private onTouchEnd = () => { this.hoverTarget = 0; this.mouseNDC.set(-99, -99) }

  private onResize = () => { this.renderer.setSize(window.innerWidth, window.innerHeight) }

  private animate = () => {
    this.raf = requestAnimationFrame(this.animate)
    if (!this.material) return

    const { enterLerp, exitLerp, proximityRadius, scatterDist } = this.params
    this.hover += (this.hoverTarget - this.hover) * (this.hoverTarget === 0 ? exitLerp : enterLerp)
    if (this.hover < 0.004) this.hover = 0

    this.material.uniforms.uHover.value           = this.hover
    this.material.uniforms.uTime.value            = (performance.now() - this.startTime) / 1000
    this.material.uniforms.uProximityRadius.value = proximityRadius
    this.material.uniforms.uScatterDist.value     = scatterDist
    this.renderer.render(this.scene, this.camera)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('mousemove',    this.onMouseMove)
    document.removeEventListener('mouseleave', this.onMouseLeave)
    window.removeEventListener('touchstart',   this.onTouchStart)
    window.removeEventListener('touchmove',    this.onTouchMove)
    window.removeEventListener('touchend',     this.onTouchEnd)
    window.removeEventListener('touchcancel',  this.onTouchEnd)
    window.removeEventListener('resize',       this.onResize)
    this.renderer.dispose()
  }
}
