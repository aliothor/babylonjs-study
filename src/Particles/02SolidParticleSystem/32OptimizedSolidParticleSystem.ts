import {
  ArcRotateCamera,
  Axis,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PointLight,
  Scene,
  SolidParticle,
  SolidParticleSystem,
  Vector3,
  WebGPUEngine,
} from "babylonjs";

export default class OptimizedSolidParticleSystem {
  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Optimized Solid Particle System";
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

    var pl = new PointLight("pl", new Vector3(0, 0, 0), scene);
    pl.diffuse = new Color3(1, 1, 1);
    pl.intensity = 1.0;
    pl.position = camera.position;

    scene.clearColor = new Color4(0, 0, 0, 1);
    camera.setPosition(new Vector3(0, 10, -400));

    const nb = 100; // nb of particles
    const size = 1.5; // particle size
    const fact = 150; // cube size
    const distance = 40; // neighbor distance
    const aw = 0.5; // association weight
    const cw = 0.5; // cohesion weight
    const sw = 0.5; // separation weight
    const pool = 100; // nb of particles computed at once
    const delay = 100; // delay for flocking computation
    const speed = 1; // particle speed

    const limit = fact / 2;
    const distance2 = distance * distance;
    let p; // current particle pointer (particles loop)
    let part; // current particle pointer (flocking loop)
    let start = 0; // start index
    let end = start + pool - 1; // end index
    end = end >= nb - 1 ? nb - 1 : end;
    const X = Axis.X;
    const Y = Axis.Y;
    const Z = Axis.Z;

    const box = MeshBuilder.CreateBox(
      "box",
      { size: fact + 2 * size, sideOrientation: Mesh.BACKSIDE },
      scene
    );

    // position function
    function myPositionFunction(p: SolidParticle) {
      p.position.x = (Math.random() - 0.5) * fact;
      p.position.y = (Math.random() - 0.5) * fact;
      p.position.z = (Math.random() - 0.5) * fact;
      p.velocity.x = (Math.random() - 0.5) * fact * speed;
      p.velocity.y = (Math.random() - 0.5) * fact * speed;
      p.velocity.z = (Math.random() - 0.5) * fact * speed;
      //p.rotation.x = Math.random() * 3.15;
      //p.rotation.y = Math.random() * 3.15;
      //p.rotation.z = Math.random() * 1.5;
      p.color = new Color4(
        p.position.x / fact + 0.5,
        p.position.y / fact + 0.5,
        p.position.z / fact + 0.5,
        1.0
      );
    }

    // model
    const poly = MeshBuilder.CreatePolyhedron(
      "m",
      { type: 4, size: size, sizeY: size * 2 },
      scene
    );

    // sps creation
    const sps = new SolidParticleSystem("sps", scene);
    sps.addShape(poly, nb);
    const mesh = sps.buildMesh();
    // dispose the model
    poly.dispose();

    // sps init
    sps.initParticles = function () {
      for (let i = 0; i < sps.nbParticles; i++) {
        myPositionFunction(sps.particles[i]);
      }
    };

    sps.initParticles(); // compute particle initial status
    sps.setParticles(); // updates the sps mesh and draws it

    // tmp internal storing variables
    sps.vars.v = Vector3.Zero(); // velocity result
    sps.vars.a = Vector3.Zero(); // alignement result
    sps.vars.c = Vector3.Zero(); // cohesion result
    sps.vars.sep = Vector3.Zero(); // separation result
    sps.vars.n = 0; // neighbor counter
    sps.vars.rot = Vector3.Zero(); // particle rotation
    sps.vars.axis1 = Vector3.Zero();
    sps.vars.axis3 = Vector3.Zero();

