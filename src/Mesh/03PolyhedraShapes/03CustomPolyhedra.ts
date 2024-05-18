import { ArcRotateCamera, Color4, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class CustomPolyhedra {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Custom Polyhedra'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 5, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const heptagonalPrism = { 
      "name" : "Heptagonal Prism", 
      "category" : ["Prism"], 
      "vertex" : [[0,0,1.090071],[0.796065,0,0.7446715],[-0.1498633,0.7818315,0.7446715],[-0.7396399,-0.2943675,0.7446715],[0.6462017,0.7818315,0.3992718],[1.049102,-0.2943675,-0.03143449],[-0.8895032,0.487464,0.3992718],[-0.8658909,-0.6614378,-0.03143449],[0.8992386,0.487464,-0.3768342],[0.5685687,-0.6614378,-0.6538232],[-1.015754,0.1203937,-0.3768342],[-0.2836832,-0.8247995,-0.6538232],[0.4187054,0.1203937,-0.9992228],[-0.4335465,-0.042968,-0.9992228]],
      "face" : [[0,1,4,2],[0,2,6,3],[1,5,8,4],[3,6,10,7],[5,9,12,8],[7,10,13,11],[9,11,13,12],[0,3,7,11,9,5,1],[2,4,8,12,13,10,6]]
    };

    const faceColors = []
    for (let i = 0; i < 9; i++) {
      faceColors[i] = new Color4(Math.random(), Math.random(), Math.random())
    }
    const heptPrism = MeshBuilder.CreatePolyhedron('heptPrism', {
      custom: heptagonalPrism,
      // sizeX: 0.25,
      // sizeY: 2,
      // sizeZ: 0.5,
      faceColors: faceColors
    })

    return scene;
  }
}