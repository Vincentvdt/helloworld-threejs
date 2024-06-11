import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import GUI from "lil-gui"
import { FontLoader } from "three/addons"
import { TextGeometry } from "three/addons"

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

// // Axes Helper
// const axesHelper = new THREE.AxesHelper(3)
// scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcaps = [
    textureLoader.load("./textures/matcaps/1.png"),
    textureLoader.load("./textures/matcaps/2.png"),
    textureLoader.load("./textures/matcaps/3.png"),
    textureLoader.load("./textures/matcaps/4.png"),
    textureLoader.load("./textures/matcaps/5.png"),
    textureLoader.load("./textures/matcaps/6.png"),
    textureLoader.load("./textures/matcaps/7.png"),
    textureLoader.load("./textures/matcaps/8.png"),
]
matcaps.forEach(matcap => matcap.colorSpace = THREE.SRGBColorSpace)


// Fonts
const fontLoader = new FontLoader()

fontLoader.load("./fonts/helvetiker_regular.typeface.json",
    (font) => {

        const textParams = {
            font: font,
            size: .5,
            depth: .2,
            curveSegments: 5,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 4,
        }

        const textGeometry = new TextGeometry("Hello World !", textParams)

        // textGeometry.computeBoundingBox()
        // textGeometry.translate(
        //     -(textGeometry.boundingBox.max.x - textParams.bevelSize) * 0.5,
        //     -(textGeometry.boundingBox.max.y - textParams.bevelSize) * 0.5,
        //     -(textGeometry.boundingBox.max.z - textParams.bevelThickness) * 0.5,
        // )
        //

        textGeometry.center()

        const material = new THREE.MeshMatcapMaterial({ matcap: matcaps[0] })
        console.log(matcaps[0])
        gui.add(material, "matcap", { ...matcaps })

        // textMaterial.wireframe = true
        const text = new THREE.Mesh(textGeometry, material)
        scene.add(text)

        console.time("donuts")

        const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
        const donutsCount = 2000
        const donutMesh = new THREE.InstancedMesh(donutGeometry, material, donutsCount)
        donutMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
        const dummy = new THREE.Object3D()
        const sphereRadius = 30

        gui.add(donutMesh, "count").min(0).max(donutsCount).step(10)

        function getRandomPositionInSphere(radius) {
            // Generate random spherical coordinates
            const theta = Math.random() * 2 * Math.PI // Angle around the z-axis
            const phi = Math.acos((Math.random() * 2) - 1) // Angle from the z-axis
            const r = radius * Math.cbrt(Math.random()) // Random distance from center, cube root to ensure uniform distribution

            // Convert spherical coordinates to Cartesian coordinates
            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)

            return { x, y, z }
        }

        for (let i = 0; i < 2000; i++) {
            let position
            let isOverlapping
            do {
                isOverlapping = false
                position = getRandomPositionInSphere(sphereRadius)

                for (let j = 0; j < i; j++) {
                    dummy.matrixWorld.decompose(dummy.position, dummy.rotation, dummy.scale)
                    const dx = position.x - dummy.position.x
                    const dy = position.y - dummy.position.y
                    const dz = position.z - dummy.position.z
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

                    if (distance < 1) {
                        isOverlapping = true
                        break
                    }
                }
            } while (isOverlapping)
            dummy.position.set(position.x, position.y, position.z)
            dummy.rotation.x = Math.random() * Math.PI
            dummy.rotation.y = Math.random() * Math.PI
            const scale = Math.random()
            dummy.scale.set(scale, scale, scale)
            dummy.updateMatrix()

            donutMesh.setMatrixAt(i, dummy.matrix)
        }

        scene.add(donutMesh)

        console.timeEnd("donuts")
    })

/**
 * Object
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial(),
// )

// scene.add(cube)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

window.addEventListener("resize", () => {
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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.minDistance = 3
controls.maxDistance = 15


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()