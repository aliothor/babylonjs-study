import { Analyser, ArcRotateCamera, Color3, Curve3, DirectionalLight, Engine, FreeCamera, HemisphericLight, Mesh, MeshBuilder, Scene, SceneLoader, Sound, SoundTrack, StandardMaterial, Texture, Vector3 } from "babylonjs";
import { CornerHandle } from "babylonjs-gui";

export default class UsingAnalyer {
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

    const camera = new FreeCamera('camera', new Vector3(0, 5, -70));
    camera.attachControl(this.canvas, true);

    const light = new DirectionalLight('light', new Vector3(0, -5, 2), scene);

    // gound
    const ground = MeshBuilder.CreateGround('ground', {width: 600, height: 600});
    const groundMat = new StandardMaterial('groundMat');
    groundMat.diffuseColor = Color3.White();
    groundMat.backFaceCulling = false;
    ground.material = groundMat;
    ground.position = Vector3.Zero();

    // 环境
    scene.gravity = new Vector3(0, -0.98, 0);
    scene.collisionsEnabled = true;

    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new Vector3(1, 1, 1);

    ground.checkCollisions = true;

    const music1 = new Sound(
      'Violons11',
      'https://playground.babylonjs.com/sounds/violons18.wav',
      scene,
      null,
      {autoplay: true, loop: false}
    );

    const myAnalyer = new Analyser();
    Engine.audioEngine?.connectToAnalyser(myAnalyer);
    myAnalyer.FFT_SIZE = 32;
    myAnalyer.SMOOTHING = 0.9;

    const spatialBoxArray: Mesh[] = [];
    let spatialBox: Mesh;
    let color: {r: number, g: number, b: number};

    for (let i = 0; i < myAnalyer.FFT_SIZE / 2; i++) {
      spatialBox = MeshBuilder.CreateBox('sb' + i, {size: 2});
      spatialBox.position = new Vector3(i * 2, 10, 0);
      color = hsvToRgb(i / (myAnalyer.FFT_SIZE) / 2 * 360, 100, 50);
      const mat = new StandardMaterial('sbm' + i);
      mat.diffuseColor = new Color3(color.r, color.g, color.b);
      spatialBox.material = mat;
      spatialBoxArray.push(spatialBox);
    }

    scene.registerBeforeRender(
      function() {
        const workingArray =  myAnalyer.getByteFrequencyData();
        for (let i = 0; i < myAnalyer.getFrequencyBinCount(); i++) {
          spatialBoxArray[i].scaling.y = workingArray[i] / 32;
        }
      }
    );


    // const soundTrack = new SoundTrack();
    // soundTrack.addSound(music1);
    // soundTrack.connectToAnalyser(myAnalyer);

    // myAnalyer.DEBUGCANVASSIZE.width = 640;
    // myAnalyer.DEBUGCANVASSIZE.height = 400;
    // myAnalyer.DEBUGCANVASPOS.x = 190;
    // myAnalyer.DEBUGCANVASPOS.y = 120;

    // myAnalyer.drawDebugCanvas();


    function hsvToRgb(h: number, s: number, v: number) {
      let r: number, g: number, b: number;
      let i: number;
      let f: number, p: number, q: number, t: number;
    
      h = Math.max(0, Math.min(360, h));
      s = Math.max(0, Math.min(100, s));
      v = Math.max(0, Math.min(100, v));
    
      s /= 100;
      v /= 100;
    
      if(s == 0) {
            r = g = b = v;
            return {r:Math.round(r * 255), g:Math.round(g * 255), b:Math.round(b * 255)};
          }
    
      h /= 60; // sector 0 to 5
      i = Math.floor(h);
      f = h - i; // factorial part of h
      p = v * (1 - s);
      q = v * (1 - s * f);
      t = v * (1 - s * (1 - f));
    
      switch(i) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        default: // case 5:
          r = v;
          g = p;
          b = q;
      }
      return {r: r, g: g, b: b};
    }

    return scene;
  }
}