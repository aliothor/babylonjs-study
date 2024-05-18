import { Animation, ArcRotateCamera, Color3, DirectionalLight, Engine, HemisphericLight, MeshBuilder, Scene, SpotLight, StandardMaterial, UniversalCamera, Vector3 } from "babylonjs";

export default class SequenceAnimation {
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


    const light1 = new DirectionalLight("directLight", new Vector3(0, -1, 0), scene);
    const light2 = new HemisphericLight("hemiLight", new Vector3(0, 1, -1), scene);
    light1.intensity = 0.25;
    light2.intensity = 0.5;

    // 地面
    const ground = MeshBuilder.CreateGround('ground', {width: 50, height: 50});
    // 墙面
    const wall1 = MeshBuilder.CreateBox("wall1", {width: 8, height: 6, depth: 0.1});
    wall1.position.x = -6;
    wall1.position.y = 3;
    
    const wall2 = MeshBuilder.CreateBox("wall2", {width: 4, height: 6, depth: 0.1});
    wall2.position.x = 2;
    wall2.position.y = 3;
    
    const wall3 = MeshBuilder.CreateBox("wall3", {width: 2, height: 2, depth: 0.1});
    wall3.position.x = -1;
    wall3.position.y = 5;
  
    const wall4 = MeshBuilder.CreateBox("wall3", {width: 14, height: 6, depth: 0.1});
    wall4.position.x = -3;
    wall4.position.y = 3;
    wall4.position.z = 7;
  
    const wall5 = MeshBuilder.CreateBox("wall3", {width: 7, height: 6, depth: 0.1});
    wall5.rotation.y = Math.PI / 2;
    wall5.position.x = -10;
    wall5.position.y = 3;
    wall5.position.z = 3.5;
  
    const wall6 = MeshBuilder.CreateBox("wall3", {width: 7, height: 6, depth: 0.1});
    wall6.rotation.y = Math.PI / 2;
    wall6.position.x = 4;
    wall6.position.y = 3;
    wall6.position.z = 3.5;
  
    const wall7 = MeshBuilder.CreateBox("wall3", {width: 14, height: 7, depth: 0.1});
    wall7.rotation.x = Math.PI / 2;
    wall7.position.x = -3;
    wall7.position.y = 6;
    wall7.position.z = 3.5;

    // 摄像机
    const camera = new UniversalCamera("universalCamera", new Vector3(0, 3, -30));

    // 门
    const door = MeshBuilder.CreateBox('door', {width: 2, height: 4, depth: 0.1});
    const hinge = MeshBuilder.CreateBox('hinge');
    hinge.isVisible = false;
    door.parent = hinge;
    hinge.position.y = 2;
    door.position.x = -1;

    // 灯泡
    const sphereLight = MeshBuilder.CreateSphere('sphere', {diameter: 0.2});
    sphereLight.material = new StandardMaterial('');
    (sphereLight.material as StandardMaterial).emissiveColor = new Color3(1, 1, 1);
    sphereLight.position.x = 2;
    sphereLight.position.y = 3;
    sphereLight.position.z = 0.1;

    const sphereLights = [sphereLight];
    sphereLights.push(sphereLight.clone());
    sphereLights[1].position = new Vector3(-2, 3, 6.9);

    // 灯光
    const spotLights = [];
    const lightDirections = [new Vector3(-0.5, -0.25, 1), new Vector3(0, 0, -1)];
    for (let i = 0; i < sphereLights.length; i++) {
      spotLights[i] = new SpotLight('spotLight' + i, sphereLights[i].position, 
                      lightDirections[i], Math.PI / 8, 5, scene);
      spotLights[i].diffuse = new Color3(1, 1, 1);
      spotLights[i].specular = new Color3(0.5, 0.5, 0.5);
      spotLights[i].intensity = 0;
    }

    /****************动画过程 ************************** */
    const frameRate = 20;
    // 开关门
    const doorAnim = new Animation('doorAnim', 'rotation.y', frameRate, 
              Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    const doorAnimKeys = [];
    doorAnimKeys.push({
      frame: 0,
      value: 0
    });
    doorAnimKeys.push({
      frame: 3 * frameRate,
      value: 0
    });
    doorAnimKeys.push({
      frame: 5 * frameRate,
      value: Math.PI / 3
    });
    doorAnimKeys.push({
      frame: 13 * frameRate,
      value: Math.PI / 3
    });
    doorAnimKeys.push({
      frame: 15 * frameRate,
      value: 0
    });
    doorAnim.setKeys(doorAnimKeys);

    // 摄像机动画
    // 前进
    const movein = new Animation('movein', 'position', frameRate,
      Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
    const moveKeys = [];
    moveKeys.push({
      frame: 0,
      value: new Vector3(0, 3, -30)
    });
    moveKeys.push({
      frame: 3 * frameRate,
      value: new Vector3(0, 2, -10)
    });
    moveKeys.push({
      frame: 5 * frameRate,
      value: new Vector3(0, 2, -10)
    });
    moveKeys.push({
      frame: 8 * frameRate,
      value: new Vector3(-2, 2, 3)
    });
    movein.setKeys(moveKeys);

    // 环绕
    const rotate = new Animation('rotate', 'rotation.y', frameRate,
        Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    const rotateKeys = [];
    rotateKeys.push({
      frame: 0,
      value: 0
    });
    rotateKeys.push({
      frame: 9 * frameRate,
      value: 0
    });
    rotateKeys.push({
      frame: 14 * frameRate,
      value: Math.PI
    });
    rotate.setKeys(rotateKeys);

    // 灯光动画
    const lightDimmer = new Animation('dimmer', 'intensity', frameRate,
      Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    const lightKeys = [];
    lightKeys.push({
      frame: 0,
      value: 0
    });
    lightKeys.push({
      frame: 7 * frameRate,
      value: 0
    });
    lightKeys.push({
      frame: 10 * frameRate,
      value: 1
    });
    lightKeys.push({
      frame: 14 * frameRate,
      value: 1
    });
    lightKeys.push({
      frame: 15 * frameRate,
      value: 0
    });
    lightDimmer.setKeys(lightKeys);

    scene.beginDirectAnimation(hinge, [doorAnim], 0, 25 * frameRate, false);
    scene.beginDirectAnimation(camera, [movein, rotate], 0, 25 * frameRate, false);
    scene.beginDirectAnimation(spotLights[0], [lightDimmer], 0, 25 * frameRate, false);
    scene.beginDirectAnimation(spotLights[1], [lightDimmer.clone()], 0, 25 * frameRate, false);

	
    return scene;
  }
}