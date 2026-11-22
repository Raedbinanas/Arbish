import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { soundEngine } from './audio';
import {
  BuildingRefs,
  CustomerRig,
  InteractiveTarget,
  KitchenAndDiningRefs,
  buildArbishEnvironment,
  buildCustomerRig,
  buildFoodMesh,
  buildKitchenAndDining,
  buildPlatedTrayMesh,
} from './models';
import {
  ARBISH_MENU,
  DrinkSlotSnapshot,
  FryerSlotSnapshot,
  GameHudSnapshot,
  GrillSlotSnapshot,
  HAND_ITEM_LABELS,
  HandItemType,
  IngredientId,
  MenuItemId,
  OrderTicket,
  StationId,
} from './types';

// Pre-allocated math & color helpers outside loop (Zero GC)
const _vec3 = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const _mouseNdc = new THREE.Vector2();
const _cZenithA = new THREE.Color();
const _cZenithB = new THREE.Color();
const _cHorizonA = new THREE.Color();
const _cHorizonB = new THREE.Color();
const _cGroundA = new THREE.Color();
const _cGroundB = new THREE.Color();
const _cFogA = new THREE.Color();
const _cFogB = new THREE.Color();
const _cKeyA = new THREE.Color();
const _cKeyB = new THREE.Color();
const _cHemiA = new THREE.Color();
const _cHemiB = new THREE.Color();

interface GrillSlotState {
  state: 'empty' | 'raw' | 'seared' | 'ready' | 'burnt';
  timer: number;
  warned: boolean;
  mesh: THREE.Group | null;
}

interface BunToasterState {
  state: 'empty' | 'toasting' | 'ready';
  timer: number;
  mesh: THREE.Group | null;
}

interface FryerSlotState {
  kind: 'fries' | 'chicken' | 'sides';
  state: 'idle' | 'frying' | 'ready' | 'burnt';
  timer: number;
  warned: boolean;
}

interface DrinkState {
  state: 'empty' | 'filling' | 'ready';
  flavor: 'Cola' | 'Citrus' | 'Berry';
  timer: number;
}

interface CustomerActor {
  id: string;
  name: string;
  rig: CustomerRig;
  phase: 'entering' | 'queuing' | 'waiting-food' | 'walking-booth' | 'eating' | 'leaving';
  targetPos: THREE.Vector3;
  orderItem: MenuItemId;
  ticketId: number;
  patience: number;
  maxPatience: number;
  eatTimer: number;
  walkPhase: number;
  boothSeatPos: THREE.Vector3 | null;
}

interface OnlineOrder {
  id: number;
  customerName: string;
  platform: 'HungerStation' | 'Jahez' | 'Arbish App';
  neighborhood: string;
  driverName: string;
  payout: number;
  status: 'pending' | 'accepted';
  orderItem: MenuItemId;
  patience: number;
  maxPatience: number;
}

interface SteamParticle {
  mesh: THREE.Mesh;
  active: boolean;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  vz: number;
}

interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

const CUSTOMER_NAMES = [
  'Faisal',
  'Tariq',
  'Noura',
  'Omar',
  'Reem',
  'Khalid',
  'Sana',
  'Maya',
  'Yusuf',
  'Laila',
];

const ONLINE_PLATFORMS: Array<'HungerStation' | 'Jahez' | 'Arbish App'> = [
  'HungerStation',
  'Jahez',
  'Arbish App',
];

const MAKKAH_NEIGHBORHOODS = [
  'Al-Shawqiyya',
  'Al-Jamiah',
  'Al-Kakiyah',
  'Ar-Rawabi',
  'Al-Misfala',
  'Al-Awali',
];

const ONLINE_DRIVERS = ['Salman', 'Ahmed', 'Bader', 'Tariq', 'Faisal'];

const TUTORIAL_STEPS: Array<{ title: string; hint: string }> = [
  {
    title: 'Accept Walk-In Guest',
    hint: 'Click "Accept" on the guest card (top-right) or click the guest at the Front Counter.',
  },
  {
    title: 'Grab a Raw Smash Patty',
    hint: 'Open the Left Cold Fridge (or Storage Room) and click the glowing Blue Patty Crate.',
  },
  {
    title: 'Sear on the Flat-Top Grill',
    hint: 'Press 2 (Grill) and click an empty grill plate to sear your patty until green, then pick it up.',
  },
  {
    title: 'Toast a Brioche Bun',
    hint: 'Grab a Brioche Bun from the Fridge, toast it on the grill-side Toaster Plate, then pick it up.',
  },
  {
    title: 'Plate the Arbish Classic',
    hint: 'Press 4 (Prep): add Toasted Bun + Seared Patty + Cheese + Lettuce + Top Bun, then click Plate!',
  },
  {
    title: 'Serve Guest & Online Dispatch',
    hint: 'Press 1 (Counter) to serve Pickup Pass, then Accept & dispatch the incoming Makkah app order!',
  },
];

const SHIRT_COLORS = [0x2563eb, 0xdc2626, 0x059669, 0xd97706, 0x7c3aed, 0x0d9488, 0xe11d48];
const PANTS_COLORS = [0x1e293b, 0x334155, 0x27272a, 0x3f3f46];
const SKIN_COLORS = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac];
const HAIR_COLORS = [0x18181b, 0x451a03, 0x78350f, 0x92400e, 0x27272a];

const STATION_PRESETS: Record<StationId, { pos: [number, number, number]; yaw: number; pitch: number }> = {
  counter: { pos: [0.0, 1.66, -1.05], yaw: Math.PI, pitch: -0.14 },
  grill: { pos: [-2.2, 1.66, -3.15], yaw: 0, pitch: -0.26 },
  fryer: { pos: [1.05, 1.66, -3.15], yaw: 0, pitch: -0.24 },
  prep: { pos: [0.0, 1.66, -0.95], yaw: 0, pitch: -0.38 },
  drinks: { pos: [3.65, 1.66, -3.15], yaw: 0, pitch: -0.2 },
  storefront: { pos: [0.0, 3.3, 13.8], yaw: 0, pitch: 0.04 },
  loft: { pos: [3.4, 5.91, -1.6], yaw: Math.PI * 0.72, pitch: -0.12 },
  storage: { pos: [4.1, 1.66, -6.95], yaw: Math.PI * 0.36, pitch: -0.16 },
};

const COLLISION_BOXES: AABB[] = [
  // Front Counter
  { minX: -3.75, maxX: 3.75, minZ: -0.62, maxZ: 0.62 },
  // Center Prep Island
  { minX: -1.55, maxX: 1.85, minZ: -2.95, maxZ: -1.55 },
  // Back Equipment Row (stops at X = 4.42 to keep Storage Doorway open)
  { minX: -5.6, maxX: 4.42, minZ: -5.4, maxZ: -3.95 },
  // Kitchen / Storage dividing wall (open doorway X = 4.42..5.95)
  { minX: -6.05, maxX: 4.42, minZ: -5.85, maxZ: -5.45 },
  // Exterior left behind kitchen (blocks walking outside into void left of Storage)
  { minX: -6.05, maxX: 0.92, minZ: -9.2, maxZ: -5.45 },
  // Storage Back Shelving
  { minX: 0.9, maxX: 5.9, minZ: -9.2, maxZ: -8.15 },
  // Storage Right Shelving
  { minX: 5.15, maxX: 6.05, minZ: -8.35, maxZ: -6.35 },
  // Storage Floor Pallet
  { minX: 1.55, maxX: 2.55, minZ: -6.95, maxZ: -6.15 },
  // Left Fridge
  { minX: -5.6, maxX: -4.25, minZ: -3.75, maxZ: -1.6 },
  // Trash bin
  { minX: 1.95, maxX: 2.75, minZ: -2.65, maxZ: -1.85 },
  // Left Booth
  { minX: -5.1, maxX: -3.3, minZ: 1.5, maxZ: 3.6 },
  // Right Booth (shifted inward to clear right staircase)
  { minX: 2.15, maxX: 3.55, minZ: 1.5, maxZ: 3.6 },
  // Right Staircase side stringer guard (blocks walking sideways under stairs from dining room)
  { minX: 4.15, maxX: 4.45, minZ: -0.5, maxZ: 3.05 },
];

const FLOOR2_COLLISION_BOXES: AABB[] = [
  // Center Atrium opening & railing
  { minX: -1.82, maxX: 1.62, minZ: 0.68, maxZ: 4.48 },
  // Right Stairwell opening side railing
  { minX: 4.08, maxX: 4.32, minZ: -0.35, maxZ: 4.48 },
  // Retro Arcade Cabinets (back-left)
  { minX: -4.1, maxX: -1.9, minZ: -5.45, maxZ: -4.45 },
  // 2nd Floor VIP Booth 1 (Left Side)
  { minX: -5.05, maxX: -3.45, minZ: -3.9, maxZ: -1.8 },
  // 2nd Floor VIP Booth 2 (Left Side)
  { minX: -5.05, maxX: -3.45, minZ: 0.7, maxZ: 2.8 },
  // 2nd Floor Window Bar (Left Front)
  { minX: -4.7, maxX: -2.4, minZ: 3.45, maxZ: 4.35 },
];

export class ArbishEngine {
  private container: HTMLElement;
  private onHudUpdate: (snapshot: GameHudSnapshot) => void;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private pmremGenerator: THREE.PMREMGenerator | null = null;
  private envRT: THREE.WebGLRenderTarget | null = null;
  private composer: EffectComposer | null = null;
  private isSoftwareGl = false;
  private maxAnisotropy = 4;

  private building!: BuildingRefs;
  private kitchen!: KitchenAndDiningRefs;
  private handMount = new THREE.Group();
  private handItemMesh: THREE.Group | null = null;

  private raycaster = new THREE.Raycaster();
  private clock = new THREE.Clock();
  private frameId = 0;
  private disposed = false;

  // Player & Camera State
  private playerPos = new THREE.Vector3(0, 3.3, 13.8);
  private targetPlayerPos = new THREE.Vector3(0, 3.3, 13.8);
  private playerFloor: 1 | 2 = 1;
  private yaw = 0;
  private pitch = 0.04;
  private targetYaw = 0;
  private targetPitch = 0.04;
  private autoMoveActive = false;
  private activeStation: StationId | null = null;
  private freeCam = false;
  private freeMouseLook = false;
  private targetFov = 62;

  // Input State
  private keys: Record<string, boolean> = {};
  private isDragging = false;
  private dragMoved = false;
  private dragDistance = 0;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private lastFreeX: number | null = null;
  private lastFreeY: number | null = null;
  private hoverPointerX = 0;
  private hoverPointerY = 0;
  private hasMouseMoved = false;
  private lastHoverCheck = 0;
  private hoveredTarget: InteractiveTarget | null = null;
  private isPointerLocked = false;

  private hemiLight!: THREE.HemisphereLight;
  private keyLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  private facadeSpot!: THREE.PointLight;

  // Gameplay State
  private phase: 'title' | 'playing' | 'shift-end' | 'game-complete' = 'title';
  private shiftNumber = 1;
  private shiftDuration = 195;
  private shiftTimeLeft = 195;
  private money = 0;
  private tips = 0;
  private ordersServed = 0;
  private ordersMissed = 0;
  private streak = 0;
  private bestStreak = 0;
  private rating = 5.0;
  private tutorialMode = false;
  private tutorialStep = 0;
  private tutorialWalkInServed = false;
  private tutorialOnlineDispatched = false;
  private dispatchBagAnim = 0;
  private heldItem: HandItemType | null = null;
  private nextTicketId = 101;
  private spawnTimer = 2.0;

  private grillSlots: GrillSlotState[] = Array.from({ length: 4 }, () => ({
    state: 'empty',
    timer: 0,
    warned: false,
    mesh: null,
  }));
  private bunToaster: BunToasterState = { state: 'empty', timer: 0, mesh: null };
  private fryerSlots: FryerSlotState[] = [
    { kind: 'fries', state: 'idle', timer: 0, warned: false },
    { kind: 'chicken', state: 'idle', timer: 0, warned: false },
    { kind: 'sides', state: 'idle', timer: 0, warned: false },
  ];
  private drinkState: DrinkState = { state: 'empty', flavor: 'Cola', timer: 0 };
  private assemblyLayers: IngredientId[] = [];
  private assemblyMeshes: THREE.Group[] = [];
  private customers: CustomerActor[] = [];
  private onlineOrders: OnlineOrder[] = [];
  private onlineOrdersEnabled = true;
  private onlineSpawnTimer = 5.0;
  private onlineDispatched = 0;
  private ticketSlipMeshes: Map<number, THREE.Mesh> = new Map();

  private doorOpenAmount = 0;
  private steamPool: SteamParticle[] = [];
  private toastMessage: string | null = null;
  private toastTimer = 0;
  private hudSyncTimer = 0;

  constructor(container: HTMLElement, onHudUpdate: (snapshot: GameHudSnapshot) => void) {
    this.container = container;
    this.onHudUpdate = onHudUpdate;
    this.initScene();
    this.bindEvents();
    this.emitHud(true);
    this.tick();
  }

