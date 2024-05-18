import { ArcRotateCamera, Color3, CubeTexture, Engine, GeometryInputBlock, HemisphericLight, Mesh, MeshBlock, MeshBuilder, MultiMaterial, NodeGeometry, NodeGeometryBlock, Scene, SceneLoader, SetMaterialIDBlock, StandardMaterial, Texture, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Control, Grid, TextBlock } from "babylonjs-gui";
import 'babylonjs-loaders'

export default class UsingNodeGeometryGenerateProceduralCity {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Using Node Geometry to Generate a Procedural City'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 100, new Vector3(50, 0, 20));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    scene.environmentTexture = new CubeTexture('https://playground.babylonjs.com/textures/SpecularHDR.dds', scene)

    // credits and loading text
    function loadingText() {
      const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI')

      const credits = new TextBlock()
      credits.text = 'Building parts by twitter.com/Kammertonus'
      credits.color = 'white'
      credits.fontSize = 12
      credits.width = '260px'
      credits.height = '40px'
      credits.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
      credits.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
      adt.addControl(credits)

      const loading = new TextBlock('loading')
      loading.text = 'Loading parts...please wait...'
      loading.color = 'white'
      loading.fontSize = 24
      adt.addControl(loading)

      const loadAssetsTime = new TextBlock('atime')
      loadAssetsTime.text = 'Loading Assets: 0 ms'
      loadAssetsTime.color = 'white'
      loadAssetsTime.fontSize = 12
      loadAssetsTime.width = '180px'
      loadAssetsTime.height = '40px'
      loadAssetsTime.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
      loadAssetsTime.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
      adt.addControl(loadAssetsTime)

      const generateBuildingTime = new TextBlock('gtime')
      generateBuildingTime.text = 'Generate Building: 0 ms'
      generateBuildingTime.color = 'white'
      generateBuildingTime.fontSize = 12
      generateBuildingTime.width = '180px'
      generateBuildingTime.height = '40px'
      generateBuildingTime.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
      generateBuildingTime.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
      adt.addControl(generateBuildingTime)


      return adt
    }
    const adt = loadingText()

    async function loadAssetsAsync(source: string, nodeGeometry: NodeGeometry, multiMat: MultiMaterial, options: { block: string; index: number; }[]) {
      const container = await SceneLoader.LoadAssetContainerAsync('https://assets.babylonjs.com/meshes/Buildings/', source)
      // only add materials
      container.addToScene((m: Mesh) => m.getClassName && m.getClassName().indexOf('Material') != -1)

      const meshes = container.meshes.filter(m => m.getTotalVertices() > 0)

      for (let option of options) {
        meshes[option.index].setEnabled(false)
        // remove parent
        const mesh = meshes[option.index]
        mesh.createNormals(false);
        // connect meshes
        (nodeGeometry.getBlockByName(option.block) as MeshBlock).mesh = mesh as Mesh;
        // connect material index
        (nodeGeometry.getBlockByName(option.block + ' ID') as SetMaterialIDBlock).id.value = multiMat.subMaterials.length
        multiMat.subMaterials.push(mesh.material)
        mesh.material!.backFaceCulling = false
      }
    }

    function generateBuilding(nodeGeometry: NodeGeometry, multiMat: MultiMaterial, location: Vector3, hightRise: boolean) {
      const height = (hightRise ? (16 + Math.random() * 8) : (2 + Math.random() * 10)) | 0;
      (nodeGeometry.getBlockByName('Main Height') as GeometryInputBlock).value = height
      nodeGeometry.build()
      const mesh = nodeGeometry.createMesh('Building')!
      mesh.material = multiMat
      mesh.position = location
      mesh.position.y = height / 2
    }

