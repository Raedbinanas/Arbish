import * as THREE from 'three';
import {
  createArbishBowlTexture,
  createArbishCupTexture,
  createArbishFacadeSignTexture,
  createArbishSignEmissiveTexture,
  createArbishTrayPaperTexture,
  createArcadeScreenTexture,
  createAsphaltPuddleTextures,
  createBeefPattyTexture,
  createBrushedMetalTextures,
  createCounterTvScreenTexture,
  createCrateLabelTexture,
  createDiningTileTexture,
  createDoorDecalTexture,
  createKitchenFloorTexture,
  createLeatherBumpTexture,
  createLoftNeonTexture,
  createMenuBoardTexture,
  createNeonScriptSignTexture,
  createNeonWindowSignTexture,
  createRightDoorMakkahDecalTexture,
  createSesameBunTexture,
  createSidewalkBoardTexture,
  createSidewalkConcreteTextures,
  createStorageSignTexture,
  createStuccoBumpTexture,
  createSubwayBumpTexture,
  createSubwayTileTexture,
  createWallArtTexture,
  createWoodBoardTexture,
  createWoodPlankTextures,
  createWoodSlatTexture,
} from './textures';
import { IngredientId, MenuItemId } from './types';

export interface InteractiveTarget {
  id: string;
  kind:
    | 'register'
    | 'serve-pass'
    | 'online-tablet'
    | 'online-dispatch'
    | 'fridge-patty'
    | 'fridge-bun'
    | 'grill-slot'
    | 'bun-toaster'
    | 'fryer-slot'
    | 'prep-ingredient'
    | 'prep-plate'
    | 'prep-clear'
    | 'soda-cup-stack'
    | 'soda-dispenser'
    | 'trash'
    | 'customer'
    | 'door'
    | 'storage-patty'
    | 'storage-bun'
    | 'storage-cooler';
  slotIndex?: number;
  ingredient?: IngredientId;
  flavor?: 'Cola' | 'Citrus' | 'Berry';
  customerId?: string;
  label: string;
}

export function tagInteractive(obj: THREE.Object3D, target: InteractiveTarget) {
  obj.userData.interactive = target;
  obj.traverse((child) => {
    child.userData.interactive = target;
  });
}

export interface BuildingRefs {
  group: THREE.Group;
  leftDoorPivot: THREE.Group;
  rightDoorPivot: THREE.Group;
  signMesh: THREE.Mesh;
  skyUniforms: {
    uZenithColor: { value: THREE.Color };
    uHorizonColor: { value: THREE.Color };
    uGroundColor: { value: THREE.Color };
  };
  starsMat: THREE.PointsMaterial;
  sunDisc: THREE.Mesh;
  moonDisc: THREE.Mesh;
  streetLampGlowMat: THREE.MeshStandardMaterial;
  skylineWindowMat: THREE.MeshStandardMaterial;
  facadeSignMat: THREE.MeshStandardMaterial;
  canopyLedMat: THREE.MeshStandardMaterial;
  lanternMat: THREE.MeshStandardMaterial;
}

function buildPlanter(x: number, z: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  const potMat = new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: 0.45, metalness: 0.2 });
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x2b1d12, roughness: 0.95 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.55 });
  const brightLeafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });

  const pot = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.52, 0.48), potMat);
  pot.position.y = 0.26;
  pot.castShadow = true;
  g.add(pot);

  const rim = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.05, 0.52), potMat);
  rim.position.y = 0.52;
  g.add(rim);

  const soil = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.42), soilMat);
  soil.position.y = 0.51;
  g.add(soil);

  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.42, 6),
      i % 2 === 0 ? leafMat : brightLeafMat
    );
    leaf.position.set(Math.cos(angle) * 0.1, 0.72 + (i % 2) * 0.08, Math.sin(angle) * 0.1);
    leaf.rotation.z = Math.cos(angle) * -0.45;
    leaf.rotation.x = Math.sin(angle) * 0.45;
    g.add(leaf);
  }
  return g;
}

function buildDeliveryScooter(x: number, z: number): THREE.Group {
  const scooter = new THREE.Group();
  scooter.position.set(x, 0, z);
  scooter.rotation.y = Math.PI * 0.34;

  const tireMat = new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.85 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.85, roughness: 0.25 });
  const redPaint = new THREE.MeshPhysicalMaterial({
    color: 0xdc2626,
    metalness: 0.4,
    roughness: 0.25,
    clearcoat: 0.8,
  });
  const blackTrim = new THREE.MeshStandardMaterial({ color: 0x1f2024, roughness: 0.5 });

  // Front & Rear Wheels
  [-0.58, 0.58].forEach((wz) => {
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.075, 10, 20), tireMat);
    tire.rotation.y = Math.PI / 2;
    tire.position.set(0, 0.29, wz);
    tire.castShadow = true;
    scooter.add(tire);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 12), rimMat);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(0, 0.29, wz);
    scooter.add(rim);
  });

  // Floorboard & Rear Body
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.76), blackTrim);
  deck.position.set(0, 0.32, 0);
  scooter.add(deck);

  const rearBody = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.38, 0.72), redPaint);
  rearBody.position.set(0, 0.55, -0.35);
  rearBody.castShadow = true;
  scooter.add(rearBody);

  // Seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.52), blackTrim);
  seat.position.set(0, 0.78, -0.18);
  scooter.add(seat);

  // Front Shield & Steering Column
  const frontShield = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.65, 0.24), redPaint);
  frontShield.position.set(0, 0.68, 0.45);
  frontShield.rotation.x = -0.2;
  frontShield.castShadow = true;
  scooter.add(frontShield);

  const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.68, 10), rimMat);
  handlebar.rotation.z = Math.PI / 2;
  handlebar.position.set(0, 1.06, 0.38);
  scooter.add(handlebar);

  // Glowing Headlight & Taillight
  const headlight = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xfde68a,
      emissiveIntensity: 2.2,
    })
  );
  headlight.position.set(0, 0.92, 0.55);
  scooter.add(headlight);

  const taillight = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.07, 0.04),
    new THREE.MeshStandardMaterial({
      color: 0xff2222,
      emissive: 0xef4444,
      emissiveIntensity: 2.0,
    })
  );
  taillight.position.set(0, 0.65, -0.72);
  scooter.add(taillight);

  // Rear Arbish Bites Insulated Delivery Box
  const deliveryBox = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.42, 0.46), redPaint);
  deliveryBox.position.set(0, 1.02, -0.58);
  deliveryBox.castShadow = true;
  scooter.add(deliveryBox);

  const boxBand = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.48), blackTrim);
  boxBand.position.set(0, 1.02, -0.58);
  scooter.add(boxBand);

  return scooter;
}

