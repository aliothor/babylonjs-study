import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, Mesh, MeshBuilder, PointLight, Scene, StandardMaterial, Texture, Vector3, Vector4 } from "babylonjs";

export default class PolyhdraWithDifferentElement {
  engine: Engine;
  scene: Scene;
  private s: HTMLScriptElement

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Polyhdra With Different Element'
    // https://cdn.rawgit.com/BabylonJS/Extensions/master/Polyhedron/polyhedra.js
    this.s = document.createElement('script')
    this.s.src = '/Materials/polyhedra.js'
    document.head.appendChild(this.s)

    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);
    scene.clearColor = new Color4(0.5, 0.5, 0.5, 1)

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 60, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7

    const pl = new PointLight('pl', Vector3.Zero(), scene)
    pl.diffuse = Color3.White()
    pl.specular = Color3.White()
    pl.intensity = 0.8

    const mat = new StandardMaterial('mat')
    // mat.diffuseTexture = new Texture('/Materials/spriteAtlas.png')
    mat.diffuseTexture = new Texture('/Materials/polyhedron.jpeg')

    const spriteCols = 10 // 6
    const spriteRows = 1  // 4

    this.s.onload = function() {
      // create element
      const createDiv = function(name: string) {
        const div = document.createElement('div')
        document.getElementsByTagName('body')[0].appendChild(div)
        div.id = name

        return div
      }

      // main
      const polygons: Mesh[] = []
      const rotations: number[] = []
      const divs = {}
      let counter = 0
      let col = 0
      let row = 0
      for (let p in POLYHEDRA) {
        const polyhedron = POLYHEDRA[p]
        const faceUV = []
        const faceColors = []
        const nbf = polyhedron.face.length
        for (let f = 0; f < nbf; f++) {
          const v = Math.floor(Math.random() * spriteRows)
          faceUV[f] = new Vector4((f % spriteCols) / spriteCols, v / spriteRows, (f % spriteCols + 1) / spriteCols, (v + 1) / spriteRows)
          faceColors[f] = new Color4(Math.random(), Math.random(), Math.random(), 1)
        }

        const polygon = MeshBuilder.CreatePolyhedron(polyhedron.name, {
          custom: polyhedron,
          size: 2,
          // faceUV: faceUV,
          faceColors: faceColors
        })
        // polygon.material = mat

        col = counter % 21
        if (col == 0) row++
        polygon.position.x = (col - 10) * 8
        polygon.position.y = (row - 3) * 8
        polygons.push(polygon)
        rotations.push((.5 - Math.random()) / 4)
        divs[polyhedron.name] = createDiv(polyhedron.name)

        counter++
      }

      pl.position = camera.position

      // display info
      let curDiv: HTMLDivElement
      let lastDiv: HTMLDivElement
      let onExit = true
      scene.registerBeforeRender(function() {
        // rotations
        for (let i = 0; i < polygons.length; i++) {
          polygons[i].rotation.y += rotations[i] 
        }

        // pick
        const pickResult = scene.pick(scene.pointerX, scene.pointerY, function(mesh) { return mesh.isVisible && mesh.isReady }, false, camera)
        if (pickResult.hit) {
          const name = pickResult.pickedMesh?.name
          curDiv = divs[name]
          if (lastDiv && curDiv != lastDiv) {
            lastDiv.style.display = 'none'
            lastDiv = curDiv
          }
          curDiv.style.position = 'fixed'
          curDiv.style.width = '150px'
          curDiv.style.height = '80px'
          curDiv.style.left = scene.pointerX + 'px'
          curDiv.style.top = scene.pointerY + 'px'
          curDiv.style.display = 'block'
          curDiv.style.color = 'white'
          curDiv.style.backgroundColor = 'red'
          curDiv.style.cursor = 'pointer'
          curDiv.innerHTML = name
          onExit = true
          lastDiv = curDiv
        } else if (curDiv && onExit) {
          curDiv.style.display = 'none'
          onExit = false
        }
      })

    }

    return scene;
  }
}