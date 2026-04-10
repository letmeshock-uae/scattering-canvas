varying vec4 vColor;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  if (length(c) > 0.5) discard;
  gl_FragColor = vColor;
}
