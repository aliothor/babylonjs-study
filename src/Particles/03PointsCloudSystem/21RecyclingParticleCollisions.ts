import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PointsCloudSystem,
  Scene,
  StandardMaterial,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class RecyclingParticleCollisions {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Recycling Particle Collisions";
  }

  async InitScene() {
    const engine = await this.CreateEngine();
    const scene = await this.CreateScene(engine);

    engine.runRenderLoop(() => {
      scene.render();
    });
    window.addEventListener("resize", () => {
      engine.resize();
    });
  }

  async CreateEngine(gpu: boolean = false): Promise<Engine> {
    if (gpu) {
      const webGPUSupported = await WebGPUEngine.IsSupportedAsync;
      if (webGPUSupported) {
        const engine = new WebGPUEngine(this.canvas);
        await engine.initAsync();
        return engine;
      }
    }
    return new Engine(this.canvas);
  }

  async CreateScene(engine: Engine): Promise<Scene> {
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      12,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    camera.minZ = 0.1;

    const ground = MeshBuilder.CreateGround("ground", {
      width: 100,
      height: 100,
    });
    const gMat = new StandardMaterial("gmat");
    gMat.diffuseColor = new Color3(0.5, 0.45, 0.4);
    ground.material = gMat;
    const sphere = MeshBuilder.CreateSphere("sphere", {
      diameter: 0.5,
      segments: 10,
    });
    const sMat = new StandardMaterial("smat");
    sMat.diffuseColor = Color3.Blue();
    sphere.material = sMat;

    // parameters
    const meshX = -3;
    const meshY = 4;
    const meshZ = 0;
    const sphereX = 0;
    const sphereY = meshY / 2;
    const sphereZ = 0;
    const direction = new Vector3(
      sphereX - meshX,
      sphereY - meshY,
      sphereZ - meshZ
    ).normalize();
    const axis1 = new Vector3(
      sphereX - meshX,
      meshY - sphereY,
      sphereZ - meshZ
    ).normalize();
    const axis2 = Vector3.Cross(direction, axis1);

    MeshBuilder.CreateLines("direction", {
      points: [Vector3.Zero(), direction.scaleInPlace(5)],
    }).color = Color3.Red();
    MeshBuilder.CreateLines("axis1", {
      points: [Vector3.Zero(), axis1.scaleInPlace(5)],
    }).color = Color3.Green();
    MeshBuilder.CreateLines("axis2", {
      points: [Vector3.Zero(), axis2.scaleInPlace(5)],
    }).color = Color3.Blue();

    const speed = 1.9;
    const cone = 0.3;
    const gravity = -speed / 3.5;
    const restitution = 0.98;
    let tmpPos = Vector3.Zero();
    let tmpNormal = Vector3.Zero();
    let tmpDot = 0;

    const pcs = new PointsCloudSystem("pcs", 2, scene);
    pcs.recycleParticle = (p) => {
      p.position = Vector3.Zero();
      p.velocity = direction
        .add(axis1.scale((0.5 - Math.random()) * cone))
        .add(axis2.scale((0.5 - Math.random()) * cone));
      p.velocity.normalize();
      p.velocity.scaleInPlace(speed * (0.5 * Math.random()));
      p.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
      return p;
    };
    MeshBuilder.CreateLines("emit", {
      points: [
        new Vector3(meshX, meshY, meshZ),
        direction
          .add(axis1.scale((0.5 - Math.random()) * cone))
          .add(axis2.scale((0.5 - Math.random()) * cone)),
      ],
    });

    pcs.addPoints(10000, pcs.recycleParticle);
    const mesh = await pcs.buildMeshAsync();
    mesh.position = new Vector3(meshX, meshY, meshZ);
    sphere.position = new Vector3(sphereX, sphereY, sphereZ);

    pcs.updateParticle = (p) => {
      if (p.position.y + mesh.position.y < ground.position.y) {
        pcs.recycleParticle(p);
      }
      p.position.addInPlace(p.velocity);

      // interscection
      if (p.intersectsMesh(sphere, true)) {
        p.position.addToRef(mesh.position, tmpPos);
        tmpPos.subtractToRef(sphere.position, tmpNormal);
        tmpNormal.normalize();
        tmpDot = Vector3.Dot(p.velocity, tmpNormal);
        // bounce result
        p.velocity.x = -p.velocity.x + tmpDot * tmpNormal.x;
        p.velocity.y = tmpDot * tmpNormal.y;
        p.velocity.z = -p.velocity.z + tmpDot * tmpNormal.z;
        p.velocity.scaleInPlace(restitution);
        p.velocity.y += gravity;
        p.color = new Color4(1, 1, 0, 1);
      }
      return p;
    };

    let k = 0;
    sphere.registerBeforeRender(() => {
      pcs.setParticles();
      sphere.position = new Vector3(
        0.2 * Math.sin(k),
        0.05 * Math.sin(k * 10) + sphereY,
        0.1 * Math.sin(k * 6)
      );
      k += 0.01;
    });

    return scene;
  }
}
