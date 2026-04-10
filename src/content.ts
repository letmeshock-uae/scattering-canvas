export function injectContent(root: HTMLElement) {
  root.innerHTML = `
    <div class="datum-logo">
      <img src="/assets/datum-logo.svg" alt="datum" />
    </div>

    <nav class="datum-nav">
      <a href="#">Who we are</a>
      <a href="#">Technologies</a>
      <a href="#">Industries</a>
      <a href="#">Why Datum</a>
    </nav>

    <div class="datum-hero">
      <p class="datum-tagline">Transforming Big Data &amp; Spatial Intelligence into immersive, AI-powered digital realities.</p>
      <button class="datum-cta">Request a demo</button>
    </div>

    <div class="datum-wordmark">
      <img src="/assets/datum-wordmark.svg" alt="" />
    </div>
  `
}
