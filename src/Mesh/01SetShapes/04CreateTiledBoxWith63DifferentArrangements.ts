import { Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Texture, TransformNode, UniversalCamera, Vector3, Vector4 } from "babylonjs";
import { AdvancedDynamicTexture, Rectangle, TextBlock } from "babylonjs-gui";

export default class CreateTiledBoxWith63DifferentArrangements {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Create Tiled Box With 63 Different Arrangements'
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
    camera.setTarget(new Vector3(0, 0, radius))

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const mat  = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('https://assets.babylonjs.com/environments/arrows.jpg')

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

    const cols = 6
    const rows = 1
    const faceUV = new Array<Vector4>(6)
    for (let i = 0; i < cols; i++) {
      faceUV[i] = new Vector4(i / cols, 0, (i + 1) / cols, 1 / rows)
    }

    const angle = 2 * Math.PI / 63
    let theta = 0
    
    const mesh: Mesh[] = []
    const options = []
    let count = 0

    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          options[count] = {
            pattern: pat[i],
            alignVertical: av[j],
            alignHorizontal: ah[k],
            faceUV: faceUV,
            width: 6.9,
            height: 3.9,
            depth: 2.8,
            tileSize: 1,
            tileWidth: 1
          }

          mesh[count] = MeshBuilder.CreateTiledBox('mesh' + count, options[count])
          mesh[count].parent = root
          mesh[count].position.x = radius * Math.cos(theta)
          mesh[count].position.z = radius * Math.sin(theta)

          theta += angle
          mesh[count].material = mat

          const rect1 = new Rectangle()
          rect1.width = '200px'
          rect1.height = '80px'
          rect1.color = 'Orange'
          rect1.thickness = 2
          rect1.background = 'green'
          adt.addControl(rect1)

          const label = new TextBlock()
          label.text = patText[i] + '\n' + avText[j] + '\n' + ahText[k]
          rect1.addControl(label)

          rect1.linkWithMesh(mesh[count])
          rect1.linkOffsetY = -280
          count++
        }
      }
    }

    scene.onBeforeRenderObservable.add(() => {
      root.rotation.y += 0.001
      for (let m = 0; m < mesh.length; m++) {
        mesh[m].addRotation(0, 0, 0.01).addRotation(0, 0.02, 0).addRotation(0.03, 0, 0)
      }
    })

    return scene;
  }
}