    function computeFlocking(particle: SolidParticle) {
      for (let i = 0; i < sps.nbParticles; i++) {
        p = sps.particles[i];
        // reset tmp vectors
        sps.vars.v.scaleInPlace(0);
        sps.vars.a.scaleInPlace(0);
        sps.vars.c.scaleInPlace(0);
        sps.vars.sep.scaleInPlace(0);
        sps.vars.n = 0;

        if (i != particle.idx) {
          if (
            Vector3.DistanceSquared(p.position, particle.position) < distance2
          ) {
            // Alignement
            sps.vars.a.addInPlace(p.velocity);
            // Cohesion
            sps.vars.c.addInPlace(p.position);
            // Separation
            sps.vars.sep.addInPlace(p.position);
            sps.vars.sep.subtractInPlace(particle.position);
            // neighbor count
            sps.vars.n++;
          }
        }
      }
      if (sps.vars.n == 0) {
        return sps.vars.v;
      }

      sps.vars.n = 1 / sps.vars.n;

      sps.vars.a.scaleInPlace(sps.vars.n);
      sps.vars.a.normalize();
      sps.vars.a.scaleInPlace(aw);

      sps.vars.c.scaleInPlace(sps.vars.n);
      sps.vars.c.subtractInPlace(particle.position);
      sps.vars.c.normalize();
      sps.vars.c.scaleInPlace(cw);

      sps.vars.sep.scaleInPlace(-1 * sps.vars.n);
      sps.vars.sep.normalize();
      sps.vars.sep.scaleInPlace(sw);

      sps.vars.v.addInPlace(sps.vars.a);
      sps.vars.v.addInPlace(sps.vars.c);
      sps.vars.v.addInPlace(sps.vars.sep);

      return sps.vars.v;
    }

    function flocking() {
      for (let i = start; i <= end; i++) {
        part = sps.particles[i];
        part.velocity.addInPlace(computeFlocking(part));

        // rotation : steer like velocity vector
        // get axis1 orthogonal to velocity
        if (part.velocity.x != 0 || part.velocity.z != 0) {
          // velocity not collinear with Y
          Vector3.CrossToRef(part.velocity, Y, sps.vars.axis1);
        } else if (part.velocity.y != 0 || part.velocity.z != 0) {
          // velocity not collinear with X
          Vector3.CrossToRef(part.velocity, X, sps.vars.axis1);
        } else if (part.velocity.x != 0 || part.velocity.y != 0) {
          // velocity not collinear with Z
          Vector3.CrossToRef(part.velocity, Z, sps.vars.axis1);
        }
        // get axis3 orthogonal to axis1 and velocity
        Vector3.CrossToRef(sps.vars.axis1, part.velocity, sps.vars.axis3);
        Vector3.RotationFromAxisToRef(
          sps.vars.axis1,
          part.velocity,
          sps.vars.axis3,
          sps.vars.rot
        );
        part.rotation.x = sps.vars.rot.x;
        part.rotation.y = sps.vars.rot.y;
        part.rotation.z = sps.vars.rot.z;
      }

      start += pool;
      start = start >= sps.nbParticles - 1 ? 0 : start;
      end = start + pool - 1;
      end = end >= sps.nbParticles - 1 ? sps.nbParticles - 1 : end;
    }

    // flocking
    setInterval(() => {
      flocking();
    }, delay);

    sps.updateParticle = (p: SolidParticle) => {
      // keep in the cube
      if (Math.abs(p.position.x) > limit) {
        p.velocity.x *= -1;
      }
      if (Math.abs(p.position.y) > limit) {
        p.velocity.y *= -1;
      }
      if (Math.abs(p.position.z) > limit) {
        p.velocity.z *= -1;
      }

      p.velocity.normalize();
      p.velocity.scaleInPlace(speed);

      p.position.x += p.velocity.x;
      p.position.y += p.velocity.y;
      p.position.z += p.velocity.z;

      return p;
    };

    // Optimizers after first setParticles() call
    // This will be used only for the next setParticles() calls
    // Here, colors and textures never change once they are set
    sps.computeParticleColor = false;
    sps.computeParticleTexture = false;

    // sps mesh animation
    scene.registerBeforeRender(() => {
      sps.setParticles();
    });

    return scene;
  }
}
