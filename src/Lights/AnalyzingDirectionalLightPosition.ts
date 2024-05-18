import { ArcRotateCamera, Camera, Color3, DirectionalLight, Engine, FloatArray, HemisphericLight, LightGizmo, Matrix, Mesh, MeshBuilder, Nullable, Scene, SceneLoader, ShadowGenerator, StandardMaterial, Vector3, VertexData } from "babylonjs";

export default class AnalyzingDirectionalLightPosition {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 5, Math.PI / 3, 10, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new DirectionalLight('light', new Vector3(-1, -1, -1), scene);
    light.intensity = 0.7
    light.shadowMinZ = 0
    light.shadowMaxZ = 3
    const g = new LightGizmo()
    g.light = light

    const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 2, segments: 32});
    sphere.position.y = 1

    const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6})
    ground.receiveShadows = true

    // shadow
    const sg = new ShadowGenerator(1024, light)
    sg.addShadowCaster(sphere)
    sg.usePercentageCloserFiltering = true
    sg.filteringQuality = ShadowGenerator.QUALITY_LOW

    // debuger
    scene.debugLayer.show({embedMode: true}).then(() => {
      scene.debugLayer.select(light)
    })

    const dlh = new DirectionalLightHelper(light, camera)
    window.setTimeout(() => {
      scene.onAfterRenderObservable.add(() => dlh.buildLightHelper())
    }, 500)

    return scene;
  }
}

class DirectionalLightHelper {
  scene: Scene
  light: DirectionalLight
  camera: Camera
  private _viewMatrix: Matrix
  private _lightHelperFrustumLines: Mesh[]
  private _oldPosition: Vector3 = Vector3.Zero()
  private _oldDirection: Vector3 = Vector3.Zero()
  private _oldAutoCalc: boolean = false
  private _oldMinZ: number = 0
  private _oldMaxZ: number = 3

  constructor(light: DirectionalLight, camera: Camera) {
      this.scene = light.getScene();
      this.light = light;
      this.camera = camera;
      this._viewMatrix = Matrix.Identity();
      this._lightHelperFrustumLines = [];
  }

  getLightExtents() {
      const light = this.light;

      return {
          "min": new Vector3(light.orthoLeft, light.orthoBottom, light.shadowMinZ !== undefined ? light.shadowMinZ : this.camera.minZ),
          "max": new Vector3(light.orthoRight, light.orthoTop, light.shadowMaxZ !== undefined ? light.shadowMaxZ : this.camera.maxZ)
      };
  }

  getViewMatrix() {
      // same computation here than in the shadow generator
      Matrix.LookAtLHToRef(this.light.position, this.light.position.add(this.light.direction), Vector3.Up(), this._viewMatrix);
      return this._viewMatrix;
  }

