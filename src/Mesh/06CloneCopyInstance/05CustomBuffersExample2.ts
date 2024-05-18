import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Vector3, VertexBuffer } from "babylonjs";

export default class CustomBuffersExample2 {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Custom Buffers Example 2'
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

    const box = MeshBuilder.CreateBox('box');
    box.alwaysSelectAsActiveMesh = true

    const nInstances = 1000
    box.registerInstancedBuffer(VertexBuffer.ColorKind, 4)
    box.instancedBuffers.color = new Color4(Math.random(), Math.random(), Math.random(), 1)

    const mat = new StandardMaterial('mat')
    mat.disableLighting = true
    mat.emissiveColor = Color3.White()
    box.material = mat

    const baseColors: Color4[] = []
    const alphas: number[] = []
    for (let i = 0; i < nInstances - 1; i++) {
      const inst = box.createInstance('box' + i)
      inst.alwaysSelectAsActiveMesh = true
      inst.position.x = 20 - Math.random() * 40
      inst.position.y = 20 - Math.random() * 40
      inst.position.z = 20 - Math.random() * 40

      alphas.push(Math.random())
      baseColors.push(new Color4(Math.random(), Math.random(), Math.random(), 1))
      inst.instancedBuffers.color = baseColors[baseColors.length - 1].clone()
    }
    camera.radius = 60

    scene.freezeActiveMeshes()

    // animation
    scene.onBeforeRenderObservable.add(() => {
      for (let i = 0; i < box.instances.length; i++) {
        let alpha = alphas[i]
        const cos = Math.abs(Math.cos(alpha))
        alpha += 0.01

        alphas[i] = alpha
        const inst = box.instances[i]
        baseColors[i].scaleToRef(cos, inst.instancedBuffers.color)
      }
    })

    return scene;
  }
}