import { ArcRotateCamera, Color3, DynamicTexture, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Texture, Vector3, VertexData } from "babylonjs";
import dat from 'dat.gui'

export default class VaryingUVValues {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Varying UV Values'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 20, new Vector3(0, 0, 0));
    // camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const customMesh = new Mesh('custom')

    const positions = [-5, 2, -3, -7, -2, -3, -3, -2, -3]
    const indices = [0, 1, 2]
    const uvs = [0, 1, 0, 0, 1, 0]
    const normals: any[] = []

    const vtData = new VertexData()
    VertexData.ComputeNormals(positions, indices, normals)

    vtData.positions = positions
    vtData.indices = indices
    vtData.normals = normals
    vtData.uvs = uvs
    vtData.applyToMesh(customMesh)

    const mat = new StandardMaterial('mat')
    mat.diffuseTexture = new Texture('/Materials/fourdivisions.png')
    customMesh.material = mat

    // create plane to show image
    const plane = MeshBuilder.CreatePlane('plane', { size: 10 })
    plane.position.x = 5
    plane.material = mat

    const animUVs = [0, 1, 0, 0, 1, 0, 0.5, 1, 0, 0, 1, 0, 0.5, 1, 0.5, 0, 1, 0, 0.5, 1, 0.5, 0, 0, 0, 0.5, 1, 1, 0, 0, 0, 0, 0.5, 1, 1, 1, 0, 0, 0.5, 1, 0, 1, 1, 0.25, 0.5, 0.75, 0.25, 0.75, 0.75, 0.25, 0.5, 0.6, 0.35, 0.87, 0.9]
    let triN = 0
    const maxN = animUVs.length / 6
    // create and label uv triangle
    const points = [
      new Vector3(animUVs[6 * triN], animUVs[6 * triN + 1], 0).scale(10),
      new Vector3(animUVs[6 * triN + 2], animUVs[6 * triN + 3], 0).scale(10),
      new Vector3(animUVs[6 * triN + 4], animUVs[6 * triN + 5], 0).scale(10)
    ]
    points.push(points[0])

    let triangle = MeshBuilder.CreateLines('tri', { points, updatable: true })
    triangle.position.y = -5
    triangle.position.z = -0.1

    function makeLabel(text: string, color: string, size: number) {
      const dynTex = new DynamicTexture('dynTex', 50, scene, true)
      dynTex.hasAlpha = true
      dynTex.drawText(text, 5, 40, '10px Arial', color, 'transparent', true)
      const pl = MeshBuilder.CreatePlane('pl', { width: 6.5, height: 6.5 })
      const mat = new StandardMaterial('mat')
      mat.backFaceCulling = false
      mat.specularColor = new Color3(0, 0, 0)
      mat.diffuseTexture = dynTex
      pl.material = mat
      pl.position.z = -0.2
      return pl
    }

    const v0 = makeLabel('0', 'black', 2)
    v0.position.x = -3
    v0.position.y = 4

    const v1 = makeLabel('1', 'black', 2)
    v1.position.x = -6
    v1.position.y = -1.3

    const v2 = makeLabel('2', 'black', 2)
    v2.position.x = -1
    v2.position.y = -1.3

    const label0 = makeLabel(0 + '(' + animUVs[6 * triN] + ',' + animUVs[6 * triN + 1] + ')', 'black', 1.5)
    label0.position.x = animUVs[6 * triN] * 10
    label0.position.y = animUVs[6 * triN + 1] * 10 - 3

    const label1 = makeLabel(1 + '(' + animUVs[6 * triN + 2] + ',' + animUVs[6 * triN + 3] + ')', 'black', 1.5)
    label1.position.x = animUVs[6 * triN + 2] * 10
    label1.position.y = animUVs[6 * triN + 3] * 10 - 4

    const label2 = makeLabel(2 + '(' + animUVs[6 * triN + 4] + ',' + animUVs[6 * triN + 5] + ')', 'black', 1.5)
    label2.position.x = animUVs[6 * triN + 4] * 10
    label2.position.y = animUVs[6 * triN + 5] * 10 - 4

    // ui
    const gui = new dat.GUI()
    gui.domElement.style.marginTop = '100px'
    gui.domElement.id = 'datGUI'

    const settings = {
      uv: 0
    }
    gui.add(settings, 'uv', 0, maxN - 1, 1).onChange(updateUV)

    function updateUV() {
      triN = settings.uv
      const uvs = []
      for (let i = 0; i < 6; i++) {
        uvs.push(animUVs[6 * triN + i])
      }
      vtData.uvs = uvs
      vtData.applyToMesh(customMesh)

      const points = [
        new Vector3(animUVs[6 * triN], animUVs[6 * triN + 1], 0).scale(10),
        new Vector3(animUVs[6 * triN + 2], animUVs[6 * triN + 3], 0).scale(10),
        new Vector3(animUVs[6 * triN + 4], animUVs[6 * triN + 5], 0).scale(10)
      ]
      points.push(points[0])
  
      triangle = MeshBuilder.CreateLines('tri', { points, instance: triangle })
  
      const tex0 = (label0.material as StandardMaterial).diffuseTexture as DynamicTexture
      tex0.getContext().clearRect(0, 0, 50, 50)
      tex0.drawText(0 + '(' + animUVs[6 * triN] + ',' + animUVs[6 * triN + 1] + ')', 5, 40, '10px Arial', 'black', 'transparent', true)
      label0.position.x = animUVs[6 * triN] * 10
      label0.position.y = animUVs[6 * triN + 1] * 10 - 3

      const tex1 = (label1.material as StandardMaterial).diffuseTexture as DynamicTexture
      tex1.getContext().clearRect(0, 0, 50, 50)
      tex1.drawText(1 + '(' + animUVs[6 * triN + 2] + ',' + animUVs[6 * triN + 3] + ')', 5, 40, '10px Arial', 'black', 'transparent', true)
      label1.position.x = animUVs[6 * triN + 2] * 10
      label1.position.y = animUVs[6 * triN + 3] * 10 - 4
  
      const tex2 = (label2.material as StandardMaterial).diffuseTexture as DynamicTexture
      tex2.getContext().clearRect(0, 0, 50, 50)
      tex2.drawText(2 + '(' + animUVs[6 * triN + 4] + ',' + animUVs[6 * triN + 5] + ')', 5, 40, '10px Arial', 'black', 'transparent', true)
      label2.position.x = animUVs[6 * triN + 4] * 10
      label2.position.y = animUVs[6 * triN + 5] * 10 - 4
      
    }

      

    return scene;
  }
}