import { Angle, ArcRotateCamera, AxesViewer, Bone, Color3, Debug, Engine, HemisphericLight, Matrix, Mesh, MeshBuilder, Quaternion, Scene, Skeleton, StandardMaterial, Vector3, VertexBuffer } from "babylonjs";

export default class CharacterExample {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Character Example'
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene()

    this.engine.runRenderLoop(() => {
      scene.render();
    })
    window.addEventListener('resize', () => {
      this.engine.resize();
    })
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    new AxesViewer()

    const body = MeshBuilder.CreateBox('body', { width: 1, height: 3.5, depth: 1 });
    const armLeft = MeshBuilder.CreateBox('armLeft', { width: 0.5, height: 2.5, depth: 0.5 });
    const armRight = MeshBuilder.CreateBox('armRight', { width: 0.5, height: 2.5, depth: 0.5 });

    body.material = new StandardMaterial('bodyMat')
    body.material.diffuseColor = new Color3(0.5, 1, 0.5);

    const armInitialRotation = Angle.FromDegrees(30).radians()
    armLeft.rotation.z = armInitialRotation
    armLeft.position.x = 1
    armLeft.position.y = 0.5

    armRight.rotation.z = -armInitialRotation
    armRight.position.x = -1
    armRight.position.y = 0.5

    function setVertexDataForBones(mesh: Mesh, boneIndex: number) {
      const boneIndices = []
      const boneWeights = []
      for (let i = 0; i < mesh.getTotalVertices(); ++i) {
        boneIndices.push(boneIndex, 0, 0, 0)
        boneWeights.push(1, 0, 0, 0)
      }

      mesh.setVerticesData(VertexBuffer.MatricesIndicesKind, boneIndices)
      mesh.setVerticesData(VertexBuffer.MatricesWeightsKind, boneWeights)
    }

    setVertexDataForBones(body, 0)
    setVertexDataForBones(armLeft, 1)
    setVertexDataForBones(armRight, 2)

    const character = Mesh.MergeMeshes([body, armLeft, armRight], true)!
    character.name = 'character'

    const skeleton = new Skeleton('charSkeleton', 'skeleton', scene)
    const boneBody = new Bone('boneBody', skeleton, undefined, undefined, undefined, undefined, 0)
    const boneArmLeft = new Bone('boneArmLeft', skeleton, boneBody, Matrix.Compose(Vector3.One(), Quaternion.FromEulerAngles(0, 0, armInitialRotation), new Vector3(0.5, 1.5, 0)), undefined, undefined, 1)
    const boneArmRight = new Bone('boneArmRight', skeleton, boneBody, Matrix.Compose(Vector3.One(), Quaternion.FromEulerAngles(0, 0, -armInitialRotation), new Vector3(-0.5, 1.5, 0)), undefined, undefined, 2)

    boneBody.length = 1.5
    boneArmLeft.length = -2
    boneArmRight.length = -2

    skeleton.sortBones()
    character.skeleton = skeleton

    boneArmLeft.rotation = new Vector3(0, 0, Angle.FromDegrees(75).radians())

    let t = 0
    scene.registerBeforeRender(() => {
      t += 0.01
      boneArmLeft.rotation = new Vector3(0, 0, Angle.FromDegrees(50 + Math.sin(t) * 30).radians())
    })

    const skelViever = new Debug.SkeletonViewer(skeleton, character, scene)

    await scene.debugLayer.show({ embedMode: true })

    return scene;
  }
}