  private detectSoftwareGl(): boolean {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      return true;
    }
  }

  private initScene() {
    this.isSoftwareGl = this.detectSoftwareGl();

    const width = Math.max(this.container.clientWidth, 1);
    const height = Math.max(this.container.clientHeight, 1);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.62;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.maxAnisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 8);

    const canvas = this.renderer.domElement;
    canvas.style.touchAction = 'none';
    canvas.style.outline = 'none';
    canvas.tabIndex = 0;
    this.container.appendChild(canvas);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b101b);
    this.scene.fog = new THREE.FogExp2(0x111724, 0.015);

    this.camera = new THREE.PerspectiveCamera(62, width / height, 0.08, 95);
    this.camera.rotation.order = 'YXZ';
    this.scene.add(this.camera);

    // First-person held item mount attached to camera
    this.handMount.position.set(0.32, -0.28, -0.52);
    this.camera.add(this.handMount);

    // Studio Environment Reflection (RoomEnvironment)
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.envRT = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = this.envRT.texture;
    this.scene.environmentIntensity = 0.24;
    this.pmremGenerator.dispose();
    this.pmremGenerator = null;

    // Dynamic Day-Night Makkah Lighting Rig (only 1 shadow caster for speed)
    this.hemiLight = new THREE.HemisphereLight(0x8aa8dc, 0x201914, 0.24);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xffe8cc, 0.65);
    this.keyLight.position.set(6, 12, 10);
    this.keyLight.castShadow = !this.isSoftwareGl;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 1;
    this.keyLight.shadow.camera.far = 36;
    const d = 11;
    this.keyLight.shadow.camera.left = -d;
    this.keyLight.shadow.camera.right = d;
    this.keyLight.shadow.camera.top = d;
    this.keyLight.shadow.camera.bottom = -d;
    this.keyLight.shadow.bias = -0.0005;
    this.keyLight.shadow.normalBias = 0.02;
    this.keyLight.shadow.radius = 2.5;
    this.scene.add(this.keyLight);

    // Cool sky rim light from back-left (no shadow casting)
    this.rimLight = new THREE.DirectionalLight(0x7ca9f2, 0.24);
    this.rimLight.position.set(-10, 9, -8);
    this.scene.add(this.rimLight);

    // Dim warm interior kitchen, dining & storage fill lights (no shadow casting)
    const kitchenFill = new THREE.PointLight(0xffedd5, 0.72, 13, 1.5);
    kitchenFill.position.set(0, 3.6, -2.5);
    this.scene.add(kitchenFill);

    const diningFill = new THREE.PointLight(0xffe4b5, 0.52, 12, 1.5);
    diningFill.position.set(0, 3.4, 2.5);
    this.scene.add(diningFill);

    this.facadeSpot = new THREE.PointLight(0xffdfb0, 0.45, 13, 1.5);
    this.facadeSpot.position.set(0, 4.4, 6.2);
    this.scene.add(this.facadeSpot);

    const loftFill = new THREE.PointLight(0xffe4b5, 0.6, 15, 1.45);
    loftFill.position.set(0, 7.25, -1.1);
    this.scene.add(loftFill);

    const atriumFill = new THREE.PointLight(0xffd699, 0.48, 12, 1.5);
    atriumFill.position.set(0.1, 6.2, 2.55);
    this.scene.add(atriumFill);

    const storageFill = new THREE.PointLight(0xdbeafe, 0.52, 7.5, 1.5);
    storageFill.position.set(3.3, 3.35, -7.35);
    this.scene.add(storageFill);

    // Build Arbish Bites Building + Kitchen + Steam Pool
    this.building = buildArbishEnvironment(this.maxAnisotropy, this.isSoftwareGl);
    this.scene.add(this.building.group);

    this.kitchen = buildKitchenAndDining(this.maxAnisotropy);
    this.scene.add(this.kitchen.group);

    // Pre-allocate steam particle pool
    const steamGeo = new THREE.SphereGeometry(0.055, 8, 8);
    for (let i = 0; i < 28; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xf4f4f5,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(steamGeo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.steamPool.push({
        mesh,
        active: false,
        life: 0,
        maxLife: 1.2,
        vx: 0,
        vy: 0.45,
        vz: 0,
      });
    }

    if (!this.isSoftwareGl) {
      const renderTarget = new THREE.WebGLRenderTarget(width, height, {
        type: THREE.HalfFloatType,
        samples: 2,
      });
      this.composer = new EffectComposer(this.renderer, renderTarget);
      this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.composer.setSize(width, height);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      this.composer.addPass(
        new UnrealBloomPass(new THREE.Vector2(width, height), 0.18, 0.35, 0.96)
      );
      this.composer.addPass(new OutputPass());
      this.renderer.compile(this.scene, this.camera);
    }
  }

  private bindEvents() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    document.addEventListener('pointerlockerror', this.onPointerLockError);

    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('contextmenu', this.onContextMenu);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('webglcontextlost', this.onContextLost);
    canvas.addEventListener('webglcontextrestored', this.onContextRestored);
  }

  private onContextLost = (e: Event) => {
    e.preventDefault();
  };

  private onContextRestored = () => {
    this.emitHud(true);
  };

  private onResize = () => {
    if (this.disposed) return;
    const width = Math.max(this.container.clientWidth, 1);
    const height = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer?.setSize(width, height);
  };

  private onPointerLockChange = () => {
    this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
    if (this.isPointerLocked) {
      this.freeMouseLook = false;
    }
    this.emitHud(true);
  };

  private onPointerLockError = () => {
    // Sandboxed iframes often block Pointer Lock — fall back seamlessly to unlocked mouse-look
    this.isPointerLocked = false;
    this.freeMouseLook = true;
    this.lastFreeX = null;
    this.lastFreeY = null;
    this.showToast('Mouse Look enabled — move mouse to look, press L or Esc to stop');
    this.emitHud(true);
  };

  private onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  private onWheel = (e: WheelEvent) => {
    if (this.phase !== 'playing') return;
    e.preventDefault();
    this.targetFov = THREE.MathUtils.clamp(this.targetFov + e.deltaY * 0.03, 38, 82);
    this.emitHud(false);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;
    if (this.phase !== 'playing') return;

    if (
      e.code === 'ArrowUp' ||
      e.code === 'ArrowDown' ||
      e.code === 'ArrowLeft' ||
      e.code === 'ArrowRight' ||
      e.code === 'Space'
    ) {
      e.preventDefault();
    }

    if (e.code === 'Escape') {
      if (this.freeMouseLook) {
        this.freeMouseLook = false;
        this.lastFreeX = null;
        this.lastFreeY = null;
        this.emitHud(true);
      }
      return;
    }

    if (e.code === 'KeyE' || (e.code === 'Space' && !this.freeCam)) {
      if (this.hoveredTarget) {
        this.interactWithTarget(this.hoveredTarget);
      }
    } else if (e.code === 'KeyL') {
      this.togglePointerLock();
    } else if (e.code === 'KeyC') {
      this.toggleFreeCam();
    } else if (e.code === 'Digit1') {
      this.jumpToStation('counter');
    } else if (e.code === 'Digit2') {
      this.jumpToStation('grill');
    } else if (e.code === 'Digit3') {
      this.jumpToStation('fryer');
    } else if (e.code === 'Digit4') {
      this.jumpToStation('prep');
    } else if (e.code === 'Digit5') {
      this.jumpToStation('drinks');
    } else if (e.code === 'Digit6') {
      this.jumpToStation('storefront');
    } else if (e.code === 'Digit7') {
      this.jumpToStation('loft');
    } else if (e.code === 'Digit8') {
      this.jumpToStation('storage');
    } else if (e.code === 'KeyQ') {
      this.discardHeldItem();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private onPointerDown = (e: PointerEvent) => {
    if (this.phase !== 'playing') return;
    this.renderer.domElement.focus({ preventScroll: true });

    if (this.isPointerLocked || this.freeMouseLook) {
      this.updateRaycaster(true);
      if (this.hoveredTarget) {
        this.interactWithTarget(this.hoveredTarget);
      }
      return;
    }

    this.isDragging = true;
    this.dragMoved = false;
    this.dragDistance = 0;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.hoverPointerX = e.clientX;
    this.hoverPointerY = e.clientY;
    this.hasMouseMoved = true;
    try {
      this.renderer.domElement.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if synthetic event
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.phase !== 'playing') return;

    if (this.isPointerLocked) {
      this.autoMoveActive = false;
      this.yaw -= e.movementX * 0.0024;
      this.pitch = THREE.MathUtils.clamp(
        this.pitch - e.movementY * 0.0024,
        -Math.PI * 0.44,
        Math.PI * 0.44
      );
      return;
    }

    if (this.freeMouseLook) {
      this.autoMoveActive = false;
      if (this.lastFreeX !== null && this.lastFreeY !== null) {
        const dx = e.clientX - this.lastFreeX;
        const dy = e.clientY - this.lastFreeY;
        this.yaw -= dx * 0.0042;
        this.pitch = THREE.MathUtils.clamp(
          this.pitch - dy * 0.0042,
          -Math.PI * 0.44,
          Math.PI * 0.44
        );
      }
      this.lastFreeX = e.clientX;
      this.lastFreeY = e.clientY;
      return;
    }

    this.hoverPointerX = e.clientX;
    this.hoverPointerY = e.clientY;
    this.hasMouseMoved = true;

    if (this.isDragging) {
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.dragDistance += Math.hypot(dx, dy);
      if (this.dragDistance > 5) {
        this.dragMoved = true;
      }
      this.autoMoveActive = false;
      this.yaw -= dx * 0.0045;
      this.pitch = THREE.MathUtils.clamp(
        this.pitch - dy * 0.0045,
        -Math.PI * 0.44,
        Math.PI * 0.44
      );
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    if (this.phase !== 'playing') {
      this.isDragging = false;
      return;
    }

    try {
      if (this.renderer.domElement.hasPointerCapture(e.pointerId)) {
        this.renderer.domElement.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    if (this.isDragging && !this.dragMoved && !this.isPointerLocked && !this.freeMouseLook) {
      this.hoverPointerX = e.clientX;
      this.hoverPointerY = e.clientY;
      this.hasMouseMoved = true;
      this.updateRaycaster(false);
      if (this.hoveredTarget) {
        this.interactWithTarget(this.hoveredTarget);
      }
    }
    this.isDragging = false;
  };

  // =========================================================================
  // PUBLIC CONTROLS FOR REACT HUD
  // =========================================================================
  public startShift(shiftNum = 1, tutorial = false) {
    const clampedShift = Math.max(1, Math.min(100, shiftNum));
    this.shiftNumber = clampedShift;
    this.phase = 'playing';
    this.tutorialMode = tutorial;
    this.tutorialStep = 0;
    this.tutorialWalkInServed = false;
    this.tutorialOnlineDispatched = false;
    // Shifts get slightly faster-paced & busier as you climb toward Shift 100
    this.shiftDuration = Math.max(145, 195 - Math.floor((clampedShift - 1) * 0.5));
    this.shiftTimeLeft = this.shiftDuration;
    this.freeCam = false;
    this.freeMouseLook = false;
    this.targetFov = 62;
    if (clampedShift === 1) {
      this.money = 0;
      this.tips = 0;
      this.ordersServed = 0;
      this.ordersMissed = 0;
      this.onlineDispatched = 0;
      this.streak = 0;
      this.bestStreak = 0;
      this.rating = 5.0;
    }
    this.clearKitchenState();
    this.clearAllCustomers();
    this.spawnTimer = tutorial ? 999 : 1.5;
    this.onlineSpawnTimer = tutorial ? 999 : Math.max(2.5, 5.0 - clampedShift * 0.05);
    this.jumpToStation('counter');
    this.renderer.domElement.focus({ preventScroll: true });

    if (tutorial) {
      this.spawnCustomer('classic-burger');
      this.showToast('Tutorial Mode — follow the top guide to cook & dispatch!');
    } else {
      this.showToast(
        clampedShift === 100
          ? 'FINAL SHIFT 100 — Finish strong at Arbish Bites Makkah!'
          : `Shift ${clampedShift} started — rush speed x${(1 + (clampedShift - 1) * 0.08).toFixed(2)}!`
      );
    }
    this.emitHud(true);
  }

  public skipTutorial() {
    if (!this.tutorialMode) return;
    this.tutorialMode = false;
    const hasActiveCustomer = this.customers.some(
      (c) => c.phase === 'entering' || c.phase === 'queuing' || c.phase === 'waiting-food'
    );
    this.spawnTimer = hasActiveCustomer ? 60.0 : 1.5;
    this.onlineSpawnTimer = 5.0;
    this.showToast('Tutorial skipped — live Makkah shift active!');
    this.emitHud(true);
  }

  public acceptCustomerOrderFromHud(ticketId: number) {
    if (this.phase !== 'playing') return;
    const cust = this.customers.find((c) => c.ticketId === ticketId && c.phase === 'queuing');
    if (cust) {
      this.takeCustomerOrder(cust);
      this.emitHud(true);
    }
  }

  public declineCustomerOrderFromHud(ticketId: number) {
    if (this.phase !== 'playing') return;
    const cust = this.customers.find((c) => c.ticketId === ticketId && c.phase === 'queuing');
    if (!cust) return;
    cust.rig.statusHalo.visible = false;
    cust.phase = 'leaving';
    cust.targetPos.set((Math.random() - 0.5) * 4, 0, 8.0);
    soundEngine.playTrash();
    this.showToast(`Declined walk-in guest ${cust.name}`);
    this.emitHud(true);
  }

  public acceptOnlineOrderFromHud(ticketId: number) {
    if (this.phase !== 'playing') return;
    const ord = this.onlineOrders.find((o) => o.id === ticketId && o.status === 'pending');
    if (!ord) return;
    this.acceptOnlineOrder(ord);
    this.emitHud(true);
  }

  public declineOnlineOrderFromHud(ticketId: number) {
    if (this.phase !== 'playing') return;
    const idx = this.onlineOrders.findIndex((o) => o.id === ticketId && o.status === 'pending');
    if (idx === -1) return;
    const ord = this.onlineOrders[idx];
    this.onlineOrders.splice(idx, 1);
    soundEngine.playTrash();
    this.showToast(`Declined ${ord.platform} #${ord.id} (${ord.neighborhood})`);
    this.emitHud(true);
  }

  public jumpToStation(station: StationId) {
    const preset = STATION_PRESETS[station];
    this.playerFloor = station === 'loft' ? 2 : 1;
    this.targetPlayerPos.set(...preset.pos);
    this.targetYaw = preset.yaw;
    this.targetPitch = preset.pitch;
    this.autoMoveActive = true;
    this.activeStation = station;
    this.freeCam = false;
    this.emitHud(true);
  }

  public togglePointerLock() {
    if (this.isPointerLocked) {
      document.exitPointerLock?.();
      return;
    }
    if (this.freeMouseLook) {
      this.freeMouseLook = false;
      this.lastFreeX = null;
      this.lastFreeY = null;
      this.showToast('Mouse Look paused — drag or use Arrow keys to look');
      this.emitHud(true);
      return;
    }

    const req = this.renderer.domElement.requestPointerLock?.() as unknown as Promise<void> | undefined;
    if (req && typeof req.catch === 'function') {
      req.catch(() => {
        this.onPointerLockError();
      });
    } else if (!this.renderer.domElement.requestPointerLock) {
      this.onPointerLockError();
    }
  }

  public toggleFreeCam() {
    this.freeCam = !this.freeCam;
    this.autoMoveActive = false;
    this.activeStation = null;
    this.showToast(
      this.freeCam
        ? 'Free Cam ON — WASD fly, Space/R up, Shift/F down, Arrows/Drag look'
        : 'Walk Mode ON'
    );
    this.emitHud(true);
  }

  public discardHeldItem() {
    if (!this.heldItem) return;
    this.setHeldItem(null);
    soundEngine.playTrash();
    this.showToast('Item discarded');
    this.emitHud(true);
  }

  public addIngredientFromHud(ing: IngredientId) {
    if (this.phase !== 'playing') return;
    this.addAssemblyLayer(ing);
  }

  public plateFromHud() {
    if (this.phase !== 'playing') return;
    this.completeAssemblyToTray();
  }

  public clearAssemblyFromHud() {
    if (this.phase !== 'playing') return;
    this.clearAssemblyBoard();
    soundEngine.playTrash();
    this.showToast('Prep board cleared');
    this.emitHud(true);
  }

  public triggerOnlineOrder() {
    if (this.phase !== 'playing') return;
    if (this.onlineOrders.length >= 4) {
      this.showToast('Online tablet queue full — dispatch one first!');
      return;
    }
    this.spawnOnlineOrder();
    this.emitHud(true);
  }

  public toggleOnlineOrders() {
    if (this.phase !== 'playing') return;
    this.onlineOrdersEnabled = !this.onlineOrdersEnabled;
    this.showToast(
      this.onlineOrdersEnabled
        ? 'Online Delivery Apps OPEN (HungerStation / Jahez / Arbish App)'
        : 'Online Delivery Apps PAUSED'
    );
    this.emitHud(true);
  }

  public dispatchOnlineOrderFromHud(ticketId: number) {
    if (this.phase !== 'playing') return;
    this.tryDispatchOnlineOrder(ticketId);
    this.emitHud(true);
  }

  private clearKitchenState() {
    this.setHeldItem(null);
    this.grillSlots.forEach((slot, idx) => {
      if (slot.mesh) {
        this.scene.remove(slot.mesh);
        slot.mesh = null;
      }
      slot.state = 'empty';
      slot.timer = 0;
      slot.warned = false;
      this.kitchen.grillProgressBars[idx].visible = false;
    });

    if (this.bunToaster.mesh) {
      this.scene.remove(this.bunToaster.mesh);
      this.bunToaster.mesh = null;
    }
    this.bunToaster.state = 'empty';
    this.bunToaster.timer = 0;

    this.fryerSlots.forEach((slot, idx) => {
      slot.state = 'idle';
      slot.timer = 0;
      slot.warned = false;
      this.kitchen.fryerProgressBars[idx].visible = false;
      this.kitchen.fryerBaskets[idx].position.y = 1.02;
    });

    this.drinkState = { state: 'empty', flavor: 'Cola', timer: 0 };
    this.kitchen.drinkCupGroup.visible = false;
    this.clearAssemblyBoard();
  }

  private clearAllCustomers() {
    this.customers.forEach((c) => this.scene.remove(c.rig.group));
    this.customers = [];
    this.onlineOrders = [];
    if (this.kitchen?.onlineDeliveryBag) {
      this.kitchen.onlineDeliveryBag.visible = false;
    }
    this.ticketSlipMeshes.forEach((m) => this.kitchen.ticketRailGroup.remove(m));
    this.ticketSlipMeshes.clear();
  }

  private setHeldItem(item: HandItemType | null) {
    this.heldItem = item;
    if (this.handItemMesh) {
      this.handMount.remove(this.handItemMesh);
      this.handItemMesh = null;
    }
    if (!item) return;

    if (item.startsWith('tray-')) {
      const menuId = item.replace('tray-', '') as MenuItemId;
      this.handItemMesh = buildPlatedTrayMesh(menuId, this.maxAnisotropy);
      this.handItemMesh.scale.setScalar(0.75);
    } else if (item === 'fries-basket-raw') {
      this.handItemMesh = buildFoodMesh('fries-cup', this.maxAnisotropy);
    } else if (item === 'empty-cup') {
      this.handItemMesh = buildFoodMesh('soda-cup', this.maxAnisotropy);
    } else {
      this.handItemMesh = buildFoodMesh(
        item as Exclude<HandItemType, `tray-${string}` | 'fries-basket-raw' | 'empty-cup'>,
        this.maxAnisotropy
      );
    }
    this.handMount.add(this.handItemMesh);
  }

  private showToast(msg: string) {
    this.toastMessage = msg;
    this.toastTimer = 2.6;
  }

  // =========================================================================
  // INTERACTION HANDLER
  // =========================================================================
  private interactWithTarget(target: InteractiveTarget) {
    switch (target.kind) {
      case 'fridge-patty': {
        if (this.heldItem) {
          this.showToast('Hands full — place or trash your item first');
          return;
        }
        this.setHeldItem('raw-patty');
        soundEngine.playPlop();
        this.showToast('Grabbed Raw Beef Patty — place on Grill');
        break;
      }
      case 'fridge-bun': {
        if (this.heldItem) {
          this.showToast('Hands full — place or trash your item first');
          return;
        }
        this.setHeldItem('raw-bun');
        soundEngine.playPlop();
        this.showToast('Grabbed Brioche Bun — toast on Bun Plate or add to Prep');
        break;
      }
      case 'grill-slot': {
        const idx = target.slotIndex ?? 0;
        const slot = this.grillSlots[idx];
        if (slot.state === 'empty') {
          if (this.heldItem === 'raw-patty') {
            this.setHeldItem(null);
            slot.state = 'raw';
            slot.timer = 0;
            slot.warned = false;
            slot.mesh = buildFoodMesh('raw-patty', this.maxAnisotropy);
            slot.mesh.position.copy(this.kitchen.grillSlotAnchors[idx]);
            this.scene.add(slot.mesh);
            soundEngine.playSizzle();
            this.showToast('Patty sizzling on flat-top!');
          } else {
            this.showToast('Grab a Raw Beef Patty from the Cold Fridge first');
          }
        } else if (slot.state === 'ready' || slot.state === 'seared') {
          if (this.heldItem) {
            this.showToast('Hands full — free your hands to pick up patty');
            return;
          }
          if (slot.state === 'seared') {
            this.showToast('Hold on — let it finish searing!');
            return;
          }
          if (slot.mesh) this.scene.remove(slot.mesh);
          slot.mesh = null;
          slot.state = 'empty';
          this.kitchen.grillProgressBars[idx].visible = false;
          this.setHeldItem('cooked-patty');
          soundEngine.playPlop();
          this.showToast('Picked up Seared Patty — add to Prep Board');
        } else if (slot.state === 'burnt') {
          if (this.heldItem) return;
          if (slot.mesh) this.scene.remove(slot.mesh);
          slot.mesh = null;
          slot.state = 'empty';
          this.kitchen.grillProgressBars[idx].visible = false;
          this.setHeldItem('burnt-patty');
          soundEngine.playTrash();
          this.showToast('Picked up charred patty — toss in Trash Bin');
        } else {
          this.showToast('Patty is searing...');
        }
        break;
      }
      case 'bun-toaster': {
        if (this.bunToaster.state === 'empty') {
          if (this.heldItem === 'raw-bun') {
            this.setHeldItem(null);
            this.bunToaster.state = 'toasting';
            this.bunToaster.timer = 0;
            this.bunToaster.mesh = buildFoodMesh('raw-bun', this.maxAnisotropy);
            this.bunToaster.mesh.position.set(-1.58, 0.94, -4.53);
            this.scene.add(this.bunToaster.mesh);
            soundEngine.playSizzle();
            this.showToast('Toasting Brioche Bun...');
          } else {
            this.showToast('Grab a Brioche Bun from the Fridge to toast');
          }
        } else if (this.bunToaster.state === 'ready') {
          if (this.heldItem) {
            this.showToast('Hands full — free your hands first');
            return;
          }
          if (this.bunToaster.mesh) this.scene.remove(this.bunToaster.mesh);
          this.bunToaster.mesh = null;
          this.bunToaster.state = 'empty';
          this.setHeldItem('toasted-bun');
          soundEngine.playPlop();
          this.showToast('Picked up Toasted Bun — add to Prep Board');
        }
        break;
      }
      case 'fryer-slot': {
        const idx = target.slotIndex ?? 0;
        const slot = this.fryerSlots[idx];
        if (!slot) break;
        if (slot.state === 'idle') {
          slot.state = 'frying';
          slot.timer = 0;
          slot.warned = false;
          soundEngine.playFryDrop();
          this.showToast(
            slot.kind === 'fries'
              ? 'Frying Spiced Fries...'
              : slot.kind === 'chicken'
                ? 'Frying Crispy Chicken Strips...'
                : 'Frying Crispy Sides (Rings / Mozz / Bites)...'
          );
        } else if (slot.state === 'ready') {
          if (this.heldItem) {
            this.showToast('Hands full — free your hands first');
            return;
          }
          slot.state = 'idle';
          this.kitchen.fryerProgressBars[idx].visible = false;
          this.setHeldItem(
            slot.kind === 'fries'
              ? 'fries-cup'
              : slot.kind === 'chicken'
                ? 'chicken-box'
                : 'sides-box'
          );
          soundEngine.playPlop();
          this.showToast(
            slot.kind === 'fries'
              ? 'Grabbed Fries — serve or add toppings on Prep Board!'
              : slot.kind === 'chicken'
                ? 'Grabbed Chicken Strips — serve or plate on Tray!'
                : 'Grabbed Crispy Sides — serve Onion Rings or add Cheese/Jalapeño/Mozz!'
          );
        } else if (slot.state === 'burnt') {
          slot.state = 'idle';
          this.kitchen.fryerProgressBars[idx].visible = false;
          soundEngine.playTrash();
          this.showToast('Dumped burnt batch — ready to fry again');
        } else {
          this.showToast('Basket still frying...');
        }
        break;
      }
      case 'soda-cup-stack': {
        if (this.heldItem) {
          this.showToast('Hands full — free your hands first');
          return;
        }
        this.setHeldItem('empty-cup');
        soundEngine.playPlop();
        this.showToast('Grabbed Arbish Cup — click a Soda Nozzle to pour');
        break;
      }
      case 'soda-dispenser': {
        const flavor = target.flavor ?? 'Cola';
        if (this.drinkState.state === 'empty') {
          if (this.heldItem === 'empty-cup' || !this.heldItem) {
            if (this.heldItem === 'empty-cup') this.setHeldItem(null);
            this.drinkState = { state: 'filling', flavor, timer: 0 };
            this.kitchen.drinkCupGroup.visible = true;
            const liquidColor =
              flavor === 'Cola' ? 0x3b1708 : flavor === 'Citrus' ? 0xa3e635 : 0x3b82f6;
            (this.kitchen.drinkLiquidMesh.material as THREE.MeshStandardMaterial).color.setHex(
              liquidColor
            );
            this.kitchen.drinkLiquidMesh.scale.y = 0.05;
            soundEngine.playPour();
            this.showToast(`Pouring ${flavor} Soda...`);
          } else {
            this.showToast('Free your hands or hold an empty cup to pour soda');
          }
        } else if (this.drinkState.state === 'ready') {
          if (this.heldItem) {
            this.showToast('Hands full — free your hands first');
            return;
          }
          this.drinkState.state = 'empty';
          this.kitchen.drinkCupGroup.visible = false;
          this.setHeldItem('soda-cup');
          soundEngine.playPlop();
          this.showToast('Picked up Chilled Fountain Soda');
        }
        break;
      }
      case 'prep-ingredient': {
        if (target.ingredient) {
          this.addAssemblyLayer(target.ingredient);
        }
        break;
      }
      case 'prep-plate': {
        if (this.heldItem === 'cooked-patty') {
          this.setHeldItem(null);
          this.addAssemblyLayer('cooked-patty');
        } else if (this.heldItem === 'toasted-bun' || this.heldItem === 'raw-bun') {
          this.setHeldItem(null);
          const hasBottom = this.assemblyLayers.includes('bottom-bun');
          this.addAssemblyLayer(hasBottom ? 'top-bun' : 'bottom-bun');
        } else if (this.heldItem === 'fries-cup') {
          this.setHeldItem(null);
          this.addAssemblyLayer('fries');
        } else if (this.heldItem === 'chicken-box') {
          this.setHeldItem(null);
          this.addAssemblyLayer('chicken-box');
        } else if (this.heldItem === 'sides-box') {
          this.setHeldItem(null);
          this.addAssemblyLayer('sides-box');
        } else if (this.heldItem === 'soda-cup') {
          this.setHeldItem(null);
          this.addAssemblyLayer('soda');
        } else {
          this.completeAssemblyToTray();
        }
        break;
      }
      case 'prep-clear': {
        this.clearAssemblyBoard();
        soundEngine.playTrash();
        this.showToast('Prep board cleared');
        break;
      }
      case 'trash': {
        this.discardHeldItem();
        break;
      }
      case 'register': {
        const queuingCustomer = this.customers.find((c) => c.phase === 'queuing');
        if (queuingCustomer) {
          this.takeCustomerOrder(queuingCustomer);
        } else {
          this.showToast('No customer waiting at the register yet');
        }
        break;
      }
      case 'serve-pass': {
        this.tryServeHeldOrder();
        break;
      }
      case 'online-tablet': {
        const pending = this.onlineOrders.find((o) => o.status === 'pending');
        if (pending) {
          this.acceptOnlineOrder(pending);
        } else {
          this.triggerOnlineOrder();
        }
        break;
      }
      case 'online-dispatch': {
        this.tryDispatchOnlineOrder();
        break;
      }
      case 'customer': {
        const cust = this.customers.find((c) => c.id === target.customerId);
        if (!cust) return;
        if (cust.phase === 'queuing') {
          this.takeCustomerOrder(cust);
        } else if (cust.phase === 'waiting-food') {
          this.tryServeHeldOrder(cust);
        }
        break;
      }
      case 'door': {
        this.doorOpenAmount = 1.35;
        soundEngine.playDoorChime();
        break;
      }
      case 'storage-patty': {
        if (this.heldItem) {
          this.showToast('Hands full — place or trash your item first');
          return;
        }
        this.setHeldItem('raw-patty');
        soundEngine.playPlop();
        this.showToast('Restocked Fresh Smash Patty from Storage Crate!');
        break;
      }
      case 'storage-bun': {
        if (this.heldItem) {
          this.showToast('Hands full — place or trash your item first');
          return;
        }
        this.setHeldItem('raw-bun');
        soundEngine.playPlop();
        this.showToast('Grabbed Fresh Brioche Bun from Storage Rack!');
        break;
      }
      case 'storage-cooler': {
        soundEngine.playDoorChime();
        this.showToast('Walk-In Freezer (-18°C) — Stock fully chilled & ready!');
        break;
      }
    }
    this.emitHud(true);
  }

  private addAssemblyLayer(ing: IngredientId) {
    if (this.assemblyLayers.length >= 11) {
      this.showToast('Prep tray is full — Plate or Clear it');
      return;
    }
    this.assemblyLayers.push(ing);
    soundEngine.playPlop();

    let mesh: THREE.Group;
    let x = 0;
    let z = 0;
    let y = 0.024;

    if (ing === 'fries') {
      mesh = buildFoodMesh('fries-cup', this.maxAnisotropy);
      x = 0.2;
      z = 0.07;
    } else if (ing === 'chicken-box') {
      mesh = buildFoodMesh('chicken-box', this.maxAnisotropy);
      x = -0.04;
      z = 0.0;
    } else if (ing === 'sides-box') {
      mesh = buildFoodMesh('sides-box', this.maxAnisotropy);
      x = -0.04;
      z = 0.0;
    } else if (ing === 'soda') {
      mesh = buildFoodMesh('soda-cup', this.maxAnisotropy);
      x = 0.2;
      z = -0.1;
    } else if (
      (ing === 'sauce' ||
        ing === 'classic-sauce' ||
        ing === 'cheese-sauce' ||
        ing === 'spicy-sauce' ||
        ing === 'maple-sauce' ||
        ing === 'cherry-sauce') &&
      (this.assemblyLayers.includes('chicken-box') || this.assemblyLayers.includes('fries')) &&
      !this.assemblyLayers.includes('bottom-bun')
    ) {
      mesh = buildFoodMesh(ing, this.maxAnisotropy);
      x = this.assemblyLayers.includes('chicken-box') ? -0.04 : 0.2;
      y = this.assemblyLayers.includes('chicken-box') ? 0.105 : 0.175;
      z = this.assemblyLayers.includes('chicken-box') ? 0.0 : 0.07;
    } else {
      // Burger / side topping stack height
      const burgerCount =
        this.assemblyLayers.filter(
          (l) => l !== 'fries' && l !== 'chicken-box' && l !== 'sides-box' && l !== 'soda'
        ).length - 1;
      y = 0.024 + Math.max(0, burgerCount) * 0.036;
      x = -0.06;
      mesh = buildFoodMesh(ing, this.maxAnisotropy);
    }

    mesh.position.set(x, y, z);
    this.kitchen.assemblyAnchor.add(mesh);
    this.assemblyMeshes.push(mesh);

    const matched = this.detectAssemblyMatch();
    if (matched) {
      this.showToast(`Ready to plate: ${ARBISH_MENU[matched].name}`);
    }
    this.emitHud(true);
  }

  private detectAssemblyMatch(): MenuItemId | null {
    const counts: Record<string, number> = {};
    this.assemblyLayers.forEach((l) => {
      counts[l] = (counts[l] || 0) + 1;
    });

    const hasBuns = (counts['bottom-bun'] ?? 0) >= 1 && (counts['top-bun'] ?? 0) >= 1;
    const patties = counts['cooked-patty'] ?? 0;
    const chicken = counts['chicken-box'] ?? 0;
    const sides = counts['sides-box'] ?? 0;
    const fries = counts['fries'] ?? 0;
    const soda = counts['soda'] ?? 0;
    const cheese = counts['cheese'] ?? 0;
    const jalapeno = counts['jalapeno'] ?? 0;
    const mozzarella = counts['mozzarella'] ?? 0;
    const sauceClassic = counts['classic-sauce'] ?? 0;
    const sauceCheese = counts['cheese-sauce'] ?? 0;
    const sauceSpicy = counts['spicy-sauce'] ?? 0;
    const sauceMaple = counts['maple-sauce'] ?? 0;
    const sauceCherry = counts['cherry-sauce'] ?? 0;
    const anySauce =
      (counts['sauce'] ?? 0) +
      sauceClassic +
      sauceCheese +
      sauceSpicy +
      sauceMaple +
      sauceCherry;

    if (hasBuns && patties >= 2 && fries >= 1 && soda >= 1) {
      return 'double-smash-meal';
    }
    if (hasBuns && patties >= 1 && fries >= 1 && soda >= 1) {
      return 'bites-combo';
    }
    if (!hasBuns && chicken >= 1 && fries >= 1 && soda >= 1) {
      return 'spicy-chicken-meal';
    }
    if (hasBuns && patties >= 2) {
      return 'double-burger';
    }
    if (hasBuns && patties >= 1 && anySauce >= 1) {
      return 'truffle-smash';
    }
    if (hasBuns && patties >= 1) {
      return 'classic-burger';
    }
    if (fries >= 1 && patties >= 1 && (cheese >= 1 || anySauce >= 1)) {
      return 'brisket-fries';
    }
    if (fries >= 1 && chicken >= 1 && jalapeno >= 1) {
      return 'arbish-fries';
    }
    if (fries >= 1 && chicken >= 1 && anySauce >= 1) {
      return 'nashville-fries';
    }
    if (chicken >= 1 && anySauce >= 1) {
      return 'crispy-chicken-burger';
    }
    if (sides >= 1 && jalapeno >= 1) {
      return 'jalapeno-bites';
    }
    if (sides >= 1 && cheese >= 1) {
      return 'cheesy-bites';
    }
    if (sides >= 1 && mozzarella >= 1) {
      return 'mozzarella-sticks';
    }
    if (sides >= 1) {
      return 'onion-rings';
    }
    if (chicken >= 1) {
      return 'chicken-bites';
    }
    if (fries >= 1) {
      return 'loaded-fries';
    }
    if (sauceCheese >= 1) return 'cheese-sauce';
    if (sauceSpicy >= 1) return 'spicy-sauce';
    if (sauceClassic >= 1) return 'classic-sauce';
    if (sauceMaple >= 1) return 'maple-sauce';
    if (sauceCherry >= 1) return 'cherry-sauce';
    if ((counts['sauce'] ?? 0) >= 1) return 'classic-sauce';
    return null;
  }

  private completeAssemblyToTray() {
    if (this.heldItem) {
      this.showToast('Hands full — serve or trash your current item first');
      return;
    }
    const match = this.detectAssemblyMatch();
    if (!match) {
      this.showToast('Add ingredients (Burger, Fries, Chicken, Sides, or Sauce) first!');
      return;
    }
    this.clearAssemblyBoard();
    this.setHeldItem(`tray-${match}` as HandItemType);
    soundEngine.playReadyDing();
    this.showToast(`Plated ${ARBISH_MENU[match].name} — deliver to Front Counter!`);
  }

  private clearAssemblyBoard() {
    this.assemblyLayers = [];
    this.assemblyMeshes.forEach((m) => this.kitchen.assemblyAnchor.remove(m));
    this.assemblyMeshes = [];
  }

  private takeCustomerOrder(cust: CustomerActor) {
    cust.phase = 'waiting-food';
    // Give full cooking patience buffer once accepted
    cust.patience = Math.min(cust.maxPatience, cust.patience + 25);
    cust.targetPos.set(
      1.25 + (this.customers.filter((c) => c.phase === 'waiting-food').length % 3) * 0.65,
      0,
      1.15
    );
    soundEngine.playReadyDing();

    // Add visual paper slip on overhead ticket rail
    const slip = new THREE.Mesh(
      new THREE.PlaneGeometry(0.24, 0.34),
      new THREE.MeshBasicMaterial({ color: 0xfef3c7, side: THREE.DoubleSide })
    );
    const slotCount = this.ticketSlipMeshes.size;
    slip.position.set(-1.4 + (slotCount % 6) * 0.45, -0.18, 0.04);
    this.kitchen.ticketRailGroup.add(slip);
    this.ticketSlipMeshes.set(cust.ticketId, slip);

    this.showToast(`Accepted #${cust.ticketId}: ${ARBISH_MENU[cust.orderItem].name}`);
  }

  private acceptOnlineOrder(ord: OnlineOrder) {
    ord.status = 'accepted';
    const cookMax = Math.max(65, 195 - (this.shiftNumber - 1) * 3.0);
    ord.maxPatience = cookMax;
    ord.patience = cookMax;

    // Add light-emerald paper delivery slip on overhead ticket rail
    const slip = new THREE.Mesh(
      new THREE.PlaneGeometry(0.24, 0.34),
      new THREE.MeshBasicMaterial({ color: 0xd1fae5, side: THREE.DoubleSide })
    );
    const slotCount = this.ticketSlipMeshes.size;
    slip.position.set(-1.4 + (slotCount % 6) * 0.45, -0.18, 0.04);
    this.kitchen.ticketRailGroup.add(slip);
    this.ticketSlipMeshes.set(ord.id, slip);

    soundEngine.playReadyDing();
    this.showToast(
      `Accepted ${ord.platform} #${ord.id} · Rider ${ord.driverName} heading to pickup!`
    );
  }

  private getHeldMenuItem(): MenuItemId | null {
    if (this.heldItem?.startsWith('tray-')) {
      return this.heldItem.replace('tray-', '') as MenuItemId;
    }
    if (this.heldItem === 'fries-cup') {
      return 'loaded-fries';
    }
    if (this.heldItem === 'chicken-box') {
      return 'chicken-bites';
    }
    if (this.heldItem === 'sides-box') {
      return 'onion-rings';
    }
    return null;
  }

  private tryDispatchOnlineOrder(specificTicketId?: number) {
    const servedMenuId = this.getHeldMenuItem();
    if (!servedMenuId) {
      this.showToast('Hold a plated Tray, Bucket Fries, or Chicken Strips to dispatch!');
      return;
    }
    const acceptedOrders = this.onlineOrders.filter((o) => o.status === 'accepted');
    if (acceptedOrders.length === 0) {
      const hasPending = this.onlineOrders.some((o) => o.status === 'pending');
      this.showToast(
        hasPending
          ? 'Accept the incoming Online Order first!'
          : 'No accepted online orders — click Online Tablet or + Order'
      );
      return;
    }

    const idx = specificTicketId
      ? this.onlineOrders.findIndex(
          (o) => o.id === specificTicketId && o.status === 'accepted' && o.orderItem === servedMenuId
        )
      : this.onlineOrders.findIndex(
          (o) => o.status === 'accepted' && o.orderItem === servedMenuId
        );

    if (idx === -1) {
      this.showToast(`No accepted online order waiting for ${ARBISH_MENU[servedMenuId].shortName}`);
      return;
    }

    const order = this.onlineOrders[idx];
    this.onlineOrders.splice(idx, 1);

    this.streak += 1;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    const streakBonus = Math.min(10, Number((this.streak * 1.0).toFixed(2)));

    const def = ARBISH_MENU[servedMenuId];
    const patienceRatio = THREE.MathUtils.clamp(order.patience / order.maxPatience, 0, 1);
    const deliveryBonus = Number((6.0 + def.price * 0.16 * patienceRatio + streakBonus).toFixed(2));
    this.money = Number((this.money + def.price + deliveryBonus).toFixed(2));
    this.tips = Number((this.tips + deliveryBonus).toFixed(2));
    this.ordersServed += 1;
    this.onlineDispatched += 1;
    this.rating = Math.min(5.0, Number((this.rating + 0.06).toFixed(2)));
    this.dispatchBagAnim = 0.85;

    if (this.tutorialMode && this.tutorialStep >= 5) {
      this.tutorialOnlineDispatched = true;
    }

    this.setHeldItem(null);
    soundEngine.playCashRegister();

    const slip = this.ticketSlipMeshes.get(order.id);
    if (slip) {
      this.kitchen.ticketRailGroup.remove(slip);
      this.ticketSlipMeshes.delete(order.id);
    }

    this.showToast(
      `Dispatched ${order.platform} #${order.id} via ${order.driverName}! +${(def.price + deliveryBonus).toFixed(2)} SAR (${this.streak}x streak)`
    );
  }

  private tryServeHeldOrder(specificCustomer?: CustomerActor) {
    const servedMenuId = this.getHeldMenuItem();

    if (!servedMenuId) {
      this.showToast('Hold a plated Tray, Bucket Fries, or Chicken Strips to serve!');
      return;
    }

    const candidates = specificCustomer
      ? [specificCustomer]
      : this.customers.filter((c) => c.phase === 'waiting-food');

    const match = candidates.find((c) => c.orderItem === servedMenuId);
    if (!match) {
      this.showToast(`No accepted customer waiting for ${ARBISH_MENU[servedMenuId].shortName}`);
      return;
    }

    // Serve success!
    this.streak += 1;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    const streakBonus = Math.min(10, Number((this.streak * 1.0).toFixed(2)));

    const def = ARBISH_MENU[servedMenuId];
    const patienceRatio = THREE.MathUtils.clamp(match.patience / match.maxPatience, 0, 1);
    const tip = Number((def.price * (0.08 + 0.18 * patienceRatio) + streakBonus).toFixed(2));
    this.money = Number((this.money + def.price + tip).toFixed(2));
    this.tips = Number((this.tips + tip).toFixed(2));
    this.ordersServed += 1;
    this.rating = Math.min(5.0, Number((this.rating + 0.05).toFixed(2)));

    if (this.tutorialMode && this.tutorialStep >= 5) {
      this.tutorialWalkInServed = true;
    }

    this.setHeldItem(null);
    soundEngine.playCashRegister();

    // Remove ticket slip
    const slip = this.ticketSlipMeshes.get(match.ticketId);
    if (slip) {
      this.kitchen.ticketRailGroup.remove(slip);
      this.ticketSlipMeshes.delete(match.ticketId);
    }

    // Give customer visible 3D tray and send them to a booth or exit
    const tray = buildPlatedTrayMesh(servedMenuId, this.maxAnisotropy);
    tray.scale.setScalar(0.8);
    match.rig.heldTrayAnchor.add(tray);
    match.rig.statusHalo.visible = false;

    const freeBooth = this.getAvailableBoothSeat();
    if (freeBooth) {
      match.phase = 'walking-booth';
      match.boothSeatPos = freeBooth;
      match.targetPos.copy(freeBooth);
      match.eatTimer = 14 + Math.random() * 8;
    } else {
      match.phase = 'leaving';
      match.targetPos.set((Math.random() - 0.5) * 4, 0, 7.6);
    }

    this.showToast(
      `Served ${match.name}! +${def.price.toFixed(2)} SAR (+${tip.toFixed(2)} SAR tip · ${this.streak}x streak)`
    );
  }

  private getAvailableBoothSeat(): THREE.Vector3 | null {
    const seats = [
      new THREE.Vector3(-4.2, 0, 1.95),
      new THREE.Vector3(-4.2, 0, 3.15),
      new THREE.Vector3(2.85, 0, 1.95),
      new THREE.Vector3(2.85, 0, 3.15),
    ];
    for (const s of seats) {
      const taken = this.customers.some(
        (c) => c.boothSeatPos && c.boothSeatPos.distanceToSquared(s) < 0.3
      );
      if (!taken) return s;
    }
    return null;
  }

  // =========================================================================
  // MAIN SIMULATION LOOP
  // =========================================================================
  private tick = () => {
    if (this.disposed) return;

    const delta = Math.min(this.clock.getDelta(), 0.08);
    const elapsed = this.clock.getElapsedTime();

    const cycleT =
      this.phase === 'playing'
        ? THREE.MathUtils.clamp(1 - this.shiftTimeLeft / this.shiftDuration, 0, 1)
        : 0.42 + Math.sin(elapsed * 0.08) * 0.22;

    this.updateDayNightCycle(cycleT);
    this.updateCameraAndMovement(delta, elapsed);
    this.updateKitchenSimulation(delta, elapsed);
    this.updateCustomers(delta, elapsed);
    this.updateSteamParticles(delta);
    this.updateDoors(delta);

    if (this.dispatchBagAnim > 0) {
      this.dispatchBagAnim = Math.max(0, this.dispatchBagAnim - delta * 2.2);
      const pulse = 1 + Math.sin(this.dispatchBagAnim * Math.PI * 3) * 0.14;
      this.kitchen.onlineDeliveryBag.scale.setScalar(pulse);
    } else {
      this.kitchen.onlineDeliveryBag.scale.setScalar(1);
    }

    if (this.toastTimer > 0) {
      this.toastTimer -= delta;
      if (this.toastTimer <= 0) {
        this.toastMessage = null;
        this.emitHud(true);
      }
    }

    if (this.phase === 'playing') {
      if (this.tutorialMode) {
        this.updateTutorialProgress();
      } else {
        this.shiftTimeLeft -= delta;
        if (this.shiftTimeLeft <= 0) {
          this.shiftTimeLeft = 0;
          if (this.shiftNumber >= 100) {
            this.phase = 'game-complete';
            soundEngine.playCashRegister();
            this.showToast('Shift 100 Complete — You mastered Arbish Bites Makkah!');
          } else {
            this.phase = 'shift-end';
          }
          if (this.isPointerLocked) {
            document.exitPointerLock?.();
          }
          this.emitHud(true);
        }
      }

      // Throttled hover raycast (20 Hz)
      if (elapsed - this.lastHoverCheck > 0.05) {
        this.lastHoverCheck = elapsed;
        this.updateRaycaster(this.isPointerLocked || this.freeMouseLook);
      }

      this.hudSyncTimer += delta;
      if (this.hudSyncTimer > 0.14) {
        this.hudSyncTimer = 0;
        this.emitHud(false);
      }
    }

    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updateCameraAndMovement(delta: number, elapsed: number) {
    if (this.phase === 'title') {
      // Showcase framing showing full 2-story Arbish Bites building & patio
      const swayX = Math.sin(elapsed * 0.35) * 1.1;
      const swayY = 3.45 + Math.cos(elapsed * 0.25) * 0.14;
      this.camera.position.set(swayX, swayY, 13.6);
      this.camera.lookAt(0, 3.85, 4.5);
      return;
    }

    // Smooth camera FOV zoom
    if (Math.abs(this.camera.fov - this.targetFov) > 0.05) {
      this.camera.fov = THREE.MathUtils.damp(this.camera.fov, this.targetFov, 10, delta);
      this.camera.updateProjectionMatrix();
    }

    // Keyboard Camera Look via Arrow Keys
    const turnYaw = (this.keys['ArrowLeft'] ? 1 : 0) - (this.keys['ArrowRight'] ? 1 : 0);
    const turnPitch = (this.keys['ArrowUp'] ? 1 : 0) - (this.keys['ArrowDown'] ? 1 : 0);
    if (turnYaw !== 0 || turnPitch !== 0) {
      this.autoMoveActive = false;
      this.yaw += turnYaw * 2.1 * delta;
      this.pitch = THREE.MathUtils.clamp(
        this.pitch + turnPitch * 1.6 * delta,
        -Math.PI * 0.44,
        Math.PI * 0.44
      );
    }

    // Check keyboard WASD Movement
    const forward = (this.keys['KeyW'] ? 1 : 0) - (this.keys['KeyS'] ? 1 : 0);
    const strafe = (this.keys['KeyD'] ? 1 : 0) - (this.keys['KeyA'] ? 1 : 0);
    const vertical = this.freeCam
      ? (this.keys['Space'] || this.keys['KeyR'] ? 1 : 0) -
        (this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.keys['KeyF'] ? 1 : 0)
      : 0;

    if (forward !== 0 || strafe !== 0 || vertical !== 0) {
      this.autoMoveActive = false;
      this.activeStation = null;

      const sinY = Math.sin(this.yaw);
      const cosY = Math.cos(this.yaw);
      _vec3.set(-sinY * forward + cosY * strafe, 0, -cosY * forward - sinY * strafe);
      if (_vec3.lengthSq() > 0) _vec3.normalize();

      const speed = this.freeCam ? 4.8 : 3.6;
      if (this.freeCam) {
        this.playerPos.x = THREE.MathUtils.clamp(
          this.playerPos.x + _vec3.x * speed * delta,
          -14,
          14
        );
        this.playerPos.z = THREE.MathUtils.clamp(
          this.playerPos.z + _vec3.z * speed * delta,
          -5.2,
          18
        );
        this.playerPos.y = THREE.MathUtils.clamp(
          this.playerPos.y + vertical * speed * delta,
          0.6,
          9.5
        );
      } else {
        const minZ = this.playerFloor === 2 ? -5.15 : -8.05;
        const maxZ = this.playerFloor === 2 ? 4.15 : 13.8;
        const nextX = THREE.MathUtils.clamp(
          this.playerPos.x + _vec3.x * speed * delta,
          -5.55,
          5.55
        );
        const nextZ = THREE.MathUtils.clamp(
          this.playerPos.z + _vec3.z * speed * delta,
          minZ,
          maxZ
        );

        if (!this.collidesAt(nextX, this.playerPos.z)) this.playerPos.x = nextX;
        if (!this.collidesAt(this.playerPos.x, nextZ)) this.playerPos.z = nextZ;

        // Seamless floor switching at top & bottom of the right staircase
        if (this.playerPos.x > 4.25) {
          if (this.playerFloor === 1 && this.playerPos.z < -0.25 && this.playerPos.y > 4.6) {
            this.playerFloor = 2;
          } else if (this.playerFloor === 2 && this.playerPos.z > 3.2) {
            this.playerFloor = 1;
          }
        }
      }
    } else if (this.autoMoveActive) {
      this.playerPos.x = THREE.MathUtils.damp(this.playerPos.x, this.targetPlayerPos.x, 7, delta);
      this.playerPos.y = THREE.MathUtils.damp(this.playerPos.y, this.targetPlayerPos.y, 7, delta);
      this.playerPos.z = THREE.MathUtils.damp(this.playerPos.z, this.targetPlayerPos.z, 7, delta);

      let diff = ((this.targetYaw - this.yaw + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (diff < -Math.PI) diff += Math.PI * 2;
      this.yaw += diff * (1 - Math.exp(-8 * delta));
      this.pitch = THREE.MathUtils.damp(this.pitch, this.targetPitch, 8, delta);

      if (
        this.playerPos.distanceToSquared(this.targetPlayerPos) < 0.002 &&
        Math.abs(diff) < 0.01
      ) {
        this.autoMoveActive = false;
      }
    }

    if (!this.freeCam && !this.autoMoveActive) {
      let floorSurfaceY = this.playerFloor === 2 ? 4.25 : 0;
      // Continuous walkable stair slope along right wall (X > 4.25, Z: -0.4 to 3.6)
      const onStairX = this.playerPos.x > 4.25;
      const inStairZ = this.playerPos.z >= -0.45 && this.playerPos.z <= 3.65;
      const validStairEntry =
        this.playerFloor === 2 || this.playerPos.y > 1.8 || this.playerPos.z > 2.6;

      if (onStairX && inStairZ && validStairEntry) {
        const stairProgress = THREE.MathUtils.clamp((3.6 - this.playerPos.z) / 4.0, 0, 1);
        floorSurfaceY = stairProgress * 4.25;
      }

      const eyeOffset = this.activeStation === 'storefront' ? 3.3 : 1.66;
      const desiredY = floorSurfaceY + eyeOffset;
      this.playerPos.y = THREE.MathUtils.damp(this.playerPos.y, desiredY, 10, delta);
    }

    this.camera.position.copy(this.playerPos);
    _euler.set(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(_euler);

    // Subtle hand item idle/walk bob
    const moving = forward !== 0 || strafe !== 0;
    const bobAmt = moving ? 0.015 : 0.004;
    const bobSpeed = moving ? 9 : 2.2;
    this.handMount.position.y = -0.28 + Math.sin(elapsed * bobSpeed) * bobAmt;
  }

  private collidesAt(x: number, z: number): boolean {
    const r = 0.28;
    if (this.playerFloor === 2) {
      // Allow walking onto the top of the right stairs (X > 4.25, Z: -0.4..3.8) to descend
      const onStairs = x > 4.25 && z >= -0.45 && z <= 3.7;
      for (const b of FLOOR2_COLLISION_BOXES) {
        if (x + r > b.minX && x - r < b.maxX && z + r > b.minZ && z - r < b.maxZ) {
          return true;
        }
      }
      // Keep out of stairwell hole beyond the stair flight (near front window X > 4.15, Z > 3.55)
      if (!onStairs && x > 4.15 && z > 3.55) {
        return true;
      }
      return false;
    }

    // Floor 1 collisions
    // Front storefront glass wall (open only through central doorway |x| < 1.15)
    if (z > 4.2 && z < 4.9 && Math.abs(x) >= 1.15) {
      return true;
    }
    // Block walking under the back of the right stairs from Floor 1
    if (this.playerPos.y < 3.4 && x > 4.25 && z < -0.2 && z > -1.35) {
      return true;
    }
    for (const b of COLLISION_BOXES) {
      if (x + r > b.minX && x - r < b.maxX && z + r > b.minZ && z - r < b.maxZ) {
        return true;
      }
    }
    return false;
  }

  private updateRaycaster(useCenter: boolean) {
    if (useCenter || !this.hasMouseMoved) {
      _mouseNdc.set(0, 0);
    } else {
      const rect = this.renderer.domElement.getBoundingClientRect();
      _mouseNdc.x = ((this.hoverPointerX - rect.left) / rect.width) * 2 - 1;
      _mouseNdc.y = -((this.hoverPointerY - rect.top) / rect.height) * 2 + 1;
    }

    this.raycaster.setFromCamera(_mouseNdc, this.camera);
    this.raycaster.far = 7.5;
    const hits = this.raycaster.intersectObjects(this.scene.children, true);

    let found: InteractiveTarget | null = null;
    for (const hit of hits) {
      if (hit.object.userData?.interactive) {
        found = hit.object.userData.interactive as InteractiveTarget;
        break;
      }
    }
    this.hoveredTarget = found;
    this.renderer.domElement.style.cursor = found ? 'pointer' : 'grab';
  }

  private updateKitchenSimulation(delta: number, elapsed: number) {
    // 1. Flat-Top Grill Slots
    this.grillSlots.forEach((slot, idx) => {
      if (slot.state === 'empty') return;
      slot.timer += delta;
      const bar = this.kitchen.grillProgressBars[idx];
      bar.visible = true;

      const cookTime = 6.0;
      const burnTime = 14.0;
      const progress = Math.min(slot.timer / cookTime, 1);
      bar.scale.x = Math.max(0.08, progress);

      if (slot.timer >= burnTime && slot.state !== 'burnt') {
        slot.state = 'burnt';
        if (slot.mesh) this.scene.remove(slot.mesh);
        slot.mesh = buildFoodMesh('burnt-patty', this.maxAnisotropy);
        slot.mesh.position.copy(this.kitchen.grillSlotAnchors[idx]);
        this.scene.add(slot.mesh);
        (bar.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
      } else if (slot.timer >= cookTime && slot.state === 'seared') {
        slot.state = 'ready';
        if (slot.mesh) this.scene.remove(slot.mesh);
        slot.mesh = buildFoodMesh('cooked-patty', this.maxAnisotropy);
        slot.mesh.position.copy(this.kitchen.grillSlotAnchors[idx]);
        this.scene.add(slot.mesh);
        (bar.material as THREE.MeshBasicMaterial).color.setHex(0x22c55e);
        soundEngine.playReadyDing();
      } else if (slot.timer >= cookTime * 0.45 && slot.state === 'raw') {
        slot.state = 'seared';
        (bar.material as THREE.MeshBasicMaterial).color.setHex(0xf59e0b);
      } else if (slot.state === 'raw') {
        (bar.material as THREE.MeshBasicMaterial).color.setHex(0xfbbf24);
      }

      if (slot.state === 'ready' && slot.timer > 10.5 && !slot.warned) {
        slot.warned = true;
        soundEngine.playBurnWarn();
      }

      // Spawn steam puffs from sizzling patties
      if (Math.random() < delta * 4.5) {
        const anchor = this.kitchen.grillSlotAnchors[idx];
        this.spawnSteam(anchor.x, anchor.y + 0.06, anchor.z);
      }
    });

    // 2. Bun Toaster
    if (this.bunToaster.state === 'toasting') {
      this.bunToaster.timer += delta;
      if (this.bunToaster.timer >= 2.2) {
        this.bunToaster.state = 'ready';
        if (this.bunToaster.mesh) this.scene.remove(this.bunToaster.mesh);
        this.bunToaster.mesh = buildFoodMesh('toasted-bun', this.maxAnisotropy);
        this.bunToaster.mesh.position.set(-1.58, 0.94, -4.53);
        this.scene.add(this.bunToaster.mesh);
        soundEngine.playReadyDing();
      }
    }

    // 3. Deep Fryer Slots
    this.fryerSlots.forEach((slot, idx) => {
      const basket = this.kitchen.fryerBaskets[idx];
      const bar = this.kitchen.fryerProgressBars[idx];
      const cookTime = slot.kind === 'fries' ? 5.2 : 6.0;
      const burnTime = 13.0;

      if (slot.state === 'idle') {
        basket.position.y = THREE.MathUtils.damp(basket.position.y, 1.06, 8, delta);
        bar.visible = false;
        return;
      }

      slot.timer += delta;
      bar.visible = true;
      bar.scale.x = Math.max(0.08, Math.min(slot.timer / cookTime, 1));

      if (slot.state === 'frying') {
        basket.position.y = THREE.MathUtils.damp(basket.position.y, 0.84, 8, delta);
        (bar.material as THREE.MeshBasicMaterial).color.setHex(0xf59e0b);
        if (Math.random() < delta * 5) {
          this.spawnSteam(1.25 + (idx - 1) * 0.62, 0.94, -4.55);
        }
        if (slot.timer >= cookTime) {
          slot.state = 'ready';
          soundEngine.playReadyDing();
        }
      } else if (slot.state === 'ready') {
        basket.position.y = THREE.MathUtils.damp(basket.position.y, 1.12, 8, delta);
        (bar.material as THREE.MeshBasicMaterial).color.setHex(0x22c55e);
        if (slot.timer > 9.5 && !slot.warned) {
          slot.warned = true;
          soundEngine.playBurnWarn();
        }
        if (slot.timer >= burnTime) {
          slot.state = 'burnt';
          (bar.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
        }
      } else if (slot.state === 'burnt') {
        basket.position.y = THREE.MathUtils.damp(basket.position.y, 1.06, 8, delta);
        (bar.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
      }
    });

    // 4. Soda Dispenser Fill
    if (this.drinkState.state === 'filling') {
      this.drinkState.timer += delta;
      const p = Math.min(this.drinkState.timer / 2.2, 1);
      this.kitchen.drinkLiquidMesh.scale.y = Math.max(0.05, p);
      this.kitchen.drinkLiquidMesh.position.y = 0.01 + p * 0.08;
      if (p >= 1) {
        this.drinkState.state = 'ready';
        soundEngine.playReadyDing();
      }
    }

    // Subtle glow pulse on pickup pad & online dispatch pad when player holds a completed order
    const heldMenu = this.getHeldMenuItem();
    const walkInMatch = heldMenu
      ? this.customers.some((c) => c.phase === 'waiting-food' && c.orderItem === heldMenu)
      : false;
    const acceptedOnlineOrders = this.onlineOrders.filter((o) => o.status === 'accepted');
    const pendingOnlineOrders = this.onlineOrders.filter((o) => o.status === 'pending');
    const onlineMatch = heldMenu
      ? acceptedOnlineOrders.some((o) => o.orderItem === heldMenu)
      : false;

    this.kitchen.serveMatGlow.emissiveIntensity = walkInMatch
      ? 0.55 + Math.sin(elapsed * 5) * 0.25
      : 0.14;

    this.kitchen.onlineDeliveryBag.visible = acceptedOnlineOrders.length > 0 || this.dispatchBagAnim > 0;
    this.kitchen.onlineDispatchGlow.emissiveIntensity = onlineMatch
      ? 0.65 + Math.sin(elapsed * 5.5) * 0.28
      : acceptedOnlineOrders.length > 0
        ? 0.34
        : 0.12;

    if (!this.onlineOrdersEnabled) {
      this.kitchen.onlineTabletScreenMat.emissive.setHex(0x475569);
      this.kitchen.onlineTabletScreenMat.emissiveIntensity = 0.25;
    } else if (pendingOnlineOrders.length > 0) {
      this.kitchen.onlineTabletScreenMat.emissive.setHex(0xf59e0b);
      this.kitchen.onlineTabletScreenMat.emissiveIntensity = 0.8 + Math.sin(elapsed * 6) * 0.25;
    } else if (acceptedOnlineOrders.length > 0) {
      this.kitchen.onlineTabletScreenMat.emissive.setHex(0x10b981);
      this.kitchen.onlineTabletScreenMat.emissiveIntensity = 0.72 + Math.sin(elapsed * 4) * 0.18;
    } else {
      this.kitchen.onlineTabletScreenMat.emissive.setHex(0x38bdf8);
      this.kitchen.onlineTabletScreenMat.emissiveIntensity = 0.45;
    }
  }

  private updateDayNightCycle(cycleT: number) {
    // 0.0 (12:00 PM Noon) -> 0.38 (5:42 PM Golden) -> 0.50 (7:30 PM Dusk) -> 0.65..1.0 (Night)
    if (cycleT < 0.35) {
      const k = THREE.MathUtils.smoothstep(cycleT, 0.0, 0.35);
      _cZenithA.setHex(0x2563eb);
      _cZenithB.setHex(0x3b4d8a);
      _cHorizonA.setHex(0x93c5fd);
      _cHorizonB.setHex(0xfdba74);
      _cGroundA.setHex(0x384354);
      _cGroundB.setHex(0x2d2428);
      _cFogA.setHex(0x6b87ad);
      _cFogB.setHex(0x52424a);
      _cKeyA.setHex(0xfff5e0);
      _cKeyB.setHex(0xffb56b);
      _cHemiA.setHex(0xa8ccf5);
      _cHemiB.setHex(0xd49d74);
      this.building.skyUniforms.uZenithColor.value.copy(_cZenithA).lerp(_cZenithB, k);
      this.building.skyUniforms.uHorizonColor.value.copy(_cHorizonA).lerp(_cHorizonB, k);
      this.building.skyUniforms.uGroundColor.value.copy(_cGroundA).lerp(_cGroundB, k);
      (this.scene.fog as THREE.FogExp2).color.copy(_cFogA).lerp(_cFogB, k);
      this.keyLight.color.copy(_cKeyA).lerp(_cKeyB, k);
      this.keyLight.intensity = THREE.MathUtils.lerp(0.95, 0.72, k);
      this.hemiLight.color.copy(_cHemiA).lerp(_cHemiB, k);
      this.hemiLight.intensity = THREE.MathUtils.lerp(0.42, 0.3, k);
    } else if (cycleT < 0.56) {
      const k = THREE.MathUtils.smoothstep(cycleT, 0.35, 0.56);
      _cZenithA.setHex(0x3b4d8a);
      _cZenithB.setHex(0x0d152b);
      _cHorizonA.setHex(0xfdba74);
      _cHorizonB.setHex(0x33223b);
      _cGroundA.setHex(0x2d2428);
      _cGroundB.setHex(0x0f1119);
      _cFogA.setHex(0x52424a);
      _cFogB.setHex(0x161926);
      _cKeyA.setHex(0xffb56b);
      _cKeyB.setHex(0x9cb8f5);
      _cHemiA.setHex(0xd49d74);
      _cHemiB.setHex(0x7c97cf);
      this.building.skyUniforms.uZenithColor.value.copy(_cZenithA).lerp(_cZenithB, k);
      this.building.skyUniforms.uHorizonColor.value.copy(_cHorizonA).lerp(_cHorizonB, k);
      this.building.skyUniforms.uGroundColor.value.copy(_cGroundA).lerp(_cGroundB, k);
      (this.scene.fog as THREE.FogExp2).color.copy(_cFogA).lerp(_cFogB, k);
      this.keyLight.color.copy(_cKeyA).lerp(_cKeyB, k);
      this.keyLight.intensity = THREE.MathUtils.lerp(0.72, 0.44, k);
      this.hemiLight.color.copy(_cHemiA).lerp(_cHemiB, k);
      this.hemiLight.intensity = THREE.MathUtils.lerp(0.3, 0.2, k);
    } else {
      const k = THREE.MathUtils.smoothstep(cycleT, 0.56, 0.78);
      _cZenithA.setHex(0x0d152b);
      _cZenithB.setHex(0x060a14);
      _cHorizonA.setHex(0x33223b);
      _cHorizonB.setHex(0x131b2e);
      _cGroundA.setHex(0x0f1119);
      _cGroundB.setHex(0x090b10);
      _cFogA.setHex(0x161926);
      _cFogB.setHex(0x0f1522);
      _cKeyA.setHex(0x9cb8f5);
      _cKeyB.setHex(0x8aa8e8);
      this.building.skyUniforms.uZenithColor.value.copy(_cZenithA).lerp(_cZenithB, k);
      this.building.skyUniforms.uHorizonColor.value.copy(_cHorizonA).lerp(_cHorizonB, k);
      this.building.skyUniforms.uGroundColor.value.copy(_cGroundA).lerp(_cGroundB, k);
      (this.scene.fog as THREE.FogExp2).color.copy(_cFogA).lerp(_cFogB, k);
      this.keyLight.color.copy(_cKeyA).lerp(_cKeyB, k);
      this.keyLight.intensity = THREE.MathUtils.lerp(0.44, 0.38, k);
      this.hemiLight.color.setHex(0x7c97cf);
      this.hemiLight.intensity = THREE.MathUtils.lerp(0.2, 0.16, k);
    }

    (this.scene.background as THREE.Color).copy(this.building.skyUniforms.uHorizonColor.value);

    // Sun & Moon arc positions
    const sunAngle = THREE.MathUtils.lerp(Math.PI * 0.42, -Math.PI * 0.12, THREE.MathUtils.clamp(cycleT / 0.55, 0, 1));
    const sunX = Math.cos(sunAngle) * 32;
    const sunY = Math.sin(sunAngle) * 34;
    this.building.sunDisc.position.set(sunX, sunY, -34);
    this.building.sunDisc.visible = sunY > -3;

    const moonT = THREE.MathUtils.clamp((cycleT - 0.44) / 0.56, 0, 1);
    const moonAngle = THREE.MathUtils.lerp(-Math.PI * 0.08, Math.PI * 0.48, moonT);
    const moonX = -Math.cos(moonAngle) * 30;
    const moonY = Math.sin(moonAngle) * 30;
    this.building.moonDisc.position.set(moonX, moonY, -34);
    this.building.moonDisc.visible = moonY > -2 && cycleT > 0.42;

    if (cycleT < 0.5) {
      this.keyLight.position.set(sunX * 0.35 + 4, Math.max(5, sunY * 0.45), 11);
    } else {
      this.keyLight.position.set(moonX * 0.3, Math.max(6, moonY * 0.45), 10);
    }

    // Nightfall fades in stars, exterior lamps, city skyline windows & Arbish neon facade
    const nightFactor = THREE.MathUtils.smoothstep(cycleT, 0.36, 0.62);
    this.building.starsMat.opacity = nightFactor * 0.85;
    this.building.streetLampGlowMat.emissiveIntensity = 0.25 + nightFactor * 1.25;
    this.building.skylineWindowMat.emissiveIntensity = 0.1 + nightFactor * 0.85;
    this.building.facadeSignMat.emissiveIntensity = 0.35 + nightFactor * 0.65;
    this.building.canopyLedMat.emissiveIntensity = 0.35 + nightFactor * 0.85;
    this.building.lanternMat.emissiveIntensity = 0.45 + nightFactor * 1.4;
    this.facadeSpot.intensity = 0.15 + nightFactor * 0.45;
  }

  private updateTutorialProgress() {
    if (!this.tutorialMode) return;
    if (this.tutorialStep === 0) {
      const acceptedWalkIn = this.customers.some((c) => c.phase === 'waiting-food');
      if (acceptedWalkIn) {
        this.tutorialStep = 1;
        this.emitHud(true);
      }
    } else if (this.tutorialStep === 1) {
      const hasRawPatty =
        this.heldItem === 'raw-patty' ||
        this.grillSlots.some((s) => s.state !== 'empty');
      if (hasRawPatty) {
        this.tutorialStep = 2;
        this.emitHud(true);
      }
    } else if (this.tutorialStep === 2) {
      const hasCookedPatty =
        this.heldItem === 'cooked-patty' ||
        this.assemblyLayers.includes('cooked-patty');
      if (hasCookedPatty) {
        this.tutorialStep = 3;
        this.emitHud(true);
      }
    } else if (this.tutorialStep === 3) {
      const hasToastedBun =
        this.heldItem === 'toasted-bun' ||
        this.assemblyLayers.includes('bottom-bun');
      if (hasToastedBun) {
        this.tutorialStep = 4;
        this.emitHud(true);
      }
    } else if (this.tutorialStep === 4) {
      const plated = this.heldItem === 'tray-classic-burger' || this.tutorialWalkInServed;
      if (plated) {
        this.tutorialStep = 5;
        if (this.onlineOrders.length === 0) {
          this.spawnOnlineOrder('loaded-fries');
        }
        this.emitHud(true);
      }
    } else if (this.tutorialStep === 5) {
      if (this.tutorialWalkInServed && this.tutorialOnlineDispatched) {
        this.tutorialMode = false;
        this.spawnTimer = 60.0;
        this.onlineSpawnTimer = 6.0;
        soundEngine.playCashRegister();
        this.showToast('Tutorial Complete! Shift 1 rush is now live!');
        this.emitHud(true);
      }
    }
  }

  private pickOrderItem(): MenuItemId {
    const r = Math.random();
    if (r < 0.08) {
      const sauces: MenuItemId[] = [
        'cheese-sauce',
        'spicy-sauce',
        'classic-sauce',
        'maple-sauce',
        'cherry-sauce',
      ];
      return sauces[Math.floor(Math.random() * sauces.length)];
    }
    const corePool: MenuItemId[] =
      this.shiftNumber >= 4
        ? [
            'double-smash-meal',
            'bites-combo',
            'spicy-chicken-meal',
            'brisket-fries',
            'nashville-fries',
            'arbish-fries',
            'truffle-smash',
            'double-burger',
            'crispy-chicken-burger',
            'jalapeno-bites',
            'cheesy-bites',
            'mozzarella-sticks',
            'onion-rings',
            'classic-burger',
            'chicken-bites',
            'loaded-fries',
          ]
        : [
            'classic-burger',
            'double-burger',
            'truffle-smash',
            'crispy-chicken-burger',
            'chicken-bites',
            'brisket-fries',
            'nashville-fries',
            'arbish-fries',
            'loaded-fries',
            'jalapeno-bites',
            'cheesy-bites',
            'mozzarella-sticks',
            'onion-rings',
            'bites-combo',
            'spicy-chicken-meal',
            'double-smash-meal',
          ];
    return corePool[Math.floor(Math.random() * corePool.length)];
  }

  private updateCustomers(delta: number, elapsed: number) {
    if (this.phase !== 'playing') return;

    const activeOrderingOrWaiting = this.customers.filter(
      (c) => c.phase === 'entering' || c.phase === 'queuing' || c.phase === 'waiting-food'
    ).length;

    const maxCustomers = 1;
    const maxOnline = Math.min(4, 2 + Math.floor((this.shiftNumber - 1) / 4));

    if (!this.tutorialMode) {
      this.spawnTimer = Math.max(0, this.spawnTimer - delta);
      if (this.spawnTimer <= 0 && activeOrderingOrWaiting < maxCustomers) {
        this.spawnCustomer();
        this.spawnTimer = 60.0;
      }

      // Online Delivery Orders (HungerStation / Jahez / Arbish App)
      if (this.onlineOrdersEnabled) {
        this.onlineSpawnTimer -= delta;
        if (this.onlineSpawnTimer <= 0 && this.onlineOrders.length < maxOnline) {
          this.spawnOnlineOrder();
          this.onlineSpawnTimer =
            Math.max(6.5, 22 - (this.shiftNumber - 1) * 0.9) + Math.random() * 4.5;
        }
      }
    }

    for (let i = this.onlineOrders.length - 1; i >= 0; i--) {
      const ord = this.onlineOrders[i];
      if (!this.tutorialMode) {
        ord.patience -= delta;
      }
      if (ord.patience <= 0) {
        this.onlineOrders.splice(i, 1);
        if (ord.status === 'accepted') {
          this.ordersMissed += 1;
          this.streak = 0;
          const penalty = 0.2 + Math.min(0.2, (this.shiftNumber - 1) * 0.012);
          this.rating = Math.max(1.0, Number((this.rating - penalty).toFixed(2)));
          const slip = this.ticketSlipMeshes.get(ord.id);
          if (slip) {
            this.kitchen.ticketRailGroup.remove(slip);
            this.ticketSlipMeshes.delete(ord.id);
          }
          this.showToast(`${ord.platform} #${ord.id} (${ord.neighborhood}) timed out!`);
        } else {
          this.showToast(`${ord.platform} #${ord.id} offer expired`);
        }
      }
    }

    for (let i = this.customers.length - 1; i >= 0; i--) {
      const c = this.customers[i];
      const pos = c.rig.group.position;
      const distSq = pos.distanceToSquared(c.targetPos);

      // Swing doors open when customer approaches storefront doorway
      if (Math.abs(pos.x) < 1.6 && pos.z > 3.2 && pos.z < 5.9) {
        this.doorOpenAmount = Math.max(this.doorOpenAmount, 1.35);
      }

      if (distSq > 0.025) {
        _vec3.subVectors(c.targetPos, pos).setY(0).normalize();
        const walkSpeed = 1.65;
        pos.addScaledVector(_vec3, walkSpeed * delta);

        const targetYaw = Math.atan2(_vec3.x, _vec3.z);
        let diff = ((targetYaw - c.rig.group.rotation.y + Math.PI) % (Math.PI * 2)) - Math.PI;
        if (diff < -Math.PI) diff += Math.PI * 2;
        c.rig.group.rotation.y += diff * Math.min(1, delta * 9);

        c.walkPhase += delta * 8.5;
        const swing = Math.sin(c.walkPhase) * 0.48;
        c.rig.leftLegPivot.rotation.x = swing;
        c.rig.rightLegPivot.rotation.x = -swing;
        c.rig.leftArmPivot.rotation.x = c.rig.heldTrayAnchor.children.length ? -0.75 : -swing * 0.7;
        c.rig.rightArmPivot.rotation.x = c.rig.heldTrayAnchor.children.length ? -0.75 : swing * 0.7;
      } else {
        c.rig.leftLegPivot.rotation.x = THREE.MathUtils.damp(c.rig.leftLegPivot.rotation.x, 0, 10, delta);
        c.rig.rightLegPivot.rotation.x = THREE.MathUtils.damp(c.rig.rightLegPivot.rotation.x, 0, 10, delta);

        if (c.phase === 'entering') {
          c.phase = 'queuing';
          c.rig.statusHalo.visible = true;
          (c.rig.statusHalo.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
        } else if (c.phase === 'queuing' || c.phase === 'waiting-food') {
          // Face counter (-Z)
          const faceYaw = Math.PI;
          let diff = ((faceYaw - c.rig.group.rotation.y + Math.PI) % (Math.PI * 2)) - Math.PI;
          if (diff < -Math.PI) diff += Math.PI * 2;
          c.rig.group.rotation.y += diff * Math.min(1, delta * 7);

          c.rig.statusHalo.visible = true;
          c.rig.statusHalo.position.y = 1.88 + Math.sin(elapsed * 4) * 0.03;

          if (c.phase === 'waiting-food') {
            const ratio = c.patience / c.maxPatience;
            (c.rig.statusHalo.material as THREE.MeshBasicMaterial).color.setHex(
              ratio > 0.45 ? 0xf59e0b : 0xef4444
            );
          }

          if (!this.tutorialMode) {
            c.patience -= delta;
          }
          if (c.patience <= 0) {
            if (c.phase === 'waiting-food') {
              this.ordersMissed += 1;
              this.streak = 0;
              const penalty = 0.25 + Math.min(0.25, (this.shiftNumber - 1) * 0.015);
              this.rating = Math.max(1.0, Number((this.rating - penalty).toFixed(2)));
              const slip = this.ticketSlipMeshes.get(c.ticketId);
              if (slip) {
                this.kitchen.ticketRailGroup.remove(slip);
                this.ticketSlipMeshes.delete(c.ticketId);
              }
            }
            c.rig.statusHalo.visible = false;
            c.phase = 'leaving';
            c.targetPos.set((Math.random() - 0.5) * 4, 0, 8.0);
            this.showToast(`${c.name} left — waited too long!`);
          }
        } else if (c.phase === 'walking-booth') {
          c.phase = 'eating';
        } else if (c.phase === 'eating') {
          c.eatTimer -= delta;
          if (c.eatTimer <= 0) {
            c.boothSeatPos = null;
            c.phase = 'leaving';
            c.targetPos.set(0, 0, 8.2);
          }
        } else if (c.phase === 'leaving') {
          this.scene.remove(c.rig.group);
          this.customers.splice(i, 1);
        }
      }
    }
  }

  private spawnCustomer(forcedItem?: MenuItemId) {
    const id = `cust-${this.nextTicketId}`;
    const ticketId = this.nextTicketId++;
    const name = CUSTOMER_NAMES[ticketId % CUSTOMER_NAMES.length];
    const orderItem = forcedItem ?? this.pickOrderItem();

    const rig = buildCustomerRig(
      id,
      SHIRT_COLORS[ticketId % SHIRT_COLORS.length],
      PANTS_COLORS[ticketId % PANTS_COLORS.length],
      SKIN_COLORS[ticketId % SKIN_COLORS.length],
      HAIR_COLORS[ticketId % HAIR_COLORS.length],
      `${name} — ${ARBISH_MENU[orderItem].shortName}`
    );

    const startX = (Math.random() - 0.5) * 3.5;
    rig.group.position.set(startX, 0, 7.6);
    this.scene.add(rig.group);

    // Queue position near register
    const queueIdx = this.customers.filter(
      (c) => c.phase === 'entering' || c.phase === 'queuing'
    ).length;
    const queuePos = new THREE.Vector3(-1.25 - queueIdx * 0.72, 0, 1.15);

    const maxPatience = Math.max(58, 185 - (this.shiftNumber - 1) * 3.2);
    this.customers.push({
      id,
      name,
      rig,
      phase: 'entering',
      targetPos: queuePos,
      orderItem,
      ticketId,
      patience: maxPatience,
      maxPatience,
      eatTimer: 0,
      walkPhase: 0,
      boothSeatPos: null,
    });
    soundEngine.playDoorChime();
  }

  private spawnOnlineOrder(forcedItem?: MenuItemId) {
    const id = this.nextTicketId++;
    const customerName = CUSTOMER_NAMES[id % CUSTOMER_NAMES.length];
    const platform = ONLINE_PLATFORMS[id % ONLINE_PLATFORMS.length];
    const neighborhood = MAKKAH_NEIGHBORHOODS[id % MAKKAH_NEIGHBORHOODS.length];
    const driverName = ONLINE_DRIVERS[id % ONLINE_DRIVERS.length];
    const orderItem = forcedItem ?? this.pickOrderItem();
    const def = ARBISH_MENU[orderItem];
    const payout = Number((def.price + 6.0 + def.price * 0.12).toFixed(2));
    const offerTime = Math.max(18, 38 - (this.shiftNumber - 1) * 0.45);

    this.onlineOrders.push({
      id,
      customerName,
      platform,
      neighborhood,
      driverName,
      payout,
      status: 'pending',
      orderItem,
      patience: offerTime,
      maxPatience: offerTime,
    });

    soundEngine.playReadyDing();
    this.showToast(
      `Incoming ${platform} #${id} (${neighborhood}) — ${def.shortName} (${payout.toFixed(2)} SAR)`
    );
  }

  private spawnSteam(x: number, y: number, z: number) {
    const p = this.steamPool.find((s) => !s.active);
    if (!p) return;
    p.active = true;
    p.life = 0;
    p.maxLife = 0.9 + Math.random() * 0.5;
    p.vx = (Math.random() - 0.5) * 0.14;
    p.vy = 0.42 + Math.random() * 0.25;
    p.vz = (Math.random() - 0.5) * 0.14;
    p.mesh.position.set(x + (Math.random() - 0.5) * 0.1, y, z + (Math.random() - 0.5) * 0.1);
    p.mesh.scale.setScalar(0.6);
    p.mesh.visible = true;
  }

  private updateSteamParticles(delta: number) {
    for (const p of this.steamPool) {
      if (!p.active) continue;
      p.life += delta;
      if (p.life >= p.maxLife) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }
      const t = p.life / p.maxLife;
      p.mesh.position.x += p.vx * delta;
      p.mesh.position.y += p.vy * delta;
      p.mesh.position.z += p.vz * delta;
      p.mesh.scale.setScalar(0.6 + t * 1.6);
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.sin(t * Math.PI) * 0.34;
    }
  }

  private updateDoors(delta: number) {
    // Also open doors if player walks near the entrance
    if (Math.abs(this.playerPos.x) < 1.6 && this.playerPos.z > 3.2 && this.playerPos.z < 5.9) {
      this.doorOpenAmount = Math.max(this.doorOpenAmount, 1.35);
    }

    const targetAngle = this.doorOpenAmount > 0 ? Math.PI * 0.46 : 0;
    this.doorOpenAmount = Math.max(0, this.doorOpenAmount - delta);

    this.building.leftDoorPivot.rotation.y = THREE.MathUtils.damp(
      this.building.leftDoorPivot.rotation.y,
      -targetAngle,
      6,
      delta
    );
    this.building.rightDoorPivot.rotation.y = THREE.MathUtils.damp(
      this.building.rightDoorPivot.rotation.y,
      targetAngle,
      6,
      delta
    );
  }

  private getContextualPrompt(): { main: string | null; sub: string | null } {
    const t = this.hoveredTarget;
    if (!t) return { main: null, sub: null };

    if (t.kind === 'grill-slot') {
      const slot = this.grillSlots[t.slotIndex ?? 0];
      if (slot.state === 'empty') {
        return {
          main: this.heldItem === 'raw-patty' ? 'Place Raw Patty on Grill' : 'Empty Grill Zone',
          sub: this.heldItem === 'raw-patty' ? 'Click or press E' : 'Grab Raw Patty from Fridge',
        };
      }
      if (slot.state === 'ready') {
        return { main: 'Pick Up Seared Patty', sub: 'Ready! Click or press E' };
      }
      if (slot.state === 'burnt') {
        return { main: 'Remove Charred Patty', sub: 'Click to pick up & trash' };
      }
      return { main: 'Patty Searing on Flat-Top', sub: `${Math.round((slot.timer / 6) * 100)}% cooked` };
    }

    if (t.kind === 'bun-toaster') {
      if (this.bunToaster.state === 'empty') {
        return {
          main: this.heldItem === 'raw-bun' ? 'Toast Brioche Bun' : 'Bun Toaster Plate',
          sub: this.heldItem === 'raw-bun' ? 'Click or press E' : 'Grab Brioche Bun from Fridge',
        };
      }
      if (this.bunToaster.state === 'ready') {
        return { main: 'Pick Up Toasted Bun', sub: 'Ready! Click or press E' };
      }
      return { main: 'Toasting Brioche Bun...', sub: 'Almost ready' };
    }

    if (t.kind === 'fryer-slot') {
      const slot = this.fryerSlots[t.slotIndex ?? 0];
      const name =
        slot.kind === 'fries'
          ? 'Fries'
          : slot.kind === 'chicken'
            ? 'Chicken Strips'
            : 'Crispy Sides';
      if (slot.state === 'idle') return { main: `Drop ${name} Basket`, sub: 'Click or press E' };
      if (slot.state === 'frying') return { main: `Frying ${name}...`, sub: `${Math.round((slot.timer / 5.5) * 100)}% crisp` };
      if (slot.state === 'ready') return { main: `Lift & Grab ${name}`, sub: 'Crispy & Ready!' };
      return { main: `Dump Burnt ${name}`, sub: 'Click to reset vat' };
    }

    if (t.kind === 'soda-dispenser') {
      if (this.drinkState.state === 'ready') {
        return { main: 'Take Chilled Soda Cup', sub: 'Click or press E' };
      }
      if (this.drinkState.state === 'filling') {
        return { main: `Pouring ${this.drinkState.flavor}...`, sub: 'Filling cup' };
      }
      return { main: `Pour ${t.flavor ?? 'Cola'} Soda`, sub: 'Click or press E' };
    }

    if (t.kind === 'online-tablet') {
      return {
        main: 'Online Delivery Tablet',
        sub: `${this.onlineOrders.length} active · Click to receive a new Makkah app order`,
      };
    }

    if (t.kind === 'online-dispatch') {
      const heldMenu = this.getHeldMenuItem();
      if (heldMenu && this.onlineOrders.some((o) => o.orderItem === heldMenu)) {
        return {
          main: `Dispatch Online ${ARBISH_MENU[heldMenu].shortName}`,
          sub: 'Click or press E to send out delivery!',
        };
      }
      return {
        main: 'Online Delivery Dispatch Pad',
        sub: this.onlineOrders.length
          ? `${this.onlineOrders.length} online order(s) waiting — bring prepared tray`
          : 'No online orders queued yet',
      };
    }

    if (t.kind === 'storage-patty') {
      return {
        main: 'Storage: Frozen Beef Patty Crate',
        sub: this.heldItem ? 'Hands full' : 'Click or press E to grab patty',
      };
    }

    if (t.kind === 'storage-bun') {
      return {
        main: 'Storage: Brioche Bun Rack',
        sub: this.heldItem ? 'Hands full' : 'Click or press E to grab bun',
      };
    }

    if (t.kind === 'storage-cooler') {
      return {
        main: 'Walk-In Freezer (-18°C)',
        sub: 'Click or press E to inspect stock',
      };
    }

    return { main: t.label, sub: 'Click or press E' };
  }

  private getShiftClockLabel(): string {
    const progress = 1 - THREE.MathUtils.clamp(this.shiftTimeLeft / this.shiftDuration, 0, 1);
    // Simulate Arbish Bites Makkah full day-to-night cycle: 12:00 PM -> 3:00 AM (15 hours = 900 mins)
    const startMin = 12 * 60;
    const curMin = Math.floor(startMin + progress * 900) % (24 * 60);
    const h24 = Math.floor(curMin / 60);
    const m = curMin % 60;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  private emitHud(force: boolean) {
    if (this.disposed) return;
    const prompt = this.getContextualPrompt();
    const walkInTickets: OrderTicket[] = this.customers
      .filter((c) => c.phase === 'queuing' || c.phase === 'waiting-food')
      .map((c) => ({
        id: c.ticketId,
        customerId: c.id,
        customerName: c.name,
        itemId: c.orderItem,
        taken: c.phase === 'waiting-food',
        source: 'walk-in',
        patience: Math.max(0, c.patience),
        maxPatience: c.maxPatience,
        createdAt: c.ticketId,
      }));

    const onlineTickets: OrderTicket[] = this.onlineOrders.map((o) => ({
      id: o.id,
      customerId: `online-${o.id}`,
      customerName: o.customerName,
      itemId: o.orderItem,
      taken: o.status === 'accepted',
      source: 'online',
      platform: o.platform,
      neighborhood: o.neighborhood,
      driverName: o.driverName,
      payout: o.payout,
      patience: Math.max(0, o.patience),
      maxPatience: o.maxPatience,
      createdAt: o.id,
    }));

    const tickets = [...walkInTickets, ...onlineTickets].sort((a, b) => a.createdAt - b.createdAt);

    const grillSlots: GrillSlotSnapshot[] = this.grillSlots.map((s, index) => ({
      index,
      state: s.state,
      progress: Math.min(1, s.timer / 6),
    }));

    const fryerSlots: FryerSlotSnapshot[] = this.fryerSlots.map((s, index) => ({
      index,
      kind: s.kind,
      state: s.state,
      progress: Math.min(1, s.timer / (s.kind === 'fries' ? 5.2 : 6)),
    }));

    const drinkSlot: DrinkSlotSnapshot = {
      state: this.drinkState.state,
      flavor: this.drinkState.flavor,
      progress: Math.min(1, this.drinkState.timer / 2.2),
    };

    const tut = this.tutorialMode ? TUTORIAL_STEPS[this.tutorialStep] : null;

    const snapshot: GameHudSnapshot = {
      phase: this.phase,
      shiftNumber: this.shiftNumber,
      shiftClockLabel: this.getShiftClockLabel(),
      shiftTimeLeft: Math.ceil(this.shiftTimeLeft),
      money: this.money,
      tips: this.tips,
      ordersServed: this.ordersServed,
      ordersMissed: this.ordersMissed,
      streak: this.streak,
      bestStreak: this.bestStreak,
      rating: this.rating,
      tutorialMode: this.tutorialMode,
      tutorialStep: this.tutorialStep,
      tutorialTitle: tut ? tut.title : null,
      tutorialHint: tut ? tut.hint : null,
      heldItem: this.heldItem,
      heldLabel: this.heldItem ? HAND_ITEM_LABELS[this.heldItem] : 'Hands Empty',
      hoverPrompt: prompt.main,
      hoverSubPrompt: prompt.sub,
      activeStation: this.activeStation,
      isPointerLocked: this.isPointerLocked,
      freeMouseLook: this.freeMouseLook,
      freeCam: this.freeCam,
      cameraFov: Math.round(this.targetFov),
      tickets,
      onlineOrdersEnabled: this.onlineOrdersEnabled,
      onlineDispatched: this.onlineDispatched,
      grillSlots,
      fryerSlots,
      assembly: {
        layers: [...this.assemblyLayers],
        matchedItem: this.detectAssemblyMatch(),
      },
      drinkSlot,
      toastMessage: this.toastMessage,
    };

    if (force || this.phase === 'playing') {
      this.onHudUpdate(snapshot);
    }
  }

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    document.removeEventListener('pointerlockerror', this.onPointerLockError);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);

    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointerdown', this.onPointerDown);
    canvas.removeEventListener('contextmenu', this.onContextMenu);
    canvas.removeEventListener('wheel', this.onWheel);
    canvas.removeEventListener('webglcontextlost', this.onContextLost);
    canvas.removeEventListener('webglcontextrestored', this.onContextRestored);

    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else {
          m.material?.dispose();
        }
      }
    });

    this.composer?.dispose();
    this.envRT?.dispose();
    this.renderer.dispose();
    if (canvas.parentElement === this.container) {
      this.container.removeChild(canvas);
    }
  }
}
