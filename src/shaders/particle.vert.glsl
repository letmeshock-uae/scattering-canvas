attribute vec2  aOrigin;
attribute float aR1;    // угол:      [0, 1)
attribute float aR2;    // дистанция: [0, 1)

uniform float uHover;
uniform float uTime;
uniform vec2  uMouse;
uniform sampler2D uTexture;
uniform float uStep;
uniform float uDpr;
uniform float uProximityRadius; // smoothstep radius в NDC
uniform float uScatterDist;     // максимальная дистанция рассеяния

varying vec4 vColor;

void main() {
  vColor = texture2D(uTexture, aOrigin);

  // NDC-позиция точки в состоянии покоя
  vec2 pos = aOrigin * 2.0 - 1.0;
  pos.y *= -1.0;

  // Сплайновый спад: max в центре, точно 0 на границе радиуса, нет артефактов снаружи
  float cursorDist = length(uMouse - pos);
  float t          = clamp(cursorDist / uProximityRadius, 0.0, 1.0);
  float proximity  = pow(max(0.0, 1.0 - t * t), 2.5);

  // t: насколько частица рассеяна (курсорная близость × глобальный toggle)
  float t = proximity * uHover;

  // Рассеяние по случайному направлению
  float angle = aR1 * 6.2832;
  float dist  = uScatterDist * (0.25 + aR2 * 0.75);
  pos += vec2(cos(angle), sin(angle)) * dist * t;

  // Медленный дрейф — только в рассеянном состоянии
  pos += vec2(
    sin(uTime * 0.35 + aR1 * 6.2832) * 0.03,
    cos(uTime * 0.28 + aR2 * 6.2832) * 0.03
  ) * t;

  gl_Position = vec4(pos, 0.0, 1.0);

  float restSize = uStep * uDpr;
  gl_PointSize   = mix(restSize, 1.5 + aR1 * 1.5, t);
}
