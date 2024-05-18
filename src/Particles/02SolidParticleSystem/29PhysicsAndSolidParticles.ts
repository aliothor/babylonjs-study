import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  SolidParticleSystem,
  StandardMaterial,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class PhysicsAndSolidParticles {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Physics and Solid Particles Example 2";
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
      8,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    scene.clearColor = new Color4(0.2, 0.3, 0.6, 1);
    camera.setPosition(new Vector3(0, 100, -200));

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 1000, height: 1000 },
      scene
    );
    const gMat = new StandardMaterial("gMat");
    gMat.diffuseColor = new Color3(0.5, 0.45, 0.4);
    gMat.backFaceCulling = false;
    ground.material = gMat;
    ground.freezeWorldMatrix();
    gMat.freeze();

    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 36 });
    const sMat = new StandardMaterial("sMat");
    sMat.diffuseColor = Color3.Red();
    sphere.material = sMat;
    sMat.freeze();

    const box = MeshBuilder.CreateBox("box", { size: 4 });
    const poly = MeshBuilder.CreatePolyhedron("poly", {
      size: 4,
      type: 4,
      flat: true,
    });
    const tetra = MeshBuilder.CreatePolyhedron("tetra", {
      size: 2,
      flat: true,
    });
    const nb = 200;
    const sps = new SolidParticleSystem("sps", scene, {
      particleIntersection: true,
      boundingSphereOnly: true,
    });
    sps.addShape(box, nb);
    sps.addShape(poly, nb);
    sps.addShape(tetra, nb);
    box.dispose();
    poly.dispose();
    tetra.dispose();
    const mesh = sps.buildMesh();
    sps.isAlwaysVisible = true;
    sps.computeBoundingBox = true;
    sps.computeParticleTexture = false;

    mesh.position.y = 80;
    mesh.position.x = -70;
    const sphereAltitude = mesh.position.y / 2;
    sphere.position.y = sphereAltitude;

    const speed = 1.9;
    const cone = 0.3;
    const gravity = -speed / 100;
    const restitution = 0.98;
    let sign = 1;
    let tmpPos = Vector3.Zero();
    let tmpNormal = Vector3.Zero();
    let tmpDot = 0;

    sps.recycleParticle = (p) => {
      p.position = Vector3.Zero();
      p.velocity.x = Math.random() * speed;
      p.velocity.y = (Math.random() - 0.3) * cone * speed;
      p.velocity.z = (Math.random() - 0.5) * cone * speed;

      p.rotation.x = Math.random() * Math.PI;
      p.rotation.y = Math.random() * Math.PI;
      p.rotation.z = Math.random() * Math.PI;

      p.scaling = new Vector3(
        Math.random() + 0.1,
        Math.random() + 0.1,
        Math.random() + 0.1
      );

      p.color = new Color4(
        Math.random() + 0.1,
        Math.random() + 0.1,
        Math.random() + 0.1,
        1
      );

      return p;
    };

    sps.initParticles = () => {
      for (let i = 0; i < sps.nbParticles; i++) {
        sps.recycleParticle(sps.particles[i]);
      }
    };

    sps.updateParticle = (p) => {
      if (p.position.y + mesh.position.y < ground.position.y) {
        sps.recycleParticle(p);
      }

      p.velocity.y += gravity;
      p.position.addInPlace(p.velocity);
      sign = p.idx % 2 ? 1 : -1;
      p.rotation.z += 0.1 * sign;
      p.rotation.x += 0.05 * sign;
      p.rotation.z += 0.008 * sign;

      // intersection
      if (p.intersectsMesh(sphere)) {
        p.position.addToRef(mesh.position, tmpPos); // particle world position
        tmpPos.subtractToRef(sphere.position, tmpNormal); // normal to the sphere
        tmpNormal.normalize(); // normalize the normal
        tmpDot = Vector3.Dot(p.velocity, tmpNormal); // dot product
        // bounce result
        p.velocity.x = -p.velocity.x + 2 * tmpDot * tmpNormal.x;
        p.velocity.y = -p.velocity.y + 2 * tmpDot * tmpNormal.y;
        p.velocity.z = -p.velocity.z + 2 * tmpDot * tmpNormal.z;

        p.color = new Color4(0.6, p.color?.g, 0.8, 1);
      }

      return p;
    };

    sps.initParticles();
    sps.setParticles();
    // sps.computeParticleColor = false;

    let k = 0;
    scene.registerBeforeRender(() => {
      sps.setParticles();
      sphere.position.x = 20 * Math.sin(k);
      sphere.position.z = 10 * Math.sin(k * 6);
      sphere.position.y = 5 * Math.sin(k * 10) + sphereAltitude;
      k += 0.01;
    });

    const dl = new DirectionalLight("dl", new Vector3(-1, -2, -1));
    dl.intensity = 0.7;
    dl.position = new Vector3(0, 100, 0);
    const sg = new ShadowGenerator(1024, dl);
    sg.addShadowCaster(mesh);
    sg.addShadowCaster(sphere);
    sg.useBlurExponentialShadowMap = true;
    ground.receiveShadows = true;

    return scene;
  }
}
