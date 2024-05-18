import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, PointerEventTypes, Scene, StandardMaterial, Vector3, VideoTexture } from "babylonjs";

export default class PlayVideoTexture {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Play Video Texture'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const vPlane = MeshBuilder.CreatePlane('vPlane', {
      width: 7.3967,
      height: 5.4762,
      sideOrientation: Mesh.DOUBLESIDE
    })
    vPlane.position = new Vector3(0, 0, 0.1)
    const mat = new StandardMaterial('mat')
    const tex = new VideoTexture('tex', 'https://playground.babylonjs.com/textures/babylonjs.mp4', scene, false, false, VideoTexture.TRILINEAR_SAMPLINGMODE, { autoPlay: false, autoUpdateTexture: true })

    // mat.diffuseTexture = tex
    mat.roughness = 1
    // mat.emissiveColor = Color3.White()
    vPlane.material = mat

    VideoTexture.CreateFromWebCam(scene, function(vt) {
      mat.emissiveTexture = vt
      
      // html
      const div = document.getElementsByTagName('body')[0].appendChild(vt.video)

      div.style.position = 'fixed'
      div.style.width = '100px'
      div.style.height = '100px'
      div.style.left = '100px'
      div.style.top = '20px'
      div.style.backgroundColor = 'blue'
      div.style.borderRadius = '50px'
    }, { maxWidth: 256, maxHeight: 256, minWidth: 64, minHeight: 64, deviceId: '' }, undefined, false )

    // control
    scene.onPointerUp = function() {
      tex.video.play()
      scene.onPointerUp = undefined
    }

    scene.onPointerObservable.add(function(evt) {
      if (evt.pickInfo?.pickedMesh == vPlane) {
        if (tex.video.paused) {
          tex.video.play()
        } else {
          tex.video.pause()
        }
      }
    }, PointerEventTypes.POINTERPICK)

    return scene;
  }
}