export function buildArbishEnvironment(
  anisotropy: number,
  isSoftwareGl: boolean
): BuildingRefs {
  const group = new THREE.Group();

  // Dynamic Day-to-Night Makkah Sky Dome + Stars + Sun & Moon
  const skyUniforms = {
    uZenithColor: { value: new THREE.Color(0x0b1528) },
    uHorizonColor: { value: new THREE.Color(0x282136) },
    uGroundColor: { value: new THREE.Color(0x0d0f17) },
  };
  const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(64, 24, 16),
    new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      vertexShader: `
        varying float vH;
        void main() {
          vH = normalize(position).y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uZenithColor;
        uniform vec3 uHorizonColor;
        uniform vec3 uGroundColor;
        varying float vH;
        void main() {
          float up = clamp(vH, 0.0, 1.0);
          float down = clamp(-vH, 0.0, 1.0);
          vec3 col = mix(uHorizonColor, uZenithColor, pow(up, 0.65));
          col = mix(col, uGroundColor, smoothstep(0.0, 0.25, down));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
    })
  );
  group.add(skyDome);

  const starPositions: number[] = [];
  for (let i = 0; i < 240; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(0.12 + Math.random() * 0.88);
    const r = 61;
    starPositions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starsMat = new THREE.PointsMaterial({
    color: 0xe8f1ff,
    size: 0.42,
    transparent: true,
    opacity: 0.7,
    fog: false,
    depthWrite: false,
  });
  const starPoints = new THREE.Points(starGeo, starsMat);
  group.add(starPoints);

  const sunDisc = new THREE.Mesh(
    new THREE.SphereGeometry(2.1, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xfff3c4, fog: false })
  );
  sunDisc.position.set(16, 26, -34);
  group.add(sunDisc);

  const moonDisc = new THREE.Mesh(
    new THREE.SphereGeometry(1.45, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xe2e8f0, fog: false })
  );
  moonDisc.position.set(-18, 22, -34);
  group.add(moonDisc);

  // Realistic PBR Materials
  const whiteFacadeMat = new THREE.MeshStandardMaterial({
    color: 0xf4f4f1,
    bumpMap: createStuccoBumpTexture(anisotropy),
    bumpScale: 0.012,
    roughness: 0.78,
    metalness: 0.03,
  });
  const blackFrameMat = new THREE.MeshStandardMaterial({
    color: 0x151619,
    roughness: 0.32,
    metalness: 0.72,
    envMapIntensity: 1.2,
  });
  const subwayWallMat = new THREE.MeshPhysicalMaterial({
    map: createSubwayTileTexture(anisotropy),
    bumpMap: createSubwayBumpTexture(anisotropy),
    bumpScale: 0.024,
    roughness: 0.24,
    metalness: 0.08,
    clearcoat: 0.35,
    clearcoatRoughness: 0.2,
  });
  const woodSlatMat = new THREE.MeshStandardMaterial({
    map: createWoodSlatTexture(anisotropy),
    roughness: 0.6,
    metalness: 0.05,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xdbeafe,
    roughness: 0.05,
    metalness: 0.04,
    transparent: true,
    opacity: isSoftwareGl ? 0.26 : 0.2,
    transmission: isSoftwareGl ? 0 : 0.35,
    ior: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    reflectivity: 0.9,
    envMapIntensity: 1.4,
    depthWrite: false,
  });

  // =========================================================================
  // FLOORS (Polished Checkered Diner Floor + Commercial Kitchen Floor)
  // =========================================================================
  const diningTex = createDiningTileTexture(anisotropy);
  const diningFloorMat = new THREE.MeshPhysicalMaterial({
    map: diningTex.map,
    roughnessMap: diningTex.roughnessMap,
    roughness: 0.28,
    metalness: 0.08,
    clearcoat: 0.45,
    clearcoatRoughness: 0.22,
  });
  const diningFloor = new THREE.Mesh(new THREE.PlaneGeometry(12, 5.2), diningFloorMat);
  diningFloor.rotation.x = -Math.PI / 2;
  diningFloor.position.set(0, 0, 2.0);
  diningFloor.receiveShadow = true;
  group.add(diningFloor);

  const kitchenFloorMat = new THREE.MeshStandardMaterial({
    map: createKitchenFloorTexture(anisotropy),
    roughness: 0.55,
    metalness: 0.14,
  });
  const kitchenFloor = new THREE.Mesh(new THREE.PlaneGeometry(12, 5.4), kitchenFloorMat);
  kitchenFloor.rotation.x = -Math.PI / 2;
  kitchenFloor.position.set(0, 0.004, -3.1);
  kitchenFloor.receiveShadow = true;
  group.add(kitchenFloor);

  // Sidewalk & Wet-Sheen Evening Street with Puddle Reflections
  const sidewalkTex = createSidewalkConcreteTextures(anisotropy);
  const sidewalkMat = new THREE.MeshStandardMaterial({
    map: sidewalkTex.map,
    bumpMap: sidewalkTex.bumpMap,
    roughnessMap: sidewalkTex.roughnessMap,
    bumpScale: 0.018,
    roughness: 0.85,
    metalness: 0.04,
  });
  const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(38, 0.14, 4.4), sidewalkMat);
  sidewalk.position.set(0, -0.07, 6.7);
  sidewalk.receiveShadow = true;
  group.add(sidewalk);

  const curbMat = new THREE.MeshStandardMaterial({ color: 0x5c6068, roughness: 0.8 });
  const curb = new THREE.Mesh(new THREE.BoxGeometry(38, 0.16, 0.26), curbMat);
  curb.position.set(0, -0.06, 8.95);
  curb.receiveShadow = true;
  group.add(curb);

  const asphaltTex = createAsphaltPuddleTextures(anisotropy);
  const asphaltMat = new THREE.MeshStandardMaterial({
    map: asphaltTex.map,
    bumpMap: asphaltTex.bumpMap,
    roughnessMap: asphaltTex.roughnessMap,
    bumpScale: 0.014,
    roughness: 0.9,
    metalness: 0.12,
    envMapIntensity: 1.35,
  });
  const street = new THREE.Mesh(new THREE.PlaneGeometry(66, 26), asphaltMat);
  street.rotation.x = -Math.PI / 2;
  street.position.set(0, -0.14, 21.8);
  street.receiveShadow = true;
  group.add(street);

  // Street lane dashes
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.65 });
  for (let x = -24; x <= 24; x += 3.8) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.16), stripeMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(x, -0.13, 14.2);
    group.add(stripe);
  }

  // Pedestrian Crosswalk Bars & Curbside Storm Drain Grate
  const crosswalkMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.72 });
  for (let cz = 9.7; cz <= 13.3; cz += 0.9) {
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.42), crosswalkMat);
    bar.rotation.x = -Math.PI / 2;
    bar.position.set(8.6, -0.132, cz);
    group.add(bar);
  }
  const drainGrate = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.02, 0.46),
    new THREE.MeshStandardMaterial({ color: 0x262930, metalness: 0.8, roughness: 0.4 })
  );
  drainGrate.position.set(4.6, -0.13, 9.35);
  group.add(drainGrate);

  const groundExtend = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 70),
    new THREE.MeshStandardMaterial({ color: 0x151821, roughness: 0.95 })
  );
  groundExtend.rotation.x = -Math.PI / 2;
  groundExtend.position.set(0, -0.16, 0);
  group.add(groundExtend);

  // =========================================================================
  // INTERIOR ARCHITECTURAL WALLS, STORAGE ROOM WING & ARCHWAY
  // =========================================================================
  // Kitchen Back Wall left of Storage Doorway (X = -6.05 to +4.40)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(10.45, 4.25, 0.25), subwayWallMat);
  backWall.position.set(-0.825, 2.125, -5.65);
  backWall.receiveShadow = true;
  group.add(backWall);

  // Storage Room Doorway Lintel & Brushed-Steel Jambs (Doorway open at X = 4.40 to 5.95)
  const storageLintel = new THREE.Mesh(new THREE.BoxGeometry(1.72, 1.85, 0.25), subwayWallMat);
  storageLintel.position.set(5.26, 3.325, -5.65);
  group.add(storageLintel);

  const jambMat = new THREE.MeshStandardMaterial({ color: 0x3b3f47, metalness: 0.78, roughness: 0.3 });
  [4.44, 5.88].forEach((jx) => {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 0.3), jambMat);
    jamb.position.set(jx, 1.2, -5.65);
    group.add(jamb);
  });
  const doorHeaderBar = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.08, 0.3), jambMat);
  doorHeaderBar.position.set(5.16, 2.42, -5.65);
  group.add(doorHeaderBar);

  const storageSign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.16, 0.36),
    new THREE.MeshStandardMaterial({
      map: createStorageSignTexture(anisotropy),
      emissive: 0xffffff,
      emissiveMap: createStorageSignTexture(anisotropy),
      emissiveIntensity: 0.25,
      roughness: 0.35,
    })
  );
  storageSign.position.set(5.16, 2.74, -5.5);
  group.add(storageSign);

  // Walkable Back-of-House Storage Room (X: 0.6..6.0, Z: -5.65..-9.05)
  const storageFloorMat = new THREE.MeshStandardMaterial({
    map: createKitchenFloorTexture(anisotropy),
    color: 0x6b7280,
    roughness: 0.72,
    metalness: 0.08,
  });
  const storageFloor = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 3.5), storageFloorMat);
  storageFloor.rotation.x = -Math.PI / 2;
  storageFloor.position.set(3.3, 0.005, -7.35);
  storageFloor.receiveShadow = true;
  group.add(storageFloor);

  const storageWallMat = new THREE.MeshStandardMaterial({ color: 0x2a2d34, roughness: 0.85 });
  const storageBackWall = new THREE.Mesh(new THREE.BoxGeometry(5.65, 4.25, 0.25), storageWallMat);
  storageBackWall.position.set(3.3, 2.125, -9.08);
  storageBackWall.receiveShadow = true;
  group.add(storageBackWall);

  const storageLeftWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.25, 3.65), storageWallMat);
  storageLeftWall.position.set(0.62, 2.125, -7.35);
  group.add(storageLeftWall);

  const storageRightWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.25, 3.65), storageWallMat);
  storageRightWall.position.set(6.0, 2.125, -7.35);
  group.add(storageRightWall);

  const storageCeiling = new THREE.Mesh(
    new THREE.BoxGeometry(5.65, 0.2, 3.65),
    new THREE.MeshStandardMaterial({ color: 0x16181e, roughness: 0.88 })
  );
  storageCeiling.position.set(3.3, 4.15, -7.35);
  group.add(storageCeiling);

  // Dim industrial utility light bar inside Storage Room
  const storageTube = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.06, 0.14),
    new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0xbae6fd,
      emissiveIntensity: 0.75,
    })
  );
  storageTube.position.set(3.3, 4.02, -7.35);
  group.add(storageTube);

  // Walk-In Freezer / Cooler Door on Storage Left Wall (X = 0.76, Z = -7.35)
  const coolerGroup = new THREE.Group();
  coolerGroup.position.set(0.76, 0, -7.35);
  const coolerDoorMat = new THREE.MeshStandardMaterial({
    color: 0xb8bec7,
    metalness: 0.82,
    roughness: 0.34,
  });
  const coolerDoor = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.15, 1.25), coolerDoorMat);
  coolerDoor.position.set(0, 1.075, 0);
  coolerGroup.add(coolerDoor);
  const coolerFrame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.26, 1.38), jambMat);
  coolerFrame.position.set(-0.03, 1.13, 0);
  coolerGroup.add(coolerFrame);
  const coolerHandle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.05), jambMat);
  coolerHandle.position.set(0.08, 1.05, 0.48);
  coolerGroup.add(coolerHandle);
  const coolerWindow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.42),
    new THREE.MeshStandardMaterial({ color: 0xbae6fd, emissive: 0x38bdf8, emissiveIntensity: 0.22 })
  );
  coolerWindow.rotation.y = Math.PI / 2;
  coolerWindow.position.set(0.06, 1.55, 0);
  coolerGroup.add(coolerWindow);
  const tempDisplay = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.1, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x052e16, emissive: 0x22c55e, emissiveIntensity: 0.85 })
  );
  tempDisplay.position.set(0.04, 2.02, 0.48);
  coolerGroup.add(tempDisplay);
  tagInteractive(coolerGroup, {
    id: 'storage-cooler',
    kind: 'storage-cooler',
    label: 'Walk-In Freezer (-18°C)',
  });
  group.add(coolerGroup);

  // Storage Wire Shelving Racks & Stocked Inventory Boxes
  const crateFriesTex = createCrateLabelTexture(anisotropy, 'BUCKET FRIES', '#DC2626');
  const crateBunsTex = createCrateLabelTexture(anisotropy, 'BRIOCHE BUNS', '#D97706');
  const crateSauceTex = createCrateLabelTexture(anisotropy, 'ARBISH SAUCES', '#1F2937');
  const rackMetalMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.82, roughness: 0.35 });

  const buildStorageRack = (rx: number, rz: number, rotY = 0) => {
    const rack = new THREE.Group();
    rack.position.set(rx, 0, rz);
    rack.rotation.y = rotY;
    const w = 1.65;
    const d = 0.56;
    [
      [-w / 2 + 0.03, -d / 2 + 0.03],
      [w / 2 - 0.03, -d / 2 + 0.03],
      [-w / 2 + 0.03, d / 2 - 0.03],
      [w / 2 - 0.03, d / 2 - 0.03],
    ].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 2.15, 8), rackMetalMat);
      post.position.set(px, 1.075, pz);
      rack.add(post);
    });
    [0.2, 0.82, 1.44, 2.05].forEach((sy) => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, d), rackMetalMat);
      shelf.position.set(0, sy, 0);
      shelf.castShadow = true;
      shelf.receiveShadow = true;
      rack.add(shelf);
    });
    group.add(rack);
    return rack;
  };

  const rack1 = buildStorageRack(2.05, -8.58, 0);
  const rack2 = buildStorageRack(3.95, -8.58, 0);
  const rack3 = buildStorageRack(5.55, -7.35, Math.PI / 2);

  // Stocked Cartons on Rack 1 (Interactive Frozen Patty Crate + Fries Boxes)
  const storagePattyCrate = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.34, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.45 })
  );
  storagePattyCrate.position.set(-0.4, 1.01, 0);
  tagInteractive(storagePattyCrate, {
    id: 'storage-patty',
    kind: 'storage-patty',
    label: 'Restock Beef Patty Crate',
  });
  rack1.add(storagePattyCrate);

  const friesCase1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.36, 0.44),
    new THREE.MeshStandardMaterial({ map: crateFriesTex, roughness: 0.72 })
  );
  friesCase1.position.set(0.35, 1.02, 0);
  rack1.add(friesCase1);

  const friesCase2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.36, 0.44),
    new THREE.MeshStandardMaterial({ map: crateFriesTex, roughness: 0.72 })
  );
  friesCase2.position.set(-0.35, 1.64, 0);
  rack1.add(friesCase2);

  // Stacked Red Fry Buckets on Rack 1 Top Shelf
  for (let b = 0; b < 4; b++) {
    const bucket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.08, 0.2, 14),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45 })
    );
    bucket.position.set(0.25 + b * 0.12, 2.16, 0);
    rack1.add(bucket);
  }

  // Stocked Cartons on Rack 2 (Interactive Brioche Bun Tray + Sauces + Oil Jugs)
  const storageBunCrate = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.32, 0.44),
    new THREE.MeshStandardMaterial({ map: crateBunsTex, roughness: 0.68 })
  );
  storageBunCrate.position.set(-0.38, 1.0, 0);
  tagInteractive(storageBunCrate, {
    id: 'storage-bun',
    kind: 'storage-bun',
    label: 'Restock Brioche Bun Crate',
  });
  rack2.add(storageBunCrate);

  const sauceCase = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.36, 0.44),
    new THREE.MeshStandardMaterial({ map: crateSauceTex, roughness: 0.72 })
  );
  sauceCase.position.set(0.38, 1.02, 0);
  rack2.add(sauceCase);

  [0, 1].forEach((j) => {
    const oilJug = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.38, 0.22),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35 })
    );
    oilJug.position.set(-0.45 + j * 0.28, 0.41, 0);
    rack2.add(oilJug);
  });

  // Rack 3 (Right Wall): Soda Syrup Canisters & Takeout Paper Bags
  [0, 1, 2].forEach((c) => {
    const canister = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.48, 14),
      new THREE.MeshStandardMaterial({ color: c === 0 ? 0xdc2626 : c === 1 ? 0x16a34a : 0x2563eb, metalness: 0.5, roughness: 0.35 })
    );
    canister.position.set(-0.45 + c * 0.34, 0.46, 0);
    rack3.add(canister);
  });
  const bagCase = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.36, 0.44),
    new THREE.MeshStandardMaterial({ map: crateSauceTex, roughness: 0.75 })
  );
  bagCase.position.set(0.2, 1.02, 0);
  rack3.add(bagCase);

  // Wooden Pallet + Extra Flour/Salt Sacks on Storage Floor (X = 1.9, Z = -6.55)
  const pallet = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.08, 0.75),
    new THREE.MeshStandardMaterial({ color: 0x7c5836, roughness: 0.85 })
  );
  pallet.position.set(2.05, 0.04, -6.55);
  group.add(pallet);
  const sack1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.16, 0.62),
    new THREE.MeshStandardMaterial({ color: 0xe5e0d5, roughness: 0.9 })
  );
  sack1.position.set(1.85, 0.16, -6.55);
  group.add(sack1);
  const sack2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.16, 0.62),
    new THREE.MeshStandardMaterial({ color: 0xd6cfc2, roughness: 0.9 })
  );
  sack2.position.set(2.26, 0.18, -6.55);
  sack2.rotation.y = 0.08;
  group.add(sack2);

  // Left & Right walls split between kitchen subway tile (Z < 0) and warm wood slats (Z >= 0)
  const leftKitchenWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.6, 5.4), subwayWallMat);
  leftKitchenWall.position.set(-6.0, 2.3, -3.0);
  group.add(leftKitchenWall);
  const leftDiningWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.6, 5.1), woodSlatMat);
  leftDiningWall.position.set(-6.0, 2.3, 2.25);
  group.add(leftDiningWall);

  const rightKitchenWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.6, 5.4), subwayWallMat);
  rightKitchenWall.position.set(6.0, 2.3, -3.0);
  group.add(rightKitchenWall);
  const rightDiningWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.6, 5.1), woodSlatMat);
  rightDiningWall.position.set(6.0, 2.3, 2.25);
  group.add(rightDiningWall);

  // Framed Graphic Wall Posters on Dining Walls + Brass Wall Sconces
  const wallArtMat = new THREE.MeshStandardMaterial({
    map: createWallArtTexture(anisotropy),
    roughness: 0.4,
  });
  [-5.84, 5.84].forEach((wx, sideIdx) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.5, 1.2), blackFrameMat);
    frame.position.set(wx, 2.1, 2.55);
    group.add(frame);

    const art = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 1.36), wallArtMat);
    art.position.set(wx + (sideIdx === 0 ? 0.04 : -0.04), 2.1, 2.55);
    art.rotation.y = sideIdx === 0 ? Math.PI / 2 : -Math.PI / 2;
    group.add(art);

    // Warm Sconces flanking the booth
    [1.35, 3.7].forEach((sz) => {
      const sconce = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.28, 12),
        new THREE.MeshStandardMaterial({
          color: 0xffedd5,
          emissive: 0xffb74d,
          emissiveIntensity: 0.85,
          roughness: 0.3,
        })
      );
      sconce.position.set(wx + (sideIdx === 0 ? 0.06 : -0.06), 2.25, sz);
      group.add(sconce);
    });
  });

  // Glowing Red Cursive "Arbish" Neon Sign on Left Dining Wall & "Burgers" on Right Wall (matching Makkah interior)
  const leftWallNeonTex = createNeonScriptSignTexture(anisotropy, 'Arbish', '#EF4444', true);
  const leftWallNeon = new THREE.Mesh(
    new THREE.PlaneGeometry(1.55, 0.58),
    new THREE.MeshBasicMaterial({ map: leftWallNeonTex, transparent: true, side: THREE.DoubleSide })
  );
  leftWallNeon.position.set(-5.83, 2.75, 1.25);
  leftWallNeon.rotation.y = Math.PI / 2;
  group.add(leftWallNeon);

  const rightWallNeonTex = createNeonScriptSignTexture(anisotropy, 'Burgers & Take Away', '#EF4444', true);
  const rightWallNeon = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 0.58),
    new THREE.MeshBasicMaterial({ map: rightWallNeonTex, transparent: true, side: THREE.DoubleSide })
  );
  rightWallNeon.position.set(5.83, 2.85, 2.2);
  rightWallNeon.rotation.y = -Math.PI / 2;
  group.add(rightWallNeon);

  // Indoor Potted Palms flanking front entrance & staircase (matching Arbish Bites Makkah photos)
  group.add(buildPlanter(-4.85, 4.18));
  group.add(buildPlanter(3.85, 4.18));

  // Underside Ceiling Beams & Exposed Brushed Steel HVAC Duct (below Floor 2 slab Y=4.03)
  const beamMat = new THREE.MeshStandardMaterial({ color: 0x1f2128, roughness: 0.6, metalness: 0.3 });
  [-3.8, -1.6, 0.2].forEach((bz) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.14, 0.2), beamMat);
    beam.position.set(0, 3.96, bz);
    group.add(beam);
  });

  const hvacDuct = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 10.6, 16),
    new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.8, roughness: 0.28 })
  );
  hvacDuct.rotation.z = Math.PI / 2;
  hvacDuct.position.set(0, 3.82, -2.0);
  group.add(hvacDuct);

  // =========================================================================
  // SECOND FLOOR STRUCTURAL DECK (Y = 4.25), STAIRWELL, ATRIUM & 2ND FLOOR SHELL
  // =========================================================================
  const woodPlanks = createWoodPlankTextures(anisotropy);
  const loftFloorMat = new THREE.MeshPhysicalMaterial({
    map: woodPlanks.map,
    bumpMap: woodPlanks.bumpMap,
    roughnessMap: woodPlanks.roughnessMap,
    bumpScale: 0.015,
    roughness: 0.42,
    metalness: 0.04,
    clearcoat: 0.28,
    clearcoatRoughness: 0.35,
  });
  const ceilingUnderMat = new THREE.MeshStandardMaterial({ color: 0x141519, roughness: 0.85 });
  const deckSlabMaterials = [
    beamMat,
    beamMat,
    loftFloorMat,
    ceilingUnderMat,
    beamMat,
    beamMat,
  ];

  // Partitioned around Right Stairwell (X: +4.2..+5.9, Z: -0.4..4.45) & Center Atrium (X: -1.7..1.5, Z: 0.8..4.45)
  const deckSegments: Array<[number, number, number, number]> = [
    [0, -3.025, 12.0, 5.25],     // Back half (full width)
    [-3.85, 2.075, 4.3, 4.95],   // Left front lounge wing
    [-0.1, 0.2, 3.2, 1.2],       // Walkway behind atrium
    [2.85, 2.075, 2.7, 4.95],    // Bridge between atrium & right stairwell
  ];
  deckSegments.forEach(([sx, sz, sw, sd]) => {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.22, sd), deckSlabMaterials);
    slab.position.set(sx, 4.14, sz);
    slab.receiveShadow = true;
    slab.castShadow = true;
    group.add(slab);
  });

  // Walkable Steel & Walnut Staircase along Right Wall (Z = +3.8 at Y=0 up to Z = -0.4 at Y=4.25)
  const stairX = 5.05;
  const stepCount = 16;
  const treadMat = new THREE.MeshStandardMaterial({ color: 0x855533, roughness: 0.5, metalness: 0.08 });
  for (let i = 0; i < stepCount; i++) {
    const t = (i + 0.5) / stepCount;
    const stepY = t * 4.25;
    const stepZ = 3.8 - t * 4.2;
    const tread = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.09, 0.3), treadMat);
    tread.position.set(stairX, stepY - 0.045, stepZ);
    tread.castShadow = true;
    tread.receiveShadow = true;
    group.add(tread);

    const riser = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.22, 0.04), blackFrameMat);
    riser.position.set(stairX, stepY - 0.14, stepZ + 0.12);
    group.add(riser);
  }
  // Twin diagonal steel stair stringers + handrail
  [4.37, 5.73].forEach((sx) => {
    const stringer = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 6.1), blackFrameMat);
    stringer.position.set(sx, 2.05, 1.7);
    stringer.rotation.x = Math.atan2(4.25, 4.2);
    stringer.castShadow = true;
    group.add(stringer);
  });
  const stairHandrail = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 6.0, 10), blackFrameMat);
  stairHandrail.position.set(4.37, 2.98, 1.7);
  stairHandrail.rotation.x = Math.PI / 2 + Math.atan2(4.25, 4.2);
  group.add(stairHandrail);

  // Industrial Dark Mesh & Black-Steel Balustrade Railings around Right Stairwell & Atrium
  const meshRailMat = new THREE.MeshPhysicalMaterial({
    color: 0x16181f,
    roughness: 0.45,
    metalness: 0.6,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const addBalustrade = (x1: number, z1: number, x2: number, z2: number) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);
    const cx = (x1 + x2) / 2;
    const cz = (z1 + z2) / 2;

    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, len + 0.06), blackFrameMat);
    topRail.position.set(cx, 5.27, cz);
    topRail.rotation.y = angle;
    group.add(topRail);

    const meshPanel = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.9), meshRailMat);
    meshPanel.position.set(cx, 4.78, cz);
    meshPanel.rotation.y = angle + Math.PI / 2;
    group.add(meshPanel);

    const posts = Math.max(2, Math.round(len / 1.4) + 1);
    for (let i = 0; i < posts; i++) {
      const f = i / (posts - 1);
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.055, 1.02, 0.055), blackFrameMat);
      post.position.set(x1 + dx * f, 4.76, z1 + dz * f);
      group.add(post);
    }
  };
  addBalustrade(4.2, -0.4, 4.2, 4.45);    // Right stairwell edge
  addBalustrade(-1.7, 0.8, -1.7, 4.45);  // Atrium left edge
  addBalustrade(-1.7, 0.8, 1.5, 0.8);    // Atrium back edge
  addBalustrade(1.5, 0.8, 1.5, 4.45);    // Atrium right edge

  // Glowing Coral/Peach "SMASHED TO PERFECTION" Neon along Atrium Mezzanine Beam (matching Makkah photo)
  const smashedTex = createNeonScriptSignTexture(
    anisotropy,
    'SMASHED TO PERFECTION',
    '#FB7185',
    false
  );
  const smashedSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.05, 0.42),
    new THREE.MeshBasicMaterial({ map: smashedTex, transparent: true })
  );
  smashedSign.position.set(-0.1, 4.16, 0.84);
  group.add(smashedSign);

  // Also visible in the upper mezzanine window bay facing the street
  const mezzanineSmashedSign = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 0.56),
    new THREE.MeshBasicMaterial({ map: smashedTex, transparent: true })
  );
  mezzanineSmashedSign.position.set(0.2, 6.22, 4.25);
  group.add(mezzanineSmashedSign);

  // Second Floor Perimeter Walls (Y = 4.25 to 8.55) & Dark Industrial Ceiling + Criss-Crossing Electric Blue LEDs
  const upperBackWall = new THREE.Mesh(new THREE.BoxGeometry(12.2, 4.3, 0.25), woodSlatMat);
  upperBackWall.position.set(0, 6.4, -5.65);
  upperBackWall.receiveShadow = true;
  group.add(upperBackWall);

  const upperLeftWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.3, 10.5), woodSlatMat);
  upperLeftWall.position.set(-6.0, 6.4, -0.55);
  group.add(upperLeftWall);

  const upperRightWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.3, 10.5), woodSlatMat);
  upperRightWall.position.set(6.0, 6.4, -0.55);
  group.add(upperRightWall);

  const upperCeiling = new THREE.Mesh(
    new THREE.BoxGeometry(12.3, 0.24, 10.6),
    new THREE.MeshStandardMaterial({ color: 0x0b0c10, roughness: 0.88 })
  );
  upperCeiling.position.set(0, 8.55, -0.55);
  group.add(upperCeiling);

  // Criss-crossing Electric Cobalt-Blue Ceiling LED Light Strips (matching Makkah photo)
  const cobaltLedMat = new THREE.MeshStandardMaterial({
    color: 0x60a5fa,
    emissive: 0x2563eb,
    emissiveIntensity: 2.3,
  });
  [
    { x: -1.4, z: 1.5, w: 9.8, d: 0.08, ry: 0.14 },
    { x: 1.4, z: 2.6, w: 0.08, d: 7.4, ry: -0.18 },
    { x: 0.0, z: -1.5, w: 10.2, d: 0.08, ry: -0.1 },
    { x: -2.2, z: -0.6, w: 0.08, d: 7.8, ry: 0.22 },
  ].forEach((strip) => {
    const led = new THREE.Mesh(new THREE.BoxGeometry(strip.w, 0.05, strip.d), cobaltLedMat);
    led.position.set(strip.x, 8.38, strip.z);
    led.rotation.y = strip.ry;
    group.add(led);
  });

  // Recessed Architectural Ceiling Downlights (Floor 1 & Floor 2)
  const downlightGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfff7ed,
    emissive: 0xffd28a,
    emissiveIntensity: 0.95,
  });
  [
    [-3.2, 4.02, -3.2],
    [0.0, 4.02, -3.2],
    [3.2, 4.02, -3.2],
    [-3.2, 8.42, -3.0],
    [0.0, 8.42, -3.0],
    [3.6, 8.42, -3.0],
    [3.6, 8.42, 1.8],
  ].forEach(([dx, dy, dz]) => {
    const trim = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 14), blackFrameMat);
    trim.position.set(dx, dy, dz);
    group.add(trim);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.034, 14), downlightGlowMat);
    lens.position.set(dx, dy, dz);
    group.add(lens);
  });

  // Upper Floor Wall Art & Warm Sconces
  [-5.84, 5.84].forEach((wx, sideIdx) => {
    const upperFrame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.5, 1.2), blackFrameMat);
    upperFrame.position.set(wx, 6.2, -1.2);
    group.add(upperFrame);

    const upperArt = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 1.36), wallArtMat);
    upperArt.position.set(wx + (sideIdx === 0 ? 0.04 : -0.04), 6.2, -1.2);
    upperArt.rotation.y = sideIdx === 0 ? Math.PI / 2 : -Math.PI / 2;
    group.add(upperArt);

    [-3.2, 0.8, 2.8].forEach((sz) => {
      const uSconce = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.28, 12),
        new THREE.MeshStandardMaterial({
          color: 0xffedd5,
          emissive: 0xffb74d,
          emissiveIntensity: 0.9,
          roughness: 0.3,
        })
      );
      uSconce.position.set(wx + (sideIdx === 0 ? 0.06 : -0.06), 6.35, sz);
      group.add(uSconce);
    });
  });

  // Giant Illuminated "Arbish LOUNGE" Neon Sign on 2nd-Floor Back Wall
  const loftNeonTex = createLoftNeonTexture(anisotropy);
  const loftNeonFrame = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.45, 0.1), blackFrameMat);
  loftNeonFrame.position.set(0, 6.45, -5.48);
  group.add(loftNeonFrame);
  const loftNeonFace = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 1.3),
    new THREE.MeshStandardMaterial({
      map: loftNeonTex,
      emissive: 0xffffff,
      emissiveMap: loftNeonTex,
      emissiveIntensity: 0.65,
      roughness: 0.25,
    })
  );
  loftNeonFace.position.set(0, 6.45, -5.42);
  group.add(loftNeonFace);

  // Multi-Globe Atrium Chandelier suspended from 2nd-floor ceiling (Y=8.43 down into atrium)
  const chandelier = new THREE.Group();
  chandelier.position.set(0.1, 0, 2.55);
  const chStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 10), blackFrameMat);
  chStem.position.y = 7.35;
  chandelier.add(chStem);
  const chRing = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.028, 10, 28), blackFrameMat);
  chRing.rotation.x = Math.PI / 2;
  chRing.position.y = 6.25;
  chandelier.add(chRing);
  const globeMat = new THREE.MeshStandardMaterial({
    color: 0xfff7ed,
    emissive: 0xffc66e,
    emissiveIntensity: 1.35,
    roughness: 0.2,
  });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const gx = Math.cos(a) * 0.75;
    const gz = Math.sin(a) * 0.75;
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), globeMat);
    globe.position.set(gx, 6.12 - (i % 2) * 0.22, gz);
    chandelier.add(globe);
  }
  group.add(chandelier);

  // 2nd Floor Retro Arbish Arcade Cabinets (Back-Left Lounge)
  const buildArcadeCabinet = (x: number, z: number, title: string, accent: string, accentHex: number) => {
    const cab = new THREE.Group();
    cab.position.set(x, 4.25, z);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.76, 1.82, 0.72), blackFrameMat);
    body.position.y = 0.91;
    body.castShadow = true;
    cab.add(body);

    const marquee = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.2, 0.14),
      new THREE.MeshStandardMaterial({
        color: accentHex,
        emissive: accentHex,
        emissiveIntensity: 1.4,
      })
    );
    marquee.position.set(0, 1.7, 0.33);
    cab.add(marquee);

    const screenTex = createArcadeScreenTexture(anisotropy, title, accent);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.58, 0.68),
      new THREE.MeshStandardMaterial({
        map: screenTex,
        emissive: 0xffffff,
        emissiveMap: screenTex,
        emissiveIntensity: 0.85,
      })
    );
    screen.position.set(0, 1.24, 0.37);
    screen.rotation.x = -0.14;
    cab.add(screen);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.1, 0.28), blackFrameMat);
    deck.position.set(0, 0.86, 0.44);
    cab.add(deck);

    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.09, 8), blackFrameMat);
    stick.position.set(-0.18, 0.94, 0.46);
    cab.add(stick);
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.032, 10, 10),
      new THREE.MeshStandardMaterial({ color: accentHex, roughness: 0.3 })
    );
    ball.position.set(-0.18, 0.99, 0.46);
    cab.add(ball);

    group.add(cab);
  };
  buildArcadeCabinet(-3.55, -5.0, 'BURGER RUSH', '#EF4444', 0xef4444);
  buildArcadeCabinet(-2.45, -5.0, 'FRY BLASTER', '#F59E0B', 0xf59e0b);

  // 2nd Floor VIP Lounge Booths (Right Side)
  const buildUpperBooth = (x: number, z: number) => {
    const b = new THREE.Group();
    b.position.set(x, 4.25, z);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.72, 10), blackFrameMat);
    leg.position.y = 0.36;
    b.add(leg);
    const tbl = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.06, 0.8), whiteFacadeMat);
    tbl.position.y = 0.75;
    tbl.castShadow = true;
    b.add(tbl);

    const lamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.075, 0.16, 10),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.9,
      })
    );
    lamp.position.set(0.32, 0.86, 0);
    b.add(lamp);

    const seatMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.42 });
    [-0.65, 0.65].forEach((bz) => {
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.36, 0.44), blackFrameMat);
      base.position.set(0, 0.18, bz);
      b.add(base);
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.12, 0.46), seatMat);
      cushion.position.set(0, 0.42, bz);
      b.add(cushion);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.54, 0.12), seatMat);
      back.position.set(0, 0.7, bz + (bz > 0 ? 0.17 : -0.17));
      b.add(back);
    });
    group.add(b);
  };
  buildUpperBooth(-4.25, -2.85);
  buildUpperBooth(-4.25, 1.75);

  // Iconic Arbish Bites Makkah Pastel Pink & Mustard Yellow Designer Lounge Chairs (2nd-Floor Center-Left)
  const buildColorfulCafeSet = (x: number, yBase: number, z: number) => {
    const cafeSet = new THREE.Group();
    cafeSet.position.set(x, yBase, z);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, 0.72, 10), blackFrameMat);
    pole.position.y = 0.36;
    cafeSet.add(pole);
    const baseDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.03, 14), blackFrameMat);
    baseDisc.position.y = 0.015;
    cafeSet.add(baseDisc);
    const roundTop = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.045, 20), whiteFacadeMat);
    roundTop.position.y = 0.73;
    roundTop.castShadow = true;
    cafeSet.add(roundTop);

    [
      { cx: -0.62, rotY: Math.PI / 2, color: 0xf472b6 }, // Pastel Pink chair
      { cx: 0.62, rotY: -Math.PI / 2, color: 0xfacc15 }, // Mustard Yellow chair
    ].forEach((ch) => {
      const chair = new THREE.Group();
      chair.position.set(ch.cx, 0, 0);
      chair.rotation.y = ch.rotY;

      const shellMat = new THREE.MeshPhysicalMaterial({ color: ch.color, roughness: 0.42, sheen: 0.3 });
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.21, 0.07, 16), shellMat);
      seat.position.y = 0.44;
      chair.add(seat);
      const back = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.23, 0.38, 16, 1, true, Math.PI * 0.6, Math.PI * 0.8),
        shellMat
      );
      back.position.y = 0.64;
      chair.add(back);
      [
        [-0.14, -0.14],
        [0.14, -0.14],
        [-0.14, 0.14],
        [0.14, 0.14],
      ].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.42, 6), blackFrameMat);
        leg.position.set(lx, 0.21, lz);
        chair.add(leg);
      });
      cafeSet.add(chair);
    });
    group.add(cafeSet);
  };
  buildColorfulCafeSet(3.15, 4.25, -1.35);
  buildColorfulCafeSet(3.15, 4.25, 0.85);

  // 2nd Floor Street-View Window Bar & Stools (Left Front Window)
  const upperBar = new THREE.Group();
  upperBar.position.set(-3.55, 4.25, 4.02);
  const uBarTop = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 0.44), whiteFacadeMat);
  uBarTop.position.y = 0.98;
  upperBar.add(uBarTop);
  [-0.9, 0.9].forEach((lx) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.96, 8), blackFrameMat);
    leg.position.set(lx, 0.48, 0);
    upperBar.add(leg);
  });
  [-0.65, 0.0, 0.65].forEach((sx) => {
    const seat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.07, 14),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.45 })
    );
    seat.position.set(sx, 0.68, -0.35);
    upperBar.add(seat);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.66, 8), blackFrameMat);
    post.position.set(sx, 0.33, -0.35);
    upperBar.add(post);
  });
  group.add(upperBar);

  // Second Floor Exterior Front Panoramic Loft Facade (Matte-Black Aluminum Cladding matching Makkah photo)
  const sfZ = 4.55;
  const kneeWall = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.48, 0.28), blackFrameMat);
  kneeWall.position.set(0, 5.96, sfZ);
  kneeWall.castShadow = true;
  group.add(kneeWall);

  const upperLintel = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.42, 0.28), blackFrameMat);
  upperLintel.position.set(0, 8.38, sfZ);
  upperLintel.castShadow = true;
  group.add(upperLintel);

  [-5.75, 5.75].forEach((px) => {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.0, 0.28), blackFrameMat);
    pier.position.set(px, 7.18, sfZ);
    pier.castShadow = true;
    group.add(pier);
  });

  [-5.35, -3.2, -1.32, 0, 1.32, 3.2, 5.35].forEach((mx) => {
    const mPost = new THREE.Mesh(new THREE.BoxGeometry(0.11, 2.0, 0.16), blackFrameMat);
    mPost.position.set(mx, 7.18, sfZ);
    group.add(mPost);
  });

  const loftGlass = new THREE.Mesh(new THREE.PlaneGeometry(10.6, 1.92), glassMat);
  loftGlass.position.set(0, 7.18, sfZ);
  group.add(loftGlass);

  const roofCornice = new THREE.Mesh(new THREE.BoxGeometry(12.45, 0.2, 0.54), blackFrameMat);
  roofCornice.position.set(0, 8.65, sfZ + 0.06);
  roofCornice.castShadow = true;
  group.add(roofCornice);

  // Backlit Wall Menu Board
  const menuBoardFrame = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.2, 0.12), blackFrameMat);
  menuBoardFrame.position.set(0, 3.15, -5.48);
  group.add(menuBoardFrame);

  const menuTex = createMenuBoardTexture(anisotropy);
  const menuBoardFace = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 2.0),
    new THREE.MeshStandardMaterial({
      map: menuTex,
      emissive: 0xffffff,
      emissiveMap: menuTex,
      emissiveIntensity: 0.38,
      roughness: 0.3,
    })
  );
  menuBoardFace.position.set(0, 3.15, -5.41);
  group.add(menuBoardFace);

  // =========================================================================
  // SIGNATURE ARBISH BITES STOREFRONT FACADE (Z = +4.55)
  // Illuminated red cursive "Arbish" + grey "bites" + soffit LED canopy + neon window signs
  // =========================================================================
  const storefrontZ = 4.55;

  const signTex = createArbishFacadeSignTexture(anisotropy);
  const signEmissiveTex = createArbishSignEmissiveTexture(anisotropy);
  const facadeSignMat = new THREE.MeshStandardMaterial({
    map: signTex,
    emissive: 0xffffff,
    emissiveMap: signEmissiveTex,
    emissiveIntensity: 0.85,
    roughness: 0.42,
    metalness: 0.08,
  });
  const signMesh = new THREE.Mesh(
    new THREE.BoxGeometry(12.2, 2.85, 0.28),
    [
      blackFrameMat,
      blackFrameMat,
      blackFrameMat,
      blackFrameMat,
      facadeSignMat,
      new THREE.MeshStandardMaterial({ color: 0x0e0f14, roughness: 0.7 }),
    ]
  );
  signMesh.position.set(0, 4.18, storefrontZ);
  signMesh.castShadow = true;
  signMesh.receiveShadow = true;
  group.add(signMesh);

  // Sleek dark architectural cornice & cool-blue recessed storefront eyebrow strip (matching Makkah photo)
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.14, 0.36), blackFrameMat);
  cornice.position.set(0, 5.65, storefrontZ + 0.04);
  group.add(cornice);

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.07, 0.28), blackFrameMat);
  canopy.position.set(0, 2.8, storefrontZ + 0.08);
  canopy.castShadow = true;
  group.add(canopy);

  const canopyLedMat = new THREE.MeshStandardMaterial({
    color: 0xe0e7ff,
    emissive: 0x6366f1,
    emissiveIntensity: 0.75,
  });
  const canopyLed = new THREE.Mesh(
    new THREE.BoxGeometry(11.8, 0.02, 0.04),
    canopyLedMat
  );
  canopyLed.position.set(0, 2.76, storefrontZ + 0.18);
  group.add(canopyLed);

  // Storefront Mullions & Glass Panes
  const mullionXs = [-5.92, -4.15, -2.6, -1.32, 1.32, 2.6, 4.15, 5.92];
  mullionXs.forEach((mx) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.8, 0.14), blackFrameMat);
    post.position.set(mx, 1.4, storefrontZ);
    post.castShadow = true;
    group.add(post);
  });

  const topBar = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.1, 0.16), blackFrameMat);
  topBar.position.set(0, 2.75, storefrontZ);
  group.add(topBar);

  const transomBar = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.09, 0.14), blackFrameMat);
  transomBar.position.set(0, 2.15, storefrontZ);
  group.add(transomBar);

  const windowSpans: Array<[number, number]> = [
    [-5.92, -4.15],
    [-4.15, -2.6],
    [-2.6, -1.32],
    [1.32, 2.6],
    [2.6, 4.15],
    [4.15, 5.92],
  ];
  windowSpans.forEach(([x0, x1]) => {
    const w = x1 - x0 - 0.08;
    const cx = (x0 + x1) / 2;
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(w, 2.65), glassMat);
    pane.position.set(cx, 1.38, storefrontZ);
    group.add(pane);

    const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.08, 0.14), blackFrameMat);
    sill.position.set(cx, 0.04, storefrontZ);
    group.add(sill);
  });

  // Glowing Neon Window Signs inside Left & Right Windows
  const openNeonTex = createNeonWindowSignTexture(anisotropy, 'OPEN', '#EF4444');
  const openNeon = new THREE.Mesh(
    new THREE.PlaneGeometry(0.88, 0.44),
    new THREE.MeshBasicMaterial({ map: openNeonTex, transparent: true, side: THREE.DoubleSide })
  );
  openNeon.position.set(-1.96, 1.68, storefrontZ - 0.12);
  group.add(openNeon);

  const smashNeonTex = createNeonWindowSignTexture(anisotropy, 'SMASH', '#F59E0B');
  const smashNeon = new THREE.Mesh(
    new THREE.PlaneGeometry(0.88, 0.44),
    new THREE.MeshBasicMaterial({ map: smashNeonTex, transparent: true, side: THREE.DoubleSide })
  );
  smashNeon.position.set(1.96, 1.68, storefrontZ - 0.12);
  group.add(smashNeon);

  // Transom glass & center mullion above doors
  const doorTransom = new THREE.Mesh(new THREE.PlaneGeometry(2.56, 0.56), glassMat);
  doorTransom.position.set(0, 2.45, storefrontZ);
  group.add(doorTransom);
  const centerTransomPost = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.62, 0.14), blackFrameMat);
  centerTransomPost.position.set(0, 2.45, storefrontZ);
  group.add(centerTransomPost);

  // Double Glass Entrance Doors with Hours & Burger Decal
  const doorWidth = 1.28;
  const doorHeight = 2.1;

  const leftDoorPivot = new THREE.Group();
  leftDoorPivot.position.set(-1.3, 0, storefrontZ);
  group.add(leftDoorPivot);

  const buildDoorLeaf = (isLeft: boolean) => {
    const leaf = new THREE.Group();
    const dir = isLeft ? 1 : -1;

    const outerStile = new THREE.Mesh(new THREE.BoxGeometry(0.07, doorHeight, 0.08), blackFrameMat);
    outerStile.position.set(dir * 0.035, doorHeight / 2, 0);
    leaf.add(outerStile);

    const innerStile = new THREE.Mesh(new THREE.BoxGeometry(0.07, doorHeight, 0.08), blackFrameMat);
    innerStile.position.set(dir * (doorWidth - 0.035), doorHeight / 2, 0);
    leaf.add(innerStile);

    const topRail = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, 0.08, 0.08), blackFrameMat);
    topRail.position.set(dir * (doorWidth / 2), doorHeight - 0.04, 0);
    leaf.add(topRail);

    const botRail = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, 0.1, 0.08), blackFrameMat);
    botRail.position.set(dir * (doorWidth / 2), 0.05, 0);
    leaf.add(botRail);

    const doorGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(doorWidth - 0.12, doorHeight - 0.16),
      glassMat
    );
    doorGlass.position.set(dir * (doorWidth / 2), doorHeight / 2, 0);
    leaf.add(doorGlass);

    // Tall vertical tubular architectural door pull handles (matching Makkah entrance doors)
    const handleX = dir * (doorWidth - 0.17);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x2a2c32, metalness: 0.85, roughness: 0.25 });
    [0.075, -0.075].forEach((hz) => {
      const pullBar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.48, 12), handleMat);
      pullBar.position.set(handleX, 1.02, hz);
      leaf.add(pullBar);
      [0.42, 1.62].forEach((sy) => {
        const standoff = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.07, 8), handleMat);
        standoff.rotation.x = Math.PI / 2;
        standoff.position.set(handleX, sy, hz * 0.5);
        leaf.add(standoff);
      });
    });

    const decalMat = new THREE.MeshBasicMaterial({
      map: isLeft
        ? createDoorDecalTexture(anisotropy)
        : createRightDoorMakkahDecalTexture(anisotropy),
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const decal = new THREE.Mesh(
      new THREE.PlaneGeometry(doorWidth - 0.18, doorHeight - 0.2),
      decalMat
    );
    decal.position.set(dir * (doorWidth / 2), doorHeight / 2, 0.015);
    leaf.add(decal);

    return leaf;
  };

  const leftLeaf = buildDoorLeaf(true);
  leftDoorPivot.add(leftLeaf);
  tagInteractive(leftLeaf, { id: 'door-left', kind: 'door', label: 'Arbish Bites Entrance' });

  const rightDoorPivot = new THREE.Group();
  rightDoorPivot.position.set(1.3, 0, storefrontZ);
  group.add(rightDoorPivot);

  const rightLeaf = buildDoorLeaf(false);
  rightDoorPivot.add(rightLeaf);
  tagInteractive(rightLeaf, { id: 'door-right', kind: 'door', label: 'Arbish Bites Entrance' });

  // =========================================================================
  // SIDEWALK PROPS: A-FRAME BOARD, PATIO BISTRO TABLE, PLANTERS, SCOOTER
  // =========================================================================
  group.add(buildPlanter(-1.75, 5.05));
  group.add(buildPlanter(1.75, 5.05));

  // A-frame Chalkboard Sign
  const aFrame = new THREE.Group();
  aFrame.position.set(-2.75, 0, 5.85);
  aFrame.rotation.y = 0.28;
  const boardTex = createSidewalkBoardTexture(anisotropy);
  const frontBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 1.05, 0.04),
    [
      blackFrameMat,
      blackFrameMat,
      blackFrameMat,
      blackFrameMat,
      new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.55 }),
      blackFrameMat,
    ]
  );
  frontBoard.position.set(0, 0.52, 0.14);
  frontBoard.rotation.x = -0.18;
  frontBoard.castShadow = true;
  aFrame.add(frontBoard);

  const backBoard = new THREE.Mesh(new THREE.BoxGeometry(0.68, 1.05, 0.04), blackFrameMat);
  backBoard.position.set(0, 0.52, -0.14);
  backBoard.rotation.x = 0.18;
  aFrame.add(backBoard);
  group.add(aFrame);

  // Outdoor Bistro Table & 2 Stools on right sidewalk
  const patio = new THREE.Group();
  patio.position.set(3.45, 0, 6.0);
  const patioTable = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 20), blackFrameMat);
  patioTable.position.y = 0.76;
  patioTable.castShadow = true;
  patio.add(patioTable);
  const patioLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.75, 10), blackFrameMat);
  patioLeg.position.y = 0.375;
  patio.add(patioLeg);
  const patioBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.04, 14), blackFrameMat);
  patioBase.position.y = 0.02;
  patio.add(patioBase);

  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.8,
  });
  const lantern = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.07, 0.14, 10),
    lanternMat
  );
  lantern.position.y = 0.85;
  patio.add(lantern);

  [-0.65, 0.65].forEach((sx) => {
    const stoolSeat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.05, 14),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.45 })
    );
    stoolSeat.position.set(sx, 0.52, 0);
    patio.add(stoolSeat);
    const stoolLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), blackFrameMat);
    stoolLeg.position.set(sx, 0.25, 0);
    patio.add(stoolLeg);
  });
  group.add(patio);

  // Parked Arbish Bites Delivery Scooter at the Curb
  group.add(buildDeliveryScooter(-4.75, 7.65));

  // Neighboring Buildings + Urban Horizon (scaled to frame the 2-story flagship)
  const neighborLeft = new THREE.Mesh(
    new THREE.BoxGeometry(11, 10.8, 10.6),
    new THREE.MeshStandardMaterial({ color: 0x22242b, roughness: 0.88 })
  );
  neighborLeft.position.set(-11.7, 5.4, -0.5);
  group.add(neighborLeft);

  const neighborRight = new THREE.Mesh(
    new THREE.BoxGeometry(11, 11.4, 10.6),
    new THREE.MeshStandardMaterial({ color: 0x282a32, roughness: 0.86 })
  );
  neighborRight.position.set(11.7, 5.7, -0.5);
  group.add(neighborRight);

  // Streetlamps
  const streetLampGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffe4b5,
    emissive: 0xffc978,
    emissiveIntensity: 1.4,
  });
  const buildStreetLamp = (x: number, z: number) => {
    const lamp = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x1b1d22,
      metalness: 0.72,
      roughness: 0.34,
    });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.45, 12), poleMat);
    base.position.y = 0.225;
    lamp.add(base);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.4, 12), poleMat);
    pole.position.y = 2.4;
    lamp.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.06, 0.06), poleMat);
    arm.position.set(0.35, 4.5, 0);
    lamp.add(arm);

    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.14, 16), poleMat);
    head.position.set(0.7, 4.42, 0);
    lamp.add(head);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 12, 12),
      streetLampGlowMat
    );
    glow.position.set(0.7, 4.32, 0);
    lamp.add(glow);

    lamp.position.set(x, 0, z);
    group.add(lamp);
  };
  buildStreetLamp(-5.8, 8.4);
  buildStreetLamp(5.8, 8.4);

  // Distant Evening City Skyline
  const skyBlockMat = new THREE.MeshStandardMaterial({ color: 0x12151e, roughness: 0.9 });
  const winGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffe4a0,
    emissive: 0xffc864,
    emissiveIntensity: 0.85,
  });
  [-20, -10, 0, 11, 21].forEach((bx, idx) => {
    const h = 8.5 + (idx % 3) * 4.5;
    const b = new THREE.Mesh(new THREE.BoxGeometry(7.8, h, 6), skyBlockMat);
    b.position.set(bx, h / 2 - 0.2, 26 + (idx % 2) * 3);
    group.add(b);

    for (let wy = 2; wy < h - 1.5; wy += 1.6) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.7), winGlowMat);
      w.rotation.y = Math.PI;
      w.position.set(bx - 1.4 + (wy % 2) * 2.2, wy, b.position.z - 3.02);
      group.add(w);
    }
  });

  return {
    group,
    leftDoorPivot,
    rightDoorPivot,
    signMesh,
    skyUniforms,
    starsMat,
    sunDisc,
    moonDisc,
    streetLampGlowMat,
    skylineWindowMat: winGlowMat,
    facadeSignMat,
    canopyLedMat,
    lanternMat,
  };
}

export interface KitchenAndDiningRefs {
  group: THREE.Group;
  grillPatties: Array<THREE.Group | null>;
  grillSlotAnchors: THREE.Vector3[];
  grillProgressBars: THREE.Mesh[];
  bunSlotMesh: THREE.Group | null;
  fryerBaskets: THREE.Group[];
  fryerOilMeshes: THREE.Mesh[];
  fryerProgressBars: THREE.Mesh[];
  assemblyAnchor: THREE.Group;
  drinkCupGroup: THREE.Group;
  drinkLiquidMesh: THREE.Mesh;
  ticketRailGroup: THREE.Group;
  registerScreenMat: THREE.MeshStandardMaterial;
  serveMatGlow: THREE.MeshStandardMaterial;
  onlineTabletScreenMat: THREE.MeshStandardMaterial;
  onlineDispatchGlow: THREE.MeshStandardMaterial;
  onlineDeliveryBag: THREE.Group;
}

export function buildKitchenAndDining(anisotropy: number): KitchenAndDiningRefs {
  const group = new THREE.Group();

  const brushedMetal = createBrushedMetalTextures(anisotropy);
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xc9cdd4,
    bumpMap: brushedMetal.bumpMap,
    roughnessMap: brushedMetal.roughnessMap,
    bumpScale: 0.006,
    metalness: 0.88,
    roughness: 0.45,
    envMapIntensity: 1.25,
  });
  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: 0x2a2d34,
    metalness: 0.72,
    roughness: 0.34,
  });
  const counterBaseMat = new THREE.MeshStandardMaterial({
    color: 0x1e2025,
    roughness: 0.65,
    metalness: 0.14,
  });
  const quartzTopMat = new THREE.MeshPhysicalMaterial({
    color: 0xf4f3ef,
    roughness: 0.2,
    metalness: 0.05,
    clearcoat: 0.35,
    clearcoatRoughness: 0.18,
  });
  const redAccentMat = new THREE.MeshStandardMaterial({
    color: 0xd91b1b,
    roughness: 0.32,
    metalness: 0.2,
  });

  // =========================================================================
  // 1. DINING ROOM BOOTHS, CONDIMENTS, PENDANTS & WINDOW BAR COUNTER
  // =========================================================================
  const boothLeatherMat = new THREE.MeshPhysicalMaterial({
    color: 0xb91c1c,
    bumpMap: createLeatherBumpTexture(anisotropy),
    bumpScale: 0.008,
    roughness: 0.42,
    metalness: 0.05,
    sheen: 0.45,
    sheenRoughness: 0.5,
  });
  const tableTopMat = new THREE.MeshStandardMaterial({
    color: 0xf2f0eb,
    roughness: 0.24,
    metalness: 0.06,
  });

  const buildBoothSet = (x: number, z: number) => {
    const booth = new THREE.Group();
    booth.position.set(x, 0, z);

    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.04, 16), steelMat);
    foot.position.y = 0.02;
    booth.add(foot);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.72, 12), steelMat);
    leg.position.y = 0.38;
    booth.add(leg);
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.06, 0.8), tableTopMat);
    table.position.y = 0.75;
    table.castShadow = true;
    table.receiveShadow = true;
    booth.add(table);

    // Chrome rim around table
    const rim = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 0.82), steelMat);
    rim.position.y = 0.75;
    booth.add(rim);

    // Tabletop Condiment Caddy (Ketchup, Mustard, Napkin Holder)
    const caddy = new THREE.Group();
    caddy.position.set(x < 0 ? -0.35 : 0.35, 0.78, 0);
    const ketchup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.035, 0.16, 10),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35 })
    );
    ketchup.position.set(-0.04, 0.08, 0.03);
    caddy.add(ketchup);
    const mustard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.035, 0.15, 10),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 })
    );
    mustard.position.set(0.04, 0.075, -0.03);
    caddy.add(mustard);
    const napkins = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.11, 0.1), steelMat);
    napkins.position.set(0.0, 0.055, -0.1);
    caddy.add(napkins);
    booth.add(caddy);

    // Tufted Benches
    [-0.65, 0.65].forEach((bz) => {
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.36, 0.44), counterBaseMat);
      base.position.set(0, 0.18, bz);
      booth.add(base);
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.12, 0.46), boothLeatherMat);
      cushion.position.set(0, 0.42, bz);
      booth.add(cushion);
      const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.56, 0.12), boothLeatherMat);
      backrest.position.set(0, 0.72, bz + (bz > 0 ? 0.17 : -0.17));
      booth.add(backrest);
    });

    // Warm Pendant Lamp (anchored cleanly to Floor 2 underside Y=4.03)
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.2, 8), darkSteelMat);
    cord.position.set(0, 3.45, 0);
    booth.add(cord);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.24, 20, 1, true), darkSteelMat);
    shade.position.set(0, 2.85, 0);
    booth.add(shade);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0xfff0c8,
        emissive: 0xffc864,
        emissiveIntensity: 2.5,
      })
    );
    bulb.position.set(0, 2.78, 0);
    booth.add(bulb);

    group.add(booth);
  };

  buildBoothSet(-4.2, 2.55);
  buildBoothSet(2.85, 2.55);

  // Window Counter Bar & Chrome Barstools looking out onto the street (left window bay)
  const windowBar = new THREE.Group();
  windowBar.position.set(-2.3, 0, 4.1);
  const barTop = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.06, 0.44), tableTopMat);
  barTop.position.y = 0.98;
  windowBar.add(barTop);
  [-0.85, 0.85].forEach((lx) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.96, 8), darkSteelMat);
    leg.position.set(lx, 0.48, 0);
    windowBar.add(leg);
  });
  [-0.55, 0.55].forEach((sx) => {
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.07, 16), boothLeatherMat);
    seat.position.set(sx, 0.68, -0.35);
    windowBar.add(seat);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.035, 0.66, 10), steelMat);
    post.position.set(sx, 0.33, -0.35);
    windowBar.add(post);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.03, 14), steelMat);
    base.position.set(sx, 0.015, -0.35);
    windowBar.add(base);
  });
  group.add(windowBar);

  // =========================================================================
  // 2. FRONT ORDER & PICKUP COUNTER (Z = 0.0, X = -3.6 to +3.6)
  // =========================================================================
  const frontCounter = new THREE.Group();
  frontCounter.position.set(0, 0, 0);

  // Fluted Light-Oak Front Counter with Glowing Purple/Blue Under-Lip LED (matching Makkah photo)
  const frontWoodMat = new THREE.MeshStandardMaterial({
    map: createWoodSlatTexture(anisotropy),
    roughness: 0.56,
    metalness: 0.04,
  });
  const counterBody = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.92, 0.88), frontWoodMat);
  counterBody.position.y = 0.46;
  counterBody.castShadow = true;
  counterBody.receiveShadow = true;
  frontCounter.add(counterBody);

  // Signature Purple/Indigo LED Accent Strip along Upper Counter Lip
  const counterStripe = new THREE.Mesh(
    new THREE.BoxGeometry(7.22, 0.05, 0.92),
    new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x6366f1,
      emissiveIntensity: 1.65,
    })
  );
  counterStripe.position.y = 0.9;
  frontCounter.add(counterStripe);

  // Glowing Base Plinth Strip
  const toeLed = new THREE.Mesh(
    new THREE.BoxGeometry(7.1, 0.04, 0.91),
    new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.6,
    })
  );
  toeLed.position.y = 0.025;
  frontCounter.add(toeLed);

  const counterTop = new THREE.Mesh(new THREE.BoxGeometry(7.35, 0.07, 0.98), quartzTopMat);
  counterTop.position.y = 0.955;
  counterTop.castShadow = true;
  counterTop.receiveShadow = true;
  frontCounter.add(counterTop);

  // Overhead Glowing Cursive "Order" & "Pick Up" Kitchen Pass Neon Signs + Digital TV Menu Screens (matching Makkah photo)
  const orderSignTex = createNeonScriptSignTexture(anisotropy, 'Order', '#FDE047', true);
  const pickUpSignTex = createNeonScriptSignTexture(anisotropy, 'Pick Up', '#FDE047', true);

  const orderSignMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 0.42),
    new THREE.MeshBasicMaterial({ map: orderSignTex, transparent: true, side: THREE.DoubleSide })
  );
  orderSignMesh.position.set(-1.35, 2.46, -0.16);
  frontCounter.add(orderSignMesh);

  const pickUpSignMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.25, 0.44),
    new THREE.MeshBasicMaterial({ map: pickUpSignTex, transparent: true, side: THREE.DoubleSide })
  );
  pickUpSignMesh.position.set(1.45, 2.46, -0.16);
  frontCounter.add(pickUpSignMesh);

  // Two Digital TV Menu Screens behind the counter pass (Double Smash 23 / Supreme Smash 24 / Fries)
  (
    [
      { x: -1.15, variant: 'left' },
      { x: 1.15, variant: 'right' },
    ] as const
  ).forEach((tv) => {
    const tvHousing = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.84, 0.06), darkSteelMat);
    tvHousing.position.set(tv.x, 3.04, -0.32);
    frontCounter.add(tvHousing);

    const tvTex = createCounterTvScreenTexture(anisotropy, tv.variant);
    const tvScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.52, 0.74),
      new THREE.MeshStandardMaterial({
        map: tvTex,
        emissive: 0xffffff,
        emissiveMap: tvTex,
        emissiveIntensity: 0.75,
        roughness: 0.2,
      })
    );
    tvScreen.position.set(tv.x, 3.04, -0.285);
    frontCounter.add(tvScreen);
  });

  // Overhead Pass Shelf with Stacked Red & White Arbish Takeout Boxes (matching Makkah photo)
  const passShelf = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.05, 0.42), steelMat);
  passShelf.position.set(0.05, 2.08, -0.25);
  frontCounter.add(passShelf);
  for (let bx = -1.75; bx <= 1.85; bx += 0.36) {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.2, 0.24),
      new THREE.MeshStandardMaterial({
        color: Math.round((bx + 2) * 3) % 2 === 0 ? 0xfafaf9 : 0xdc2626,
        roughness: 0.65,
      })
    );
    box.position.set(bx, 2.2, -0.25);
    frontCounter.add(box);
  }

  // 3 Hanging Edison Pendant Lamps over Front Counter (anchored to Floor 2 underside Y=4.03)
  [-2.2, 0, 2.2].forEach((px) => {
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.35, 8), darkSteelMat);
    cord.position.set(px, 3.4, 0.15);
    frontCounter.add(cord);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.16, 16, 1, true), darkSteelMat);
    shade.position.set(px, 2.72, 0.15);
    frontCounter.add(shade);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0xfff3d6,
        emissive: 0xffc864,
        emissiveIntensity: 2.2,
      })
    );
    bulb.position.set(px, 2.66, 0.15);
    frontCounter.add(bulb);
  });

  // POS Register at X = -1.25
  const posGroup = new THREE.Group();
  posGroup.position.set(-1.25, 0.99, 0);

  const posStand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.16), darkSteelMat);
  posStand.position.y = 0.12;
  posGroup.add(posStand);

  const posScreenFrame = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, 0.05), darkSteelMat);
  posScreenFrame.position.set(0, 0.3, 0);
  posScreenFrame.rotation.x = 0.42;
  posGroup.add(posScreenFrame);

  const registerScreenMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.55,
    roughness: 0.2,
  });
  const posDisplay = new THREE.Mesh(new THREE.PlaneGeometry(0.37, 0.25), registerScreenMat);
  posDisplay.position.set(0, 0.305, -0.028);
  posDisplay.rotation.y = Math.PI;
  posDisplay.rotation.x = -0.42;
  posGroup.add(posDisplay);

  const cashDrawer = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.09, 0.38), darkSteelMat);
  cashDrawer.position.set(0, 0.045, 0);
  posGroup.add(cashDrawer);

  // Tip Jar with visible green bills inside
  const tipJar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.09, 0.22, 14),
    new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
    })
  );
  tipJar.position.set(0.45, 0.11, 0.15);
  posGroup.add(tipJar);
  const tipCash = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.09, 8),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 })
  );
  tipCash.position.set(0.45, 0.06, 0.15);
  posGroup.add(tipCash);

  tagInteractive(posGroup, {
    id: 'register',
    kind: 'register',
    label: 'Order Register (Take Customer Order)',
  });
  frontCounter.add(posGroup);

  // Serve / Pickup Pass Mat at X = +1.35
  const serveGroup = new THREE.Group();
  serveGroup.position.set(1.35, 0.995, 0);
  const serveMatGlow = new THREE.MeshStandardMaterial({
    color: 0x26282e,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.15,
    roughness: 0.4,
  });
  const servePad = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.025, 0.62), serveMatGlow);
  serveGroup.add(servePad);

  const bellBase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.02, 16), darkSteelMat);
  bellBase.position.set(-0.46, 0.02, 0.2);
  serveGroup.add(bellBase);
  const bellDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    steelMat
  );
  bellDome.position.set(-0.46, 0.03, 0.2);
  serveGroup.add(bellDome);

  tagInteractive(serveGroup, {
    id: 'serve-pass',
    kind: 'serve-pass',
    label: 'Pickup Pass (Serve Walk-In Guest)',
  });
  frontCounter.add(serveGroup);

  // Online Order Tablet Stand at X = +2.24
  const tabletGroup = new THREE.Group();
  tabletGroup.position.set(2.24, 0.99, 0.02);

  const tabBase = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.18), darkSteelMat);
  tabBase.position.y = 0.015;
  tabletGroup.add(tabBase);

  const tabNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.14, 10), steelMat);
  tabNeck.position.set(0, 0.08, 0.02);
  tabletGroup.add(tabNeck);

  const tabBezel = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.025), darkSteelMat);
  tabBezel.position.set(0, 0.19, 0);
  tabBezel.rotation.x = 0.45;
  tabletGroup.add(tabBezel);

  const onlineTabletScreenMat = new THREE.MeshStandardMaterial({
    color: 0x052e16,
    emissive: 0x10b981,
    emissiveIntensity: 0.75,
    roughness: 0.2,
  });
  const tabScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.18), onlineTabletScreenMat);
  tabScreen.position.set(0, 0.195, -0.016);
  tabScreen.rotation.y = Math.PI;
  tabScreen.rotation.x = -0.45;
  tabletGroup.add(tabScreen);

  tagInteractive(tabletGroup, {
    id: 'online-tablet',
    kind: 'online-tablet',
    label: 'Online Orders Tablet (Incoming App Order)',
  });
  frontCounter.add(tabletGroup);

  // Online Delivery Dispatch Pad + Arbish Delivery Bag at X = +2.92
  const onlineDispatchGroup = new THREE.Group();
  onlineDispatchGroup.position.set(2.92, 0.995, 0);

  const onlineDispatchGlow = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    emissive: 0x10b981,
    emissiveIntensity: 0.2,
    roughness: 0.4,
  });
  const dispatchPad = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.025, 0.56), onlineDispatchGlow);
  onlineDispatchGroup.add(dispatchPad);

  const onlineDeliveryBag = new THREE.Group();
  onlineDeliveryBag.position.set(0, 0.02, 0);
  const bagBody = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.24), redAccentMat);
  bagBody.position.y = 0.18;
  bagBody.castShadow = true;
  onlineDeliveryBag.add(bagBody);

  const bagFlap = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.06, 0.26), darkSteelMat);
  bagFlap.position.y = 0.36;
  onlineDeliveryBag.add(bagFlap);

  const bagHandle = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.014, 8, 16, Math.PI),
    darkSteelMat
  );
  bagHandle.position.set(0, 0.39, 0);
  onlineDeliveryBag.add(bagHandle);

  onlineDeliveryBag.visible = false;
  onlineDispatchGroup.add(onlineDeliveryBag);

  tagInteractive(onlineDispatchGroup, {
    id: 'online-dispatch',
    kind: 'online-dispatch',
    label: 'Online Delivery Dispatch (Send App Order)',
  });
  frontCounter.add(onlineDispatchGroup);

  // Overhead Aluminum Ticket Rail
  const ticketRailGroup = new THREE.Group();
  ticketRailGroup.position.set(0, 2.05, 0);
  const railBar = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.07, 0.06), steelMat);
  ticketRailGroup.add(railBar);
  [-1.6, 1.6].forEach((rx) => {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 2.0, 8), darkSteelMat);
    rod.position.set(rx, 1.0, 0);
    ticketRailGroup.add(rod);
  });
  frontCounter.add(ticketRailGroup);

  // Stacked Kraft/Red Arbish Takeout Bags by Online Dispatch Pad (X = 3.35)
  [0, 1].forEach((bIdx) => {
    const bag = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.28, 0.14),
      new THREE.MeshStandardMaterial({ color: bIdx === 0 ? 0xd4b483 : 0xdc2626, roughness: 0.78 })
    );
    bag.position.set(3.38 + bIdx * 0.12, 1.13, -0.22 + bIdx * 0.08);
    bag.rotation.y = bIdx * 0.25;
    frontCounter.add(bag);
  });

  group.add(frontCounter);

  // =========================================================================
  // 3. COLD FRIDGE, GLASS DISPLAY COOLER & BUN RACK (Left Wall: X = -4.85)
  // =========================================================================
  const fridgeGroup = new THREE.Group();
  fridgeGroup.position.set(-4.85, 0, -2.6);
  fridgeGroup.rotation.y = Math.PI / 2;

  const fridgeBody = new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.3, 0.9), steelMat);
  fridgeBody.position.y = 1.15;
  fridgeBody.castShadow = true;
  fridgeGroup.add(fridgeBody);

  const fridgeHeader = new THREE.Mesh(new THREE.BoxGeometry(1.77, 0.28, 0.92), redAccentMat);
  fridgeHeader.position.y = 2.16;
  fridgeGroup.add(fridgeHeader);

  // Illuminated cool-blue interior window panel above patty/bun bins
  const coolerWindow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.38, 0.65),
    new THREE.MeshStandardMaterial({
      color: 0xdbeafe,
      emissive: 0x60a5fa,
      emissiveIntensity: 0.45,
      roughness: 0.15,
    })
  );
  coolerWindow.position.set(0, 1.56, 0.46);
  fridgeGroup.add(coolerWindow);

  // Raw Patty Crate (Frosted Icy Cyan Display + Textured Smash Patties)
  const pattyCrate = new THREE.Group();
  pattyCrate.position.set(-0.4, 0.72, 0.48);
  const crateBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.52, 0.14),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.45 })
  );
  pattyCrate.add(crateBox);

  const frostTrim = new THREE.Mesh(
    new THREE.BoxGeometry(0.64, 0.48, 0.025),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.55,
      roughness: 0.2,
    })
  );
  frostTrim.position.set(0, 0, 0.068);
  pattyCrate.add(frostTrim);

  const crateInner = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.42, 0.025),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 })
  );
  crateInner.position.set(0, 0, 0.072);
  pattyCrate.add(crateInner);

  const cratePattyTex = createBeefPattyTexture(anisotropy, 'raw');
  const cratePattyMat = new THREE.MeshPhysicalMaterial({
    map: cratePattyTex,
    bumpMap: cratePattyTex,
    bumpScale: 0.014,
    roughness: 0.36,
    clearcoat: 0.24,
    clearcoatRoughness: 0.26,
  });
  for (let i = 0; i < 6; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.092, 0.032, 16), cratePattyMat);
    p.rotation.x = Math.PI / 2;
    p.position.set(-0.16 + col * 0.16, 0.09 - row * 0.18, 0.092);
    pattyCrate.add(p);
  }
  tagInteractive(pattyCrate, {
    id: 'fridge-patty',
    kind: 'fridge-patty',
    label: 'Take Raw Beef Patty',
  });
  fridgeGroup.add(pattyCrate);

  // Brioche Bun Rack
  const bunCrate = new THREE.Group();
  bunCrate.position.set(0.4, 0.72, 0.48);
  const bunBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.52, 0.14),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.45 })
  );
  bunCrate.add(bunBox);
  const bunIcon = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: createSesameBunTexture(anisotropy), roughness: 0.6 })
  );
  bunIcon.position.set(0, 0.0, 0.09);
  bunIcon.rotation.x = Math.PI / 2;
  bunCrate.add(bunIcon);
  tagInteractive(bunCrate, {
    id: 'fridge-bun',
    kind: 'fridge-bun',
    label: 'Take Brioche Bun',
  });
  fridgeGroup.add(bunCrate);

  group.add(fridgeGroup);

  // Tall Glass-Door Pepsi Beverage Cooler (Visible behind left pass, matching Makkah photo)
  const pepsiCooler = new THREE.Group();
  pepsiCooler.position.set(-4.85, 0, -4.55);
  const pcBody = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.25, 0.85), darkSteelMat);
  pcBody.position.y = 1.125;
  pcBody.castShadow = true;
  pepsiCooler.add(pcBody);

  const pcHeader = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.34, 0.06),
    new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      emissive: 0x2563eb,
      emissiveIntensity: 0.9,
      roughness: 0.25,
    })
  );
  pcHeader.position.set(0, 2.04, 0.42);
  pepsiCooler.add(pcHeader);

  const pcInterior = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 1.56),
    new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.55,
      roughness: 0.2,
    })
  );
  pcInterior.position.set(0, 1.06, 0.43);
  pepsiCooler.add(pcInterior);

  [0.58, 0.98, 1.38].forEach((sy) => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.03, 0.08), steelMat);
    shelf.position.set(0, sy, 0.44);
    pepsiCooler.add(shelf);
    for (let cx = -0.28; cx <= 0.28; cx += 0.14) {
      const can = new THREE.Mesh(
        new THREE.CylinderGeometry(0.034, 0.034, 0.12, 10),
        new THREE.MeshStandardMaterial({ color: cx < 0 ? 0x1d4ed8 : 0xdc2626, metalness: 0.6, roughness: 0.3 })
      );
      can.position.set(cx, sy + 0.075, 0.45);
      pepsiCooler.add(can);
    }
  });
  group.add(pepsiCooler);

  // =========================================================================
  // 4. FLAT-TOP SMASH GRILL & BUN TOASTER (Back Wall Left: X = -2.2, Z = -4.55)
  // =========================================================================
  const grillGroup = new THREE.Group();
  grillGroup.position.set(-2.2, 0, -4.55);

  const grillStand = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.85, 1.05), steelMat);
  grillStand.position.y = 0.425;
  grillStand.castShadow = true;
  grillGroup.add(grillStand);

  // Glowing Amber Burner Strip beneath the grill plate
  const burnerGlow = new THREE.Mesh(
    new THREE.BoxGeometry(2.26, 0.045, 0.06),
    new THREE.MeshStandardMaterial({
      color: 0xff6b00,
      emissive: 0xff5500,
      emissiveIntensity: 1.8,
    })
  );
  burnerGlow.position.set(0, 0.835, 0.52);
  grillGroup.add(burnerGlow);

  const grillPlate = new THREE.Mesh(
    new THREE.BoxGeometry(2.36, 0.06, 0.92),
    new THREE.MeshStandardMaterial({ color: 0x383a40, metalness: 0.8, roughness: 0.32 })
  );
  grillPlate.position.y = 0.88;
  grillPlate.receiveShadow = true;
  grillGroup.add(grillPlate);

  // Chrome Spatula resting on right edge
  const spatulaBlade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.01, 0.16), steelMat);
  spatulaBlade.position.set(0.95, 0.92, 0.25);
  grillGroup.add(spatulaBlade);
  const spatulaHandle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.22), darkSteelMat);
  spatulaHandle.position.set(0.95, 0.935, 0.42);
  grillGroup.add(spatulaHandle);

  [-1.2, 1.2].forEach((sx) => {
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.96), steelMat);
    guard.position.set(sx, 0.98, 0);
    grillGroup.add(guard);
  });
  const backGuard = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.28, 0.06), steelMat);
  backGuard.position.set(0, 1.01, -0.47);
  grillGroup.add(backGuard);

  [-0.85, -0.3, 0.25, 0.8].forEach((kx) => {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 12), redAccentMat);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(kx, 0.74, 0.54);
    grillGroup.add(knob);
  });

  // Exhaust hood with glowing warm under-hood light strip
  const hood = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.65, 1.2), steelMat);
  hood.position.set(0, 2.55, 0);
  grillGroup.add(hood);
  const hoodLightStrip = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.03, 0.14),
    new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xffd580,
      emissiveIntensity: 2.0,
    })
  );
  hoodLightStrip.position.set(0, 2.22, -0.15);
  grillGroup.add(hoodLightStrip);

  const duct = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.2, 0.65), steelMat);
  duct.position.set(0, 3.45, -0.15);
  grillGroup.add(duct);

  const grillSlotAnchors: THREE.Vector3[] = [];
  const grillProgressBars: THREE.Mesh[] = [];
  const slotOffsets: Array<[number, number]> = [
    [-0.78, -0.18],
    [-0.22, -0.18],
    [-0.78, 0.22],
    [-0.22, 0.22],
  ];

  slotOffsets.forEach(([sx, sz], idx) => {
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.19, 0.012, 18),
      new THREE.MeshStandardMaterial({ color: 0x222328, metalness: 0.7, roughness: 0.35 })
    );
    pad.position.set(sx, 0.916, sz);
    tagInteractive(pad, {
      id: `grill-slot-${idx}`,
      kind: 'grill-slot',
      slotIndex: idx,
      label: `Grill Zone ${idx + 1}`,
    });
    grillGroup.add(pad);

    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.025, 0.03),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    bar.position.set(sx, 1.08, sz - 0.18);
    bar.visible = false;
    grillGroup.add(bar);
    grillProgressBars.push(bar);

    grillSlotAnchors.push(new THREE.Vector3(-2.2 + sx, 0.925, -4.55 + sz));
  });

  // Bun Toaster Zone
  const toasterZone = new THREE.Group();
  toasterZone.position.set(0.62, 0.92, 0.02);
  const toasterPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.64, 0.03, 0.68),
    new THREE.MeshStandardMaterial({ color: 0x454952, metalness: 0.85, roughness: 0.25 })
  );
  toasterZone.add(toasterPlate);
  tagInteractive(toasterZone, {
    id: 'bun-toaster',
    kind: 'bun-toaster',
    label: 'Bun Toaster Plate',
  });
  grillGroup.add(toasterZone);

  group.add(grillGroup);

  // =========================================================================
  // 5. 3-VAT DEEP FRYER STATION (Back Wall Center-Right: X = +1.25, Z = -4.55)
  // =========================================================================
  const fryerGroup = new THREE.Group();
  fryerGroup.position.set(1.25, 0, -4.55);

  const fryerBody = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.88, 1.0), steelMat);
  fryerBody.position.y = 0.44;
  fryerBody.castShadow = true;
  fryerGroup.add(fryerBody);

  const fryerBack = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.48, 0.1), steelMat);
  fryerBack.position.set(0, 1.1, -0.45);
  fryerGroup.add(fryerBack);

  const fryerHood = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 1.15), steelMat);
  fryerHood.position.set(0, 2.55, 0);
  fryerGroup.add(fryerHood);

  const fryerBaskets: THREE.Group[] = [];
  const fryerOilMeshes: THREE.Mesh[] = [];
  const fryerProgressBars: THREE.Mesh[] = [];

  [-0.62, 0.0, 0.62].forEach((vx, idx) => {
    const kind =
      idx === 0
        ? 'Fries Basket'
        : idx === 1
          ? 'Chicken Strips'
          : 'Sides Basket (Rings / Mozz / Bites)';
    const oilMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xb45309,
      emissiveIntensity: 0.42,
      roughness: 0.12,
      metalness: 0.1,
    });
    const oil = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.66), oilMat);
    oil.position.set(vx, 0.87, 0.02);
    fryerGroup.add(oil);
    fryerOilMeshes.push(oil);

    const basket = new THREE.Group();
    basket.position.set(vx, 1.02, 0.05);

    const wireMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.85,
      roughness: 0.25,
    });
    const basketFrame = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 0.5), wireMat);
    basket.add(basketFrame);

    const handleArm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.36), wireMat);
    handleArm.position.set(0, 0.1, 0.38);
    basket.add(handleArm);

    const grip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.22, 10),
      idx === 0 ? redAccentMat : idx === 2 ? new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.45 }) : darkSteelMat
    );
    grip.rotation.x = Math.PI / 2;
    grip.position.set(0, 0.11, 0.56);
    basket.add(grip);

    tagInteractive(basket, {
      id: `fryer-slot-${idx}`,
      kind: 'fryer-slot',
      slotIndex: idx,
      label: `Deep Fryer — ${kind}`,
    });
    fryerGroup.add(basket);
    fryerBaskets.push(basket);

    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.035, 0.03),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    bar.position.set(vx, 1.28, -0.32);
    bar.visible = false;
    fryerGroup.add(bar);
    fryerProgressBars.push(bar);
  });

  group.add(fryerGroup);

  // =========================================================================
  // 6. SODA FOUNTAIN DISPENSER (Back Wall Right: X = +3.65, Z = -4.55)
  // =========================================================================
  const sodaGroup = new THREE.Group();
  sodaGroup.position.set(3.65, 0, -4.55);

  const sodaCabinet = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 0.95), counterBaseMat);
  sodaCabinet.position.y = 0.45;
  sodaGroup.add(sodaCabinet);

  const sodaTop = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.06, 1.0), steelMat);
  sodaTop.position.y = 0.93;
  sodaGroup.add(sodaTop);

  const towerBody = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.72, 0.52), darkSteelMat);
  towerBody.position.set(0, 1.32, -0.15);
  sodaGroup.add(towerBody);

  const marquee = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.22, 0.04),
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.85,
    })
  );
  marquee.position.set(0, 1.54, 0.12);
  sodaGroup.add(marquee);

  const dripTray = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.05, 0.28), steelMat);
  dripTray.position.set(0, 0.98, 0.16);
  sodaGroup.add(dripTray);

  const flavors: Array<{ name: 'Cola' | 'Citrus' | 'Berry'; color: number; x: number }> = [
    { name: 'Cola', color: 0xef4444, x: -0.25 },
    { name: 'Citrus', color: 0x84cc16, x: 0.0 },
    { name: 'Berry', color: 0x3b82f6, x: 0.25 },
  ];
  flavors.forEach((f) => {
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.08, 10), darkSteelMat);
    nozzle.position.set(f.x, 1.32, 0.16);
    sodaGroup.add(nozzle);

    const button = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.1, 0.04),
      new THREE.MeshStandardMaterial({ color: f.color, emissive: f.color, emissiveIntensity: 0.35 })
    );
    button.position.set(f.x, 1.4, 0.12);
    tagInteractive(button, {
      id: `soda-${f.name}`,
      kind: 'soda-dispenser',
      flavor: f.name,
      label: `Pour ${f.name} Soda`,
    });
    sodaGroup.add(button);
  });

  const cupStackGroup = new THREE.Group();
  cupStackGroup.position.set(-0.56, 0.96, 0.1);
  const cupTex = createArbishCupTexture(anisotropy);
  for (let i = 0; i < 4; i++) {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.048, 0.18, 14),
      new THREE.MeshStandardMaterial({ map: cupTex, roughness: 0.45 })
    );
    cup.position.y = 0.09 + i * 0.045;
    cupStackGroup.add(cup);
  }
  tagInteractive(cupStackGroup, {
    id: 'soda-cup-stack',
    kind: 'soda-cup-stack',
    label: 'Grab Empty Arbish Cup',
  });
  sodaGroup.add(cupStackGroup);

  const drinkCupGroup = new THREE.Group();
  drinkCupGroup.position.set(0, 1.01, 0.18);
  drinkCupGroup.visible = false;

  const activeCupMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.048, 0.2, 16, 1, true),
    new THREE.MeshStandardMaterial({ map: cupTex, side: THREE.DoubleSide, roughness: 0.4 })
  );
  activeCupMesh.position.y = 0.1;
  drinkCupGroup.add(activeCupMesh);

  const drinkLiquidMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.062, 0.045, 0.18, 14),
    new THREE.MeshStandardMaterial({ color: 0x3a1c0a, roughness: 0.1 })
  );
  drinkLiquidMesh.position.y = 0.09;
  drinkCupGroup.add(drinkLiquidMesh);

  tagInteractive(drinkCupGroup, {
    id: 'soda-active-cup',
    kind: 'soda-dispenser',
    flavor: 'Cola',
    label: 'Take Filled Soda Cup',
  });
  sodaGroup.add(drinkCupGroup);

  group.add(sodaGroup);

  // =========================================================================
  // 7. CENTER KITCHEN ISLAND: PREP & BURGER ASSEMBLY BOARD (X = +0.15, Z = -2.25)
  // =========================================================================
  const prepGroup = new THREE.Group();
  prepGroup.position.set(0.15, 0, -2.25);

  const prepBody = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.88, 1.15), steelMat);
  prepBody.position.y = 0.44;
  prepBody.castShadow = true;
  prepBody.receiveShadow = true;
  prepGroup.add(prepBody);

  const board = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.045, 0.62),
    new THREE.MeshStandardMaterial({ map: createWoodBoardTexture(anisotropy), roughness: 0.72 })
  );
  board.position.set(-0.35, 0.905, 0.15);
  prepGroup.add(board);

  // Interactive Makkah Arbish 5-Sauce Rack (Classic, Cheese, Spicy, Maple, Cherry)
  const sauceRackGroup = new THREE.Group();
  sauceRackGroup.position.set(0.95, 0.91, -0.32);
  const sauceRack = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.04, 0.2), steelMat);
  sauceRackGroup.add(sauceRack);
  prepGroup.add(sauceRackGroup);

  const sauceBottles: Array<{ id: IngredientId; label: string; color: number; x: number }> = [
    { id: 'classic-sauce', label: 'Add Classic Sauce', color: 0xea580c, x: -0.26 },
    { id: 'cheese-sauce', label: 'Add Cheese Sauce', color: 0xfbbf24, x: -0.13 },
    { id: 'spicy-sauce', label: 'Add Spicy Sauce', color: 0xef4444, x: 0.0 },
    { id: 'maple-sauce', label: 'Add Maple Sauce', color: 0xd97706, x: 0.13 },
    { id: 'cherry-sauce', label: 'Add Cherry Sauce', color: 0xbe123c, x: 0.26 },
  ];
  sauceBottles.forEach((s) => {
    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.034, 0.22, 12),
      new THREE.MeshStandardMaterial({ color: s.color, roughness: 0.35 })
    );
    bottle.position.set(0.95 + s.x, 1.03, -0.32);
    tagInteractive(bottle, {
      id: `prep-${s.id}`,
      kind: 'prep-ingredient',
      ingredient: s.id,
      label: s.label,
    });
    prepGroup.add(bottle);
  });

  const ingredientBins: Array<{
    id: IngredientId;
    label: string;
    color: number;
    x: number;
  }> = [
    { id: 'cheese', label: 'Add Cheddar Cheese', color: 0xfbbf24, x: -1.16 },
    { id: 'lettuce', label: 'Add Crisp Lettuce', color: 0x4ade80, x: -0.8 },
    { id: 'tomato', label: 'Add Fresh Tomato', color: 0xef4444, x: -0.44 },
    { id: 'jalapeno', label: 'Add Sliced Jalapeño', color: 0x16a34a, x: -0.08 },
    { id: 'mozzarella', label: 'Add Mozzarella Cheese', color: 0xfef3c7, x: 0.28 },
  ];

  ingredientBins.forEach((bin) => {
    const pan = new THREE.Group();
    pan.position.set(bin.x, 0.91, -0.34);

    const rim = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.32), steelMat);
    pan.add(rim);

    const foodFill = new THREE.Mesh(
      new THREE.BoxGeometry(0.27, 0.06, 0.27),
      new THREE.MeshStandardMaterial({ color: bin.color, roughness: 0.5 })
    );
    foodFill.position.y = 0.025;
    pan.add(foodFill);

    tagInteractive(pan, {
      id: `prep-${bin.id}`,
      kind: 'prep-ingredient',
      ingredient: bin.id,
      label: bin.label,
    });
    prepGroup.add(pan);
  });

  const assemblyAnchor = new THREE.Group();
  assemblyAnchor.position.set(-0.35, 0.935, 0.15);

  const prepTrayBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.02, 0.48),
    new THREE.MeshStandardMaterial({ color: 0x1e2025, roughness: 0.4, metalness: 0.3 })
  );
  prepTrayBase.position.y = 0.01;
  assemblyAnchor.add(prepTrayBase);

  tagInteractive(assemblyAnchor, {
    id: 'prep-assembly',
    kind: 'prep-plate',
    label: 'Assembly Board (Add Held Item / Pick Up Tray)',
  });
  prepGroup.add(assemblyAnchor);

  const wrapStation = new THREE.Group();
  wrapStation.position.set(0.65, 0.91, 0.12);
  const wrapMat = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.04, 0.44),
    new THREE.MeshStandardMaterial({ color: 0xe61919, roughness: 0.38 })
  );
  wrapStation.add(wrapMat);
  tagInteractive(wrapStation, {
    id: 'prep-plate',
    kind: 'prep-plate',
    label: 'Pick Up Plated Order',
  });
  prepGroup.add(wrapStation);

  const clearStation = new THREE.Group();
  clearStation.position.set(1.22, 0.91, 0.12);
  const clearPad = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.04, 0.34),
    new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.5 })
  );
  clearStation.add(clearPad);
  tagInteractive(clearStation, {
    id: 'prep-clear',
    kind: 'prep-clear',
    label: 'Clear Assembly Board',
  });
  prepGroup.add(clearStation);

  group.add(prepGroup);

  // =========================================================================
  // 8. STAINLESS TRASH BIN (Beside Prep Island: X = +2.35, Z = -2.25)
  // =========================================================================
  const trashGroup = new THREE.Group();
  trashGroup.position.set(2.35, 0, -2.25);

  const binBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.78, 16), steelMat);
  binBody.position.y = 0.39;
  binBody.castShadow = true;
  trashGroup.add(binBody);

  const binLid = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.08, 16), darkSteelMat);
  binLid.position.y = 0.8;
  trashGroup.add(binLid);

  tagInteractive(trashGroup, {
    id: 'trash-bin',
    kind: 'trash',
    label: 'Trash Bin (Discard Held Item)',
  });
  group.add(trashGroup);

  return {
    group,
    grillPatties: [null, null, null, null],
    grillSlotAnchors,
    grillProgressBars,
    bunSlotMesh: null,
    fryerBaskets,
    fryerOilMeshes,
    fryerProgressBars,
    assemblyAnchor,
    drinkCupGroup,
    drinkLiquidMesh,
    ticketRailGroup,
    registerScreenMat,
    serveMatGlow,
    onlineTabletScreenMat,
    onlineDispatchGlow,
    onlineDeliveryBag,
  };
}

// ===========================================================================
// COMPOSITE 3D FOOD ITEM BUILDERS
// ===========================================================================
export function buildFoodMesh(
  type:
    | 'raw-patty'
    | 'cooked-patty'
    | 'burnt-patty'
    | 'raw-bun'
    | 'toasted-bun'
    | 'bottom-bun'
    | 'top-bun'
    | 'cheese'
    | 'lettuce'
    | 'tomato'
    | 'jalapeno'
    | 'mozzarella'
    | 'sauce'
    | 'classic-sauce'
    | 'cheese-sauce'
    | 'spicy-sauce'
    | 'maple-sauce'
    | 'cherry-sauce'
    | 'fries-cup'
    | 'chicken-box'
    | 'sides-box'
    | 'soda-cup',
  anisotropy = 4
): THREE.Group {
  const g = new THREE.Group();

  if (type === 'raw-patty' || type === 'cooked-patty' || type === 'burnt-patty') {
    const pattyState =
      type === 'raw-patty' ? 'raw' : type === 'cooked-patty' ? 'cooked' : 'burnt';
    const pattyTex = createBeefPattyTexture(anisotropy, pattyState);
    const mat = new THREE.MeshPhysicalMaterial({
      map: pattyTex,
      bumpMap: pattyTex,
      bumpScale: 0.015,
      roughness: type === 'raw-patty' ? 0.36 : type === 'cooked-patty' ? 0.48 : 0.88,
      metalness: 0.05,
      clearcoat: type === 'cooked-patty' ? 0.45 : type === 'raw-patty' ? 0.2 : 0.04,
      clearcoatRoughness: 0.24,
    });
    const patty = new THREE.Mesh(new THREE.CylinderGeometry(0.144, 0.152, 0.036, 20), mat);
    patty.position.y = 0.02;
    patty.castShadow = true;
    g.add(patty);

    // Lacy crispy smash-burger skirt rim + crust nibs
    const skirtColor =
      type === 'raw-patty' ? 0x991b1b : type === 'cooked-patty' ? 0x3f1d0b : 0x111111;
    const skirtMat = new THREE.MeshStandardMaterial({
      map: pattyTex,
      color: skirtColor,
      roughness: type === 'cooked-patty' ? 0.58 : 0.78,
      metalness: 0.04,
    });
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.162, 0.158, 0.013, 18), skirtMat);
    skirt.position.y = 0.009;
    skirt.scale.set(1.03, 1, 0.97);
    skirt.castShadow = true;
    g.add(skirt);

    if (type === 'cooked-patty') {
      // Sizzling butter-sear center highlight ring & caramelized edge nibs
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + 0.3;
        const nib = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.014, 0.024), skirtMat);
        nib.position.set(Math.cos(ang) * 0.15, 0.011, Math.sin(ang) * 0.145);
        nib.rotation.y = ang;
        g.add(nib);
      }
    }
    return g;
  }

  if (type === 'raw-bun' || type === 'toasted-bun' || type === 'bottom-bun') {
    const color = type === 'raw-bun' ? 0xe5b77b : 0xc98236;
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.65 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.045, 18), mat);
    base.position.y = 0.022;
    g.add(base);
    if (type !== 'bottom-bun') {
      const top = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({
          map: createSesameBunTexture(anisotropy),
          roughness: 0.55,
        })
      );
      top.scale.y = 0.55;
      top.position.y = 0.046;
      g.add(top);
    }
    return g;
  }

  if (type === 'top-bun') {
    const top = new THREE.Mesh(
      new THREE.SphereGeometry(0.145, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({
        map: createSesameBunTexture(anisotropy),
        roughness: 0.55,
      })
    );
    top.scale.y = 0.58;
    g.add(top);
    return g;
  }

  if (type === 'cheese') {
    const slice = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.015, 0.24),
      new THREE.MeshPhysicalMaterial({
        color: 0xfbbf24,
        roughness: 0.26,
        clearcoat: 0.45,
        clearcoatRoughness: 0.2,
      })
    );
    slice.rotation.y = Math.PI / 6;
    slice.position.y = 0.008;
    g.add(slice);
    return g;
  }

  if (type === 'lettuce') {
    const mat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.52 });
    for (let i = 0; i < 4; i++) {
      const leaf = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.018, 7), mat);
      leaf.position.set(Math.cos(i * 1.5) * 0.04, 0.01, Math.sin(i * 1.5) * 0.04);
      leaf.rotation.y = i * 0.8;
      g.add(leaf);
    }
    return g;
  }

  if (type === 'tomato') {
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      roughness: 0.16,
      clearcoat: 0.75,
      clearcoatRoughness: 0.12,
    });
    [-0.05, 0.05].forEach((tx) => {
      const slice = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.018, 14), mat);
      slice.position.set(tx, 0.01, tx * 0.4);
      g.add(slice);
    });
    return g;
  }

  if (type === 'jalapeno') {
    const jMat = new THREE.MeshPhysicalMaterial({
      color: 0x15803d,
      roughness: 0.25,
      clearcoat: 0.45,
    });
    [
      [-0.045, 0.02],
      [0.04, -0.025],
      [0.0, 0.045],
      [-0.015, -0.04],
    ].forEach(([jx, jz]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.009, 8, 14), jMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(jx, 0.01, jz);
      g.add(ring);
    });
    return g;
  }

  if (type === 'mozzarella') {
    const mozzMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.35 });
    for (let i = 0; i < 4; i++) {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.14, 10), mozzMat);
      stick.rotation.z = Math.PI / 2;
      stick.position.set(0, 0.018, -0.06 + i * 0.04);
      g.add(stick);
    }
    return g;
  }

  if (
    type === 'sauce' ||
    type === 'classic-sauce' ||
    type === 'cheese-sauce' ||
    type === 'spicy-sauce' ||
    type === 'maple-sauce' ||
    type === 'cherry-sauce'
  ) {
    const sauceColor =
      type === 'cheese-sauce'
        ? 0xfbbf24
        : type === 'spicy-sauce'
          ? 0xdc2626
          : type === 'classic-sauce'
            ? 0xea580c
            : type === 'cherry-sauce'
              ? 0xbe123c
              : 0xd97706;
    const sauceMat = new THREE.MeshPhysicalMaterial({
      color: sauceColor,
      roughness: 0.14,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
    });
    const glaze = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.122, 0.012, 16), sauceMat);
    glaze.position.y = 0.007;
    g.add(glaze);
    const accentRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.068, 0.012, 8, 18),
      new THREE.MeshPhysicalMaterial({
        color: type === 'cheese-sauce' ? 0xf59e0b : 0xbe123c,
        roughness: 0.16,
        clearcoat: 0.85,
      })
    );
    accentRing.rotation.x = Math.PI / 2;
    accentRing.position.y = 0.012;
    g.add(accentRing);
    return g;
  }

  if (type === 'fries-cup') {
    // 3D Arbish Bucket of Fries (tapered red & charcoal bucket brimming with fries)
    const bucketBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.068, 0.16, 18),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.42 })
    );
    bucketBody.position.y = 0.08;
    bucketBody.castShadow = true;
    g.add(bucketBody);

    const bucketBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.088, 0.081, 0.042, 18),
      new THREE.MeshStandardMaterial({ color: 0x1f2024, roughness: 0.5 })
    );
    bucketBand.position.y = 0.085;
    g.add(bucketBand);

    const bucketRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.095, 0.009, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0xfafaf9, roughness: 0.35 })
    );
    bucketRim.rotation.x = Math.PI / 2;
    bucketRim.position.y = 0.158;
    g.add(bucketRim);

    const fryBed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.086, 0.076, 0.03, 14),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.6 })
    );
    fryBed.position.y = 0.145;
    g.add(fryBed);

    const fryMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
    for (let i = 0; i < 16; i++) {
      const fry = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.115, 0.015), fryMat);
      const ring = i < 10 ? 0.052 : 0.022;
      const angle = i < 10 ? (i / 10) * Math.PI * 2 : ((i - 10) / 6) * Math.PI * 2 + 0.3;
      fry.position.set(
        Math.cos(angle) * ring,
        0.175 + (i % 3) * 0.014,
        Math.sin(angle) * ring
      );
      fry.rotation.z = -Math.cos(angle) * (i < 10 ? 0.24 : 0.12);
      fry.rotation.x = Math.sin(angle) * (i < 10 ? 0.24 : 0.12);
      fry.rotation.y = angle;
      g.add(fry);
    }
    return g;
  }

  if (type === 'chicken-box') {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.09, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x202124, roughness: 0.5 })
    );
    box.position.y = 0.045;
    g.add(box);

    const nuggetMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.65 });
    for (let i = 0; i < 5; i++) {
      const bite = new THREE.Mesh(new THREE.DodecahedronGeometry(0.038, 0), nuggetMat);
      bite.position.set(-0.06 + (i % 3) * 0.06, 0.09, -0.03 + Math.floor(i / 3) * 0.06);
      g.add(bite);
    }
    return g;
  }

  if (type === 'sides-box') {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.092, 0.072, 0.085, 16),
      new THREE.MeshStandardMaterial({ color: 0xfafaf9, roughness: 0.55 })
    );
    cup.position.y = 0.042;
    g.add(cup);

    const crispyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.62 });
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2;
      const piece = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.012, 8, 14), crispyMat);
      piece.rotation.x = Math.PI / 2 + 0.25;
      piece.position.set(Math.cos(ang) * 0.025, 0.09 + i * 0.008, Math.sin(ang) * 0.025);
      g.add(piece);
    }
    return g;
  }

  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.048, 0.2, 16),
    new THREE.MeshStandardMaterial({ map: createArbishCupTexture(anisotropy), roughness: 0.4 })
  );
  cup.position.y = 0.1;
  g.add(cup);

  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.072, 0.072, 0.018, 16),
    new THREE.MeshStandardMaterial({ color: 0xf4f4f5, roughness: 0.3 })
  );
  lid.position.y = 0.205;
  g.add(lid);

  const straw = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.12, 8),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
  );
  straw.position.set(0.01, 0.26, 0);
  straw.rotation.z = 0.18;
  g.add(straw);
  return g;
}

export function buildPlatedTrayMesh(itemId: MenuItemId, anisotropy = 4): THREE.Group {
  const trayGroup = new THREE.Group();
  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.025, 0.38),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.45 })
  );
  tray.position.y = 0.0125;
  trayGroup.add(tray);

  const liner = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.34),
    new THREE.MeshStandardMaterial({
      map: createArbishTrayPaperTexture(anisotropy),
      roughness: 0.82,
    })
  );
  liner.rotation.x = -Math.PI / 2;
  liner.position.y = 0.027;
  trayGroup.add(liner);

  const addBurger = (
    x: number,
    z: number,
    variant: 'classic' | 'double' | 'maple' | 'chicken'
  ) => {
    const burger = new THREE.Group();
    burger.position.set(x, 0.028, z);
    let y = 0;

    if (variant === 'chicken') {
      const b = buildFoodMesh('bottom-bun', anisotropy);
      b.position.y = y;
      burger.add(b);
      y += 0.042;

      const fillet = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.042, 0.22),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.62 })
      );
      fillet.position.y = y + 0.02;
      burger.add(fillet);
      y += 0.045;

      ['cheese', 'lettuce', 'top-bun'].forEach((l) => {
        const m = buildFoodMesh(l as Parameters<typeof buildFoodMesh>[0], anisotropy);
        m.position.y = y;
        burger.add(m);
        y += 0.02;
      });
      trayGroup.add(burger);
      return;
    }

    const layers: Array<Parameters<typeof buildFoodMesh>[0]> =
      variant === 'double'
        ? ['bottom-bun', 'cooked-patty', 'cheese', 'cooked-patty', 'cheese', 'lettuce', 'tomato', 'top-bun']
        : variant === 'maple'
          ? ['bottom-bun', 'cooked-patty', 'cheese', 'sauce', 'top-bun']
          : ['bottom-bun', 'cooked-patty', 'cheese', 'lettuce', 'top-bun'];

    layers.forEach((l) => {
      const m = buildFoodMesh(l, anisotropy);
      m.position.y = y;
      burger.add(m);
      y += l === 'cheese' || l === 'lettuce' || l === 'tomato' || l === 'sauce' ? 0.018 : 0.042;
    });
    trayGroup.add(burger);
  };

  const addDipCup = (x: number, z: number, colorHex: number) => {
    const dipCup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.044, 0.034, 0.042, 12),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 })
    );
    dipCup.position.set(x, 0.049, z);
    trayGroup.add(dipCup);
    const dipSauce = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, 0.01, 12),
      new THREE.MeshPhysicalMaterial({ color: colorHex, roughness: 0.15, clearcoat: 0.88 })
    );
    dipSauce.position.set(x, 0.068, z);
    trayGroup.add(dipSauce);
  };

  const addLoadedArbishBowl = (kind: 'brisket' | 'nashville' | 'arbish') => {
    const bowl = new THREE.Group();
    bowl.position.set(0, 0.028, 0);
    const bowlBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.135, 0.1, 0.11, 20),
      new THREE.MeshStandardMaterial({ map: createArbishBowlTexture(anisotropy), roughness: 0.68 })
    );
    bowlBody.position.y = 0.055;
    bowl.add(bowlBody);

    const friesBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.125, 0.11, 0.03, 18),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.55 })
    );
    friesBase.position.y = 0.105;
    bowl.add(friesBase);

    // Cheese & sauce drizzle
    const cheeseMat = new THREE.MeshPhysicalMaterial({
      color: kind === 'nashville' ? 0xdc2626 : 0xfbbf24,
      roughness: 0.2,
      clearcoat: 0.7,
    });
    const drizzle = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.112, 0.014, 16), cheeseMat);
    drizzle.position.y = 0.122;
    bowl.add(drizzle);

    const toppingColor = kind === 'brisket' ? 0x451a03 : 0xd97706;
    const toppingMat = new THREE.MeshStandardMaterial({ color: toppingColor, roughness: 0.6 });
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const chunk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.024, 0), toppingMat);
      chunk.position.set(Math.cos(ang) * 0.055, 0.138, Math.sin(ang) * 0.055);
      bowl.add(chunk);
    }

    if (kind === 'arbish') {
      const jal = buildFoodMesh('jalapeno', anisotropy);
      jal.position.y = 0.138;
      bowl.add(jal);
    } else if (kind === 'brisket') {
      const pomMat = new THREE.MeshPhysicalMaterial({ color: 0x9f1239, roughness: 0.2, clearcoat: 0.8 });
      for (let i = 0; i < 5; i++) {
        const seed = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 6), pomMat);
        seed.position.set(-0.04 + i * 0.02, 0.145, (i % 2 === 0 ? 1 : -1) * 0.025);
        bowl.add(seed);
      }
    }
    trayGroup.add(bowl);
  };

  if (itemId === 'classic-burger') {
    addBurger(0, 0, 'classic');
  } else if (itemId === 'double-burger') {
    addBurger(0, 0, 'double');
  } else if (itemId === 'truffle-smash') {
    addBurger(0, 0, 'maple');
  } else if (itemId === 'crispy-chicken-burger') {
    const box = buildFoodMesh('chicken-box', anisotropy);
    box.position.set(-0.04, 0.028, 0);
    trayGroup.add(box);
    const glaze = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.075, 0.014, 14),
      new THREE.MeshPhysicalMaterial({ color: 0xb91c1c, roughness: 0.14, clearcoat: 0.9 })
    );
    glaze.position.set(-0.04, 0.128, 0);
    trayGroup.add(glaze);
    addDipCup(0.14, 0, 0xdc2626);
  } else if (itemId === 'chicken-bites') {
    const box = buildFoodMesh('chicken-box', anisotropy);
    box.position.set(0, 0.028, 0);
    trayGroup.add(box);
  } else if (itemId === 'brisket-fries') {
    addLoadedArbishBowl('brisket');
  } else if (itemId === 'nashville-fries') {
    addLoadedArbishBowl('nashville');
  } else if (itemId === 'arbish-fries') {
    addLoadedArbishBowl('arbish');
  } else if (itemId === 'loaded-fries') {
    const fries = buildFoodMesh('fries-cup', anisotropy);
    fries.position.set(0, 0.028, 0);
    trayGroup.add(fries);
  } else if (itemId === 'jalapeno-bites' || itemId === 'cheesy-bites') {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.072, 0.085, 16),
      new THREE.MeshStandardMaterial({ color: 0xfafaf9, roughness: 0.5 })
    );
    cup.position.set(0, 0.07, 0);
    trayGroup.add(cup);
    const biteMat = new THREE.MeshStandardMaterial({ color: 0xea951f, roughness: 0.58 });
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2 + 0.3;
      const bite = new THREE.Mesh(new THREE.DodecahedronGeometry(0.032, 0), biteMat);
      bite.position.set(Math.cos(ang) * 0.036, 0.118, Math.sin(ang) * 0.036);
      trayGroup.add(bite);
    }
    if (itemId === 'jalapeno-bites') {
      const jal = buildFoodMesh('jalapeno', anisotropy);
      jal.position.y = 0.135;
      trayGroup.add(jal);
    }
    addDipCup(0.15, 0, itemId === 'jalapeno-bites' ? 0xdc2626 : 0xfbbf24);
  } else if (itemId === 'mozzarella-sticks') {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.072, 0.095, 16),
      new THREE.MeshStandardMaterial({ color: 0xfafaf9, roughness: 0.5 })
    );
    cup.position.set(-0.02, 0.075, 0);
    trayGroup.add(cup);
    const stickMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.62 });
    for (let i = 0; i < 4; i++) {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.13, 10), stickMat);
      stick.position.set(-0.04 + i * 0.022, 0.13, (i % 2 === 0 ? 1 : -1) * 0.02);
      stick.rotation.z = -0.22 + i * 0.14;
      trayGroup.add(stick);
    }
    addDipCup(0.14, 0, 0xbe123c);
  } else if (itemId === 'onion-rings') {
    const cup = buildFoodMesh('sides-box', anisotropy);
    cup.position.set(0, 0.028, 0);
    trayGroup.add(cup);
  } else if (
    itemId === 'cheese-sauce' ||
    itemId === 'spicy-sauce' ||
    itemId === 'classic-sauce' ||
    itemId === 'maple-sauce' ||
    itemId === 'cherry-sauce'
  ) {
    const color =
      itemId === 'cheese-sauce'
        ? 0xfbbf24
        : itemId === 'spicy-sauce'
          ? 0xdc2626
          : itemId === 'classic-sauce'
            ? 0xea580c
            : itemId === 'cherry-sauce'
              ? 0xbe123c
              : 0xd97706;
    addDipCup(0, 0, color);
  } else if (itemId === 'bites-combo') {
    addBurger(-0.12, 0.02, 'classic');
    const fries = buildFoodMesh('fries-cup', anisotropy);
    fries.position.set(0.14, 0.028, 0.05);
    trayGroup.add(fries);
    const soda = buildFoodMesh('soda-cup', anisotropy);
    soda.position.set(0.14, 0.028, -0.09);
    trayGroup.add(soda);
  } else if (itemId === 'spicy-chicken-meal') {
    const box = buildFoodMesh('chicken-box', anisotropy);
    box.position.set(-0.12, 0.028, 0.02);
    trayGroup.add(box);
    const fries = buildFoodMesh('fries-cup', anisotropy);
    fries.position.set(0.14, 0.028, 0.05);
    trayGroup.add(fries);
    const soda = buildFoodMesh('soda-cup', anisotropy);
    soda.position.set(0.14, 0.028, -0.09);
    trayGroup.add(soda);
  } else if (itemId === 'double-smash-meal') {
    addBurger(-0.12, 0.02, 'double');
    const fries = buildFoodMesh('fries-cup', anisotropy);
    fries.position.set(0.14, 0.028, 0.05);
    trayGroup.add(fries);
    const soda = buildFoodMesh('soda-cup', anisotropy);
    soda.position.set(0.14, 0.028, -0.09);
    trayGroup.add(soda);
  }

  return trayGroup;
}

// ===========================================================================
// COMPOSITE ARTICULATED 3D CUSTOMER BUILDER
// ===========================================================================
export interface CustomerRig {
  group: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  headGroup: THREE.Group;
  statusHalo: THREE.Mesh;
  heldTrayAnchor: THREE.Group;
}

export function buildCustomerRig(
  id: string,
  shirtColor: number,
  pantsColor: number,
  skinColor: number,
  hairColor: number,
  label: string
): CustomerRig {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.72 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.78 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.82 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.75 });

  const buildLeg = (x: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.78, 0);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.068, 0.72, 12), pantsMat);
    leg.position.y = -0.36;
    leg.castShadow = true;
    pivot.add(leg);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.22), shoeMat);
    shoe.position.set(0, -0.735, 0.04);
    pivot.add(shoe);
    group.add(pivot);
    return pivot;
  };
  const leftLegPivot = buildLeg(-0.11);
  const rightLegPivot = buildLeg(0.11);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.24), shirtMat);
  torso.position.y = 1.07;
  torso.castShadow = true;
  group.add(torso);

  const buildArm = (x: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 1.3, 0);
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.44, 10), shirtMat);
    sleeve.position.y = -0.22;
    pivot.add(sleeve);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), skinMat);
    hand.position.y = -0.46;
    pivot.add(hand);
    group.add(pivot);
    return pivot;
  };
  const leftArmPivot = buildArm(-0.28);
  const rightArmPivot = buildArm(0.28);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.5, 0);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), skinMat);
  head.castShadow = true;
  headGroup.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
    hairMat
  );
  hair.position.y = 0.03;
  hair.rotation.x = -0.18;
  headGroup.add(hair);

  // Some guests wear a sleek baseball cap!
  const numericSeed = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  if (numericSeed % 2 === 0) {
    const capMat = new THREE.MeshStandardMaterial({
      color: numericSeed % 4 === 0 ? 0xdc2626 : 0x18181b,
      roughness: 0.65,
    });
    const capDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.186, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.46),
      capMat
    );
    capDome.position.y = 0.04;
    headGroup.add(capDome);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.025, 0.16), capMat);
    brim.position.set(0, 0.06, 0.18);
    headGroup.add(brim);
  }

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
  [-0.06, 0.06].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), eyeMat);
    eye.position.set(ex, 0.02, 0.155);
    headGroup.add(eye);
  });

  group.add(headGroup);

  const statusHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.024, 10, 24),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b })
  );
  statusHalo.rotation.x = Math.PI / 2;
  statusHalo.position.set(0, 1.88, 0);
  statusHalo.visible = false;
  group.add(statusHalo);

  const heldTrayAnchor = new THREE.Group();
  heldTrayAnchor.position.set(0, 1.0, 0.38);
  group.add(heldTrayAnchor);

  tagInteractive(group, {
    id: `customer-${id}`,
    kind: 'customer',
    customerId: id,
    label,
  });

  return {
    group,
    leftLegPivot,
    rightLegPivot,
    leftArmPivot,
    rightArmPivot,
    headGroup,
    statusHalo,
    heldTrayAnchor,
  };
}
