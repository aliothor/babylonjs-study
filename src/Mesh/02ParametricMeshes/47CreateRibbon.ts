import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Vector3 } from "babylonjs";

export default class CreateRibbon {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create a Ribbon'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 30, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const myPaths = [
      [ 	
        new Vector3(5.0, 0, 0),
        new Vector3(4.5, 1, 0),
        new Vector3(4.0, 2, 0),
        new Vector3(3.5, 3, 0),
        new Vector3(3.0, 4, 0)
      ],
      [	
        new Vector3(0, 0.0, -5),
        new Vector3(0, 0.5, -7),
        new Vector3(0, 1.0, -9),
        new Vector3(0, 1.5, -11),
        new Vector3(0, 2.0, -13)
      ],
      [	
        new Vector3(-5.0, 0, 0),
        new Vector3(-4.5, 1, 0),
        new Vector3(-4.0, 2, 0),
        new Vector3(-3.5, 3, 0),
        new Vector3(-3.0, 4, 0)
      ]
    ]

    let ribbon = MeshBuilder.CreateRibbon('ribbon', {
      pathArray: myPaths,
      updatable: true,
      sideOrientation: Mesh.DOUBLESIDE,
      // closeArray: true
      // closePath: true
    })


    // set new values
    const path0 = []
    for (let a = 0; a <= Math.PI; a += Math.PI / 4) {
      path0.push(new Vector3(4, 4 * Math.cos(a), 4 * Math.sin(a)))
    }

    const path1 = []
    for (let a = 0; a <= Math.PI; a += Math.PI / 4) {
      path1.push(new Vector3(0, 4 * Math.cos(a), 4 * Math.sin(a) + 2))
    }

    const path2 = []
    for (let a = 0; a <= Math.PI; a += Math.PI / 4) {
      path2.push(new Vector3(-4, 4 * Math.cos(a), 4 * Math.sin(a)))
    }

    const myPaths2 = [path0, path1, path2]
    
    setTimeout(() => {
      ribbon = MeshBuilder.CreateRibbon('ribbon', {
        pathArray: myPaths2,
        instance: ribbon,
        sideOrientation: Mesh.DOUBLESIDE
      })

      ribbon.visibility = 0.7
      const pathLines = MeshBuilder.CreateLineSystem('pathLines', {
        lines: myPaths2
      })
      pathLines.color = Color3.Red()
    }, 1000);


    return scene;
  }
}