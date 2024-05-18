import { Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Texture, TransformNode, UniversalCamera, Vector3, Vector4 } from "babylonjs";
import { AdvancedDynamicTexture, Rectangle, TextBlock } from "babylonjs-gui";

export default class CreateTiledPlaneWith63DifferentPermutations {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create Tiled Plane With 63 Different Permutations'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const radius = 640 / (2 * Math.PI)
    const camera = new UniversalCamera('camera', new Vector3(0, 0, radius * 0.8))
    camera.attachControl(this.canvas, true);
    camera.setTarget(new Vector3(0, 3, radius))

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const mat  = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('https://assets.babylonjs.com/environments/tile1.jpg')

    const root = new TransformNode('root')

    const pat = [
      Mesh.NO_FLIP,
      Mesh.FLIP_TILE,
      Mesh.ROTATE_TILE,
      Mesh.FLIP_ROW,
      Mesh.ROTATE_ROW,
      Mesh.FLIP_N_ROTATE_TILE,
      Mesh.FLIP_N_ROTATE_ROW
    ]
    const av = [
      Mesh.CENTER,
      Mesh.TOP,
      Mesh.BOTTOM
    ]
    const ah = [
      Mesh.CENTER,
      Mesh.LEFT,
      Mesh.RIGHT
    ]

    const patText = [
      'No Flip',
      'Flip Tile',
      'Rotate Tile',
      'Flip Row',
      'Rotate Row',
      'Flip and Rotate Tile',
      'Flip and Rotate Row'
    ]
    const avText = [
      'Vert - Center',
      'Vert - Top',
      'Vert - Bottom'
    ]
    const ahText = [
      'Horz - Center',
      'Horz - Left',
      'Horz - Right'
    ]

    const f = new Vector4(0,0, 0.5, 1); // front image = half the whole image along the width 
    const b = new Vector4(0.5,0, 1, 1); // back image = second half along the width
    
    const angle = 2 * Math.PI / 63;
	
    let theta = 0;
    
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          const options = {
            frontUVs: f,
            backUVs: b,
            sideOrientation: Mesh.DOUBLESIDE,
            pattern: pat[i],
            alignVertical: av[j],
            alignHorizontal: ah[k],
            width: 8.6,
            height: 8.6,
            tileSize: 1,
            tileWidth:1
          }

          const mesh = MeshBuilder.CreateTiledPlane("tile plane", options);
          mesh.rotation.y = Math.PI / 2 - theta; //front view
          //mesh.rotation.y = 3 * Math.PI / 2 - theta; //back view, remove comment out for back view
          mesh.parent = root;
          mesh.position.x = radius * Math.cos(theta);
          mesh.position.z = radius * Math.sin(theta);
          
          theta += angle;
          mesh.material = mat;
  
          const rect1 = new Rectangle();
          rect1.width = "200px";
          rect1.height = "80px";
          rect1.color = "Orange";
          rect1.thickness = 2;
          rect1.background = "green";
          adt.addControl(rect1);
  
          const label = new TextBlock();
          label.text = patText[i] + "\n" + avText[j] + "\n" + ahText[k];
          rect1.addControl(label);
  
          rect1.linkWithMesh(mesh);   
          rect1.linkOffsetY = -280;
          }
      }
    }

    scene.registerAfterRender(function() {
      root.rotation.y += 0.001; 
    });

    return scene;
  }
}