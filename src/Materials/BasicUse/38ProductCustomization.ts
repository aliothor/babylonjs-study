import { ArcRotateCamera, AssetsManager, Color3, Color4, CubeTexture, DirectionalLight, DynamicTexture, Engine, NodeMaterial, Scene, Vector3, Viewport } from "babylonjs";
import { AdvancedDynamicTexture, Button, Control } from "babylonjs-gui";
import 'babylonjs-loaders'

export default class ProductCustomization {
  engine: Engine;
  scene: Scene;

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Product Customization'
    this.engine = new Engine(this.canvas);

    this.iniScene()
  }
  async iniScene(): Promise<void> {
    this.scene = await this.CreateScene()

    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
  }

  async CreateScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    const server = "https://patrickryanms.github.io/BabylonJStextures/Demos/productCustomizer/";

    const screen = {};
    // determine the size of the viewport minus the gutter based on the current window width
    const  setViewportSize = () => {
        screen.width = this.engine.getRenderWidth();
        screen.height = this.engine.getRenderHeight();
        screen.ratio = screen.width / screen.height;
        camera.productWidth = 0.6;
        camera.product.viewport = new Viewport(1.0 - camera.productWidth, 0.0, 
        camera.productWidth, 1.0);
    }

    const updateViewportSize = () => {
        screen.width = this.engine.getRenderWidth();
        screen.height = this.engine.getRenderHeight();
        screen.ratio = screen.width / screen.height;
        // resize content buttons based on screen size
        for (let control of gui.contentButtons) {
            if (screen.ratio < 0.6) {
                let calculatedWidth = ((screen.width * gui.layoutGrid.getColumnDefinition(0)._value) / gui.contentButtonsGrid.columnCount) * 0.7;
                control.width = Math.floor(calculatedWidth).toString() + "px";
            }
            else {
                let calculatedHeight = ((screen.height * gui.layoutGrid.getRowDefinition(1)._value)/ gui.contentButtonsGrid.rowCount) * 0.7;
                control.height = Math.floor(calculatedHeight).toString() + "px";
            }
        }
        // resize layer buttons based on screen size
        if (gui.buttons !== undefined) {
            for (let control of gui.buttons) {
                if (screen.ratio < 0.6 && control.name.split("_")[2] !== "selectButton") {
                    if (control._children[0] !== undefined) {
                        control._children[0].height = "95%";
                    }
                    let calculatedWidth = ((screen.width * gui.layoutGrid.getColumnDefinition(0)._value) * gui.layerUiGrid[0].getColumnDefinition(1)._value);
                    control.width = Math.floor(calculatedWidth).toString() + "px";
                }
                else {
                    if (control._children[0] !== undefined) {
                        control._children[0].height = "60%";
                    }
                    let calculatedHeight = ((screen.height * gui.layoutGrid.getRowDefinition(0)._value) * gui.layersGrid.getRowDefinition(1)._value);
                    control.height = Math.floor(calculatedHeight).toString() + "px";
                }
            }
        }
        // resize layer grid width based on screen size for button position
        if (gui.layerUiGrid !== undefined) {
            for (let layer of gui.layerUiGrid) {
                if (screen.ratio < 0.6) {
                    layer.setColumnDefinition(1, 0.18, false);
                    layer.setColumnDefinition(2, 0.18, false);
                    layer.setColumnDefinition(3, 0.18, false);
                }
                else {
                    layer.setColumnDefinition(1, 60, true);
                    layer.setColumnDefinition(2, 60, true);
                    layer.setColumnDefinition(3, 60, true);
                }
            }
        }
        // resize viewport based on screen size
        if (gui.layoutGrid !== undefined) {
            if (screen.ratio < 0.9) {
                gui.layoutGrid.setColumnDefinition(0, 0.5, false);
                gui.layoutGrid.setColumnDefinition(1, 0.5, false);
                camera.productWidth = 0.5;
            }
            else if (screen.ratio > 0.9 && screen.ratio < 1.5) {
                gui.layoutGrid.setColumnDefinition(0, 0.4, false);
                gui.layoutGrid.setColumnDefinition(1, 0.6, false);
                camera.productWidth = 0.6;
            }
            else {
                gui.layoutGrid.setColumnDefinition(0, 0.25, false);
                gui.layoutGrid.setColumnDefinition(1, 0.75, false);
                camera.productWidth = 0.75;
            }
            camera.product.viewport.x = 1.0 - camera.productWidth;
            camera.product.viewport.width = camera.productWidth;
        }
    }

    // create camera and lights for scene
    const lights = {};
    const env = {};
    const camera = {};
    const mask = {
        gui : 0x01000000,
        product: 0x10000000,
    };
    const initScene = async () => {
        // color of scene when no skybox present
        scene.clearColor = Color3.FromInts(30, 30, 35);

        // standard ArcRotate camera
        camera.product = new ArcRotateCamera("productCamera", -2.183, Math.PI/2, 1.3, new Vector3(0.0, 0.0, 0.0), scene);
        camera.product.minZ = 0.1;
        camera.product.lowerRadiusLimit = 0.55;
        camera.product.upperRadiusLimit = 3.0;
        camera.product.wheelDeltaPercentage = 0.1;
        camera.product.panningAxis = new Vector3(0.0, 0.0, 0.0);
        camera.product.attachControl(this.canvas, true);
        camera.product.layerMask = mask.product;

        camera.gui = new ArcRotateCamera("guiCamera", 0.0, 0.0, 1.0, new Vector3(0.0, 0.0, 0.0), scene);
        camera.gui.layerMask = mask.gui;
        setViewportSize();
        this.engine.onResizeObservable.add(updateViewportSize);

        scene.activeCameras.push(camera.product);
        scene.activeCameras.push(camera.gui);

        // add in IBL with linked environment
        env.lighting = CubeTexture.CreateFromPrefilteredData(server + 
        "assets/env/studio.env", scene);
        env.lighting.name = "studioIBL";
        env.lighting.gammaSpace = false;
        env.lighting.rotationY = 3.14;
        scene.environmentTexture = env.lighting;
        scene.environmentIntensity = 1.0;

        // directional light needed for shadows
        lights.dirLight = new DirectionalLight("dirLight", new Vector3(0.45, -0.34, -0.83), scene);
        lights.dirLight.position = new Vector3(0, 3, 5);
        lights.dirLight.intensity = 1;
    }

    const assets = {
        manager : new AssetsManager(scene),
        graphics : []
    }
    const imprintWidth = 683;
    const imprintHeight = 2048;
    const imprint = {
        texture : new DynamicTexture("decalTex", {width: imprintWidth, height: imprintHeight}, scene),
        defaultBackground : new Color4(1.0, 0.0, 0.0, 1.0).toHexString(),
        graphics : []
    };
    imprint.context = imprint.texture.getContext();

    const maxLayers = 5;
    const layers = [];
    async function loadAssets() {
        // mesh tasks
        assets.skateboard = assets.manager.addMeshTask("load skateboard", "", server + "assets/gltf/skateboard_mesh.glb")

        // image tasks
        assets.graphics.push(assets.manager.addImageTask("load image_Babylon Logo", server + "assets/textures/babylonLogo.png"));
        assets.graphics.push(assets.manager.addImageTask("load image_Flame Skull", server + "assets/textures/flameSkull.png"));
        assets.graphics.push(assets.manager.addImageTask("load image_Blue Character", server + "assets/textures/cartoonHead_blue.png"));
        assets.graphics.push(assets.manager.addImageTask("load image_Orange Character", server + "assets/textures/cartoonHead_orange.png"));
        assets.graphics.push(assets.manager.addImageTask("load image_Purple Character", server + "assets/textures/cartoonHead_purple.png"));
        assets.graphics.push(assets.manager.addImageTask("load image_Pony", server + "assets/textures/pony.png"));
        assets.graphics.push(assets.manager.addImageTask("load image_Rays", server + "assets/textures/rays.png"));
        assets.graphics.push(assets.manager.addImageTask("load image_Waves", server + "assets/textures/waves.png"));
        assets.moveUpIcon = assets.manager.addImageTask("load move up icon", server + "assets/textures/upArrowCircle.svg");
        assets.moveDownIcon = assets.manager.addImageTask("load move up icon", server + "assets/textures/downArrowCircle.svg");
        assets.cancelIcon = assets.manager.addImageTask("load move up icon", server + "assets/textures/cancelCircle.svg");
        assets.addIcon = assets.manager.addImageTask("load move up icon", server + "assets/textures/addCircle.svg");
        assets.colors = [
            "Azure",
            "Black",
            "DarkGray",
            "DimGray",
            "Red",
            "FireBrick",
            "DeepPink",
            "OrangeRed",
            "Orange",
            "Gold",
            "Yellow",
            "RoyalBlue",
            "CornflowerBlue",
            "DeepSkyBlue",
            "DarkGreen",
            "ForestGreen",
            "GreenYellow",
            "RebeccaPurple",
            "DarkViolet",
            "MediumPurple",
        ]

        // text tasks
        assets.decalShaderText = assets.manager.addTextFileTask("load decal node material", server + "assets/shaders/decalShader.json");

        // call all loading tasks
        assets.manager.load();

        // task error handling
        assets.manager.onTaskErrorObservable.add((task) => {
            console.log("Error loading task: " + task.name);
            console.log(task.errorObject.message, task.errorObject.exception);
        });

        // wait for all tasks to complete
        assets.manager.onFinish = (tasks) => {
            console.log("All tasks complete!", tasks);

            // set graphic properties array
            for (let loaded of assets.graphics) {
                imprint.graphics.push({
                    image : loaded.image,
                    ratio : loaded.image.width / loaded.image.height,
                    size : loaded.image.width,
                    name : loaded.name.split("_")[1]
                });
            }

            // skateboard root
            assets.skateboardRoot = assets.skateboard.loadedMeshes[0];
            assets.skateboardRoot.name = "skateboardRoot";
            assets.skateboardMesh = assets.skateboard.loadedMeshes[1];
            for (let child of assets.skateboard.loadedMeshes) {
                child.layerMask = mask.product;
            }

            // parse loaded node material to json
            assets.decalShaderJson = JSON.parse(assets.decalShaderText.text);

            // set up layer data array
            for (let i = 0; i < maxLayers; i++) {
                layers.push({
                    name: undefined,
                    graphic : undefined,
                    rectangle: false,
                    ratio : 1.0,
                    horizontal : 0.0,
                    vertical : 0.0,
                    size : 512,
                    rotation : 0.0,
                    width: 1.0,
                    height : 1.0,
                    fillStyle : new Color4(0.0, 0.0, 0.0, 0.0).toHexString()
                });
            }

            // create materials for scene meshes
            createMaterials();
            createGUI();
            createContentButtons();
        }
    }

    // prevent updating dynamic texture when setting slider values while changing layers
    let activeUpdate = true;
    // update dynamic texture
    async function updateimprint() {
        // clear imprint
        imprint.context.clearRect(0, 0, imprintWidth, imprintHeight);
        // only update dynamic texture if the user is actively changing a GUI slider
        if (activeUpdate) {
            for (let thisLayer of layers) {
                if (thisLayer.graphic !== undefined) {
                    // save context
                    imprint.context.save();
    
                    // set rotation center accounting for manual offset
                    const graphicU = thisLayer.horizontal * imprintWidth * 0.5;
                    const graphicV = thisLayer.vertical * imprintHeight * -0.5;
                    imprint.context.translate(imprintWidth * 0.5 + graphicU, 
                    imprintHeight * 0.5 + graphicV);
    
                    // determine position of graphic on texture in pixels
                    const left = thisLayer.size * thisLayer.ratio * -0.5;
                    const top = thisLayer.size * -0.5;
    
                    // rotate layer and draw graphic
                    imprint.context.rotate(thisLayer.rotation);
                    imprint.context.drawImage(thisLayer.graphic, left, top, 
                    thisLayer.ratio * thisLayer.size, thisLayer.size);
    
                    // restore context pre-rotation
                    imprint.context.restore();
                }
                else if (thisLayer.rectangle) {
                    // save context
                    imprint.context.save();
    
                    // set bounds of rectangle
                    const left = (1 - thisLayer.width) * 0.5 * imprintWidth;
                    const top = (1- thisLayer.height) * 0.5 * imprintHeight;
                    const width = thisLayer.width * imprintWidth;
                    const height = thisLayer.height * imprintHeight;
    
                    const offsetU = thisLayer.horizontal * imprintWidth * 0.5;
                    const offsetV = thisLayer.vertical * imprintHeight * -0.5;
    
                    // translate center for rotation
                    const rectangleU = width * 0.5 + left;
                    const rectangleV = height * 0.5 + top;
                    imprint.context.translate(rectangleU + offsetU, rectangleV + offsetV);
    
                    // rotate context before drawing
                    imprint.context.rotate(thisLayer.rotation);
    
                    // draw rectangle
                    imprint.context.fillStyle = thisLayer.fillStyle;
                    imprint.context.fillRect(-width * 0.5, -height * 0.5, width, height);
    
                    // restore context
                    imprint.context.restore();
                }
                else {
                    continue;
                }
            }
            // update texture
            imprint.texture.update();
        }
    }

    // create materials for scene meshes
    // ignore textures embedded in shader when loading
    NodeMaterial.IgnoreTexturesAtLoadTime = true;
    const meshesMats = {};
    async function createMaterials() {
        meshesMats.skateboard = NodeMaterial.Parse(assets.decalShaderJson, scene);
        meshesMats.skateboard.name = "skateboardDecalMat";

        // create default dynamic texture
        updateimprint();

        // get texture blocks and assign PBR textures from loaded mesh and dynamic texture
        meshesMats.skateboard.getBlockByName("decalTex").texture = imprint.texture;
        meshesMats.skateboard.getBlockByName("baseColorTex").texture = 
        assets.skateboardMesh.material.albedoTexture;
        meshesMats.skateboard.getBlockByName("ormTex").texture = 
        assets.skateboardMesh.material.metallicTexture;
        meshesMats.skateboard.getBlockByName("normalTex").texture = 
        assets.skateboardMesh.material.bumpTexture;
        assets.skateboardMesh.material.dispose();
        assets.skateboardMesh.material = meshesMats.skateboard;
    }

    // create GUI AdvancedDynamicTexture
    const gui = {
        texture : await AdvancedDynamicTexture.ParseFromFileAsync(server + "assets/gui/imprintCustomizationGui.json"),
        contentButtons : []
    };
    // dynamically create content buttons 
    function createContentButtons() {
        let lastButton = 0;
        // create color buttons from colors array
        for (let i = 0; i < assets.colors.length; i++) {
            const button = new Button(assets.colors[i]);
            button.fixedRatio = 1.0;
            button.thickness = 2;
            button.background = assets.colors[i];
            button.onPointerClickObservable.add(function() {
                layers[currentLayer].name = button.name;
                layers[currentLayer].fillStyle = button.name;
                layers[currentLayer].rectangle = true;
                layers[currentLayer].graphic = undefined;
                layers[currentLayer].width = 1.0;
                loadLayerContentUI(currentLayer);
                updateLayerNames();
                updateGUI(layers[currentLayer]);
                showLayerControls();
                updateimprint();
            });
            gui.contentButtonsGrid.addControl(button, Math.floor(i / 4), i % 4);
            gui.contentButtons.push(button);
            lastButton = i + 1;
        }
        // create graphic buttons from graphics array
        for (let i = lastButton; i < assets.graphics.length + lastButton; i++) {
            const button = Button.CreateImageOnlyButton(assets.graphics[i - lastButton].name.split("_")[1], assets.graphics[i - lastButton].url);
            button.image.width = 0.8;
            button.image.height = 0.8;
            button.image.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            button.image.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            button.fixedRatio = 1.0;
            button.thickness = 2;
            button.background = "black";
            button.onPointerClickObservable.add(function() {
                layers[currentLayer].name = button.name;
                layers[currentLayer].fillStyle = undefined;
                layers[currentLayer].rectangle = false;
                for (let graphic of assets.graphics) {
                    if (graphic.name.split("_")[1] === button.name) {
                        layers[currentLayer].graphic = graphic.image;
                    }
                }
                loadLayerContentUI(currentLayer);
                updateLayerNames();
                updateGUI(layers[currentLayer]);
                showLayerControls();
                updateimprint();
            });
            gui.contentButtonsGrid.addControl(button, Math.floor(i / 4), i % 4);
            gui.contentButtons.push(button);
        }
        updateViewportSize();
    }
    
    // change visibility of GUI grids to show content buttons
    let currentLayer = undefined;
    function chooseContent() {
        updateActiveLayer();
        gui.slidersGrid.isVisible = false;
        gui.contentButtonsGrid.isVisible = true;
    }

    // change visibility of GUI grids to show layer parameter sliders
    function showLayerControls() {
        updateActiveLayer();
        gui.slidersGrid.isVisible = true;
        gui.contentButtonsGrid.isVisible = false;
    }
    
    // update GUI layer background color to highlight active layer
    function updateActiveLayer() {
        updateGUI(layers[currentLayer]);
        for (let rect of gui.layerBG) {
            if (parseInt(rect.name.split("_")[1], 10) === currentLayer) {
                rect.background = gui.highlightLayerColor;
            }
            else {
                rect.background = gui.layerColor;
            }
        }
    }

    // update layers array to move layer parameters up or down one index position
    function moveLayer(index, direction) {
        const temp = layers[index];
        if (direction === "up") {
            layers[index] = layers[index - 1];
            layers[index - 1] = temp;
        }
        else if (direction === "down") {
            layers[index] = layers[index + 1];
            layers[index + 1] = temp;
        }
        updateGUI(layers[currentLayer]);
        updateimprint();
        updateLayerNames();
        gui.slidersGrid.isVisible = false;
        gui.contentButtonsGrid.isVisible = false;
    }

    // update GUI layer names to match layers array
    function updateLayerNames() {
        for (let i=0; i < layers.length; i++) {
            for (let target of gui.layerUiGrid) {
                if (parseInt(target.name.split("_")[1]) === i) {
                    for (let control of target.getDescendants(false)) {
                        if (control.name.split("_")[2] === "contentName") {
                            if (layers[i].name !== undefined)
                            {
                                loadLayerContentUI(i);
                                control.text = layers[i].name;
                            }  
                            else {
                                unloadLayerContentUI(i);
                            }                  
                        }
                    }
                }
            }
        }
    }

    // update layer to hide insert button and show layer action buttons when content selected for layer
    function loadLayerContentUI(index) {
        for (let button of gui.buttons) {
            if (button.name.split("_")[2] === 
            "insertButton" && button.name.split("_")[1] === index.toString()) {
                button.isVisible = false;
            }
        }
        for (let grid of gui.layerUiGrid) {
            if (grid.name.split("_")[1] === index.toString()) {
                grid.isVisible = true;
            }
        }
    }

    // update layer to hide layer action buttons and show insert button when content deleted from layer
    function unloadLayerContentUI(index) {
        for (let button of gui.buttons) {
            if (button.name.split("_")[2] === "insertButton" && button.name.split("_")[1] === index.toString()) {
                button.isVisible = true;
            }
        }
        for (let grid of gui.layerUiGrid) {
            if (grid.name.split("_")[1] === index.toString()) {
                grid.isVisible = false;
            }
        }
    }

    // revert layer parameters in layers array to default values when content deleted from layer
    function removeLayerGraphic(index) {
        layers[index].name = undefined;
        layers[index].graphic = undefined;
        layers[index].rectangle = false;
        layers[index].ratio = 1.0;
        layers[index].horizontal = 0.0;
        layers[index].vertical = 0.0;
        layers[index].size = 512;
        layers[index].rotation = 0.0;
        layers[index].width = 1.0;
        layers[index].height = 1.0;
        layers[index].fillStyle = new Color4(0.0, 0.0, 0.0, 0.0).toHexString();
        currentLayer = undefined;
        updateActiveLayer();
        gui.slidersGrid.isVisible = false;
        gui.contentButtonsGrid.isVisible = false;
        updateimprint();
    }

    // define GUI style parameters and actions for interactivity
    gui.texture.layer.layerMask = mask.gui;
    gui.layerColor = "#381A1AFF";
    gui.highlightLayerColor = "#e42d2dFF";
    gui.layerUiGrid = [];
    async function createGUI() {
        // get grid controls and set pointer blocker to false
        for (let grid of gui.texture.getControlsByType("Grid")) {
            grid.isPointerBlocker = false;
            if (grid.name === "layout") {
                gui.layoutGrid = grid;
            }
            if (grid.name === "layers") {
                gui.layersGrid = grid;
            }
            if (grid.name === "sliders") {
                gui.slidersGrid = grid;
                gui.slidersGrid.isVisible = false;
            }
            if (grid.name === "contentButtons") {
                gui.contentButtonsGrid = grid;
                gui.contentButtonsGrid.isVisible = false;
            }
            if (grid.name.split("_")[2] === "uiGrid") {
                gui.layerUiGrid.push(grid);
            }
        }
        
        // get rectangle controls and set pointer blocker to false
        for (let rect of gui.texture.getControlsByType("Rectangle")) {
            rect.isPointerBlocker = false;
        }

        // get slider title and slider controls and set alignment on text for all avalable parameters
        gui.slider_horizontal_title = gui.texture.getControlByName("slider_horizontal_title");
        gui.slider_horizontal_title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        gui.slider_horizontal = gui.texture.getControlByName("slider_horizontal");
        gui.slider_horizontal.onValueChangedObservable.add(function(value) {
            layers[currentLayer].horizontal = value;
            if (activeUpdate) {
                updateimprint();
            }
        });

        gui.slider_vertical_title = gui.texture.getControlByName("slider_vertical_title");
        gui.slider_vertical_title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        gui.slider_vertical = gui.texture.getControlByName("slider_vertical");
        gui.slider_vertical.onValueChangedObservable.add(function(value) {
            layers[currentLayer].vertical = value;
            if (activeUpdate) {
                updateimprint();
            }
        });

        gui.slider_size_title = gui.texture.getControlByName("slider_size_title");
        gui.slider_size_title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        gui.slider_size = gui.texture.getControlByName("slider_size");
        gui.slider_size.onValueChangedObservable.add(function(value) {
            layers[currentLayer].size = value;
            if (activeUpdate) {
                updateimprint();
            }
        });

        gui.slider_width_title = gui.texture.getControlByName("slider_width_title");
        gui.slider_width_title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        gui.slider_width = gui.texture.getControlByName("slider_width");
        gui.slider_width.onValueChangedObservable.add(function(value) {
            layers[currentLayer].width = value;
            if (activeUpdate) {
                updateimprint();
            }
        });

        gui.slider_height_title = gui.texture.getControlByName("slider_height_title");
        gui.slider_height_title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        gui.slider_height = gui.texture.getControlByName("slider_height");
        gui.slider_height.onValueChangedObservable.add(function(value) {
            if (layers[currentLayer].rectangle) {
                layers[currentLayer].height = value;
                if (activeUpdate) {
                    updateimprint();
                }
            }
            else {
                layers[currentLayer].rotation = value;
                if (activeUpdate) {
                    updateimprint();
                }
            }
        });

        gui.slider_rotation_title = gui.texture.getControlByName("slider_rotation_title");
        gui.slider_rotation_title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        gui.slider_rotation = gui.texture.getControlByName("slider_rotation");
        gui.slider_rotation.onValueChangedObservable.add(function(value) {
            layers[currentLayer].rotation = value;
            if (activeUpdate) {
                updateimprint();
            }
        });

        // get layers backgrounds
        gui.layerBG = [];
        for (let rect of gui.texture.getControlsByType("Rectangle")) {
            if (rect.name.split("_")[2] === "bg") {
                gui.layerBG.push(rect);
            }
        }

        // assign icons and actions to buttons
        gui.buttons = gui.texture.getControlsByType("Button");
        for (let button of gui.buttons) {
            button.width = "100%";
            button.fixedRatio = 1.0;
            if (button._children[0] !== undefined) {
                button._children[0].height = "100%";
                button._children[0].fixedRatio = 1.0;
            }
            if (button.name.split("_")[2] === "upButton") {
                button._children[0].source = assets.moveUpIcon.url;
                button.isVisible = true;
                button.onPointerClickObservable.add(function() {
                    moveLayer(parseInt(button.name.split("_")[1]), "up");
                    currentLayer = undefined;
                    updateActiveLayer();
                });
            }
            if (button.name.split("_")[2] === "downButton") {
                button._children[0].source = assets.moveDownIcon.url;
                button.isVisible = true;
                button.onPointerClickObservable.add(function() {
                    moveLayer(parseInt(button.name.split("_")[1]), "down");
                    currentLayer = undefined;
                    updateActiveLayer();
                });
            }
            if (button.name.split("_")[2] === "insertButton") {
                button._children[0].source = assets.addIcon.url;
                button.onPointerClickObservable.add(function() {
                    currentLayer = parseInt(button.name.split("_")[1]);
                    chooseContent();
                });
            }
            if (button.name.split("_")[2] === "deleteButton") {
                button._children[0].source = assets.cancelIcon.url;
                button.isVisible = true;
                button.onPointerClickObservable.add(function() {
                    unloadLayerContentUI(parseInt(button.name.split("_")[1]));
                    removeLayerGraphic(parseInt(button.name.split("_")[1]))
                });
            }
            if (button.name.split("_")[2] === "selectButton") {
                button.fixedRatio = 0.0;
                button.onPointerClickObservable.add(function() {
                    currentLayer = parseInt(button.name.split("_")[1]);
                    updateActiveLayer();
                });
                button.isVisible = true;
            }
        }

        // get layer textblocks and assign them to the layer array in the correct order
        gui.layerContentNames = [];
        for (let textBlock of gui.texture.getControlsByType("TextBlock")) {
            if (textBlock.name.split("_")[2] === "contentName") {
                gui.layerContentNames.push(textBlock);
                textBlock.isVisible = true;
            }
        }
    }

    // update sliders panel with the correct controls for the layer
    function updateGUI(layer) {
        if (layer !== undefined) {
        }
        if (currentLayer !== undefined) {
            // disable update for dynamic texture when setting sliders due to layer change
            activeUpdate = false;
            gui.slidersGrid.isVisible = true;

            // update sliders for rectangle content parameters
            if (layer.rectangle && layer.graphic === undefined) {
                gui.slider_horizontal.minimum = -1;
                gui.slider_horizontal.maximum = 1;
                gui.slider_horizontal.value = layer.horizontal;
                
                gui.slider_vertical.minimum = -1;
                gui.slider_vertical.maximum = 1;
                gui.slider_vertical.value = layer.vertical;
    
                gui.slider_size_title.isVisible = false;
                gui.slider_size.isVisible = false;

                gui.slider_width_title.isVisible = true;
                gui.slider_width.isVisible = true;
                gui.slider_width.minimum = 0;
                gui.slider_width.maximum = 2;
                gui.slider_width.value = layer.width;
    
                gui.slider_height_title.isVisible = true;
                gui.slider_height.isVisible = true;
                gui.slider_height.minimum = 0;
                gui.slider_height.maximum = 2;
                gui.slider_height.value = layer.height;
    
                gui.slidersGrid.removeControl(gui.slider_rotation_title)
                gui.slidersGrid.addControl(gui.slider_rotation_title, 5, 0)
                gui.slidersGrid.removeControl(gui.slider_rotation)
                gui.slidersGrid.addControl(gui.slider_rotation, 5, 1)
                gui.slider_rotation_title.isVisible = true;
                gui.slider_rotation.isVisible = true;
                gui.slider_rotation.minimum = -Math.PI;
                gui.slider_rotation.maximum = Math.PI;
                gui.slider_rotation.value = layer.rotation;
            }
            // update sliders for image content parameters
            else {
                gui.slider_horizontal.minimum = -2;
                gui.slider_horizontal.maximum = 2;
                gui.slider_horizontal.value = layer.horizontal;
    
                gui.slider_vertical.minimum = -2;
                gui.slider_vertical.maximum = 2;
                gui.slider_vertical.value = layer.vertical;
    
                gui.slider_size_title.isVisible = true;
                gui.slider_size.isVisible = true;
                gui.slider_size.minimum = 0;
                gui.slider_size.maximum = 2048;
                gui.slider_size.value = layer.size;

                gui.slider_width_title.isVisible = false;
                gui.slider_width.isVisible = false;
                gui.slider_height_title.isVisible = false;
                gui.slider_height.isVisible = false;

                gui.slidersGrid.removeControl(gui.slider_rotation_title)
                gui.slidersGrid.addControl(gui.slider_rotation_title, 4, 0)
                gui.slidersGrid.removeControl(gui.slider_rotation)
                gui.slidersGrid.addControl(gui.slider_rotation, 4, 1)
                gui.slider_rotation.minimum = -Math.PI;
                gui.slider_rotation.maximum = Math.PI;
                gui.slider_rotation.value = layer.rotation;
            }
            activeUpdate = true;
            }        
    }

    // scene logic
    initScene();
    await loadAssets();


    return scene;
  }
}
