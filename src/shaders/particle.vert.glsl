attribute vec2  aOrigin;
attribute float aR1;    // угол:      [0, 1)
attribute float aR2;    // дистанция: [0, 1)

uniform float uHover;
uniform float uTime;
uniform vec2  uMouse;
uniform sampler2D uTexture;
uniform float uStep;
uniform float uDpr;
uniform float uProximityRadius;
uniform float uScatterDist;

varying vec4 vColor;

void main() {
  vColor = texture2D(uTexture, aOrigin);

  // NDC-позиция точки в состоянии покоя
  vec2 pos = aOrigin * 2.0 - 1.0;
  pos.y *= -1.0;

  // Сплайновый спад: max в центре, точно 0 на границе радиуса, нет артефактов снаружи
  float cursorDist = length(uMouse - pos);
  float nt         = clamp(cursorDist / uProximityRadius, 0.0, 1.0); // нормализованное расстояние
  float proximity  = pow(max(0.0, 1.0 - nt * nt), 2.5);

  // насколько частица рассеяна (курсорная близость × глобальный toggle)
  float t = proximity * uHover;

  // Репульсия: точки летят ОТ курсора (как одинаковые полюса магнита)
  vec2  fromCursor  = pos - uMouse;
  float fromLen     = length(fromCursor);
  vec2  repulseDir  = fromLen > 0.001 ? fromCursor / fromLen
                                       : vec2(cos(aR1 * 6.2832), sin(aR1 * 6.2832));

  // Небольшая случайность (~25%) чтобы разлёт выглядел органично, не строго радиально
  vec2 randomDir   = vec2(cos(aR1 * 6.2832), sin(aR1 * 6.2832));
  vec2 scatterDir  = normalize(mix(repulseDir, randomDir, 0.25));

  float dist = uScatterDist * (0.25 + aR2 * 0.75);
  pos += scatterDir * dist * t;

  // Медленный дрейф — только в рассеянном состоянии
  pos += vec2(
    sin(uTime * 0.35 + aR1 * 6.2832) * 0.03,
    cos(uTime * 0.28 + aR2 * 6.2832) * 0.03
  ) * t;

  gl_Position = vec4(pos, 0.0, 1.0);

  float restSize = uStep * uDpr;
  gl_PointSize   = mix(restSize, 1.5 + aR1 * 1.5, t);
}
