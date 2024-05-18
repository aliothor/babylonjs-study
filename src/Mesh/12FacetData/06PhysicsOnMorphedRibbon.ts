import { ArcRotateCamera, Color4, Engine, HemisphericLight, KeyboardEventTypes, Matrix, MeshBuilder, PointLight, Scene, SolidParticleSystem, StandardMaterial, Vector3 } from "babylonjs";

export default class PhysicsOnMorphedRibbon {
  engine: Engine;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Physics On a Morphed Ribbon'
    this.engine = new Engine(this.canvas);
  }

  async InitScene() {
    const scene = await this.CreateScene()

    this.engine.runRenderLoop(() => {
      scene.render();
    })
    window.addEventListener('resize', () => {
      this.engine.resize();
    })
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 150, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.2
    const pl = new PointLight('pl', camera.position)
    pl.intensity = 0.7

    scene.clearColor = new Color4(0.35, 0.35, 0.42, 1)

    const paths: Vector3[][] = []
    for (let i = 0; i < 50; i++) {
      const path: Vector3[] = []
      for (let j = 0; j < 50; j++) {
        const x = i - 25
        const y = 10 * Math.sin(x / 25 * Math.PI + Math.PI / 2)
        const z = j - 25
        path.push(new Vector3(x, y, z))
      }
      paths.push(path)
    }
    const mesh = MeshBuilder.CreateRibbon('mesh', {pathArray: paths, updatable: true})
    mesh.material = new StandardMaterial('meshMat')
    mesh.material.wireframe = true

    // balls
    const ballRadius = 1
    const ballNb = 500
    const ballOrigin = new Vector3(-20, 60, 0)
    const ball = MeshBuilder.CreateSphere('ball', {diameter: ballRadius * 2, segments: 3})
    const sps = new SolidParticleSystem('sps', scene, {particleIntersection: true, boundingSphereOnly: true})
    sps.addShape(ball, ballNb)
    ball.dispose()
    sps.buildMesh()
    sps.isAlwaysVisible = true
    sps.computeParticleRotation = false
    sps.computeParticleTexture = false

    sps.vars.speed = 0.05
    sps.vars.origin = ballOrigin

    sps.recycleParticle = function(p) {
      p.position.copyFrom(this.vars.origin)
      p.velocity.x = (Math.random() - 0.5) * this.vars.speed * 3 + this.vars.speed * 3
      p.velocity.z = (Math.random() - 0.5) * this.vars.speed * 6
      p.velocity.y = 0

      return p
    }

    sps.initParticles = function() {
      for (let p = 0; p < this.nbParticles; p++) {
        this.recycleParticle(this.particles[p])
        this.particles[p].color = new Color4(0.4 + Math.random() * 0.6, 0.4 + Math.random() * 0.6, 0.4 + Math.random() * 0.6, 1)
        this.particles[p].rotation = new Vector3(Math.random() * 3.2, Math.random() * 3.2, Math.random() * 3.2)
      }
    }

    // sps init
    sps.initParticles()
    sps.setParticles()
    sps.computeParticleColor = false

    const sceneLimit = ballOrigin.y + 2
    const gravity = new Vector3(0, -0.01, 0)

    let worldMat = Matrix.Identity()
    let invMat = Matrix.Identity()
    let previousWorldMat = Matrix.Identity()

    mesh.position = Vector3.Zero()
    mesh.computeWorldMatrix(true)
    worldMat = mesh.getWorldMatrix()
    worldMat.invertToRef(invMat)
    mesh.partitioningSubdivisions = 4
    mesh.partitioningBBoxRatio = 1.05
    mesh.updateFacetData()

    const radiusSquared = ballRadius * ballRadius
    const restitution = 0.60
    let tmpDotVel = 0
    let previousPosition = Vector3.Zero()
    let meshPointVelocity = Vector3.Zero()
    let projected = Vector3.Zero()
    let facetPosition = Vector3.Zero()
    let facetNorm = Vector3.Zero()
    let normPos = Vector3.Zero()
    let tmpVect = Vector3.Zero()

    // update
    sps.updateParticle = function(p) {
      // check scene limits
      if (Math.abs(p.position.x) > sceneLimit || Math.abs(p.position.y) > sceneLimit || Math.abs(p.position.z) > sceneLimit) {
        sps.recycleParticle(p)
        return p
      }

      // aplly force and move the ball
      p.velocity.addInPlace(gravity)
      p.position.addInPlace(p.velocity)
      previousPosition.copyFrom(p.position)

      // if the particle interscets the mesh bounding ball
      if (p.intersectsMesh(mesh)) {
        const closet = mesh.getClosestFacetAtCoordinates(p.position.x, p.position.y, p.position.z, projected)
        if (closet != null) {
          // get the impact facet normal and position
          mesh.getFacetNormalToRef(closet, facetNorm)
          mesh.getFacetPositionToRef(closet, facetPosition)
          p.position.subtractToRef(projected, tmpVect)
          // p.position.subtractToRef(facetPosition, tmpVect)
          
          if (tmpVect.lengthSquared() < radiusSquared) {
            // bounce result computation
            tmpDotVel = Vector3.Dot(p.velocity, facetNorm)
            p.velocity.x = (p.velocity.x - 2 * tmpDotVel * facetNorm.x) * restitution
            p.velocity.y = (p.velocity.y - 2 * tmpDotVel * facetNorm.y) * restitution
            p.velocity.z = (p.velocity.z - 2 * tmpDotVel * facetNorm.z) * restitution
            // p.velocity = (p.velocity.subtract(facetNorm.scale(2 * tmpDotVel))).scale(restitution)

            facetNorm.scaleToRef(ballRadius * 1.01, normPos)
            projected.addToRef(normPos, p.position)

            // where was the same point at the previous frame
            Vector3.TransformCoordinatesFromFloatsToRef(p.position.x, p.position.y, p.position.z, invMat, previousPosition)
            Vector3.TransformCoordinatesFromFloatsToRef(previousPosition.x, previousPosition.y, previousPosition.z, previousWorldMat, previousPosition)
          }
        }

        p.position.subtractToRef(previousPosition, meshPointVelocity)
        meshPointVelocity.scaleInPlace(restitution)
        p.velocity.addInPlace(meshPointVelocity)
      }

      return p
    }

    sps.beforeUpdateParticles = function() {
      worldMat.invertToRef(invMat)
    }

    sps.afterUpdateParticles = function() {
      previousWorldMat.copyFrom(worldMat)
    }

    let paly = true
    scene.onKeyboardObservable.add(e => {
      if (e.type == KeyboardEventTypes.KEYDOWN && e.event.key == ' ') {
        paly = !paly
      }
    })

    function updateRibbon(t: number) {
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        for (let j = 0; j < path.length; j++) {
          path[j].y = path[j].x * Math.sin((j + i) / 5) * Math.cos(t) / 3
        }
      }
    }

    let t = 0
    scene.registerBeforeRender(() => {
      if (!paly) return
      sps.setParticles()
      mesh.rotation.x = 0.6 * Math.sin(t / 2)
      mesh.rotation.y += 0.01
      updateRibbon(t)
      MeshBuilder.CreateRibbon('', {pathArray: paths, instance: mesh})
      t += 0.01
    })

    return scene;
  }
}