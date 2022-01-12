import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5,
    })
)
floor.receiveShadow = true
floor.rotation.x = -Math.PI * 0.5
scene.add(floor)

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null
const foxGroup = new THREE.Group()
scene.add(foxGroup)
gltfLoader.load('/models/Fox/glTF/Fox.gltf', (gltf) => {
    mixer = new THREE.AnimationMixer(gltf.scene)
    // const action = mixer.clipAction(gltf.animations[2])
    // action.play()

    gltf.scene.rotation.set(0, 1, 0)
    foxGroup.add(gltf.scene)
})
foxGroup.scale.set(0.005, 0.005, 0.005)
foxGroup.position.set(2, 1.3, 1)
foxGroup.rotation.set(0, -3, 0)
gui.add(foxGroup.position, 'x').min(-5).max(5).step(0.001).name('pos x')
gui.add(foxGroup.position, 'y').min(-5).max(5).step(0.001).name('pos y')
gui.add(foxGroup.position, 'z').min(-5).max(5).step(0.001).name('pos z')
gui.add(foxGroup.rotation, 'y').min(-5).max(5).step(0.001).name('rot y')
gltfLoader.load('/models/assets/winter_house_night.glb', (gltf) => {
    gltf.scene.scale.set(0.25, 0.25, 0.25)
    gltf.scene.position.set(0, 1.5, 1.5)
    scene.add(gltf.scene)

    // console.log(children)
})

// gltfLoader.load('/models/Lantern/glTF/Lantern.gltf', (gltf) => {
//     let children = [...gltf.scene.children]
// gltf.scene.scale.set(0.1, 0.1, 0.1)
// scene.add(gltf.scene)
// scene.add(children)

//     console.log(children)
// })

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-3, 2.5, -5)
scene.add(camera)

gui.add(camera.position, 'x').min(-5).max(5).step(0.001)
gui.add(camera.position, 'y').min(-5).max(5).step(0.001)
gui.add(camera.position, 'z').min(-5).max(5).step(0.001)
// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 1.8, 5)
controls.enableDamping = true
controls.enableZoom = false
controls.enablePan = false
controls.enableRotate = false

gui.add(controls.target, 'x').min(-5).max(5).step(0.001)
gui.add(controls.target, 'y').min(-5).max(5).step(0.001)
gui.add(controls.target, 'z').min(-5).max(5).step(0.001)
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update Mixer
    if (mixer !== null) {
        mixer.update(deltaTime)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
