attribute vec2  aOrigin;
attribute float aR1;    // угол:      [0, 1)
attribute float aR2;    // дистанция: [0, 1)

uniform float uHover;
uniform float uTime;
uniform vec2  uMouse;
uniform float uScatterMode;     // 0 = случайный разлёт, 1 = магнитная репульсия
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

  // Базовые направления
  vec2  randomDir  = vec2(cos(aR1 * 6.2832), sin(aR1 * 6.2832));
  vec2  fromCursor = pos - uMouse;
  float fromLen    = length(fromCursor);
  vec2  axis       = fromLen > 0.001 ? fromCursor / fromLen : randomDir;

  // Отталкивание (+) и притяжение (−) с ~25% случайным разбросом для органичности
  vec2 repulseDir = normalize(mix( axis, randomDir, 0.25));
  vec2 attractDir = normalize(mix(-axis, randomDir, 0.25));

  // uScatterMode: 1 = repulse, 0 = random, -1 = attract (плавный blend по знаку)
  float r = clamp( uScatterMode, 0.0, 1.0);  // сила отталкивания
  float a = clamp(-uScatterMode, 0.0, 1.0);  // сила притяжения
  vec2 scatterDir = normalize(mix(mix(randomDir, repulseDir, r), attractDir, a));

  float dist = uScatterDist * (0.25 + aR2 * 0.75);
  pos += scatterDir * dist * t;

  // Медленный дрейф — только в рассеянном состоянии
  pos += vec2(
    sin(uTime * 0.35 + aR1 * 6.2832) * 0.03,
    cos(uTime * 0.28 + aR2 * 6.2832) * 0.03
  ) * t;

  gl_Position = vec4(pos, 0.0, 1.0);

  float restSize = uStep * uDpr;
  // min 1 CSS pixel = uDpr device pixels (step=0.5 на DPR=2 → restSize=1.0 sub-pixel без этого)
  gl_PointSize   = max(uDpr, mix(restSize, max(uDpr, 1.5 + aR1 * 1.5), t));
}
