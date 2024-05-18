import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scalar, Scene, SolidParticleSystem, Vector3 } from "babylonjs";

export default class CopyingTetrahedron {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Copying a Tetrahedron'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 200, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const tetra = MeshBuilder.CreatePolyhedron('tetra')
    const sps = new SolidParticleSystem('sps', scene)
    sps.addShape(tetra, 1500)
    tetra.dispose()
    sps.buildMesh()

    // initialize the particle properties
    for (let i = 0; i < sps.nbParticles; i++) {
      const p = sps.particles[i]
      p.position.x = Scalar.RandomRange(-50, 50)
      p.position.y = Scalar.RandomRange(-50, 50)
      p.position.z = Scalar.RandomRange(-50, 50)

      p.rotation.x = Scalar.RandomRange(0, Math.PI)
      p.rotation.y = Scalar.RandomRange(0, Math.PI)
      p.rotation.z = Scalar.RandomRange(0, Math.PI)

      const scale = Scalar.RandomRange(0.5, 1.5)
      p.scale = new Vector3(scale, scale, scale)
    }

    sps.setParticles()

    return scene;
  }
}