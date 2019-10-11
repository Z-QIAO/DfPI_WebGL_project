const regl = require('regl')()
//console.log("regl", regl)
const glm = require('gl-matrix')
//console.log("gl-matrix", glm)
var mat4 = glm.mat4;
var projectionMatrix = mat4.create();

var fovy = 45 * Math.PI / 180;
var aspect = window.innerWidth / window.innerHeight
var near = 0.1;
var far = 1000;
mat4.perspective(projectionMatrix, fovy, aspect, near, far)

var viewMatrix = mat4.create();
mat4.lookAt(viewMatrix, [0, 0, 5], [0, 0, 0], [0, 1, 0])

//console.log(projectionMatrix);

var points = [];
var numSlices = 24;
var radius = 1.0;
var angleStep = (Math.PI * 2) / numSlices

function getPointOnCircle(angle, radius) {
  var x = Math.cos(angle) * radius;
  var y = Math.sin(angle) * radius;
  return [x, y, 0];

}

function getUVPointOnCircle(angle, radius) {
  var x = Math.cos(angle) * radius;
  var y = Math.sin(angle) * radius;
  return [(x + 1) / 2, (1 - y) / 2];
}

var uvs = [];
var colors = [];
var vertexCount = 0;
for (var i = 0; i < numSlices; i++) {
  var currentAngle = i / numSlices * Math.PI * 2;
  points.push([0, 0, 0])
  points.push(getPointOnCircle(currentAngle, radius));
  points.push(getPointOnCircle(currentAngle + angleStep, radius));
  colors.push([1, 0, 0])
  colors.push([0, 0, 1])
  colors.push([0, 1, 0])

  uvs.push([0.5, 0.5])
  uvs.push(getUVPointOnCircle(currentAngle, radius))
  uvs.push(getUVPointOnCircle(currentAngle + angleStep, radius))
  vertexCount += 3;
}

console.log("points", uvs);
var r = 0.5
let currTime = 0
/*
for (i =0; i< 12;i++) {}
var points = [
  [0, 0, 0], //a
  [r * Math.sin(Math.PI / 6), r * Math.cos(Math.PI / 6), 0], //b
  [r * Math.sin(Math.PI / 3), r * Math.cos(Math.PI / 3), 0], //c
  [0, 0, 0],
  [r * Math.sin(Math.PI / 3), r * Math.cos(Math.PI / 3), 0],
  [r * Math.sin(Math.PI / 2), r * Math.cos(Math.PI / 2), 0],
  [0, 0, 0],
  [r * Math.sin(Math.PI / 2), r * Math.cos(Math.PI / 2), 0],
  [r * Math.sin(2 * Math.PI / 3), r * Math.cos(2 * Math.PI / 3), 0],
  [0, 0, 0],
  [r * Math.sin(2 * Math.PI / 3), r * Math.cos(2 * Math.PI / 3), 0],
  [r * Math.sin(5 * Math.PI / 6), r * Math.cos(5 * Math.PI / 6), 0],
  [0, 0, 0]
  [r * Math.sin(5 * Math.PI / 6), r * Math.cos(5 * Math.PI / 6), 0], //b
  [r * Math.sin(Math.PI), r * Math.cos(Math.PI), 0],
]
*/


var attributes = {
  position: regl.buffer(points),
  aColor: regl.buffer(colors),
  aUV: regl.buffer(uvs)
}
var uniform = {
  uTime: regl.prop('time'),
  uProjectionMatrix: projectionMatrix,
  uViewMatrix: regl.prop('uViewMatrix'),
  uTranslate: regl.prop('translate'),
}

var vertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec3 aColor;
attribute vec2 aUV;

varying vec3 vColor;
varying vec2 vUV;

uniform float uTime;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

void main(){
vec3 pos = vec3(position);
vColor = aColor;
vUV=aUV;
//pos.x += cos(uTime) * 0.25;
//pos.y += tan(uTime) * 0.05;
gl_Position = uProjectionMatrix * uViewMatrix *  vec4(pos,1);
}`



var fragShader = `
precision mediump float;
varying vec3 vColor;
varying vec2 vUV;

uniform vec3 uTranslate;

void main(){
  vec2 center = vec2(0.5,0.5);
  float d = distance(vUV, center);
  vec3 colorBg = vec3(1.0, 1.0, 1.0);
  vec3 colorDot = vec3(1.0, 0.0, 0.0);
  float gradient = smoothstep(0.48, 0.5, d);
  gl_FragColor = vec4(vUV,1.0, 1.0);
//  gl_FragColor = vec4((uTranslate/5.0) * .5 + .5, 1.0 - gradient);
}`

console.log("Attribute", attributes)

const drawTriangle = regl({
  attributes: attributes,
  frag: fragShader,
  vert: vertexShader,
  uniforms: uniform,
  count: numSlices * 3
})

//*/
const clear = () => {
  regl.clear({
    color: [0.15, 0, 0, 1]
  })
}
/*/
function clear() {
regl.clear({
  color: [0,0,0,1]
})
}
//*/

function render() {
  currTime += 0.01;
  clear();
  const cameraX = Math.sin(currTime) * 2
  mat4.lookAt(viewMatrix, [0, 0, 10], [0, 0, 0], [0, 1, 0])
  var i = j = 0;
  for (var j = -5; j < 5; j += 1) {
    for (var i = -5; i < 5; i += 1) {
      const obj = {
        uTime: currTime,
        uViewMatrix: viewMatrix,
        translate: [j + (2 * Math.random() - 1) / 25, i + (2 * Math.random() - 1) / 25, 0],
      }
      drawTriangle(obj)
    }

  }
  window.requestAnimationFrame(render)
  //  console.log('Time', obj)
}

render()
