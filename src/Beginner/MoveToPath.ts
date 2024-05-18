import {
  ArcRotateCamera,
  Axis,
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  SceneLoader,
  Space,
  Vector3
} from "babylonjs";
import Coordinate from "./Coordinate";

export default class MoveToPath {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 1.5,
      Math.PI / 5,
      15,
      new Vector3(0, 0, 0)
    );
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight(
      "light",
      new Vector3(0, 1, 0),
      this.scene
    );

    const axis = new Coordinate(scene);
    axis.showAxis(6);

    const faceColors = [];
    faceColors[0] = Color3.Blue().toColor4();
    faceColors[1] = Color3.Teal().toColor4();
    faceColors[2] = Color3.Red().toColor4();
    faceColors[3] = Color3.Purple().toColor4();
    faceColors[4] = Color3.Green().toColor4();
    faceColors[5] = Color3.Yellow().toColor4();

    const box = MeshBuilder.CreateBox("box", {
      size: 0.5,
      faceColors: faceColors
    });
    box.position = new Vector3(2, 0, 2);

    //y component can be non zero
    const points = [];
    points.push(new Vector3(2, 0, 2));
    points.push(new Vector3(2, 0, -2));
    points.push(new Vector3(-2, 0, -2));
    points.push(points[0]); //close the triangle;

    MeshBuilder.CreateLines("triangle", { points: points });

    class slide {
      turn: number;
      dist: number;
      constructor(turn: number, dist: number) {
        //after covering dist apply turn
        this.turn = turn;
        this.dist = dist;
      }
    }
    const track: any[] = [];
    track.push(new slide(Math.PI / 2, 4)); //first side length 4
    track.push(new slide((3 * Math.PI) / 4, 8)); //at finish of second side distance covered is 4 + 4
    track.push(new slide((3 * Math.PI) / 4, 8 + 4 * Math.sqrt(2))); //all three sides cover the distance 4 + 4 + 4 * sqrt(2)

    let distance = 0;
    let step = 0.05;
    let p = 0;
    scene.onBeforeRenderObservable.add(() => {
      box.movePOV(0, 0, step);
      distance += step;

      if (distance > track[p].dist) {
        box.rotate(Axis.Y, track[p].turn, Space.LOCAL);
        p += 1;
        p %= track.length;
        if (p === 0) {
          distance = 0;
          box.position = new Vector3(2, 0, 2); //reset to initial conditions
          box.rotation = Vector3.Zero(); //prevents error accumulation
        }
      }
    });

    return scene;
  }
}
