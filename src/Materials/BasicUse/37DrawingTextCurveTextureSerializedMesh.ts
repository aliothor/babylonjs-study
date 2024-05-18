import { ArcRotateCamera, DynamicTexture, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, SceneSerializer, StandardMaterial, Vector3 } from "babylonjs";

export default class DrawingTextCurveTextureSerializedMesh {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Drawing Text and a Curve Texture Serialized Mesh'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 20, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const ground = MeshBuilder.CreateGround('ground', {width: 20, height: 10, subdivisions: 25})

    // create dynamic texture
    const textureGround = new DynamicTexture('dynamic texture', 512)

    const gMat = new StandardMaterial('gMat')
    gMat.diffuseTexture = textureGround
    ground.material = gMat

    // draw curves on canvas
    const ctx = textureGround.getContext()
    const img = new Image()
    img.src = '/Materials/grass.png'
    img.onload = function() {
      ctx.drawImage(this, 0, 0)
      textureGround.update()

      // draw curves on canvas
      ctx.beginPath();
      ctx.moveTo(75, 25);
      ctx.quadraticCurveTo(25, 25, 25, 62.5);
      ctx.quadraticCurveTo(25, 100, 50, 100);
      ctx.quadraticCurveTo(50, 120, 30, 125);
      ctx.quadraticCurveTo(60, 120, 65, 100);
      ctx.quadraticCurveTo(125, 100, 125, 62.5);
      ctx.quadraticCurveTo(125, 25, 75, 25);
      ctx.stroke();
      ctx.fillStyle = 'white'
      ctx.fill()
      textureGround.update()

      // add text to dynamic texture
      const font = 'bold 28px luke快写'
      textureGround.drawText('Grass', 50, 75, font, 'green', null, true, true)
    }

    scene.onReadyObservable.add(function() {
      let jsonData = JSON.stringify(SceneSerializer.SerializeMesh(ground))

      setTimeout(() => {
        ground.dispose()
      }, 1000);

      setTimeout(() => {
        SceneLoader.ImportMesh('', '', 'data:' + jsonData)
      }, 3000);
    })

    return scene;
  }
}