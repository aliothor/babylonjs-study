import {
  ArcRotateCamera,
  CannonJSPlugin,
  Color3,
  DefaultRenderingPipeline,
  Engine,
  HemisphericLight,
  ImageProcessingConfiguration,
  MeshBuilder,
  PhysicsImpostor,
  PointLight,
  PointerEventTypes,
  Scene,
  SceneLoader,
  StandardMaterial,
  TrailMesh,
  Vector3,
} from "babylonjs";
import "babylonjs-loaders";
import * as cannon from "cannon";
window.CANNON = cannon;

export default class GlowingOrbsWithTrail {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>("h1")!.innerHTML =
      "Glowing Orbs With Trail";
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene();

    this.engine.runRenderLoop(() => {
      scene.render();
    });
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      8,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    // environment
    const environment = scene.createDefaultEnvironment({
      skyboxSize: 300,
    });
    environment?.setMainColor(new Color3(0.05, 0.05, 0.05));

    const url = "https://models.babylonjs.com/TrailMeshSpell/";
    const orbR = await SceneLoader.LoadAssetContainerAsync(
      url,
      "pinkEnergyBall.glb"
    );
    const orbG = await SceneLoader.LoadAssetContainerAsync(
      url,
      "greenEnergyBall.glb"
    );
    const obrY = await SceneLoader.LoadAssetContainerAsync(
      url,
      "yellowEnergyBall.glb"
    );

    const res = {
      orbs: [orbR.meshes[0], orbG.meshes[0], obrY.meshes[0]],
      lights: Array<PointLight>(),
    };

    res.orbs = res.orbs.map((o, i) => {
      // create lights
      const pt = new PointLight("pt", new Vector3(0, 3, 0));
      pt.intensity = 0.3;
      res.lights.push(pt);

      // add physics root for spheres
      const sphere = MeshBuilder.CreateSphere("sphere", {
        diameter: 0.7,
        segments: 16,
      });
      sphere.isVisible = false;
      o.setParent(sphere);
      sphere.position.y += 0.3 + i * 0.3;
      sphere.scaling.scaleInPlace(0.3);
      o.scaling.scaleInPlace(0.03);
      o.rotation.set(
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI
      );
      o.scaling.z *= Math.random() > 0.5 ? -1 : 1;
      scene.addMesh(o, true);

      return sphere;
    });

    // set up new rendering pipeline
    const pipeline = new DefaultRenderingPipeline("default", true, scene, [
      camera,
    ]);
    scene.imageProcessingConfiguration.toneMappingEnabled = true;
    scene.imageProcessingConfiguration.toneMappingType =
      ImageProcessingConfiguration.TONEMAPPING_ACES;
    scene.imageProcessingConfiguration.exposure = 3;
    pipeline.glowLayerEnabled = true;
    pipeline.glowLayer!.intensity = 0.5;

    // use cannon physics plugin
    scene.enablePhysics(new Vector3(0, -9.8 / 3, 0), new CannonJSPlugin());

    // create physics impostrors
    const ground = MeshBuilder.CreateBox("ground");
    ground.scaling = new Vector3(100, 1, 100);
    ground.position.y = environment?.ground?.position.y - (0.5 + 0.001);
    ground.material = new StandardMaterial("gMat");
    ground.material.alpha = 0.99;
    ground.material.alphaMode = Engine.ALPHA_ONEONE;
    ground.physicsImpostor = new PhysicsImpostor(
      ground,
      PhysicsImpostor.BoxImpostor,
      { mass: 0, restitution: 0.6 }
    );

    // add trail to orbs
    res.orbs.forEach((orb, i) => {
      orb.physicsImpostor = new PhysicsImpostor(
        orb,
        PhysicsImpostor.SphereImpostor,
        { mass: 1, restitution: 0.6 }
      );
      const trail = new TrailMesh("orb trail", orb, scene, 0.2, 30, true);
      const tMat = new StandardMaterial("tMat");
      let color = Color3.Red();
      if (i == 1) {
        color = Color3.Green();
      } else if (i === 2) {
        color = Color3.Yellow();
      }
      tMat.emissiveColor = tMat.diffuseColor = color;
      tMat.specularColor = Color3.Black();
      res.lights[i].diffuse = color.scale(0.5);
      res.lights[i].specular = color.scale(0.5);
      trail.material = tMat;
    });

    // mouse envent
    scene.onPointerObservable.add((e) => {
      if (e.type == PointerEventTypes.POINTERMOVE) {
        res.orbs.forEach((s) => {
          let vel = s.physicsImpostor?.getLinearVelocity();
          const dir = e.pickInfo?.ray?.origin
            .add(e.pickInfo.ray.direction.scale(4))
            .subtract(s.position)
            .normalize()
            .scaleInPlace(0.8);
          const result = new Vector3();
          dir?.scaleToRef(Vector3.Dot(vel, dir), result);
          const amt = vel?.subtract(result);
          amt?.scaleInPlace(0.9);
          vel = result.add(amt);
          vel.addInPlace(dir);
          s.physicsImpostor?.setLinearVelocity(vel);
        });
      }
    });

    return scene;
  }
}
