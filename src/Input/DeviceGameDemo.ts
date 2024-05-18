import { Animation, ArcRotateCamera, Axis, Color3, Color4, CubeTexture, DeviceSourceManager, DeviceType, Engine, FreeCamera, HemisphericLight, Mesh, MeshBuilder, ParticleSystem, Scene, SceneLoader, StandardMaterial, Texture, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, Control, TextBlock } from "babylonjs-gui";

export default class DeviceGameDemo {
  engine: Engine;
  scene: Scene;
  currentColor: Color3 = new Color3(0.5, 0.5, 1);
  moveSpeed: number = 0.002;
  shieldActive: boolean = false;
  bulletActive: boolean = false;
  boostActive: boolean = false;;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const camera = new FreeCamera('camera', new Vector3(0, 7, -15));
    camera.setTarget(Vector3.Zero());
    // camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // skybox
    const skybox = this._createSkybox(scene);

    // ship
    const ship = this._createShip(scene, camera);

    // gui 提示信息
    const adt = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    const ctlText = new TextBlock();
    ctlText.text = 'No connection to pilot controls';
    ctlText.color = 'white';
    ctlText.fontSize = 24;
    ctlText.fontStyle = 'bold';
    ctlText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    ctlText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    adt.addControl(ctlText);

    // 设备处理
    const dsm = new DeviceSourceManager(this.engine);

    dsm.onDeviceConnectedObservable.add((device) => {
      switch(device.deviceType) {
        case DeviceType.Keyboard:
          this.currentColor = new Color3(0, 0.5, 0.5);
          ctlText.color = 'red';
          ctlText.text = `Established link to ${DeviceType[device.deviceType]}\n`;
          ctlText.text += 'Pilot Controls\nShield: Z\nFire: Spacebar\nBoost: X';
          break;
        case DeviceType.Xbox:
          break;
        case DeviceType.DualShock:
          break;
      }
      this._changeShipColor(ship, this.currentColor);
    });

    dsm.onDeviceDisconnectedObservable.add((device) => {
      ctlText.color = 'white';
      ctlText.text = `Lost connection to ${DeviceType[device.deviceType]}`;
    });

    // scene loop
    scene.registerBeforeRender(() => {
      skybox.rotate(Axis.X, this.moveSpeed);

      const key = dsm.getDeviceSource(DeviceType.Keyboard);
      if (key) {
        this.currentColor = new Color3(1, 0.5, 0.5);
        this._changeShipColor(ship, this.currentColor);
        ctlText.color = 'red';
        ctlText.text = 'Pilot Controls\nShield: Z\nFire: Spacebar\nBoost: X';
        // Z shield
        if (key.getInput(90) == 1) {
          this._modifyShield(scene, ship);
        }
        // Spacebar fire
        if (key.getInput(32) == 1) {
          this._fireBlaster(scene, ship);
        }
        // X boost
        if (key.getInput(88) == 1) {
          const color1 = new Color4(1, 0.8, 0.8, 1);
          const color2 = new Color4(1, 0.5, 0.5, 1);
          this._activateBoost(ship, color1, color2, camera);
        }
        // <- left
        if (key.getInput(37) == 1) {
          this._turnLeft(ship);
        }
        // -> right
        if (key.getInput(39) == 1) {
          this._turnRight(ship);
        }
      }
    });

