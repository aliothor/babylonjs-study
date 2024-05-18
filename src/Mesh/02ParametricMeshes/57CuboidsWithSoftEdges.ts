import { ArcRotateCamera, Color3, DirectionalLight, Engine, HemisphericLight, Mesh, MeshBuilder, NodeMaterial, Scene, ShadowGenerator, StandardMaterial, Texture, Tools, Vector3 } from "babylonjs";

export default class CuboidsWithSoftEdges {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Cuboids With Soft Edges'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', Tools.ToRadians(-130), 3 * Math.PI / 8, 10, new Vector3(0, 0.5, 2));
    camera.attachControl(this.canvas, true);
    camera.minZ = 0.1
    camera.wheelPrecision = 80
    camera.pinchPrecision = 30
    camera.angularSensibilityX = 6000
    camera.angularSensibilityY = 6000

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.6

    const light2 = new DirectionalLight("dir01", new Vector3(-0.5, -0.5, -1.0), scene);
    light2.position = new Vector3(5, 5, 5);

    const stoneMaterial = new StandardMaterial('stoneMat', scene);
    stoneMaterial.diffuseTexture = new Texture('/Meshes/stone.jpg')

    const box = this.createSoftBox('default-box', {}, scene)
    const rectangle = this.createSoftBox("rectangle", { heightTop: 1 }, scene);
    const rectangle2 = this.createSoftBox("rectangle2", { heightTop: 1, depthBack: 1.5 }, scene);

    const circle = this.createSoftBox("circle", { radius: 0.5, arcSegments: 50 }, scene);
    const egg = this.createSoftBox("egg", { heightTop: 0.75, arcSegments: 100, stretch: true }, scene);
    const egg2 = this.createSoftBox("egg2", { heightTop: 0.75, arcSegments: 100, stretch: true, depthBack: 1.5 }, scene);

    const pebble = this.createSoftBox("pebble", { radius: 0.25, heightTop: 0, arcSegments: 20 }, scene);
    const smoothCube = this.createSoftBox("smooth-cube", { radius: 0.05, arcSegments: 20 }, scene);
    const smoothCube2 = this.createSoftBox("smooth-cube2", { radius: 0.25, arcSegments: 20, depthBack: 1.5 }, scene);

    const cuboid = this.createSoftBox("cuboid", { radius: 0.25, arcSegments: 1 }, scene);
    const cuboid2 = this.createSoftBox("cuboid2", { radius: 0.5, arcSegments: 2 }, scene);
    const cuboid3 = this.createSoftBox("cuboid2", { radius: 0.5, arcSegments: 0, depthBack: 1.5 }, scene);

    box.position.y = 1

    rectangle.position.y = 1
    rectangle.position.z = 2

    rectangle2.position.y = 1
    rectangle2.position.z = 4

    circle.position.y = 1
    circle.position.x = -2

    egg.position.y = 1
    egg.position.x = -2
    egg.position.z = 2

    egg2.position.y = 1
    egg2.position.x = -2
    egg2.position.z = 4

    pebble.position.y = 1
    pebble.position.x = -4

    smoothCube.position.y = 1
    smoothCube.position.x = -4
    smoothCube.position.z = 2

    smoothCube2.position.y = 1
    smoothCube2.position.x = -4
    smoothCube2.position.z = 4

    cuboid.position.y = 1
    cuboid.position.x = 2

    cuboid2.position.y = 1
    cuboid2.position.x = 2
    cuboid2.position.z = 2

    cuboid3.position.y = 1
    cuboid3.position.x = 2
    cuboid3.position.z = 4

    // Materials
    box.material = stoneMaterial;
    rectangle.material = stoneMaterial;
    rectangle2.material = stoneMaterial;
    circle.material = stoneMaterial;
    egg.material = stoneMaterial;
    egg2.material = stoneMaterial;
    pebble.material = stoneMaterial;
    smoothCube.material = stoneMaterial;
    smoothCube2.material = stoneMaterial;
    cuboid.material = stoneMaterial;
    cuboid2.material = stoneMaterial;
    cuboid3.material = stoneMaterial;

    //Shadows
    var sg = new ShadowGenerator(1024, light2);
    sg.useBlurExponentialShadowMap = true;
    sg.blurKernel = 32;

    sg.addShadowCaster(box, true);
    sg.addShadowCaster(rectangle, true);
    sg.addShadowCaster(rectangle2, true);
    sg.addShadowCaster(circle, true);
    sg.addShadowCaster(egg, true);
    sg.addShadowCaster(egg2, true);
    sg.addShadowCaster(pebble, true);
    sg.addShadowCaster(smoothCube, true);
    sg.addShadowCaster(smoothCube2, true);
    sg.addShadowCaster(cuboid, true);
    sg.addShadowCaster(cuboid2, true);
    sg.addShadowCaster(cuboid3, true);

    const helper = scene.createDefaultEnvironment({
      skyboxSize: 1000,
      enableGroundShadow: true
    })
    helper?.setMainColor(Color3.Gray())
    helper.ground.position.y += 0.01

    return scene;
  }

  private createSoftBox(name: string, opt: any, scene: Scene) {
    const size = opt.size ?? 1
    const height = opt.height ?? size / 2
    const width = opt.width ?? size / 2
    const depth = opt.depth ?? size / 2
    const heightTop = opt.widthTop ?? height
    const widthLeft = opt.widthLeft ?? width
    const depthBack = opt.depthBack ?? depth
    const heightBottom = opt.heightBottom ?? height
    const widthRight = opt.widthRight ?? width
    const depthFront = opt.depthFront ?? depth

    const arcSegments = Math.max(opt.arcSegments ?? 1, 1)
    const radius = Math.max(opt.radius ?? 0, 0)
    const radiusX = Math.max(opt.radiusX ?? radius, 0)
    const radiusY = Math.max(opt.radiusY ?? radius, 0)
    const radiusZ = Math.max(opt.radiusZ ?? radius, 0)
    const radiusXPos = Math.max(opt.radiusXPos ?? radius, 0)
    const radiusYPos = Math.max(opt.radiusYPos ?? radius, 0)
    const radiusZPos = Math.max(opt.radiusZPos ?? radius, 0)
    const radiusXNeg = Math.max(opt.radiusXNeg ?? radius, 0)
    const radiusYNeg = Math.max(opt.radiusYNeg ?? radius, 0)
    const radiusZNeg = Math.max(opt.radiusZNeg ?? radius, 0)

    const stretch = opt.stretch ?? false
    const stretchX = opt.stretchX ?? stretch
    const stretchY = opt.stretchY ?? stretch
    const stretchZ = opt.stretchZ ?? stretch

    const heightTopInner = Math.max(heightTop - radiusYPos, 0)
    const widthLeftInner = Math.max(widthLeft - radiusXPos, 0)
    const depthBackInner = Math.max(depthBack - radiusZPos, 0)

    const heightBottomInner = Math.max(heightBottom - radiusYNeg, 0)
    const widthRightInner = Math.max(widthRight - radiusXNeg, 0)
    const depthFrontInner = Math.max(depthFront - radiusZNeg, 0)

    // console.log(`heightBottomInner:${heightBottomInner}, heightTopInner:${heightTopInner}, widthRightInner:${widthRightInner}, widthLeftInner:${widthLeftInner}, depthFrontInner:${depthFrontInner}, depthBackInner:${depthBackInner}, radiusYNeg:${radiusYNeg}, radiusYPos:${radiusYPos}, radiusXNeg:${radiusXNeg}, radiusXPos:${radiusXPos}`);

    const getArc = (
      offset: number,
      width: number,
      height: number,
      depth: number,
      radiusX: number,
      radiusY: number,
      radiusZ: number,
      innerInc: number,
      outerInc: number,
      stretchX: number,
      stretchY: number,
      stretchZ: number) => {

      let x = stretchX ?
          (Math.abs(width) + radiusX) * Math.cos(offset + outerInc * arc) * Math.cos(innerInc * arc) :
          width + radiusX * Math.cos(offset + outerInc * arc) * Math.cos(innerInc * arc);
      let y = stretchY ?
          (Math.abs(height) + radiusY) * Math.sin(innerInc * arc) :
          height + radiusY * Math.sin(innerInc * arc);
      let z = stretchZ ?
          (Math.abs(depth) + radiusZ) * Math.sin(offset + outerInc * arc) * Math.cos(innerInc * arc) :
          depth + radiusZ * Math.sin(offset + outerInc * arc) * Math.cos(innerInc * arc);

      const ret = new Vector3(x, y, z);

      return ret;
    }

    const paths: Vector3[][] = [];
    const arc = Math.PI / (2 * arcSegments)

    const addSegment = (offset: number, segments: number, width: number, heightTop: number, heightBottom: number, depth: number) => {
      for (let t = 0; t <= segments; t++) {

          const path: Vector3[] = [];
          path.push(getArc(offset, 0, -heightBottom, 0, radiusXPos, radiusYPos, radiusZPos, -arcSegments, t, stretchX, stretchY, stretchZ));

          for (let a = -arcSegments; a <= 0; a++) {
              const height = a > 0 ? heightTop : -heightBottom;
              path.push(getArc(offset, width, height, depth, radiusXPos, radiusYPos, radiusZPos, a, t, stretchX, stretchY, stretchZ));
          }

          path.push(getArc(offset, width, 0, depth, radiusXPos, radiusYPos, radiusZPos, 0, t, stretchX, stretchY, stretchZ));

          for (let a = 0; a <= arcSegments; a++) {
              const height = a >= 0 ? heightTop : -heightBottom;
              path.push(getArc(offset, width, height, depth, radiusXPos, radiusYPos, radiusZPos, a, t, stretchX, stretchY, stretchZ));
          }

          path.push(getArc(offset, 0, heightTop, 0, radiusXPos, radiusYPos, radiusZPos, arcSegments, t, stretchX, stretchY, stretchZ));
          paths.push(path);

      }
    }

    if (!stretch && widthLeftInner + widthRightInner > 0) addSegment(0, 0, widthRightInner, heightTopInner, heightBottomInner, 0);
    addSegment(0, arcSegments, widthRightInner, heightTopInner, heightBottomInner, depthBackInner);

    if (!stretch && depthBackInner + depthFrontInner > 0) addSegment(Math.PI / 2, 0, 0, heightTopInner, heightBottomInner, depthBackInner);
    addSegment(Math.PI / 2, arcSegments, -widthLeftInner, heightTopInner, heightBottomInner, depthBackInner);

    if (!stretch && widthLeftInner + widthRightInner > 0) addSegment(Math.PI, 0, -widthLeftInner, heightTopInner, heightBottomInner, 0);
    addSegment(Math.PI, arcSegments, -widthLeftInner, heightTopInner, heightBottomInner, -depthFrontInner);

    if (!stretch && depthBackInner + depthFrontInner > 0) addSegment(3 * Math.PI / 2, 0, 0, heightTopInner, heightBottomInner, -depthFrontInner);
    addSegment(3 * Math.PI / 2, arcSegments, widthRightInner, heightTopInner, heightBottomInner, -depthFrontInner);

    const ribbon = MeshBuilder.CreateRibbon("ribbon", { pathArray: paths, sideOrientation: Mesh.FRONTSIDE, closeArray: true }, scene);

    return ribbon;

  }
}