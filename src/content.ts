const SVG_W = 1708
const SVG_H = 372.983

export function injectContent(root: HTMLElement) {
  // html2canvas игнорирует CSS width:100% на SVG — нужны явные px-атрибуты,
  // иначе на мобилке SVG рендерится в нативном 1708px и не помещается.
  const imgW = window.innerWidth
  const imgH = Math.round(imgW * SVG_H / SVG_W)

  root.innerHTML = `
    <div class="datum-wordmark">
      <img src="/assets/datum-wordmark.svg" alt=""
           width="${imgW}" height="${imgH}" />
    </div>
  `
}
