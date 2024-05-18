import { ArcRotateCamera, Color4, CreateGreasedLine, Engine, GreasedLineTools, HemisphericLight, MeshBuilder, Scene, SceneLoader, Sprite, SpriteManager, Vector3 } from "babylonjs";

export default class FlowerPower {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Flower Power'
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
    camera.detachControl()

    scene.clearColor = new Color4(0, 0, 0, 1)

    const spriteManager = new SpriteManager(
      'spriteManager',
      'https://playgrounds.babylonjs.xyz/flowers.png',
      2000,
      { width: 105, height: 103 },
      scene
    )

    fetch('https://assets.babylonjs.com/fonts/Droid Sans_Regular.json').then(data => {
      data.json().then(fontData => {
        const points = GreasedLineTools.GetPointsFromText('BJS', 16, 2, fontData)

        const textLines = CreateGreasedLine('textLines', {points})

        camera.zoomOn([textLines])

        const pointsInfo = []
        for (let line of points) {
          const pointsVertors = GreasedLineTools.ToVector3Array(line)
          const lineSegments = GreasedLineTools.GetLineSegments(pointsVertors)
          const lineLength = GreasedLineTools.GetLineLength(pointsVertors)
          pointsInfo.push({
            pointsVertors,
            lineSegments,
            lineLength
          })
        }

        let v = 0
        textLines.visibility = 0
        const flowers = []
        let stop = false
        scene.onBeforeRenderObservable.add(() => {
          if (stop) return
          textLines.greasedLineMaterial!.visibility = v
          v += 0.001 * scene.getAnimationRatio()

          for (let pi of pointsInfo) {
            const drawingPosition = GreasedLineTools.GetPositionOnLineByVisibility(pi.lineSegments, pi.lineLength, v)
            if (v <= 1 && Math.random() < 0.2) {
              this.addFlower(flowers, drawingPosition, spriteManager)
            }
          }
          
          stop = this.animateFlowers(flowers, scene)
        })

      })
    })

    return scene;
  }

  addFlower(flowers, position: Vector3, spriteManager: SpriteManager) {
    const flower = new Sprite('flower', spriteManager)
    flower.width = 0
    flower.height = 0
    flower.cellIndex = (Math.round(Math.random() * 69) * 100) / 100
    position.z = Math.random()
    position.x += Math.random() * 2 -1
    flower.position = position
    flowers.push({
      targetSize: Math.random() * 2 + 1,
      flower
    })
  }

  animateFlowers(flowers, scene: Scene) {
    let stop = flowers.length > 0
    for (let f of flowers) {
      if (f.flower.width < f.targetSize) {
        f.flower.width += 0.01 * scene.getAnimationRatio()
        f.flower.height += 0.01 * scene.getAnimationRatio()
        stop = false
      }
    }
    return stop
  }
}