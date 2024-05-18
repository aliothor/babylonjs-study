import { AddBlock, AnimatedInputBlockTypes, ArcRotateCamera, ClampBlock, Color3, CubeTexture, Engine, FragmentOutputBlock, GlowLayer, HemisphericLight, InputBlock, LerpBlock, MeshBuilder, MultiplyBlock, NegateBlock, NodeMaterial, NodeMaterialSystemValues, OneMinusBlock, PBRMetallicRoughnessBlock, PerturbNormalBlock, ReflectionBlock, ScaleBlock, Scene, SceneLoader, StepBlock, Texture, TextureBlock, TransformBlock, TrigonometryBlock, TrigonometryBlockOperations, Vector3, VertexOutputBlock } from "babylonjs"
import 'babylonjs-loaders'
import { tex1, tex2, tex3, tex4, tex5, tex6 } from "./raws/tex"

export default class AdvancedDissolveNodeMaterial {
  engine: Engine
  scene: Scene

  constructor(private readonly canvas: HTMLCanvasElement) {
    document.querySelector<HTMLHtmlElement>('h1')!.innerHTML = 'Advanced Dissolve Node Material'
    this.engine = new Engine(this.canvas)
    this.scene = this.CreateScene()

    this.engine.runRenderLoop(() => {
      this.scene.render()
    })
  }
  CreateScene(): Scene {
    const scene = new Scene(this.engine)

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 8, new Vector3(0, 0, 0))
    camera.attachControl(this.canvas, true)

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene)

    const nodeMat = new NodeMaterial('nodeMat')

    // input block
    const position = new InputBlock('position')
    position.visibleInInspector = false
    position.visibleOnFrame = false
    position.target = 1
    position.setAsAttribute('position')

    // input block
    const world = new InputBlock('world')
    world.visibleInInspector = false
    world.visibleOnFrame = false
    world.target = 1
    world.setAsSystemValue(NodeMaterialSystemValues.World)

    // transform block
    const worldPos = new TransformBlock('worldPos')
    worldPos.visibleInInspector = false
    worldPos.visibleOnFrame = false
    worldPos.target = 1
    worldPos.complementZ = 0
    worldPos.complementW = 1

    //
    const worldNormal = new TransformBlock('world normal')
    worldNormal.visibleInInspector = false
    worldNormal.visibleOnFrame = false
    worldNormal.target = 1
    worldNormal.complementZ = 0
    worldNormal.complementW = 0

    // attribute
    const normal = new InputBlock('normal')
    normal.visibleInInspector = false
    normal.visibleOnFrame = false
    normal.target = 1
    normal.setAsAttribute('normal')

    // PBRMetallicRoughnessBlock
    const PBRMetallicRoughness = new PBRMetallicRoughnessBlock("PBRMetallicRoughness")
    PBRMetallicRoughness.visibleInInspector = false
    PBRMetallicRoughness.visibleOnFrame = false
    PBRMetallicRoughness.target = 3
    PBRMetallicRoughness.lightFalloff = 0
    PBRMetallicRoughness.useAlphaTest = false
    PBRMetallicRoughness.alphaTestCutoff = 0.5
    PBRMetallicRoughness.useAlphaBlending = false
    PBRMetallicRoughness.useRadianceOverAlpha = true
    PBRMetallicRoughness.useSpecularOverAlpha = true
    PBRMetallicRoughness.enableSpecularAntiAliasing = false
    PBRMetallicRoughness.realTimeFiltering = false
    PBRMetallicRoughness.realTimeFilteringQuality = 8
    PBRMetallicRoughness.useEnergyConservation = true
    PBRMetallicRoughness.useRadianceOcclusion = true
    PBRMetallicRoughness.useHorizonOcclusion = true
    PBRMetallicRoughness.unlit = false
    PBRMetallicRoughness.forceNormalForward = false
    PBRMetallicRoughness.debugMode = 0
    PBRMetallicRoughness.debugLimit = 0
    PBRMetallicRoughness.debugFactor = 1

    // system
    const view = new InputBlock('view')
    view.visibleInInspector = false
    view.visibleOnFrame = false
    view.target = 1
    view.setAsSystemValue(NodeMaterialSystemValues.View)

    // InputBlock
    const cameraPosition = new InputBlock("cameraPosition")
    cameraPosition.visibleInInspector = false
    cameraPosition.visibleOnFrame = false
    cameraPosition.target = 1
    cameraPosition.setAsSystemValue(NodeMaterialSystemValues.CameraPosition)

    // PerturbNormalBlock
    const Perturbnormal = new PerturbNormalBlock("Perturb normal")
    Perturbnormal.visibleInInspector = false
    Perturbnormal.visibleOnFrame = false
    Perturbnormal.target = 2
    Perturbnormal.invertX = false
    Perturbnormal.invertY = false
    Perturbnormal.useParallaxOcclusion = false

    // world tangent
    const worldTangent = new TransformBlock('world tangent')
    worldTangent.visibleInInspector = false
    worldTangent.visibleOnFrame = false
    worldTangent.target = 1
    worldTangent.complementZ = 0
    worldTangent.complementW = 0

    // InputBlock
    const tangent = new InputBlock("tangent")
    tangent.visibleInInspector = false
    tangent.visibleOnFrame = false
    tangent.target = 1
    tangent.setAsAttribute("tangent")

    // Attribute
    const uv = new InputBlock("uv")
    uv.visibleInInspector = false
    uv.visibleOnFrame = false
    uv.target = 1
    uv.setAsAttribute("uv")

    // ScaleBlock
    const Scale = new ScaleBlock("Scale")
    Scale.visibleInInspector = false
    Scale.visibleOnFrame = false
    Scale.target = 4

    // InputBlock
    const TextureScale = new InputBlock("Texture Scale")
    TextureScale.visibleInInspector = false
    TextureScale.visibleOnFrame = false
    TextureScale.target = 1
    TextureScale.value = 1
    TextureScale.min = 0
    TextureScale.max = 0
    TextureScale.isBoolean = false
    TextureScale.matrixMode = 0
    TextureScale.animationType = AnimatedInputBlockTypes.None
    TextureScale.isConstant = false

    // TextureBlock
    const BumpMap = new TextureBlock("BumpMap")
    BumpMap.visibleInInspector = false
    BumpMap.visibleOnFrame = false
    BumpMap.target = 3
    BumpMap.convertToGammaSpace = false
    BumpMap.convertToLinearSpace = false
    BumpMap.disableLevelMultiplication = false
    BumpMap.texture = new Texture(tex1, null, false, false, 3)
    BumpMap.texture.wrapU = 1
    BumpMap.texture.wrapV = 1
    BumpMap.texture.uAng = 0
    BumpMap.texture.vAng = 0
    BumpMap.texture.wAng = 0
    BumpMap.texture.uOffset = 0
    BumpMap.texture.vOffset = 0
    BumpMap.texture.uScale = 1
    BumpMap.texture.vScale = 1
    BumpMap.texture.coordinatesMode = 7

    // TextureBlock
    const MainTex = new TextureBlock("MainTex")
    MainTex.visibleInInspector = false
    MainTex.visibleOnFrame = false
    MainTex.target = 3
    MainTex.convertToGammaSpace = false
    MainTex.convertToLinearSpace = true
    MainTex.disableLevelMultiplication = false
    MainTex.texture = new Texture(tex2, null, false, false, 3)
    MainTex.texture.wrapU = 1
    MainTex.texture.wrapV = 1
    MainTex.texture.uAng = 0
    MainTex.texture.vAng = 0
    MainTex.texture.wAng = 0
    MainTex.texture.uOffset = 0
    MainTex.texture.vOffset = 0
    MainTex.texture.uScale = 1
    MainTex.texture.vScale = 1
    MainTex.texture.coordinatesMode = 7

    // MultiplyBlock
    const Multiply = new MultiplyBlock("Multiply")
    Multiply.visibleInInspector = false
    Multiply.visibleOnFrame = false
    Multiply.target = 4

    // InputBlock
    const Color = new InputBlock("Color3")
    Color.visibleInInspector = false
    Color.visibleOnFrame = false
    Color.target = 1
    Color.value = new Color3(1, 1, 1).toLinearSpace()
    Color.isConstant = false

    // TextureBlock
    const DissolveTex = new TextureBlock("DissolveTex")
    DissolveTex.visibleInInspector = false
    DissolveTex.visibleOnFrame = false
    DissolveTex.target = 3
    DissolveTex.convertToGammaSpace = true
    DissolveTex.convertToLinearSpace = false
    DissolveTex.disableLevelMultiplication = false
    DissolveTex.texture = new Texture(tex3, null, false, false, 3)
    DissolveTex.texture.wrapU = 1
    DissolveTex.texture.wrapV = 1
    DissolveTex.texture.uAng = 0
    DissolveTex.texture.vAng = 0
    DissolveTex.texture.wAng = 0
    DissolveTex.texture.uOffset = 0
    DissolveTex.texture.vOffset = 0
    DissolveTex.texture.uScale = 1
    DissolveTex.texture.vScale = 1
    DissolveTex.texture.coordinatesMode = 7

    // StepBlock
    const Step = new StepBlock("Step")
    Step.visibleInInspector = false
    Step.visibleOnFrame = false
    Step.target = 4

    // TrigonometryBlock
    const Abs = new TrigonometryBlock("Abs")
    Abs.visibleInInspector = false
    Abs.visibleOnFrame = false
    Abs.target = 4
    Abs.operation = TrigonometryBlockOperations.Abs

    // TrigonometryBlock
    const Sin = new TrigonometryBlock("Sin")
    Sin.visibleInInspector = false
    Sin.visibleOnFrame = false
    Sin.target = 4
    Sin.operation = TrigonometryBlockOperations.Sin

    // InputBlock
    const Time = new InputBlock("Time")
    Time.visibleInInspector = false
    Time.visibleOnFrame = false
    Time.target = 1
    Time.value = 0
    Time.min = 0
    Time.max = 0
    Time.isBoolean = false
    Time.matrixMode = 0
    Time.animationType = AnimatedInputBlockTypes.Time
    Time.isConstant = false

    // AddBlock
    const Add = new AddBlock("Add")
    Add.visibleInInspector = false
    Add.visibleOnFrame = false
    Add.target = 4

    // InputBlock
    const EmissionController = new InputBlock("EmissionController")
    EmissionController.visibleInInspector = false
    EmissionController.visibleOnFrame = false
    EmissionController.target = 1
    EmissionController.value = 0.02
    EmissionController.min = 0
    EmissionController.max = 0
    EmissionController.isBoolean = false
    EmissionController.matrixMode = 0
    EmissionController.animationType = AnimatedInputBlockTypes.None
    EmissionController.isConstant = false

    // StepBlock
    const Step1 = new StepBlock("Step")
    Step1.visibleInInspector = false
    Step1.visibleOnFrame = false
    Step1.target = 4

    // OneMinusBlock
    const Oneminus = new OneMinusBlock("One minus")
    Oneminus.visibleInInspector = false
    Oneminus.visibleOnFrame = false
    Oneminus.target = 4

    // MultiplyBlock
    const Multiply1 = new MultiplyBlock("Multiply")
    Multiply1.visibleInInspector = false
    Multiply1.visibleOnFrame = false
    Multiply1.target = 4

    // LerpBlock
    const Lerp = new LerpBlock("Lerp")
    Lerp.visibleInInspector = false
    Lerp.visibleOnFrame = false
    Lerp.target = 4

    // MultiplyBlock
    const Multiply2 = new MultiplyBlock("Multiply")
    Multiply2.visibleInInspector = false
    Multiply2.visibleOnFrame = false
    Multiply2.target = 4

    // ScaleBlock
    const Scale1 = new ScaleBlock("Scale")
    Scale1.visibleInInspector = false
    Scale1.visibleOnFrame = false
    Scale1.target = 4

    // MultiplyBlock
    const Multiply3 = new MultiplyBlock("Multiply")
    Multiply3.visibleInInspector = false
    Multiply3.visibleOnFrame = false
    Multiply3.target = 4

    // TextureBlock
    const EmissionMap = new TextureBlock("EmissionMap")
    EmissionMap.visibleInInspector = false
    EmissionMap.visibleOnFrame = false
    EmissionMap.target = 3
    EmissionMap.convertToGammaSpace = true
    EmissionMap.convertToLinearSpace = false
    EmissionMap.disableLevelMultiplication = false
    EmissionMap.texture = new Texture(tex4, null, false, false, 3)
    EmissionMap.texture.wrapU = 1
    EmissionMap.texture.wrapV = 1
    EmissionMap.texture.uAng = 0
    EmissionMap.texture.vAng = 0
    EmissionMap.texture.wAng = 0
    EmissionMap.texture.uOffset = 0
    EmissionMap.texture.vOffset = 0
    EmissionMap.texture.uScale = 1
    EmissionMap.texture.vScale = 1
    EmissionMap.texture.coordinatesMode = 7

    // InputBlock
    const EmissionColor = new InputBlock("EmissionColor")
    EmissionColor.visibleInInspector = false
    EmissionColor.visibleOnFrame = false
    EmissionColor.target = 1
    EmissionColor.value = new Color3(1, 1, 1).toGammaSpace()
    EmissionColor.isConstant = false

    // InputBlock
    const EmissionStrength = new InputBlock("EmissionStrength")
    EmissionStrength.visibleInInspector = false
    EmissionStrength.visibleOnFrame = false
    EmissionStrength.target = 1
    EmissionStrength.value = 1
    EmissionStrength.min = 0
    EmissionStrength.max = 1
    EmissionStrength.isBoolean = false
    EmissionStrength.matrixMode = 0
    EmissionStrength.animationType = AnimatedInputBlockTypes.None
    EmissionStrength.isConstant = false

    // InputBlock
    const DissolveEdgeColor = new InputBlock("DissolveEdgeColor")
    DissolveEdgeColor.visibleInInspector = false
    DissolveEdgeColor.visibleOnFrame = false
    DissolveEdgeColor.target = 1
    DissolveEdgeColor.value = new Color3(0, 0.7803921568627451, 1)
    DissolveEdgeColor.isConstant = false

    // FragmentOutputBlock
    const FragmentOutput = new FragmentOutputBlock("FragmentOutput")
    FragmentOutput.visibleInInspector = false
    FragmentOutput.visibleOnFrame = false
    FragmentOutput.target = 2
    FragmentOutput.convertToGammaSpace = false
    FragmentOutput.convertToLinearSpace = false
    FragmentOutput.useLogarithmicDepth = false

    // LerpBlock
    const Lerp1 = new LerpBlock("Lerp")
    Lerp1.visibleInInspector = false
    Lerp1.visibleOnFrame = false
    Lerp1.target = 4

    // InputBlock
    const glowMask = new InputBlock("glowMask")
    glowMask.visibleInInspector = true
    glowMask.visibleOnFrame = false
    glowMask.target = 1
    glowMask.value = 0
    glowMask.min = 0
    glowMask.max = 1
    glowMask.isBoolean = true
    glowMask.matrixMode = 0
    glowMask.animationType = AnimatedInputBlockTypes.None
    glowMask.isConstant = false

    // TextureBlock
    const MetallicGlossMap = new TextureBlock("MetallicGlossMap")
    MetallicGlossMap.visibleInInspector = false
    MetallicGlossMap.visibleOnFrame = false
    MetallicGlossMap.target = 3
    MetallicGlossMap.convertToGammaSpace = false
    MetallicGlossMap.convertToLinearSpace = false
    MetallicGlossMap.disableLevelMultiplication = false
    MetallicGlossMap.texture = new Texture(tex5, null, false, false, 3)
    MetallicGlossMap.texture.wrapU = 1
    MetallicGlossMap.texture.wrapV = 1
    MetallicGlossMap.texture.uAng = 0
    MetallicGlossMap.texture.vAng = 0
    MetallicGlossMap.texture.wAng = 0
    MetallicGlossMap.texture.uOffset = 0
    MetallicGlossMap.texture.vOffset = 0
    MetallicGlossMap.texture.uScale = 1
    MetallicGlossMap.texture.vScale = 1
    MetallicGlossMap.texture.coordinatesMode = 7

    // AddBlock
    const Add1 = new AddBlock("Add")
    Add1.visibleInInspector = false
    Add1.visibleOnFrame = false
    Add1.target = 4

    // MultiplyBlock
    const Multiply4 = new MultiplyBlock("Multiply")
    Multiply4.visibleInInspector = false
    Multiply4.visibleOnFrame = false
    Multiply4.target = 4

    // AddBlock
    const Add2 = new AddBlock("Add")
    Add2.visibleInInspector = false
    Add2.visibleOnFrame = false
    Add2.target = 4

    // NegateBlock
    const Negate = new NegateBlock("Negate")
    Negate.visibleInInspector = false
    Negate.visibleOnFrame = false
    Negate.target = 4

    // StepBlock
    const Step2 = new StepBlock("Step")
    Step2.visibleInInspector = false
    Step2.visibleOnFrame = false
    Step2.target = 4

    // InputBlock
    const Glossiness = new InputBlock("Glossiness")
    Glossiness.visibleInInspector = false
    Glossiness.visibleOnFrame = false
    Glossiness.target = 1
    Glossiness.value = 1
    Glossiness.min = 0
    Glossiness.max = 2
    Glossiness.isBoolean = false
    Glossiness.matrixMode = 0
    Glossiness.animationType = AnimatedInputBlockTypes.None
    Glossiness.isConstant = false

    // OneMinusBlock
    const Oneminus1 = new OneMinusBlock("One minus")
    Oneminus1.visibleInInspector = false
    Oneminus1.visibleOnFrame = false
    Oneminus1.target = 4

    // TrigonometryBlock
    const Abs1 = new TrigonometryBlock("Abs")
    Abs1.visibleInInspector = false
    Abs1.visibleOnFrame = false
    Abs1.target = 4
    Abs1.operation = TrigonometryBlockOperations.Abs

    // InputBlock
    const Constant = new InputBlock("Constant 1")
    Constant.visibleInInspector = false
    Constant.visibleOnFrame = false
    Constant.target = 1
    Constant.value = 1
    Constant.min = 0
    Constant.max = 0
    Constant.isBoolean = false
    Constant.matrixMode = 0
    Constant.animationType = AnimatedInputBlockTypes.None
    Constant.isConstant = true

    // StepBlock
    const Step3 = new StepBlock("Step")
    Step3.visibleInInspector = false
    Step3.visibleOnFrame = false
    Step3.target = 4

    // InputBlock
    const Metallic = new InputBlock("Metallic")
    Metallic.visibleInInspector = false
    Metallic.visibleOnFrame = false
    Metallic.target = 1
    Metallic.value = 1
    Metallic.min = 0
    Metallic.max = 2
    Metallic.isBoolean = false
    Metallic.matrixMode = 0
    Metallic.animationType = AnimatedInputBlockTypes.None
    Metallic.isConstant = false

    // OneMinusBlock
    const Oneminus2 = new OneMinusBlock("One minus")
    Oneminus2.visibleInInspector = false
    Oneminus2.visibleOnFrame = false
    Oneminus2.target = 4

    // TrigonometryBlock
    const Abs2 = new TrigonometryBlock("Abs")
    Abs2.visibleInInspector = false
    Abs2.visibleOnFrame = false
    Abs2.target = 4
    Abs2.operation = TrigonometryBlockOperations.Abs

    // MultiplyBlock
    const Multiply5 = new MultiplyBlock("Multiply")
    Multiply5.visibleInInspector = false
    Multiply5.visibleOnFrame = false
    Multiply5.target = 4

    // AddBlock
    const Add3 = new AddBlock("Add")
    Add3.visibleInInspector = false
    Add3.visibleOnFrame = false
    Add3.target = 4

    // NegateBlock
    const Negate1 = new NegateBlock("Negate")
    Negate1.visibleInInspector = false
    Negate1.visibleOnFrame = false
    Negate1.target = 4

    // AddBlock
    const Add4 = new AddBlock("Add")
    Add4.visibleInInspector = false
    Add4.visibleOnFrame = false
    Add4.target = 4

    // ClampBlock
    const MetallicClamp = new ClampBlock("Metallic Clamp")
    MetallicClamp.visibleInInspector = false
    MetallicClamp.visibleOnFrame = false
    MetallicClamp.target = 4
    MetallicClamp.minimum = 0
    MetallicClamp.maximum = 1

    // ClampBlock
    const RoughnessClamp = new ClampBlock("Roughness Clamp")
    RoughnessClamp.visibleInInspector = false
    RoughnessClamp.visibleOnFrame = false
    RoughnessClamp.target = 4
    RoughnessClamp.minimum = 0
    RoughnessClamp.maximum = 1

    // AddBlock
    const Add5 = new AddBlock("Add")
    Add5.visibleInInspector = false
    Add5.visibleOnFrame = false
    Add5.target = 4

    // OneMinusBlock
    const Oneminus3 = new OneMinusBlock("One minus")
    Oneminus3.visibleInInspector = false
    Oneminus3.visibleOnFrame = false
    Oneminus3.target = 4

    // InputBlock
    const OcclusionStrength = new InputBlock("OcclusionStrength")
    OcclusionStrength.visibleInInspector = false
    OcclusionStrength.visibleOnFrame = false
    OcclusionStrength.target = 1
    OcclusionStrength.value = 1
    OcclusionStrength.min = 0
    OcclusionStrength.max = 2
    OcclusionStrength.isBoolean = false
    OcclusionStrength.matrixMode = 0
    OcclusionStrength.animationType = AnimatedInputBlockTypes.None
    OcclusionStrength.isConstant = false

    // ClampBlock
    const Clamp = new ClampBlock("Clamp")
    Clamp.visibleInInspector = false
    Clamp.visibleOnFrame = false
    Clamp.target = 4
    Clamp.minimum = 0
    Clamp.maximum = 1

    // InputBlock
    const BumpScale = new InputBlock("BumpScale")
    BumpScale.visibleInInspector = false
    BumpScale.visibleOnFrame = false
    BumpScale.target = 1
    BumpScale.value = 1
    BumpScale.min = 0
    BumpScale.max = 0
    BumpScale.isBoolean = false
    BumpScale.matrixMode = 0
    BumpScale.animationType = AnimatedInputBlockTypes.None
    BumpScale.isConstant = false

    // ReflectionBlock
    const reflectionBlock = new ReflectionBlock("ReflectionBlock")
    reflectionBlock.visibleInInspector = false
    reflectionBlock.visibleOnFrame = false
    reflectionBlock.target = 3
    reflectionBlock.texture = new CubeTexture(tex6, scene, undefined, false, null, undefined, undefined, undefined, false, ".dds")
    reflectionBlock.texture.coordinatesMode = 3
    reflectionBlock.texture.gammaSpace = false
    reflectionBlock.useSphericalHarmonics = true
    reflectionBlock.forceIrradianceInFragment = false

    // InputBlock
    const Color1 = new InputBlock("Color3")
    Color1.visibleInInspector = false
    Color1.visibleOnFrame = false
    Color1.target = 1
    Color1.value = new Color3(0.5411764705882353, 0.5411764705882353, 0.5411764705882353).toLinearSpace()
    Color1.isConstant = false

    // TransformBlock
    const WorldPosViewProjectionTransform = new TransformBlock("WorldPos * ViewProjectionTransform")
    WorldPosViewProjectionTransform.visibleInInspector = false
    WorldPosViewProjectionTransform.visibleOnFrame = false
    WorldPosViewProjectionTransform.target = 1
    WorldPosViewProjectionTransform.complementZ = 0
    WorldPosViewProjectionTransform.complementW = 1

    // InputBlock
    const ViewProjection = new InputBlock("ViewProjection")
    ViewProjection.visibleInInspector = false
    ViewProjection.visibleOnFrame = false
    ViewProjection.target = 1
    ViewProjection.setAsSystemValue(NodeMaterialSystemValues.ViewProjection)

    // VertexOutputBlock
    const VertexOutput = new VertexOutputBlock("VertexOutput")
    VertexOutput.visibleInInspector = false
    VertexOutput.visibleOnFrame = false
    VertexOutput.target = 1


    // connections
    position.output.connectTo(worldPos.vector)
    world.output.connectTo(worldPos.transform)
    worldPos.output.connectTo(WorldPosViewProjectionTransform.vector)
    ViewProjection.output.connectTo(WorldPosViewProjectionTransform.transform)
    WorldPosViewProjectionTransform.output.connectTo(VertexOutput.vector)
    worldPos.output.connectTo(PBRMetallicRoughness.worldPosition)
    normal.output.connectTo(worldNormal.vector)
    world.output.connectTo(worldNormal.transform)
    worldNormal.output.connectTo(PBRMetallicRoughness.worldNormal)
    view.output.connectTo(PBRMetallicRoughness.view)
    cameraPosition.output.connectTo(PBRMetallicRoughness.cameraPosition)
    worldPos.output.connectTo(Perturbnormal.worldPosition)
    worldNormal.output.connectTo(Perturbnormal.worldNormal)
    tangent.output.connectTo(worldTangent.vector)
    world.output.connectTo(worldTangent.transform)
    worldTangent.output.connectTo(Perturbnormal.worldTangent)
    uv.output.connectTo(Perturbnormal.uv)
    uv.output.connectTo(Scale.input)
    TextureScale.output.connectTo(Scale.factor)
    Scale.output.connectTo(BumpMap.uv)
    BumpMap.rgb.connectTo(Perturbnormal.normalMapColor)
    BumpScale.output.connectTo(Perturbnormal.strength)
    Perturbnormal.output.connectTo(PBRMetallicRoughness.perturbedNormal)
    Color.output.connectTo(Multiply.left)
    Scale.output.connectTo(MainTex.uv)
    MainTex.rgb.connectTo(Multiply.right)
    Multiply.output.connectTo(PBRMetallicRoughness.baseColor)
    Scale.output.connectTo(MetallicGlossMap.uv)
    MetallicGlossMap.g.connectTo(Negate1.value)
    Negate1.output.connectTo(Add3.left)
    Metallic.output.connectTo(Step3.value)
    Constant.output.connectTo(Step3.edge)
    Step3.output.connectTo(Add3.right)
    Add3.output.connectTo(Multiply5.left)
    Metallic.output.connectTo(Oneminus2.input)
    Oneminus2.output.connectTo(Abs2.input)
    Abs2.output.connectTo(Multiply5.right)
    Multiply5.output.connectTo(Add4.left)
    MetallicGlossMap.g.connectTo(Add4.right)
    Add4.output.connectTo(MetallicClamp.value)
    MetallicClamp.output.connectTo(PBRMetallicRoughness.metallic)
    MetallicGlossMap.r.connectTo(Negate.value)
    Negate.output.connectTo(Add2.left)
    Glossiness.output.connectTo(Step2.value)
    Constant.output.connectTo(Step2.edge)
    Step2.output.connectTo(Add2.right)
    Add2.output.connectTo(Multiply4.left)
    Glossiness.output.connectTo(Oneminus1.input)
    Oneminus1.output.connectTo(Abs1.input)
    Abs1.output.connectTo(Multiply4.right)
    Multiply4.output.connectTo(Add1.left)
    MetallicGlossMap.r.connectTo(Add1.right)
    Add1.output.connectTo(RoughnessClamp.value)
    RoughnessClamp.output.connectTo(PBRMetallicRoughness.roughness)
    MetallicGlossMap.b.connectTo(Add5.left)
    OcclusionStrength.output.connectTo(Oneminus3.input)
    Oneminus3.output.connectTo(Add5.right)
    Add5.output.connectTo(Clamp.value)
    Clamp.output.connectTo(PBRMetallicRoughness.ambientOcc)
    position.output.connectTo(reflectionBlock.position)
    world.output.connectTo(reflectionBlock.world)
    Color1.output.connectTo(reflectionBlock.color)
    reflectionBlock.reflection.connectTo(PBRMetallicRoughness.reflection)
    PBRMetallicRoughness.lighting.connectTo(Multiply2.left)
    uv.output.connectTo(EmissionMap.uv)
    EmissionMap.rgb.connectTo(Multiply3.left)
    EmissionColor.output.connectTo(Multiply3.right)
    Multiply3.output.connectTo(Scale1.input)
    EmissionStrength.output.connectTo(Scale1.factor)
    Scale1.output.connectTo(Multiply2.right)
    Multiply2.output.connectTo(Lerp.left)
    DissolveEdgeColor.output.connectTo(Lerp.right)
    Scale.output.connectTo(DissolveTex.uv)
    DissolveTex.r.connectTo(Step.value)
    Time.output.connectTo(Sin.input)
    Sin.output.connectTo(Abs.input)
    Abs.output.connectTo(Step.edge)
    Step.output.connectTo(Multiply1.left)
    DissolveTex.r.connectTo(Step1.value)
    Abs.output.connectTo(Add.left)
    EmissionController.output.connectTo(Add.right)
    Add.output.connectTo(Step1.edge)
    Step1.output.connectTo(Oneminus.input)
    Oneminus.output.connectTo(Multiply1.right)
    Multiply1.output.connectTo(Lerp.gradient)
    Lerp.output.connectTo(FragmentOutput.rgb)
    Oneminus.output.connectTo(Lerp1.left)
    Multiply1.output.connectTo(Lerp1.right)
    glowMask.output.connectTo(Lerp1.gradient)
    Lerp1.output.connectTo(FragmentOutput.a)

    // output nodes
    nodeMat.addOutputNode(VertexOutput)
    nodeMat.addOutputNode(FragmentOutput)
    nodeMat.build()

    // 
    const gl = new GlowLayer('glow')
    gl.intensity = 1
    gl.neutralColor.a = 0
    const glMask = nodeMat.getInputBlockByPredicate((b) => b.name === 'glowMask')

    // https://raw.githubusercontent.com/MilaJig/Duck/main/
    const duckyImportResult = SceneLoader.ImportMesh('', '/Meshes/', 'Ducky_2.glb', scene, function(duckyMeshes) {
      for (let i = 0; i < duckyMeshes.length; i++) {
        duckyMeshes[i].material = nodeMat
        duckyMeshes[i].mustDepthSortFacets = true
        duckyMeshes[i].setIndices(duckyMeshes[i].getIndices()!, null)
      }

      const ground = MeshBuilder.CreateGround('ground', {width: 6, height: 6})
      gl.addExcludedMesh(ground)

      scene.registerBeforeRender(function() {
        for (let i = 0; i < duckyMeshes.length; i++) {
          gl.referenceMeshToUseItsOwnMaterial(duckyMeshes[i])
          gl.onBeforeRenderMeshToEffect.add(() => {
            glMask!.value = 1
          })
          gl.onAfterRenderMeshToEffect.add(() => {
            glMask!.value = 0
          })

          duckyMeshes[i].material = nodeMat
          // duckyMeshes[i].updateFacetData()
        }

      })

    })

    return scene
  }
}