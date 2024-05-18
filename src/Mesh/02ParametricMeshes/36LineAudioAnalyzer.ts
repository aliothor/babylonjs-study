import { Analyser, ArcRotateCamera, Color3, CreateGreasedLine, Engine, GreasedLineMeshColorMode, RawTexture, Scene, Sound, StandardMaterial, Vector3 } from "babylonjs";

export default class LineAudioAnalyzer {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Line Audio Analyzer'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2, 8, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    this.demo(scene, camera)

    return scene;
  }

  demo(scene: Scene, camera: ArcRotateCamera) {
    // 
    const numOfBars = 256
    const barWidth = 3

    // points
    const analyzerPoints = []
    const offsets = []
    for (let i = 0; i < numOfBars; i++) {
      analyzerPoints.push(new Vector3(i * barWidth, 0, 0))
      offsets.push(0, 0, 0, 0, 0, 0)
    }
    const wavePoints = [...analyzerPoints]

    // colors
    const texColors = new Uint8Array([255, 0, 0, 255, 255, 0, 0, 255, 0])
    const tex = new RawTexture(
      texColors,
      texColors.length / 3,
      1,
      Engine.TEXTUREFORMAT_RGB,
      scene,
      false,
      true,
      Engine.TEXTURE_LINEAR_NEAREST
    )
    tex.wrapU = RawTexture.WRAP_ADDRESSMODE
    tex.name = 'analyzer-texture'

    // 1
    const analyzerLine = CreateGreasedLine('analyzerLine', {
      points: analyzerPoints,
      updatable: true
    }, {
      width: 2,
      colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY
    })
    const mat = analyzerLine.material as StandardMaterial
    mat.emissiveTexture = tex

    // 2
    const waveLine = CreateGreasedLine('waveLine', {
      points: wavePoints,
      updatable: true
    }, {
      color: Color3.Red(),
      width: 24,
      sizeAttenuation: true,
      useDash: true,
      dashRatio: 0.4,
      dashCount: numOfBars
    })
    waveLine.position = new Vector3(0, -30, 0)

    camera.zoomOn([analyzerLine])
    camera.radius = 530
    camera.detachControl()

    drawGrid()
    startAudio()
    createAnalyzer()

    function drawGrid() {
      const points = []
      for (let i = 0; i < numOfBars; i++) {
        points.push([
          new Vector3(i * barWidth, -200, 0),
          new Vector3(i * barWidth, 200, 0)
        ])
      }
      for (let i = 0; i < numOfBars; i++) {
        points.push([
          new Vector3(0, i * barWidth - 200, 0),
          new Vector3(barWidth * numOfBars, i * barWidth - 200, 0)
        ])
      }
    }

    function startAudio() {
      const music = new Sound('music', 'https://wave-analyzer.babylonjs.xyz/mp3/glitch-flight-track.mp3', scene, null, {
        loop: false,
        autoplay: true
      })
    }

    function createAnalyzer() {
      if (Engine.audioEngine) {
        const analyser = new Analyser(scene)
        Engine.audioEngine.connectToAnalyser(analyser)
        analyser.BARGRAPHAMPLITUDE = 256
        analyser.FFT_SIZE = 512
        analyser.SMOOTHING = 0.7

        scene.onBeforeRenderObservable.add(() => {
          const frequecies = analyser.getByteFrequencyData()
          const widths = []
          const offsets = []
          for (let i = 0; i < numOfBars; i++) {
            const normalizedFrequecy = frequecies[i]
            widths.push(normalizedFrequecy, normalizedFrequecy / 2)
            offsets.push(0, -normalizedFrequecy, 0, 0, -normalizedFrequecy, 0)
          }
          analyzerLine.widths = widths
          waveLine.offsets = offsets

          tex.uOffset += 0.01 * scene.getAnimationRatio()
        })
      } else {
        console.error('No audio engine.')
      }
    }

  }
}