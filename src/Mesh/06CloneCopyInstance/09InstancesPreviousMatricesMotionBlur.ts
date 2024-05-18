import { ArcRotateCamera, Color4, Engine, HemisphericLight, InstancedMesh, Matrix, MeshBuilder, MotionBlurPostProcess, Quaternion, Scene, Vector3 } from "babylonjs";

export default class InstancesPreviousMatricesMotionBlur {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Instances Previous Matrices Motion Blur'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    scene.clearColor = new Color4(0.2, 0.4, 0.8, 1)

    const nbParticle = 20000
    const poly = MeshBuilder.CreatePolyhedron('p', {type: 2, size: 1})
    poly.isVisible = false
    poly.manualUpdateOfWorldMatrixInstancedBuffer = true
    poly.manualUpdateOfPreviousWorldMatrixInstancedBuffer = true

    const particles: InstancedMesh[] = []
    const logicalParticles: { t: number; factor: number; speed: number; xFactor: number; yFactor: number; zFactor: number; mx: number; my: number; mat: Matrix; previousMat: Matrix; quat: Quaternion; }[] = []
    for (let i = 0; i < nbParticle; i++) {
      const particle = poly.createInstance('i' + i)
      particle.isPickable = false
      particles.push(particle)
      const rand = Math.random
      const t = Math.random() * 100
      const factor = 20 + rand() * 100
      const speed = 0.01 + rand() / 200
      const xFactor = -50 + rand() * 100
      const yFactor = -50 + rand() * 100
      const zFactor = -50 + rand() * 100
      const data = { t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0, mat: new Matrix(), previousMat: new Matrix(), quat: new Quaternion() }
      logicalParticles.push(data)
    }

    function updateParticles() {
      let offset = 0
      let instancedBuffer = poly.worldMatrixInstancedBuffer
      let previousInstanceBuffer = poly.previousWorldMatrixInstancedBuffer

      if (!instancedBuffer) return
      if (!previousInstanceBuffer) return

      logicalParticles.forEach((particle, i) => {
        let { t, factor, speed, xFactor, yFactor, zFactor, mat, previousMat, quat } = particle
        t = particle.t += speed / 2
        const a = Math.cos(t) + Math.sin(t * 1) / 10
        const b = Math.sin(t) + Math.cos(t * 2) / 10
        const s = Math.cos(t)
        particle.mx += (mouseX - particle.mx) * 0.01
        particle.my += (mouseY * -1 - particle.my) * 0.01

        // instance
        const p = particles[i]
        const pos = p.position
        pos.x = (particle.mx / 100) * a + xFactor + Math.cos(t / 10 * factor + Math.sin(t * 1) * factor) / 10
        pos.y = (particle.mx / 100) * a + yFactor + Math.sin(t / 10 * factor + Math.cos(t * 2) * factor) / 10
        pos.z = (particle.mx / 100) * a + zFactor + Math.cos(t / 10 * factor + Math.sin(t * 3) * factor) / 10
        const scl = p.scaling
        scl.x = scl.y = scl.z = Math.abs(s)
        const r = s * 5

        Quaternion.RotationYawPitchRollToRef(r, r, r, quat)
        previousMat.copyFrom(mat)
        Matrix.ComposeToRef(scl, quat, pos, mat)

        instancedBuffer.set(mat.m, offset)
        previousInstanceBuffer.set(previousMat.m, offset)
        offset += 16
      })
    }

    scene.freeActiveMeshes()
    const mb = new MotionBlurPostProcess('mb', scene, 1, camera)
    mb.motionStrength = 3

    let mouseX: number
    let mouseY: number
    scene.onBeforeRenderObservable.add(() => {
      mouseX = scene.pointerX - window.innerWidth * 0.5
      mouseY = scene.pointerY - window.innerHeight * 0.5
      updateParticles()
    })

    return scene;
  }
}