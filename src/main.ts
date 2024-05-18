// import app from "./Materials/BasicUse/81VolumetricFog";
// import app from "./Materials/Shaders/07BoidsComputeShader";
// import app from './Materials/NodeMaterial/11PBRBlocksSubSurface'
// import App from './Mesh/09BoundBoardDecal/09DecalGraffiti'
import App from "./Physics/27ShapeCast";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const app = new App(canvas);
app.InitScene(); // 异步时使用
