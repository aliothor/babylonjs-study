import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, Space, StandardMaterial, Texture, Vector3 } from "babylonjs";

export default class EarthRotatingOnTiltedAxis {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Earth Rotating On A Tilted Axis'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const earth = MeshBuilder.CreateSphere('earth')
    const mat = new StandardMaterial('mat')
    const tex = new Texture('https://playground.babylonjs.com/textures/earth.jpg')
    tex.uScale = -1
    tex.vScale = -1
    mat.diffuseTexture = tex
    earth.material = mat

    const earthAxis = new Vector3(Math.sin(23 * Math.PI / 180), Math.cos(23 * Math.PI / 180), 0)
    const axisLine = MeshBuilder.CreateLines('axis', {points: [earthAxis.scale(-5), earthAxis.scale(5)]})

    const angle = 0.01
    scene.onBeforeRenderObservable.add(() => {
      earth.rotate(earthAxis, angle, Space.WORLD)
    })

    return scene;
  }
}