import * as THREE from 'three'
import { type PaperDirection, foldPaperPoint } from './parchment-fold'
import { createParchmentTextures } from './parchment-texture'

export async function createParchmentRenderer (canvas: HTMLCanvasElement, stage: HTMLElement, direction: PaperDirection = 'diagonal') {
  const paper = await createParchmentTextures(stage)
  const { width, height } = paper
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1))
  renderer.setSize(width, height, false)
  renderer.setClearColor(0, 0)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  const scene = new THREE.Scene()
  const distance = Math.max(width, height)
  const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, distance * 8)
  camera.position.z = distance * 3
  const frontTexture = new THREE.CanvasTexture(paper.front)
  const backTexture = new THREE.CanvasTexture(paper.back)
  frontTexture.colorSpace = backTexture.colorSpace = THREE.SRGBColorSpace
  const geometry = new THREE.PlaneGeometry(width, height, 80, 80)
  const position = geometry.getAttribute('position') as THREE.BufferAttribute
  const originals = new Float32Array(position.array)
  const colors = new THREE.BufferAttribute(new Float32Array(position.count * 3), 3)
  geometry.setAttribute('color', colors)
  const frontMaterial = new THREE.MeshLambertMaterial({ map: frontTexture, side: THREE.FrontSide, shadowSide: THREE.DoubleSide, vertexColors: true })
  const backMaterial = new THREE.MeshLambertMaterial({ map: backTexture, side: THREE.BackSide, color: '#f1e2c0', vertexColors: true })
  const front = new THREE.Mesh(geometry, frontMaterial)
  const back = new THREE.Mesh(geometry, backMaterial)
  front.castShadow = true
  front.receiveShadow = back.receiveShadow = true
  front.frustumCulled = back.frustumCulled = false
  scene.add(front, back)
  const groundGeometry = new THREE.PlaneGeometry(width * 3, height * 3)
  const shadowMaterial = new THREE.ShadowMaterial({ color: '#20180e', opacity: 0.3 })
  const ground = new THREE.Mesh(groundGeometry, shadowMaterial)
  ground.position.z = -3
  ground.receiveShadow = true
  scene.add(ground)
  scene.add(new THREE.AmbientLight('#ffffff', Math.PI * 0.75))
  const light = new THREE.DirectionalLight('#ffffff', Math.PI * 0.3)
  light.position.set(-width * 0.4, height * 0.65, distance * 1.8)
  light.castShadow = true
  const shadowSize = width > 760 ? 2048 : 1024
  light.shadow.mapSize.set(shadowSize, shadowSize)
  Object.assign(light.shadow.camera, { left: -distance, right: distance, top: distance, bottom: -distance, near: 1, far: distance * 5 })
  light.shadow.camera.updateProjectionMatrix()
  light.shadow.bias = -0.0003
  light.shadow.radius = 5
  scene.add(light, light.target)

  return {
    render (progress: number) {
      for (let i = 0; i < position.count; i++) {
        const point = foldPaperPoint(width, height, progress, originals[i * 3]! + width / 2, height / 2 - originals[i * 3 + 1]!, direction)
        position.setXYZ(i, point.x - width / 2, height / 2 - point.y, point.z)
        const shade = 0.5 + point.shade * 0.5
        colors.setXYZ(i, shade, shade, shade)
      }
      position.needsUpdate = colors.needsUpdate = true
      geometry.computeVertexNormals()
      renderer.render(scene, camera)
    },
    dispose () {
      geometry.dispose()
      groundGeometry.dispose()
      frontMaterial.dispose()
      backMaterial.dispose()
      shadowMaterial.dispose()
      frontTexture.dispose()
      backTexture.dispose()
      light.shadow.map?.dispose()
      renderer.dispose()
    },
  }
}
