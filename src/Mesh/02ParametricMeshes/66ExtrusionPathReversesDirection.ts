import { ArcRotateCamera, Color3, Engine, FloatArray, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Vector3 } from "babylonjs";

export default class ExtrusionPathReversesDirection {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Extrusion Path Reverses Direction'
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(3, 0, 0));
    camera.attachControl(this.canvas, true);
    camera.setPosition(new Vector3(3, 5, -12))

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    function dround(f: number, d: number) {
      d = Math.round(d);
      if (d < -15 || d > 15) { return f; }
      if (d == 0) { return Math.round(f); }
      let s = Math.pow(10, d);
      let ff = s * f;
      return Math.round(ff) / s;
    }
    // round a vector using dround
    function vround(v: Vector3, d: number) {
      let va: FloatArray = [];
      v.toArray(va);
      va.forEach((e, ndx) => {
        va[ndx] = dround(va[ndx], d);
      })
      return v.fromArray(va);
    }

    function generateCircle(r1 = 0.5, r2 = 0.5, q = 12, plane = 'xy') {
      var p = [];
      let a = 2 * Math.PI / q;         // arc of each section
      let b = 3 * a / 2;  //offset
      for (let i = 0; i < q; i++) {
        let v = Vector3.Zero();
        if (plane == 'xy') {
          v = new Vector3(r1 * Math.cos(i * a), r2 * Math.sin(i * a), 0)
        } else if (plane == 'xz') {
          v = new Vector3(r1 * Math.cos(i * a + b), 0, r2 * Math.sin(i * a + b))
        } else { console.warn('plane is ' + plane) }
        p.push(vround(v, 3));
      }
      //      p.push(p[0]);
      return p;
    }

    const contour = generateCircle(0.5, 0.5, 6, 'xy')

    const shape = MeshBuilder.CreateLines('shape', { points: contour })
    shape.color = Color3.Teal()

    // 'degenerate' path that  reverses direction producing undefined and reversed tangents, normals, and binormals
    const pathY = [0,   1.1, 1.2, 1.1, 1,   0.9, 1.2, 2];   
    const radii = [0.8, 1.5, 1.2, 1,   0.8, 0.7, 0.5, 0.4];
    const path0 = [];
    const path1 = [];

    for (let i = 0; i < pathY.length; i++) {
      let pt = new Vector3(0,pathY[i],0);
      let pt1;  
      // generate paths for two extrusions
      pt.x += 3;
      path0.push(pt);
      pt1 = pt.clone();
      pt1.x += 3;
      path1.push(pt1);
  
   }

   const extPath0 = MeshBuilder.CreateLines('extPath0', { points: path0 })
   extPath0.color = Color3.Magenta()

   const extPath1 = MeshBuilder.CreateLines('extPath1', { points: path1 })
   extPath1.color = Color3.Yellow()

   const ext1 = MeshBuilder.ExtrudeShape('ext1', {
    shape: contour,
    path: path0
   })

   const ext2 = MeshBuilder.ExtrudeShape('ext2', {
    shape: contour,
    path: path1,
    firstNormal: new Vector3(1, 0, 0),
    adjustFrame: true
   })

   const mat = new StandardMaterial('mat')
   mat.diffuseColor = Color3.Green()
   mat.wireframe = true
   ext1.material = mat
   ext2.material = mat

    return scene;
  }
}