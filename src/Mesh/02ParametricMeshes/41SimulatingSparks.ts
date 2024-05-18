import { ArcRotateCamera, Color3, Color4, CreateGreasedLine, Curve3, Engine, GlowLayer, GreasedLineMeshColorMode, HemisphericLight, MeshBuilder, MeshParticleEmitter, NoiseProceduralTexture, ParticleSystem, Scene, SceneLoader, Texture, Vector3 } from "babylonjs";
import 'babylonjs-loaders'

export default class SimulatingSparks {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Simulating Sparks'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 60, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.diffuse = new Color3(1, 1, 1)
    light.specular = new Color3(1, 1, 1)
    light.groundColor = new Color3(0.5, 0.5, 0.5)
    light.intensity = 6

    scene.clearColor = Color4.FromHexString('#020207')

    createSparks(20, 20)
    setTimeout(async () => {
      await createUfo()
    });
    createParticles(700)

    function createSparks(sparkCount: number, sparkRadius: number) {
      // 3 -->
      const glow = new GlowLayer('glow', scene, {
        blurKernelSize: 64
      })
      glow.intensity = 4
      // 3 <--
      const baseColors = ['#00CCB6', '#00EEB5', '#00786E', '#00FEFF', '#00B6c1', '#00D8E6']
      const colors = baseColors.map(bc => Color3.FromHexString(bc))

      const sparks: { line: any; speed: number; }[] = []
      for (let i = 0; i < sparkCount; i++) {
        const { color, width, speed, points } = createSparkData(i, colors, sparkRadius)

        const line = drawSpark(`spark-${i}`, color, width, points)
        sparks.push({ line, speed })

        // 3
        glow.referenceMeshToUseItsOwnMaterial(line)
      }

      // 3
      scene.onBeforeRenderObservable.add(() => {
        const animRatio = scene.getAnimationRatio()
        for (let i = 0; i < sparkCount; i++) {
          sparks[i].line.greasedLineMaterial.dashOffset += sparks[i].speed * animRatio
        }
      })
    }

    function createSparkData(index: number, colors: Color3[], sparkRadius: number) {
      const r = () => Math.max(0.2, Math.random())

      const pos = new Vector3(0, sparkRadius * r(), 0)
      const basePoints = new Array(30).fill(0).map((_, index) => {
        const angle = (index / 20) * Math.PI * 2
        return pos.add(new Vector3(Math.sin(angle) * sparkRadius * r(), Math.cos(angle) * sparkRadius * r() - sparkRadius / 2, 0)).clone()
      })

      const points = Curve3.CreateCatmullRomSpline(basePoints, 1000 / basePoints.length).getPoints()

      const color = colors[parseInt((colors.length * Math.random()).toString())]
      const width = Math.max(0.05, (0.2 * index) / 30)
      const speed = Math.max(0.001, 0.002 * Math.random())
      
      return { color, width, speed, points }
    }

    function drawSpark(name: string, color: Color3, width: number, points: Vector3[]) {
      const line = CreateGreasedLine(name, {
        points,
        updatable: true
      }, {
        colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY,
        color,
        width,
        // 2
        useDash: true,
        dashRatio: 0.98,
        dashCount: 10
      })
      return line
    }

    async function createUfo() {
      const { meshes } = await SceneLoader.ImportMeshAsync(
        '', 'https://assets.babylonjs.com/meshes/ufo.glb'
      )
      const ufo = meshes[0]
      ufo.name = 'ufo-root'
      ufo.scaling = new Vector3(20, 20, 20)
      ufo.position = new Vector3(0, -9, 0)
    }

    function createParticles(count: number) {
      const emitter = MeshBuilder.CreateSphere('emitter', {diameter: 100})
      emitter.position.y = 25
      emitter.isVisible = false

      const particleSystem = new ParticleSystem('particles', count, scene)
      particleSystem.renderingGroupId = 0
      particleSystem.particleTexture = new Texture('https://playground.babylonjs.com/textures/flare.png')
      const meshEmiter = new MeshParticleEmitter(emitter)
      particleSystem.particleEmitterType = meshEmiter

      particleSystem.emitter = emitter

      particleSystem.color1 = new Color4(0.7, 0.7, 0.7, 1)
      particleSystem.color2 = new Color4(0.2, 0.2, 0.2, 1)
      particleSystem.colorDead = new Color4(0, 0, 0.2, 0)

      particleSystem.minSize = 0.1
      particleSystem.maxSize = 0.5

      particleSystem.minLifeTime = 0.3
      particleSystem.maxLifeTime = 1.5

      particleSystem.emitRate = 1500

      particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE

      particleSystem.gravity = new Vector3(0, -10, 0)

      particleSystem.direction1 = new Vector3(-1, 4, 1)
      particleSystem.direction2 = new Vector3(1, 4, -1)

      particleSystem.minAngularSpeed = 0
      particleSystem.maxAngularSpeed = Math.PI

      particleSystem.minEmitPower = 0
      particleSystem.maxEmitPower = 0
      particleSystem.updateSpeed = 0.005

      const noiseTexture = new NoiseProceduralTexture('perlin', 256)
      noiseTexture.animationSpeedFactor = 5
      noiseTexture.persistence = 2
      noiseTexture.brightness = 0.5
      noiseTexture.octaves = 10

      particleSystem.noiseTexture = noiseTexture
      particleSystem.noiseStrength = new Vector3(100, 100, 100)

      particleSystem.start()
    }

    return scene;
  }
}