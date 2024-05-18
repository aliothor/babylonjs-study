import { ArcRotateCamera, Color3, Engine, HemisphericLight, Mesh, MeshBuilder, PointLight, Scene, SceneLoader, StandardMaterial, Texture, Vector3, VertexBuffer, VertexData, VolumetricLightScatteringPostProcess } from "babylonjs";
import { FireProceduralTexture } from "babylonjs-procedural-textures";

export default class VLSSphericalHarmonics {
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
    scene.clearColor = Color3.Black()

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, 1, 20, new Vector3(0, 0, 0));
    camera.attachControl(this.canvas, true);
		camera.wheelPrecision = 50

    const light = new PointLight('light', new Vector3(0, 0, 0), scene);
		light.diffuse = new Color3(1, 1, 1)
		light.intensity = .25

    var paths = [];

    // here's the 'm' numbers used to create the SH shape
    // var m = [7,3,8,0,9,2,7,2];
    let m = [
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
    ];
    console.log("m-numbers: " + m);
    // -----------------------------------------------
    // go make the shape!
    this.harmonic(m, 64, 64, paths);
    console.log("🚀 ~ file: VLSSphericalHarmonics.ts:46 ~ VLSSphericalHarmonics ~ CreateScene ~ paths:", paths)

    const mesh = new Mesh('mesh')
    mesh.scaling = new Vector3(1.5, 1.5, 1.5)

    const fireMat = new StandardMaterial('fireMat')
		const fireTexture = new FireProceduralTexture('fire', 256)
		fireTexture.level = 1
		fireTexture.uScale = .7
		fireTexture.vScale = .7
		// fireTexture.setFragment('myFire')
		fireMat.diffuseColor = new Color3(Math.random() / 2, Math.random() / 2, Math.random() / 2)
		fireMat.diffuseTexture = fireTexture
		fireMat.alpha = 1
		fireMat.specularTexture = fireTexture
		fireMat.emissiveTexture = fireTexture
		fireMat.specularPower = 4
		fireMat.backFaceCulling = false

		fireTexture.fireColors = [
			new Color3(Math.random(), Math.random(), Math.random()),
			new Color3(Math.random(), Math.random(), Math.random()),
			new Color3(Math.random(), Math.random(), Math.random()),
			new Color3(Math.random(), Math.random(), Math.random()),
			new Color3(Math.random(), Math.random(), Math.random()),
			new Color3(Math.random(), Math.random(), Math.random())
		]

		mesh.material = fireMat

		this.createRibbon(mesh, paths, false, null, scene)

		// create god rays
		const godrays = new VolumetricLightScatteringPostProcess('godrays', 1, camera, mesh, 50, Texture.BILINEAR_SAMPLINGMODE, this.engine, false)
		godrays.exposure = 0.2;
		godrays.decay = 0.96815;
		godrays.weight = 0.58767;
		godrays.density = 0.926;

		light.position = godrays.mesh.position

    return scene;
  }

  private createRibbon(mesh: Mesh, pathArray: Vector3[][], doubleSided: boolean, closeArray: boolean, closePath: boolean, offset: number, scene: Scene) {
    let positions = [];
		let indices = [];
		let indicesRecto = [];
		let indicesVerso = [];
		let normals = [];
		let normalsRecto = [];
		let normalsVerso = [];
		let uvs = [];
		let us = [];		
		let vs = [];		
		let uTotalDistance = []; 
		let vTotalDistance = []; 
		let minlg;		  
		let lg = [];		
		let idx = [];

    closeArray = closeArray || false;
		closePath = closePath || false;
		doubleSided = doubleSided || false;
		let defaultOffset = Math.floor(pathArray[0].length / 2);
		offset = offset || defaultOffset;
		offset = offset > defaultOffset ? defaultOffset : Math.floor(offset);

    // single path in pathArray
		if ( pathArray.length < 2) {
			let ar1 = [];
			let ar2 = [];
			for (let i = 0; i < pathArray[0].length - offset; i++) {
			ar1.push(pathArray[0][i]);
			ar2.push(pathArray[0][i+offset]);
			}
			pathArray = [ar1, ar2];
		}

    // positions and horizontal distances
		let idc = 0;
		minlg = pathArray[0].length;
		for(let p = 0; p < pathArray.length; p++) {
			uTotalDistance[p] = 0;
			us[p] = [0];
			let path = pathArray[p];
			let l = path.length;
			minlg = (minlg < l) ? minlg : l;
			lg[p] = l;
			idx[p] = idc;
			let j = 0;
			while (j < l) {
			positions.push(path[j].x, path[j].y, path[j].z);
			if (j > 0) {
				let vectlg = path[j].subtract(path[j-1]).length();
				let dist = vectlg + uTotalDistance[p];
				us[p].push(dist);
				uTotalDistance[p] = dist;
			}
			j++;
			}
			if ( closePath ) {
			let vectlg = path[0].subtract(path[j-1]).length();
			let dist = vectlg + uTotalDistance[p];
			uTotalDistance[p] = dist;
			}
			idc += l;
		}

    // vertical distances
		for(let i = 0; i < minlg; i++) {
			vTotalDistance[i] = 0;
			vs[i] =[0];
			for (let p = 0; p < pathArray.length-1; p++) {
				let path1 = pathArray[p];
				let path2 = pathArray[p+1];
				let vectlg = path2[i].subtract(path1[i]).length();
				let dist: number =  vectlg + vTotalDistance[i];
				vs[i].push(dist);
				vTotalDistance[i] = dist;
			}
			if (closeArray) {
				let path1 = pathArray[p];
				let path2 = pathArray[0];
				let vectlg = path2[i].subtract(path1[i]).length();
				let dist: number =  vectlg + vTotalDistance[i];
				vTotalDistance[i] = dist;
			}
		}

    // uvs
		for(let p = 0; p < pathArray.length; p++) {
			for(let i = 0; i < minlg; i++) {
			let u = us[p][i] / uTotalDistance[p];
			let v = vs[i][p] / vTotalDistance[i];
			uvs.push(u, v);
			}
		}

		// indices
		let p = 0;					// path index
		let i = 0;					// positions array index
		let l1 = lg[p] - 1;		   // path1 length
		let l2 = lg[p+1] - 1;		 // path2 length
		let min = ( l1 < l2 ) ? l1 : l2 ;   
		let shft = idx[1] - idx[0];						  // shift
		let path1nb = closeArray ? lg.length : lg.length -1;	 
		while ( i <= min && p < path1nb ) {					  

			// draw two triangles between path1 (p1) and path2 (p2) : (p1.i, p2.i, p1.i+1) and (p2.i+1, p1.i+1, p2.i) clockwise
			let t1 = i;
			let t2 = i + shft;
			let t3 = i +1;
			let t4 = i + shft + 1;

			indices.push(i, i+shft, i+1);
			indices.push(i+shft+1, i+1, i+shft);
			i += 1;
			if ( i == min  ) {						  
			if (closePath) {						  // if closePath, add last triangles between start and end of the paths
				indices.push(i, i+shft, idx[p]);
				indices.push(idx[p]+shft, idx[p], i+shft);
				t3 = idx[p];
				t4 = idx[p] + shft;
			}
			p++;
			if ( p == lg.length - 1 ) {							
				shft = idx[0] - idx[p];
				l1 = lg[p] - 1;
				l2 = lg[0] - 1;
			}
			else {
				shft = idx[p+1] - idx[p];
				l1 = lg[p] - 1;
				l2 = lg[p+1] - 1;
			}

			i = idx[p];
			min = ( l1 < l2 ) ? l1 + i : l2 + i;
			}
		}

		//faces(false, indices);
		VertexData.ComputeNormals(positions, indices, normals);

		mesh.setVerticesData(VertexBuffer.PositionKind, positions, false);
		mesh.setVerticesData(VertexBuffer.NormalKind, normals, false);
		mesh.setIndices(indices);
		mesh.setVerticesData(VertexBuffer.UVKind, uvs, false);

  }

  private harmonic(m: number[], lat: number, long: number, paths: Vector3[][]) {
    var pi = Math.PI;
		var pi2 = Math.PI * 2;
		var steplat = pi / lat;
		var steplon = pi2 / long;

		for (var theta = 0; theta <= pi2; theta += steplon) {
			var path = [];

			for (var phi = 0; phi <= pi; phi += steplat ) {
				var r = 0;
				r += Math.pow( Math.sin(m[0]*phi), m[1] );
				r += Math.pow( Math.cos(m[2]*phi), m[3] );
				r += Math.pow( Math.sin(m[4]*theta), m[5] );
				r += Math.pow( Math.cos(m[6]*theta), m[7] );

				var p = new Vector3( r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta) );
				path.push(p);
			}
			paths.push(path);
		}
		paths.push(paths[0]);
  }
}