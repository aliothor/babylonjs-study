import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  SolidParticleSystem,
  StandardMaterial,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class SolidParticleFromMeshFacets {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Solid Particle From Mesh Facets Example";
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

    scene.clearColor = new Color4(0.2, 0.4, 0.8, 1);
    camera.setPosition(new Vector3(0, 0, -200));

    const ground = MeshBuilder.CreateGround("ground", {
      width: 1500,
      height: 1500,
    });
    ground.position.y = -100;
    ground.isPickable = false;
    const gMat = new StandardMaterial("gMat");
    gMat.diffuseColor = new Color3(0.7, 0.5, 0.4);
    gMat.freeze();
    ground.material = gMat;

    const gravity = -0.05;
    const radius = 10;
    const speed = 10;
    let digested = false;

    const sps = new SolidParticleSystem("sps", scene, { isPickable: true });

    const mat = new StandardMaterial("mat");
    mat.diffuseColor = Color3.Green();
    mat.backFaceCulling = false;
    mat.freeze();
    const knot = MeshBuilder.CreateTorusKnot("knot", {
      radius: 20,
      tube: 6,
      tubularSegments: 64,
      radialSegments: 128,
    });
    knot.material = mat;
    sps.digest(knot, { facetNb: 4, delta: 160 });
    knot.dispose();
    digested = true;
    const s = sps.buildMesh();
    s.material = mat;
    sps.setParticles();
    sps.refreshVisibleSize();

    sps.vars.target = Vector3.Zero();
    sps.vars.tmp = Vector3.Zero();
    sps.vars.justClicked = false;
    sps.vars.radius = radius;
    sps.vars.minY = -100;

    let boom = false;
    sps.updateParticle = (p) => {
      if (sps.vars.justClicked) {
        p.position.subtractToRef(sps.vars.target, sps.vars.tmp);
        let len = sps.vars.tmp.length();
        let scl = len < 0.001 ? 1 : sps.vars.radius / len;
        sps.vars.tmp.normalize();
        p.velocity.x +=
          sps.vars.tmp.x * scl * speed * (1 + Math.random() * 0.3);
        p.velocity.y +=
          sps.vars.tmp.y * scl * speed * (1 + Math.random() * 0.3);
        p.velocity.z +=
          sps.vars.tmp.z * scl * speed * (1 + Math.random() * 0.3);
        p.props = { rand: Math.random() / 100 };
        if (p.idx == sps.nbParticles - 1) {
          sps.vars.justClicked = false;
        }
      }

      // move the particle
      if (boom && !sps.vars.justClicked) {
        if (p.position.y < sps.vars.minY) {
          p.position.y = sps.vars.minY;
          p.velocity.y = 0;
          p.velocity.x = 0;
          p.velocity.z = 0;
        } else {
          p.velocity.y += gravity;
          p.position.x += p.velocity.x;
          p.position.y += p.velocity.y;
          p.position.z += p.velocity.z;

          p.rotation.x += p.velocity.z * p.props.rand;
          p.rotation.y += p.velocity.x * p.props.rand;
          p.rotation.z += p.velocity.y * p.props.rand;
        }
      }

      return p;
    };

    // boom trigger
    scene.onPointerDown = (evt, pickInfo, type) => {
      if (digested) {
        let faceId = pickInfo.faceId;
        if (faceId == -1) return;
        let idx = sps.pickedParticles[faceId].idx;
        let p = sps.particles[idx];
        boom = true;

        camera.position.subtractToRef(p.position, sps.vars.target);
        sps.vars.target.normalize();
        sps.vars.target.scaleInPlace(radius);
        sps.vars.target.addInPlace(p.position);
        sps.vars.justClicked = true;
      }
    };

    // animation
    scene.registerBeforeRender(() => {
      if (digested) {
        sps.setParticles();
      }
    });

    return scene;
  }
}
