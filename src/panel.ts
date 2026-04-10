import type { ParticleSystem, ParticleParams } from './particles'

interface SliderDef {
  key:   keyof ParticleParams
  label: string
  min:   number
  max:   number
  step:  number
  fmt?:  (v: number) => string
}

const SLIDERS: SliderDef[] = [
  { key: 'proximityRadius', label: 'Radius',        min: 0.05, max: 1.2,  step: 0.01 },
  { key: 'scatterDist',     label: 'Scatter',        min: 0.1,  max: 2.0,  step: 0.05 },
  { key: 'enterLerp',      label: 'Enter speed',    min: 0.01, max: 0.5,  step: 0.01 },
  { key: 'exitLerp',       label: 'Exit speed',     min: 0.01, max: 0.3,  step: 0.005 },
]

const DENSITY_OPTIONS = [
  { label: 'Low',       step: 4 },
  { label: 'Med',       step: 3 },
  { label: 'High',      step: 2 },
  { label: 'V.High',    step: 1 },
]

export function createPanel(ps: ParticleSystem): void {
  const panel = document.createElement('div')
  panel.className = 'pp-panel'

  // ── Header ──────────────────────────────────────────
  const header = document.createElement('div')
  header.className = 'pp-header'

  const title = document.createElement('span')
  title.className = 'pp-title'
  title.textContent = 'Particles'

  const toggle = document.createElement('button')
  toggle.className = 'pp-toggle'
  toggle.innerHTML = '&#x25B4;'
  toggle.title = 'Collapse'

  header.append(title, toggle)

  // ── Body ─────────────────────────────────────────────
  const body = document.createElement('div')
  body.className = 'pp-body'

  // Density segmented control
  const densityRow = document.createElement('div')
  densityRow.className = 'pp-row pp-row--density'

  const densityLabel = document.createElement('span')
  densityLabel.className = 'pp-label'
  densityLabel.textContent = 'Density'

  const densitySeg = document.createElement('div')
  densitySeg.className = 'pp-seg'

  let rebuildTimer = 0

  DENSITY_OPTIONS.forEach(({ label, step }) => {
    const btn = document.createElement('button')
    btn.className = 'pp-seg-btn' + (ps.params.step === step ? ' pp-seg-btn--active' : '')
    btn.textContent = label
    btn.addEventListener('click', () => {
      densitySeg.querySelectorAll('.pp-seg-btn').forEach(b => b.classList.remove('pp-seg-btn--active'))
      btn.classList.add('pp-seg-btn--active')
      ps.params.step = step
      clearTimeout(rebuildTimer)
      rebuildTimer = window.setTimeout(() => ps.rebuild(), 80)
    })
    densitySeg.appendChild(btn)
  })

  densityRow.append(densityLabel, densitySeg)
  body.appendChild(densityRow)

  // ── Scatter mode toggle ──────────────────────────────
  const modeRow = document.createElement('div')
  modeRow.className = 'pp-row pp-row--density'

  const modeLabel = document.createElement('span')
  modeLabel.className = 'pp-label'
  modeLabel.textContent = 'Mode'

  const modeSeg = document.createElement('div')
  modeSeg.className = 'pp-seg'

  const MODES: { label: string; value: 0 | 1 }[] = [
    { label: 'Random', value: 0 },
    { label: 'Magnet', value: 1 },
  ]

  MODES.forEach(({ label, value }) => {
    const btn = document.createElement('button')
    btn.className = 'pp-seg-btn' + (ps.params.scatterMode === value ? ' pp-seg-btn--active' : '')
    btn.textContent = label
    btn.addEventListener('click', () => {
      modeSeg.querySelectorAll('.pp-seg-btn').forEach(b => b.classList.remove('pp-seg-btn--active'))
      btn.classList.add('pp-seg-btn--active')
      ps.params.scatterMode = value
    })
    modeSeg.appendChild(btn)
  })

  modeRow.append(modeLabel, modeSeg)
  body.appendChild(modeRow)

  // Sliders
  SLIDERS.forEach(({ key, label, min, max, step }) => {
    const row = document.createElement('div')
    row.className = 'pp-row'

    const rowTop = document.createElement('div')
    rowTop.className = 'pp-row-top'

    const lbl = document.createElement('span')
    lbl.className = 'pp-label'
    lbl.textContent = label

    const val = document.createElement('span')
    val.className = 'pp-value'
    val.textContent = String((ps.params[key] as number).toFixed(step < 0.01 ? 3 : 2))

    rowTop.append(lbl, val)

    const slider = document.createElement('input')
    slider.type  = 'range'
    slider.className = 'pp-slider'
    slider.min   = String(min)
    slider.max   = String(max)
    slider.step  = String(step)
    slider.value = String(ps.params[key])

    slider.addEventListener('input', () => {
      const n = parseFloat(slider.value)
      ;(ps.params as unknown as Record<string, number>)[key] = n
      val.textContent = String(n.toFixed(step < 0.01 ? 3 : 2))
    })

    row.append(rowTop, slider)
    body.appendChild(row)
  })

  // ── Collapse toggle ───────────────────────────────────
  let collapsed = false
  toggle.addEventListener('click', () => {
    collapsed = !collapsed
    body.style.display  = collapsed ? 'none' : ''
    toggle.innerHTML    = collapsed ? '&#x25BE;' : '&#x25B4;'
    toggle.title        = collapsed ? 'Expand' : 'Collapse'
    panel.style.width   = collapsed ? 'auto' : ''
  })

  panel.append(header, body)
  document.body.appendChild(panel)
}
