import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  SceneLoader,
  Sound,
  StandardMaterial,
  Texture,
  Tools,
  Vector3,
  Vector4
} from "babylonjs";
import 'babylonjs-loaders';

export default class Village {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      15,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight(
      "light",
      new Vector3(1, 1, 0),
      this.scene
    );

    // Load the sound and play it automatically once ready
    // const music = new Sound(
    //   "cello",
    //   "https://playground.babylonjs.com/sounds/cellolong.wav",
    //   this.scene,
    //   null,
    //   { loop: true, autoplay: true }
    // );
    // Load the sound, give it time to load and play it every 3 seconds
    // const bounce = new Sound(
    //   "bounce",
    //   "https://playground.babylonjs.com/sounds/bounce.wav",
    //   this.scene
    // );
    // setInterval(() => bounce.play(), 3000);

  
    const ground = this.buildGround();
  
    // this.buildDwellings();
    SceneLoader.ImportMeshAsync("", "https://assets.babylonjs.com/meshes/", "village.glb");
    

    return scene;
  }
  buildDwellings() {
    const detached_house = this.buildHouse(1)!;
    detached_house.rotation.y = -Math.PI / 16;
    detached_house.position.x = -6.8;
    detached_house.position.z = 2.5;

    const semi_house = this.buildHouse(2)!;
    semi_house .rotation.y = -Math.PI / 16;
    semi_house.position.x = -4.5;
    semi_house.position.z = 3;

    const places = []; //each entry is an array [house type, rotation, x, z]
    places.push([1, -Math.PI / 16, -6.8, 2.5 ]);
    places.push([2, -Math.PI / 16, -4.5, 3 ]);
    places.push([2, -Math.PI / 16, -1.5, 4 ]);
    places.push([2, -Math.PI / 3, 1.5, 6 ]);
    places.push([2, 15 * Math.PI / 16, -6.4, -1.5 ]);
    places.push([1, 15 * Math.PI / 16, -4.1, -1 ]);
    places.push([2, 15 * Math.PI / 16, -2.1, -0.5 ]);
    places.push([1, 5 * Math.PI / 4, 0, -1 ]);
    places.push([1, Math.PI + Math.PI / 2.5, 0.5, -3 ]);
    places.push([2, Math.PI + Math.PI / 2.1, 0.75, -5 ]);
    places.push([1, Math.PI + Math.PI / 2.25, 0.75, -7 ]);
    places.push([2, Math.PI / 1.9, 4.75, -1 ]);
    places.push([1, Math.PI / 1.95, 4.5, -3 ]);
    places.push([2, Math.PI / 1.9, 4.75, -5 ]);
    places.push([1, Math.PI / 1.9, 4.75, -7 ]);
    places.push([2, -Math.PI / 3, 5.25, 2 ]);
    places.push([1, -Math.PI / 3, 6, 4 ]);

    //Create instances from the first two that were built 
    const houses = [];
    for (let i = 0; i < places.length; i++) {
        if (places[i][0] === 1) {
            houses[i] = detached_house.createInstance("house" + i);
        }
        else {
            houses[i] = semi_house.createInstance("house" + i);
        }
        houses[i].rotation.y = places[i][1];
        houses[i].position.x = places[i][2];
        houses[i].position.z = places[i][3];
    }  }
  buildHouse(width: number) {
    const roof = this.buildRoof(width);
    const box = this.buildBox(width);
    return Mesh.MergeMeshes([box, roof], true, false, undefined, false, true);
  }
  buildBox(width: number) {
    const boxMat = new StandardMaterial('boxMat');
    if (width == 2) {
      boxMat.diffuseTexture = new Texture('https://assets.babylonjs.com/environments/semihouse.png');
    } else {
      boxMat.diffuseTexture = new Texture('https://assets.babylonjs.com/environments/cubehouse.png');
    }
    
    // https://assets.babylonjs.com/environments/cubehouse.png
    // https://assets.babylonjs.com/environments/semihouse.png

    const faceUV = [];
    if (width == 2) {
      faceUV[0] = new Vector4(0.6, 0.0, 1.0, 1.0); //rear face
      faceUV[1] = new Vector4(0.0, 0.0, 0.4, 1.0); //front face
      faceUV[2] = new Vector4(0.4, 0, 0.6, 1.0); //right side
      faceUV[3] = new Vector4(0.4, 0, 0.6, 1.0); //left side
    } else {
      faceUV[0] = new Vector4(0.5, 0.0, 0.75, 1.0); //rear face
      faceUV[1] = new Vector4(0.0, 0.0, 0.25, 1.0); //front face
      faceUV[2] = new Vector4(0.25, 0, 0.5, 1.0); //right side
      faceUV[3] = new Vector4(0.75, 0, 1.0, 1.0); //left side
    }


    const box = MeshBuilder.CreateBox("box", {width: width, faceUV: faceUV, wrap: true});
    box.position.y = 0.5;
    box.material = boxMat;

    return box;
  }
  buildRoof(width: number) {
    const roofMat = new StandardMaterial('roofMat');
    roofMat.diffuseTexture = new Texture('https://assets.babylonjs.com/environments/roof.jpg');

    const roof = MeshBuilder.CreateCylinder('roof', {
      diameter: 1.3, height: 1.2, tessellation: 3
    })
    roof.scaling.x = 0.75;
    roof.rotation.z = Math.PI / 2;
    roof.position.y = 1.22;
    roof.scaling.y = width;
    roof.material = roofMat;

    return roof;
  }
  buildGround() {
    const groundMat = new StandardMaterial('groundMat');
    groundMat.diffuseColor = new Color3(0, 1, 0);

    const ground = MeshBuilder.CreateGround("ground", {
      width: 15,
      height: 16
    });
    ground.material = groundMat;

    return ground;
  }


}
