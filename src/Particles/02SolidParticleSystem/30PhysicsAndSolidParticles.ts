import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PointLight,
  Scene,
  ShadowGenerator,
  SolidParticleSystem,
  StandardMaterial,
  Texture,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class PhysicsAndSolidParticles {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Physics and Solid Particles Example 3";
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

    var pl = new PointLight("pl", new Vector3(0, 0, 0), scene);
    pl.diffuse = new Color3(1, 1, 1);
    pl.specular = new Color3(1, 1, 0.8);
    pl.intensity = 0.95;
    pl.position = camera.position;

    var sphereRadius = 10.0;
    var size = 4.0;
    var ground = MeshBuilder.CreateGround(
      "gd",
      { width: 1000.0, height: 1000.0 },
      scene
    );
    var sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: sphereRadius * 2.0 },
      scene
    );
    var plane = MeshBuilder.CreatePlane("p", { size: size }, scene);
    var texture = new Texture("/Particles/flarealpha.png", scene);
    texture.hasAlpha = true;
    var matGround = new StandardMaterial("mp", scene);
    matGround.diffuseColor = new Color3(0.65, 0.6, 0.5);
    var mat = new StandardMaterial("m", scene);
    mat.diffuseTexture = texture;
    mat.useAlphaFromDiffuseTexture = true;

    ground.material = matGround;
    mat.freeze();
    matGround.freeze();
    plane.freezeWorldMatrix();

    // Particle system
    var particleNb = 5000;
    var sps = new SolidParticleSystem("sps", scene, {
      particleIntersection: true,
      boundingSphereOnly: true,
      bSphereRadiusFactor: 1.0 / Math.sqrt(3.0),
    });
    sps.addShape(sphere, 1);
    sps.addShape(plane, particleNb);
    sphere.dispose();
    plane.dispose();
    var mesh = sps.buildMesh();
    mesh.hasVertexAlpha = true;
    mesh.material = mat;
    sps.isAlwaysVisible = true;
    sps.computeParticleRotation = false;
    sps.billboard = true;

    // position things
    mesh.position.y = 80.0;
    mesh.position.x = -120.0;
    var sphereAltitude = -30; // in the sps local system

    // shared variables
    var speed = 1.5; // particle max speed
    var cone = 0.2; // emitter aperture
    var gravity = -speed / 60.0; // gravity
    var restitution = 0.25; // energy restitution
    var k = 0.0;
    var sign = 1.0;
    var tmpNormal = Vector3.Zero(); // current sphere normal on intersection point
    var tmpDot = 0.0; // current dot product
    var bboxesComputed = false; // the bbox are actually computed only after the first particle.update()
    var particle0 = sps.particles[0];

    // sps initialization : just recycle all
    sps.initParticles = function () {
      for (var p = 0; p < sps.nbParticles; p++) {
        sps.recycleParticle(sps.particles[p]);
      }
    };

    // recycle : reset the particle at the emitter origin
    sps.recycleParticle = (p) => {
      if (p.idx == 0) {
        p.position.x = 200.0;
        p.position.y = sphereAltitude;
        p.color = new Color4(1, 0, 0, 1);
        p.uvs.x = 0.5;
        p.uvs.y = 0.5;
        p.uvs.z = 0.5;
        p.uvs.w = 0.5;
        return p;
      }
      p.position.x = 0;
      p.position.y = 0;
      p.position.z = 0;
      p.velocity.x = Math.random() * speed + speed / 2.0;
      p.velocity.y = (Math.random() - 0.5) * cone * speed + speed / 2.0;
      p.velocity.z = (Math.random() - 0.5) * cone * speed;

      p.scaling.x = Math.random() + 0.1;
      p.scaling.y = p.scaling.x;

      p.color = new Color4(0.2, 0.5, 1.0, 0.3 * (1.0 + Math.random()));

      p.alive = true;

      return p;
    };

    // particle behavior
    sps.updateParticle = (p) => {
      // the first particle is the sphere
      if (p.idx == 0) {
        p.position.x = 30.0 * Math.sin(k) + 100.0;
        p.position.z = 20.0 * Math.sin(k * 6.0);
        p.position.y = 8.0 * Math.sin(k * 4.0) + sphereAltitude;
        return p;
      }

      // recycle if touched the ground
      if (p.position.y + mesh.position.y < ground.position.y) {
        sps.recycleParticle(p);
        return p;
      }

      // intersection
      if (bboxesComputed && p.intersectsMesh(particle0)) {
        p.position.subtractToRef(particle0.position, tmpNormal); // normal to the sphere
        tmpNormal.normalize(); // normalize the sphere normal
        tmpDot = Vector3.Dot(p.velocity, tmpNormal); // dot product (velocity, normal)
        // bounce result computation
        p.velocity.x =
          (-p.velocity.x + 2.0 * tmpDot * tmpNormal.x) * restitution;
        p.velocity.y =
          (-p.velocity.y + 2.0 * tmpDot * tmpNormal.y) * restitution;
        p.velocity.z =
          (-p.velocity.z + 2.0 * tmpDot * tmpNormal.z) * restitution;
        p.alive = false;
      }

      // update velocity, rotation and position
      p.velocity.y += gravity; // apply gravity to y
      p.position.addInPlace(p.velocity); // update particle new position
      sign = p.alive ? 1.0 : -1.0;
      p.scaling.x += 0.015 * sign;
      p.scaling.y = p.scaling.x;
      p.color.a -= 0.002;
      if (p.color.a < 0.0) {
        p.color.a = 0.0;
      }

      return p;
    };

    sps.afterUpdateParticles = function () {
      bboxesComputed = true;
    };

    // init all particle values
    sps.initParticles();
    sps.setParticles();
    sps.computeParticleTexture = false;

    //scene.debugLayer.show();
    // animation
    scene.registerBeforeRender(function () {
      sps.setParticles();

      k += 0.01;
    });

    return scene;
  }
}