    return scene;
  }
  private _turnRight(ship: Mesh) {
    if (ship.position.x < 5) {
      ship.position.x += 0.04;
    }
  }
  private _turnLeft(ship: Mesh) {
    if (ship.position.x > -5) {
      ship.position.x -= 0.04;
    }
  }
  private _activateBoost(ship: Mesh, color1: Color4, color2: Color4, camera: FreeCamera) {
    if (!this.boostActive) {
      this.boostActive = true;
      const psys = this._findMesh(ship, 'jet').getConnectedParticleSystems()[0] as ParticleSystem;
      psys.color1 = color1;
      psys.color2 = color2;
      psys.direction1 = new Vector3(0, -5, 0);
      const anim = this.scene.beginAnimation(camera, 0, 120, false);
      this.moveSpeed = 0.004;

      setTimeout(() => {
        psys.direction1 = new Vector3(0, -1, 0);
        this.moveSpeed = 0.002;
      }, 3000);
      setTimeout(() => {
        this.boostActive = false;
      }, 4000);
    }
  }
  private _fireBlaster(scene: Scene, ship: Mesh) {
    if (!this.bulletActive) {
      this.bulletActive = true;
      const bulletLeft = this._findMesh(ship, 'bulletLeft');

      setTimeout(async () => {
        const anim = scene.beginAnimation(bulletLeft, 0, 10, false);
        await anim.waitAsync();
        bulletLeft.position.y = 0;
        this.bulletActive = false;
      });
    }
  }
  private _modifyShield(scene: Scene, ship: Mesh) {
    if (!this.shieldActive) {
      this.shieldActive = true;
      const shield = this._findMesh(ship, 'shield');

      setTimeout(async () => {
        const anim = scene.beginAnimation(shield, 0, 90, false);
        await anim.waitAsync();
        this.shieldActive = false;
      });
    }
  }
  private _changeShipColor(ship: Mesh, color: Color3) {
    const blasterLeft = this._findMesh(ship, 'blasterLeft');
    const bulletLeft = this._findMesh(ship, 'bulletLeft');
    const jet = this._findMesh(ship, 'jet');
    const shield = this._findMesh(ship, 'shield');

    jet.material.emissiveColor = color;
    blasterLeft.material.diffuseColor = color;
    shield.material.emissiveColor = color;
    bulletLeft.material.emissiveColor = color;
  }
  private _findMesh(ship: Mesh, childName: string) {
    return ship.getChildMeshes(false, (child) => {
      if (child.name == childName) {
        return true;
      } else {
        return false;
      }
    })[0];
  }
  private _createShip(scene: Scene, camera: FreeCamera) {
    // primary part
    const nose = MeshBuilder.CreateCylinder('nose', {height: 3, diameterTop: 0, diameterBottom: 1, tessellation: 4});
    // tail and jet
    const tail = MeshBuilder.CreateCylinder('tail', {height: 1, diameterTop: 1, diameterBottom: 0.5, tessellation: 4});
    tail.position.y = -2;
    tail.parent = nose;
    const jet = MeshBuilder.CreateCylinder('jet', {height: 0.5, diameterTop: 0.4, diameterBottom: 0, tessellation: 4});
    jet.position.y = -0.75;
    jet.parent = tail;
    const jetMat = new StandardMaterial('jetMat');
    jetMat.emissiveColor = this.currentColor;
    jetMat.alpha = 0.5;
    jet.material = jetMat;

    // particle system
    const psys = new ParticleSystem('psys', 2000, scene);
    // texture
    const url = 'https://playground.babylonjs.com/textures/';
    psys.particleTexture = new Texture(`${url}flare.png`);
    // particle sets
    psys.emitter = jet;
    psys.minEmitBox = new Vector3(-0.1, 0, 0);
    psys.maxEmitBox = new Vector3(0.1, 0, 0);

    psys.color1 = new Color4(0.8, 0.8, 1, 1);
    psys.color2 = new Color4(0.5, 0.5, 1, 1);
    psys.colorDead = new Color4(0, 0, 0.2, 0);

    psys.minSize = 0.1;
    psys.maxSize = 0.1;

    psys.minLifeTime = 0.2;
    psys.maxLifeTime = 1;

    psys.emitRate = 2000;

    psys.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    psys.gravity = new Vector3(0, 0, 0);
    psys.direction1 = new Vector3(0, -1, 0);

    psys.minAngularSpeed = 1;
    psys.maxAngularSpeed = Math.PI;

    psys.minEmitPower = 1;
    psys.maxEmitPower = 3;
    psys.updateSpeed = 0.005;

    psys.start();

    // camera animation
    const boostAnim = new Animation('boostAnim', 'position.z', 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    const boostKeys = [];
    boostKeys.push({
      frame: 0,
      value: camera.position.z
    });
    boostKeys.push({
      frame: 5,
      value: camera.position.z
    });
    boostKeys.push({
      frame: 90,
      value: camera.position.z - 1
    });
    boostKeys.push({
      frame: 120,
      value: camera.position.z
    });
    boostAnim.setKeys(boostKeys);
    camera.animations.push(boostAnim);

    // scene.beginAnimation(camera, 0, 120, true);

    // blasters and bullets
    const blasterMat = new StandardMaterial('blasterMat');
    blasterMat.diffuseColor = this.currentColor;
    const blasterLeft = MeshBuilder.CreateCylinder('blasterLeft', {height: 2, diameterTop: 0, diameterBottom: 0.75, tessellation: 4});
    blasterLeft.position = new Vector3(-0.75, -0.5, 0.25);
    blasterLeft.parent = nose;
    blasterLeft.material = blasterMat;

    const blasterRight = MeshBuilder.CreateCylinder('blasterRight', {height: 2, diameterTop: 0, diameterBottom: 0.75, tessellation: 4});
    blasterRight.position = new Vector3(0.75, -0.5, 0.25);
    blasterRight.parent = nose;
    blasterRight.material = blasterMat;

    const bulletMat = new StandardMaterial('bulletMat');
    bulletMat.emissiveColor = this.currentColor;
    const bulletLeft = MeshBuilder.CreateCylinder('bulletLeft', {height: 0.5, diameter: 0.1});
    const bulletRight = MeshBuilder.CreateCylinder('bulletRight', {height: 0.5, diameter: 0.1});
    bulletLeft.material = bulletMat;
    bulletRight.material = bulletMat;
    bulletLeft.parent = blasterLeft;
    bulletRight.parent = bulletLeft;
    bulletRight.position.x = 1.5;

    // bullets animation
    const bulletAnim = new Animation('bulletAnim', 'position.y', 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    const bulletKeys = [];
    bulletKeys.push({
      frame: 0,
      value: 0
    });
    bulletKeys.push({
      frame: 30,
      value: 30
    });
    bulletAnim.setKeys(bulletKeys);
    bulletLeft.animations.push(bulletAnim);

    // scene.beginAnimation(bulletLeft, 0, 30, true);

    // wings and shield
    const wingsLeft = MeshBuilder.CreateCylinder('wingsLeft', {height: 3, diameterTop: 1, diameterBottom: 0, tessellation: 4});
    wingsLeft.position.x = -1.75;
    wingsLeft.position.y = -3;
    wingsLeft.rotate(Axis.Z, -Math.PI / 4);
    wingsLeft.parent = nose;

    const wingsRight = MeshBuilder.CreateCylinder('wingsRight', {height: 3, diameterTop: 1, diameterBottom: 0, tessellation: 4});
    wingsRight.position.x = 1.75;
    wingsRight.position.y = -3;
    wingsRight.rotate(Axis.Z, Math.PI / 4);
    wingsRight.parent = nose;

    const shield = MeshBuilder.CreateSphere('shield', {diameterX: 7, diameterY: 8, diameterZ: 2});
    shield.position.y = -2;
    shield.parent = nose;
    const shieldMat = new StandardMaterial('shiledMat');
    shieldMat.emissiveColor = this.currentColor;
    shieldMat.alpha = 0;
    shield.material = shieldMat;

    // shield animation
    const shieldAnim = new Animation('shieldAnim', 'material.alpha', 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    const shieldKeys = [];
    shieldKeys.push({
      frame: 0,
      value: 0
    });
    shieldKeys.push({
      frame: 30,
      value: 0.1
    });
    shieldKeys.push({
      frame: 60,
      value: 0.1
    });
    shieldKeys.push({
      frame: 90,
      value: 0
    });
    shieldAnim.setKeys(shieldKeys);
    shield.animations.push(shieldAnim);

    // scene.beginAnimation(shield, 0, 90, true);
    
    // 姿态调整
    nose.setPivotPoint(new Vector3(2, -2.25, 0));
    nose.rotate(Axis.X, Math.PI / 2);

    return nose;
  }
  private _createSkybox(scene: Scene) {
    const skybox = MeshBuilder.CreateBox('skybox', {size: 1000});
    const skyMat = new StandardMaterial('skyMat');
    skyMat.backFaceCulling = false;
    const url = 'https://playground.babylonjs.com/textures/Space/space_';
    const files = [
      `${url}left.jpg`,
      `${url}up.jpg`,
      `${url}front.jpg`,
      `${url}right.jpg`,
      `${url}down.jpg`,
      `${url}back.jpg`
    ];
    skyMat.reflectionTexture = CubeTexture.CreateFromImages(files, scene);
    skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyMat.disableLighting = true;
    skybox.material = skyMat;

    return skybox;
  }
}