    setTimeout(async () => {
      const nodeGeometry = await NodeGeometry.ParseFromSnippetAsync('IJA02K#12', undefined, true)
      const multiMat = new MultiMaterial('Main material')

      let start = new Date()
      // load and apply the parts
      await loadAssetsAsync('ceiling%20corner.glb', nodeGeometry, multiMat, [
        { block: 'Ceiling corner0', index: 0 },
        { block: 'Ceiling corner1', index: 1 },
        { block: 'Ceiling corner2', index: 2 },
      ])

      await loadAssetsAsync("Gap.glb", nodeGeometry, multiMat, [
        { block: "Gap", index: 0 },
      ]);

      await loadAssetsAsync("straight.glb", nodeGeometry, multiMat, [
        { block: "straight", index: 0 },
      ]);

      await loadAssetsAsync("window.glb", nodeGeometry, multiMat, [
        { block: "window", index: 0 },
      ]);

      await loadAssetsAsync("window2.glb", nodeGeometry, multiMat, [
        { block: "window2", index: 0 },
      ]);

      await loadAssetsAsync("corner.glb", nodeGeometry, multiMat, [
        { block: "corner", index: 0 },
      ]);

      await loadAssetsAsync("corner2.glb", nodeGeometry, multiMat, [
        { block: "corner2", index: 0 },
      ]);

      await loadAssetsAsync("Road corner.glb", nodeGeometry, multiMat, [
        { block: "Road corner", index: 0 },
      ]);

      await loadAssetsAsync("ceiling.glb", nodeGeometry, multiMat, [
        { block: "ceiling", index: 0 },
      ]);

      await loadAssetsAsync("road gap.glb", nodeGeometry, multiMat, [
        { block: "road gap", index: 0 },
      ]);

      await loadAssetsAsync("ceiling straight.glb", nodeGeometry, multiMat, [
        { block: "ceiling straight0", index: 0 },
        { block: "ceiling straight1", index: 1 },
        { block: "ceiling straight2", index: 2 },
      ]);
      let end = new Date()
      let record = end.getTime() - start.getTime();
      (adt.getControlByName('atime') as TextBlock).text = (adt.getControlByName('atime') as TextBlock).text.replace('0', '' + record)

      start = new Date()
      // building
      const cellSize = 10
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 5; y++) {
          const position = new Vector3(x * cellSize, 0, y * cellSize)
          generateBuilding(nodeGeometry, multiMat, position, Math.random() > 0.9)
        }
      }
      end = new Date()
      record = end.getTime() - start.getTime();
      (adt.getControlByName('gtime') as TextBlock).text = (adt.getControlByName('gtime') as TextBlock).text.replace('0', '' + record)

      // Some cleanup as the materials are not ideal
      scene.materials.forEach(m => {
        m.metallicTexture = null;
      });

      // ground
      createGround()
      // tree
      await createTree()

      adt.getControlByName('loading')?.dispose()
    });

    function createGround() {
      const ground = MeshBuilder.CreateGround("ground", { width: 300, height:300});
        ground.position.set(40, -0.51, 20)
        const groundMat = new StandardMaterial("groundMat", scene);
        const diffuseTexture = new Texture("https://assets.babylonjs.com/textures/speckles.jpg", scene);
        const detailTexture = new Texture("https://assets.babylonjs.com/textures/detailmap.png", scene);
        groundMat.specularColor = Color3.Black();
        groundMat.diffuseTexture = diffuseTexture;
        groundMat.diffuseTexture.uScale = 100;
        groundMat.diffuseTexture.vScale = 100;    
        groundMat.detailMap.isEnabled = true;
        groundMat.detailMap.diffuseBlendLevel = 0.1;
        groundMat.detailMap.texture = detailTexture;
        groundMat.detailMap.roughnessBlendLevel = 0.25;
        groundMat.detailMap.texture.uScale = 75;
        groundMat.detailMap.texture.vScale = 75;    
        groundMat.opacityTexture = new Texture("https://assets.babylonjs.com/textures/WhiteTransarentRamp.png", scene);
        
        ground.material = groundMat;
    }

    async function createTree() {
      const cellSize = 10
      let container = await SceneLoader.LoadAssetContainerAsync("https://assets.babylonjs.com/meshes/villagePack/bush3/bush3.glb");
        container.addAllToScene();
        const sourceTree1 = scene.getMeshByName("bush3");
        sourceTree1.setEnabled(false);

        container = await SceneLoader.LoadAssetContainerAsync("https://assets.babylonjs.com/meshes/villagePack/bush2/bush2.glb");
        container.addAllToScene();
        const sourceTree2 = scene.getMeshByName("bush2");
        sourceTree2.setEnabled(false);
        
        for (let x = 0; x < 10; x++) {
            for (let y = -1; y < 4; y++) {
                if (Math.random() > 0.4) {
                    const sourceTree = Math.random() > 0.5 ? sourceTree1 : sourceTree2;

                    const instance = sourceTree.createInstance("Bush");
                    instance.position = new Vector3(x * cellSize + (1 - Math.random() * 2), -0.6, y * cellSize + 6);
                    instance.rotation.y = Math.random() * Math.PI * 2;
                    const scale = 0.5 + Math.random();
                    instance.scaling = new Vector3(scale, scale, scale);
                }
            }
        }
    }

    return scene;
  }
}