  buildLightHelper() {
      if (this._oldPosition 
          && this._oldPosition.equals(this.light.position) 
          && this._oldDirection.equals(this.light.direction) 
          && this._oldAutoCalc === this.light.autoCalcShadowZBounds
          && this._oldMinZ === this.light.shadowMinZ
          && this._oldMaxZ === this.light.shadowMaxZ
      ) {
          return;
      }

      this._oldPosition = this.light.position;
      this._oldDirection = this.light.direction;
      this._oldAutoCalc = this.light.autoCalcShadowZBounds;
      this._oldMinZ = this.light.shadowMinZ;
      this._oldMaxZ = this.light.shadowMaxZ;

      this._lightHelperFrustumLines.forEach((mesh) => {
          mesh.dispose();
      });

      this._lightHelperFrustumLines = [];

      const lightExtents = this.getLightExtents();
      const lightView = this.getViewMatrix();

      if (!lightExtents || !lightView) {
          return;
      }

      const invLightView = Matrix.Invert(lightView);

      const n1 = new Vector3(lightExtents.max.x, lightExtents.max.y, lightExtents.min.z);
      const n2 = new Vector3(lightExtents.max.x, lightExtents.min.y, lightExtents.min.z);
      const n3 = new Vector3(lightExtents.min.x, lightExtents.min.y, lightExtents.min.z);
      const n4 = new Vector3(lightExtents.min.x, lightExtents.max.y, lightExtents.min.z);

      const near1 = Vector3.TransformCoordinates(n1, invLightView);
      const near2 = Vector3.TransformCoordinates(n2, invLightView);
      const near3 = Vector3.TransformCoordinates(n3, invLightView);
      const near4 = Vector3.TransformCoordinates(n4, invLightView);

      const f1 = new Vector3(lightExtents.max.x, lightExtents.max.y, lightExtents.max.z);
      const f2 = new Vector3(lightExtents.max.x, lightExtents.min.y, lightExtents.max.z);
      const f3 = new Vector3(lightExtents.min.x, lightExtents.min.y, lightExtents.max.z);
      const f4 = new Vector3(lightExtents.min.x, lightExtents.max.y, lightExtents.max.z);

      const far1 = Vector3.TransformCoordinates(f1, invLightView);
      const far2 = Vector3.TransformCoordinates(f2, invLightView);
      const far3 = Vector3.TransformCoordinates(f3, invLightView);
      const far4 = Vector3.TransformCoordinates(f4, invLightView);

      this._lightHelperFrustumLines.push(MeshBuilder.CreateLines("nearlines", { points: [near1, near2, near3, near4, near1] }, this.scene));
      this._lightHelperFrustumLines.push(MeshBuilder.CreateLines("farlines",  { points: [far1, far2, far3, far4, far1] }, this.scene));
      this._lightHelperFrustumLines.push(MeshBuilder.CreateLines("trlines", { points: [ near1, far1 ] }, this.scene));
      this._lightHelperFrustumLines.push(MeshBuilder.CreateLines("brlines", { points: [ near2, far2 ] }, this.scene));
      this._lightHelperFrustumLines.push(MeshBuilder.CreateLines("tllines", { points: [ near3, far3 ] }, this.scene));
      this._lightHelperFrustumLines.push(MeshBuilder.CreateLines("bllines", { points: [ near4, far4 ] }, this.scene));

      const makePlane = (name: string, color: Color3, positions: Nullable<FloatArray>) => {
          let plane = new Mesh(name + "plane", this.scene),
              mat = new StandardMaterial(name + "PlaneMat", this.scene);

          plane.material = mat;

          mat.emissiveColor = color;
          mat.alpha = 0.3;
          mat.backFaceCulling = false;
          mat.disableLighting = true;

          const indices = [0, 1, 2, 0, 2, 3];

          const vertexData = new VertexData();

          vertexData.positions = positions;
          vertexData.indices = indices;

          vertexData.applyToMesh(plane);

          this._lightHelperFrustumLines.push(plane);
      };

      makePlane("near",   new Color3(1, 0, 0),    [near1.x, near1.y, near1.z, near2.x, near2.y, near2.z, near3.x, near3.y, near3.z, near4.x, near4.y, near4.z ]);
      makePlane("far",    new Color3(0.3, 0, 0),  [far1.x, far1.y, far1.z, far2.x, far2.y, far2.z, far3.x, far3.y, far3.z, far4.x, far4.y, far4.z ]);
      makePlane("right",  new Color3(0, 1, 0),    [near1.x, near1.y, near1.z, far1.x, far1.y, far1.z, far2.x, far2.y, far2.z, near2.x, near2.y, near2.z ]);
      makePlane("left",   new Color3(0, 0.3, 0),  [near4.x, near4.y, near4.z, far4.x, far4.y, far4.z, far3.x, far3.y, far3.z, near3.x, near3.y, near3.z ]);
      makePlane("top",    new Color3(0, 0, 1),    [near1.x, near1.y, near1.z, far1.x, far1.y, far1.z, far4.x, far4.y, far4.z, near4.x, near4.y, near4.z ]);
      makePlane("bottom", new Color3(0, 0, 0.3),  [near2.x, near2.y, near2.z, far2.x, far2.y, far2.z, far3.x, far3.y, far3.z, near3.x, near3.y, near3.z ]);
  }
}