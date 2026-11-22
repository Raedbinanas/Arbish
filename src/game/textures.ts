import * as THREE from 'three';

function configureColorTexture(
  canvas: HTMLCanvasElement,
  anisotropy: number,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  if (repeatX !== 1 || repeatY !== 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  tex.needsUpdate = true;
  return tex;
}

/**
 * Recreates the exact Arbish Bites storefront upper facade & charcoal signboard
 * from the reference sketch:
 * - Upper crisp white facade
 * - Deep charcoal band (#1E1F22)
 * - Sweeping vivid red cursive "Arbish" whose tall 'A' crests into the white fascia
 * - Muted warm grey cursive "bites" on the right side of the dark band
 */
export function createArbishFacadeSignTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const drawSign = () => {
    // Matte-black architectural aluminum cladding across the full upper fascia
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#0B0C10');
    bgGrad.addColorStop(0.55, '#111217');
    bgGrad.addColorStop(1, '#08090C');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle matte cladding panel seams (vertical & horizontal)
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 3;
    [340, 680].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    });
    [420, 1024, 1628].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    });

    // Subtle crimson neon ambient wall wash behind "Arbish"
    const wash = ctx.createRadialGradient(840, 440, 40, 840, 440, 680);
    wash.addColorStop(0, 'rgba(239, 25, 25, 0.22)');
    wash.addColorStop(0.55, 'rgba(220, 20, 20, 0.07)');
    wash.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sleek glowing red cursive "Arbish" with sweeping calligraphic 'A' + hot neon core
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#FF1E1E';
    ctx.shadowBlur = 42;

    // Sweeping calligraphic "A"
    ctx.strokeStyle = '#FF1F1F';
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(310, 560);
    ctx.bezierCurveTo(260, 710, 535, 745, 595, 570);
    ctx.bezierCurveTo(645, 430, 650, 225, 625, 115);
    ctx.bezierCurveTo(610, 255, 650, 480, 715, 585);
    ctx.stroke();

    // Flowing crossbar swoosh
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(275, 585);
    ctx.bezierCurveTo(420, 515, 620, 485, 775, 505);
    ctx.stroke();

    // "rbish" script
    ctx.fillStyle = '#FF1F1F';
    ctx.font = '400 320px "Sacramento", "Brush Script MT", cursive';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('rbish', 760, 585);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#FF3B3B';
    ctx.strokeText('rbish', 760, 585);

    // Bright white-hot inner neon filament highlight along the 'A' & script
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(255, 225, 225, 0.72)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(310, 560);
    ctx.bezierCurveTo(260, 710, 535, 745, 595, 570);
    ctx.bezierCurveTo(645, 430, 650, 225, 625, 115);
    ctx.stroke();
    ctx.restore();

    // Tilted electric-white script "Bites" tucked to top-right of "Arbish"
    ctx.save();
    ctx.translate(1435, 270);
    ctx.rotate(-0.12);
    ctx.shadowColor = 'rgba(224, 242, 254, 0.85)';
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '400 170px "Sacramento", "Brush Script MT", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('Bites', 0, 0);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeText('Bites', 0, 0);
    ctx.restore();

    // Crisp wide-tracked "BURGERS AND MORE" centered beneath Arbish
    ctx.save();
    ctx.shadowColor = 'rgba(226, 232, 240, 0.65)';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#F1F5F9';
    ctx.font = '600 72px "Outfit", "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('B U R G E R S   A N D   M O R E', 1055, 735);
    ctx.restore();

    // Subtle sleek metallic underline bar
    const lineGrad = ctx.createLinearGradient(560, 775, 1550, 775);
    lineGrad.addColorStop(0, 'rgba(239,68,68,0)');
    lineGrad.addColorStop(0.35, 'rgba(239,68,68,0.85)');
    lineGrad.addColorStop(0.7, 'rgba(248,250,252,0.75)');
    lineGrad.addColorStop(1, 'rgba(248,250,252,0)');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(560, 775, 990, 4);
  };

  drawSign();
  const tex = configureColorTexture(canvas, anisotropy);

  // Re-render once Google Font "Sacramento" finishes loading if needed
  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => {
      drawSign();
      tex.needsUpdate = true;
    });
  }

  return tex;
}

/**
 * Transparent glass door decal matching the real Arbish Bites Makkah entrance:
 * Frosted glowing-outline hours & burger emblem on dark glass
 */
export function createDoorDecalTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Subtle smoked glass sheen
  ctx.fillStyle = 'rgba(180, 210, 235, 0.08)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Clean frosted-white outline burger + Arabic/English hours like photo
  ctx.fillStyle = 'rgba(245, 245, 245, 0.9)';
  ctx.textAlign = 'center';
  ctx.font = '700 30px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('ساعات العمل', 256, 215);
  ctx.font = '700 28px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('12:00pm - 3:00am', 256, 258);
  ctx.fillText('10:00pm - 1:00am', 256, 298);

  // Line-art frosted burger emblem centered below hours
  const cx = 256;
  const cy = 445;
  ctx.strokeStyle = 'rgba(245, 245, 245, 0.85)';
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Top bun dome
  ctx.beginPath();
  ctx.moveTo(cx - 95, cy - 26);
  ctx.bezierCurveTo(cx - 95, cy - 102, cx + 95, cy - 102, cx + 95, cy - 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sesame seeds
  ctx.fillStyle = '#141517';
  const seeds: [number, number, number][] = [
    [-46, -62, 0.3],
    [-12, -74, -0.2],
    [25, -70, 0.4],
    [54, -56, -0.35],
    [-25, -45, 0.15],
    [16, -44, -0.25],
    [-64, -40, 0.5],
  ];
  seeds.forEach(([sx, sy, rot]) => {
    ctx.save();
    ctx.translate(cx + sx, cy + sy);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Wavy lettuce
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.beginPath();
  ctx.moveTo(cx - 102, cy - 14);
  for (let i = 0; i <= 6; i++) {
    const x = cx - 102 + (204 / 6) * i;
    const y = cy - 14 + (i % 2 === 0 ? -8 : 8);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(cx + 100, cy + 8);
  ctx.lineTo(cx - 100, cy + 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Patty + melted cheese triangle
  ctx.beginPath();
  ctx.roundRect(cx - 98, cy + 8, 196, 26, 12);
  ctx.fill();
  ctx.stroke();

  // Cheese drape
  ctx.beginPath();
  ctx.moveTo(cx - 50, cy + 8);
  ctx.lineTo(cx - 8, cy + 32);
  ctx.lineTo(cx + 35, cy + 8);
  ctx.stroke();

  // Bottom bun
  ctx.beginPath();
  ctx.roundRect(cx - 92, cy + 36, 184, 28, [6, 6, 16, 16]);
  ctx.fill();
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function createMenuBoardTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111216';
  ctx.fillRect(0, 0, 1280, 640);

  ctx.strokeStyle = '#2B2E36';
  ctx.lineWidth = 8;
  ctx.strokeRect(12, 12, 1256, 616);

  // Header
  ctx.fillStyle = '#E61919';
  ctx.fillRect(36, 28, 12, 42);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 32px "Outfit", sans-serif';
  ctx.fillText('ARBISH BITES · MAKKAH', 62, 60);

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('AL-SHAWQIYYA  ·  12PM – 3AM  ·  ADD 7 SAR FOR MEAL', 1240, 58);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#27272A';
  ctx.fillRect(36, 82, 1208, 2);

  const col1: Array<[string, string, string]> = [
    ['Arbish Classic', 'Smash Beef · Cheese · Lettuce', '23 SAR'],
    ['Double Smash', '2x Beef · Double Cheese · Tomato', '23 SAR'],
    ['Supreme Maple Smash', 'Smash Beef · Cheese · Arbish Sauce', '24 SAR'],
    ['Nashville Strips', 'Hot Nashville Glazed Strips', '25 SAR'],
    ['Chicken Strips', 'Crispy Golden Chicken Strips', '23 SAR'],
    ['Classic / Strips / Double Meal', 'Burger or Strips · Fries · Soda', '30 SAR'],
  ];

  const col2: Array<[string, string, string]> = [
    ['Brisket Fries', 'Meat · Cheese · Sauce · Pomegranate', '21 SAR'],
    ['Nashville Fries', 'Nashville Chicken · Signature Sauce', '20 SAR'],
    ['Arbish Fries', 'Chicken · Cheese · Sauce · Jalapeño', '19 SAR'],
    ['Fries', 'Potatoes with Arbish Spices', '6 SAR'],
    ['Jalapeño Bites (4 pcs)', '4 Pieces of Jalapeño Cheese', '12 SAR'],
    ['Cheesy Bites (4 pcs)', '4 Pieces of Mixed Cheesy Bites', '10 SAR'],
  ];

  const col3: Array<[string, string, string]> = [
    ['Mozzarella Sticks (4 pcs)', '4 Crispy Mozzarella Cheese Sticks', '9 SAR'],
    ['Onion Rings (6 pcs)', '6 Golden Crispy Onion Rings', '9 SAR'],
    ['Cheese Sauce', 'Rich Warm Cheddar Cheese Dip', '2 SAR'],
    ['Spicy Sauce', 'Bold Fiery Nashville Dip', '2 SAR'],
    ['Classic / Maple / Cherry Sauce', 'Signature Arbish Dipping Cups', '2 SAR'],
  ];

  const renderCol = (
    heading: string,
    list: Array<[string, string, string]>,
    x: number,
    colW: number
  ) => {
    ctx.fillStyle = '#EF4444';
    ctx.font = '700 15px "Outfit", sans-serif';
    ctx.fillText(heading, x, 110);

    list.forEach(([title, desc, price], idx) => {
      const y = 148 + idx * 68;
      ctx.fillStyle = '#FAFAFA';
      ctx.font = '700 19px "Outfit", sans-serif';
      ctx.fillText(title, x, y);

      ctx.fillStyle = '#9CA3AF';
      ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(desc, x, y + 18);

      ctx.fillStyle = '#F59E0B';
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(price, x + colW, y + 2);
      ctx.textAlign = 'left';

      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(x, y + 32, colW, 1);
    });
  };

  renderCol('BURGERS & MEALS', col1, 42, 372);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(434, 96, 2, 470);
  renderCol('FRIES & BITES · البطاطس', col2, 454, 372);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(846, 96, 2, 470);
  renderCol('SIDES & SAUCES · الجانبية', col3, 866, 372);

  // Footer
  ctx.fillStyle = '#191B21';
  ctx.fillRect(36, 578, 1208, 36);
  ctx.fillStyle = '#F59E0B';
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SAUCES (2 SAR): Cheese · Spicy · Classic · Maple · Cherry', 52, 602);
  ctx.fillStyle = '#10B981';
  ctx.textAlign = 'right';
  ctx.fillText('HUNGERSTATION · JAHEZ · ARBISH APP', 1228, 602);
  ctx.textAlign = 'left';

  return configureColorTexture(canvas, anisotropy);
}

export function createDiningTileTexture(anisotropy: number): {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.DataTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm stone-cream porcelain tiles matching the real Arbish Bites floor
  const step = 128;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const shade = ((x + y) % 2 === 0) ? '#E2D8C8' : '#DBD0BE';
      ctx.fillStyle = shade;
      ctx.fillRect(x * step, y * step, step, step);

      ctx.fillStyle = 'rgba(130, 110, 90, 0.045)';
      for (let i = 0; i < 28; i++) {
        ctx.fillRect(
          x * step + Math.random() * step,
          y * step + Math.random() * step,
          4,
          4
        );
      }
    }
  }

  // Subtle porcelain grout lines
  ctx.strokeStyle = '#B8AD9B';
  ctx.lineWidth = 3;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * step, 0);
    ctx.lineTo(i * step, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * step);
    ctx.lineTo(512, i * step);
    ctx.stroke();
  }

  const map = configureColorTexture(canvas, anisotropy, 5, 4);

  // Roughness data map (linear space)
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const val = 85 + Math.floor(Math.random() * 30);
    data[i * 4] = val;
    data[i * 4 + 1] = val;
    data[i * 4 + 2] = val;
    data[i * 4 + 3] = 255;
  }
  const roughnessMap = new THREE.DataTexture(data, size, size);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(5, 4);
  roughnessMap.needsUpdate = true;

  return { map, roughnessMap };
}

export function createKitchenFloorTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3B3D42';
  ctx.fillRect(0, 0, 512, 512);

  const step = 64;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const shade = 52 + Math.floor(Math.random() * 14);
      ctx.fillStyle = `rgb(${shade + 8}, ${shade}, ${shade})`;
      ctx.fillRect(x * step + 2, y * step + 2, step - 4, step - 4);
    }
  }

  return configureColorTexture(canvas, anisotropy, 6, 4);
}

export function createAsphaltTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1D2026';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 4000; i++) {
    const v = 24 + Math.floor(Math.random() * 28);
    ctx.fillStyle = `rgb(${v}, ${v + 2}, ${v + 5})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }

  return configureColorTexture(canvas, anisotropy, 10, 6);
}

export function createWoodBoardTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#B88454';
  ctx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y += 8) {
    ctx.fillStyle = y % 16 === 0 ? 'rgba(95, 55, 22, 0.14)' : 'rgba(255, 220, 175, 0.08)';
    ctx.fillRect(0, y, 256, 4);
  }

  return configureColorTexture(canvas, anisotropy);
}

export function createArbishCupTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = '#202124';
  ctx.fillRect(0, 88, 512, 82);

  ctx.fillStyle = '#E61919';
  ctx.font = '700 44px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ARBISH', 256, 134);

  ctx.fillStyle = '#9CA3AF';
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('BITES', 256, 160);

  return configureColorTexture(canvas, anisotropy);
}

export function createSesameBunTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#D99346';
  ctx.fillRect(0, 0, 256, 256);

  const grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 128);
  grad.addColorStop(0, '#EAB062');
  grad.addColorStop(1, '#BA722C');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#FFF5D6';
  for (let i = 0; i < 42; i++) {
    const angle = Math.random() * Math.PI * 2;
    const rad = Math.random() * 98;
    const x = 128 + Math.cos(angle) * rad;
    const y = 128 + Math.sin(angle) * rad;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 2.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  return configureColorTexture(canvas, anisotropy);
}

/**
 * Emissive mask for the Arbish Bites exterior facade so "Arbish" glows like
 * backlit red channel letters against the charcoal band at night.
 */
export function createArbishSignEmissiveTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const drawGlow = () => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vivid glowing red cursive "Arbish" channel-letter glow
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#FF1F1F';
    ctx.shadowBlur = 34;

    ctx.strokeStyle = '#FF2828';
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(310, 560);
    ctx.bezierCurveTo(260, 710, 535, 745, 595, 570);
    ctx.bezierCurveTo(645, 430, 650, 225, 625, 115);
    ctx.bezierCurveTo(610, 255, 650, 480, 715, 585);
    ctx.stroke();

    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(275, 585);
    ctx.bezierCurveTo(420, 515, 620, 485, 775, 505);
    ctx.stroke();

    ctx.fillStyle = '#FF2A2A';
    ctx.font = '400 320px "Sacramento", "Brush Script MT", cursive';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('rbish', 760, 585);
    ctx.restore();

    // Glowing white "Bites"
    ctx.save();
    ctx.translate(1435, 270);
    ctx.rotate(-0.12);
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 22;
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '400 170px "Sacramento", "Brush Script MT", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('Bites', 0, 0);
    ctx.restore();

    // Glowing white "BURGERS AND MORE"
    ctx.save();
    ctx.shadowColor = '#E2E8F0';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '600 72px "Outfit", "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('B U R G E R S   A N D   M O R E', 1055, 735);
    ctx.restore();
  };

  drawGlow();
  const tex = configureColorTexture(canvas, anisotropy);
  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => {
      drawGlow();
      tex.needsUpdate = true;
    });
  }
  return tex;
}

export function createSubwayTileTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#191A1E';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 8;
  const cols = 4;
  const tileH = 512 / rows;
  const tileW = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : tileW / 2;
    for (let c = -1; c <= cols; c++) {
      const x = c * tileW + offset;
      const y = r * tileH;
      const shade = 28 + ((r * 7 + c * 13) % 10);
      ctx.fillStyle = `rgb(${shade + 10}, ${shade + 8}, ${shade + 12})`;
      ctx.fillRect(x + 3, y + 3, tileW - 6, tileH - 6);

      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(x + 5, y + 5, tileW - 10, 5);
    }
  }

  return configureColorTexture(canvas, anisotropy, 4, 2);
}

export function createWoodSlatTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3B2B1E';
  ctx.fillRect(0, 0, 512, 512);

  // Sleek warm fluted oak slats matching the Arbish Bites front counter & modern interior
  const slats = 24;
  const slatW = 512 / slats;
  for (let i = 0; i < slats; i++) {
    const x = i * slatW;
    const tone = 165 + ((i * 13) % 22);
    ctx.fillStyle = `rgb(${tone + 18}, ${tone - 14}, ${Math.floor(tone * 0.68)})`;
    ctx.fillRect(x + 2, 0, slatW - 4, 512);

    ctx.fillStyle = 'rgba(255, 240, 215, 0.14)';
    ctx.fillRect(x + 3, 0, 2, 512);
  }

  return configureColorTexture(canvas, anisotropy, 6, 1);
}

export function createNeonScriptSignTexture(
  anisotropy: number,
  text: string,
  colorHex: string,
  isScript = true
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  const draw = () => {
    ctx.clearRect(0, 0, 512, 160);
    ctx.save();
    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 22;
    ctx.fillStyle = colorHex;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = isScript
      ? '400 94px "Sacramento", cursive'
      : '700 44px "Outfit", sans-serif';
    ctx.fillText(text, 256, 82);
    ctx.restore();
  };

  draw();
  const tex = configureColorTexture(canvas, anisotropy);
  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => {
      draw();
      tex.needsUpdate = true;
    });
  }
  return tex;
}

export function createSidewalkBoardTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#18191D';
  ctx.fillRect(0, 0, 512, 768);

  ctx.strokeStyle = '#E61919';
  ctx.lineWidth = 10;
  ctx.strokeRect(22, 22, 468, 724);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#E61919';
  ctx.font = '400 94px "Sacramento", cursive';
  ctx.fillText('Arbish', 200, 145);

  ctx.fillStyle = '#9CA3AF';
  ctx.font = '400 66px "Sacramento", cursive';
  ctx.fillText('bites', 355, 165);

  ctx.fillStyle = '#27272A';
  ctx.fillRect(60, 200, 392, 3);

  ctx.fillStyle = '#F59E0B';
  ctx.font = '700 30px "Outfit", sans-serif';
  ctx.fillText('AL-SHAWQIYYA · MAKKAH', 256, 275);

  ctx.fillStyle = '#F4F4F5';
  ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('ARBISH CLASSIC', 256, 360);
  ctx.fillText('DOUBLE SMASH', 256, 415);
  ctx.fillText('CHICKEN STRIPS', 256, 470);
  ctx.fillText('BUCKET FRIES', 256, 525);

  ctx.fillStyle = '#27272A';
  ctx.fillRect(90, 585, 332, 3);

  ctx.fillStyle = '#EF4444';
  ctx.font = '700 32px "JetBrains Mono", monospace';
  ctx.fillText('12PM – 3AM', 256, 660);

  return configureColorTexture(canvas, anisotropy);
}

export function createNeonWindowSignTexture(
  anisotropy: number,
  label: string,
  accentColor: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 256);
  ctx.fillStyle = 'rgba(10, 12, 16, 0.72)';
  ctx.beginPath();
  ctx.roundRect(14, 14, 484, 228, 28);
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = accentColor;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 22;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(22, 22, 468, 212, 22);
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 84px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 256, 130);
  ctx.restore();

  return configureColorTexture(canvas, anisotropy);
}

export function createWallArtTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#F4F1EA';
  ctx.fillRect(0, 0, 512, 640);

  ctx.fillStyle = '#1C1D21';
  ctx.fillRect(28, 28, 456, 584);

  // Stylized graphic burger circle badge
  ctx.fillStyle = '#E61919';
  ctx.beginPath();
  ctx.arc(256, 265, 138, 0, Math.PI * 2);
  ctx.fill();

  // Burger silhouette layers in cream/gold
  ctx.fillStyle = '#F4F1EA';
  ctx.beginPath();
  ctx.arc(256, 232, 82, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(166, 245, 180, 18);

  ctx.fillStyle = '#4ADE80';
  ctx.fillRect(162, 268, 188, 14);

  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.roundRect(168, 287, 176, 28, 12);
  ctx.fill();

  ctx.fillStyle = '#F4F1EA';
  ctx.beginPath();
  ctx.roundRect(174, 322, 164, 28, [4, 4, 16, 16]);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 38px "Outfit", sans-serif';
  ctx.fillText('DOUBLE SMASH', 256, 485);

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '500 22px "JetBrains Mono", monospace';
  ctx.fillText('MAKKAH · AL-SHAWQIYYA', 256, 535);

  return configureColorTexture(canvas, anisotropy);
}

export function createArcadeScreenTexture(anisotropy: number, title: string, accent: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#090D16';
  ctx.fillRect(0, 0, 256, 320);

  // Retro scanlines & grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 320; y += 12) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, 232, 296);

  ctx.fillStyle = accent;
  ctx.font = '800 30px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 128, 72);

  // Pixel burger / star graphic
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(72, 120, 112, 22);
  ctx.fillStyle = '#4ADE80';
  ctx.fillRect(68, 148, 120, 12);
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(72, 166, 112, 20);
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(76, 192, 104, 18);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.fillText('PRESS START', 128, 268);

  return configureColorTexture(canvas, anisotropy);
}

export function createLoftNeonTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  const draw = () => {
    ctx.fillStyle = '#141519';
    ctx.fillRect(0, 0, 1024, 320);

    ctx.strokeStyle = '#27272A';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 1004, 300);

    ctx.save();
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#FF2B2B';
    ctx.font = '400 165px "Sacramento", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('Arbish', 360, 205);
    ctx.restore();

    ctx.save();
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#FBBF24';
    ctx.font = '700 64px "Outfit", sans-serif';
    ctx.fillText('LOUNGE', 725, 195);
    ctx.restore();
  };

  draw();
  const tex = configureColorTexture(canvas, anisotropy);
  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => {
      draw();
      tex.needsUpdate = true;
    });
  }
  return tex;
}

function configureLinearDataTexture(
  canvas: HTMLCanvasElement,
  anisotropy: number,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = anisotropy;
  if (repeatX !== 1 || repeatY !== 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  tex.needsUpdate = true;
  return tex;
}

export function createEveningSkyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, '#070B14');
  grad.addColorStop(0.32, '#0E1729');
  grad.addColorStop(0.48, '#1B2238');
  grad.addColorStop(0.55, '#312333');
  grad.addColorStop(0.62, '#1C1B26');
  grad.addColorStop(1.0, '#0C0E14');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle Makkah night stars in upper hemisphere
  for (let i = 0; i < 160; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 215;
    const alpha = 0.15 + Math.random() * 0.55;
    const r = Math.random() < 0.85 ? 1 : 1.6;
    ctx.fillStyle = `rgba(235, 242, 255, ${alpha})`;
    ctx.fillRect(x, y, r, r);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createAsphaltPuddleTextures(anisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = 512;
  colorCanvas.height = 512;
  const cCtx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 512;
  roughCanvas.height = 512;
  const rCtx = roughCanvas.getContext('2d')!;

  cCtx.fillStyle = '#1B1E24';
  cCtx.fillRect(0, 0, 512, 512);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 512, 512);

  rCtx.fillStyle = '#C8C8C8'; // Mostly matte dry asphalt
  rCtx.fillRect(0, 0, 512, 512);

  // Mineral aggregate grit
  for (let i = 0; i < 7500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const v = 22 + Math.floor(Math.random() * 32);
    cCtx.fillStyle = `rgb(${v}, ${v + 2}, ${v + 5})`;
    cCtx.fillRect(x, y, 2, 2);

    const bv = 90 + Math.floor(Math.random() * 90);
    bCtx.fillStyle = `rgb(${bv}, ${bv}, ${bv})`;
    bCtx.fillRect(x, y, 2, 2);
  }

  // Glossy rainwater puddle patches (smooth & dark so lights reflect realistically)
  const puddles: Array<[number, number, number, number]> = [
    [130, 140, 88, 54],
    [370, 260, 105, 62],
    [210, 400, 92, 46],
    [415, 95, 72, 44],
  ];
  puddles.forEach(([px, py, rx, ry]) => {
    const rg = rCtx.createRadialGradient(px, py, 8, px, py, Math.max(rx, ry));
    rg.addColorStop(0, '#121212');
    rg.addColorStop(0.68, '#282828');
    rg.addColorStop(1, 'rgba(200,200,200,0)');
    rCtx.save();
    rCtx.translate(px, py);
    rCtx.scale(1, ry / rx);
    rCtx.translate(-px, -py);
    rCtx.fillStyle = rg;
    rCtx.beginPath();
    rCtx.arc(px, py, rx, 0, Math.PI * 2);
    rCtx.fill();
    rCtx.restore();

    cCtx.save();
    cCtx.translate(px, py);
    cCtx.scale(1, ry / rx);
    cCtx.translate(-px, -py);
    cCtx.fillStyle = 'rgba(10, 13, 19, 0.42)';
    cCtx.beginPath();
    cCtx.arc(px, py, rx * 0.85, 0, Math.PI * 2);
    cCtx.fill();
    cCtx.restore();

    // Flatten bump inside puddle
    bCtx.save();
    bCtx.translate(px, py);
    bCtx.scale(1, ry / rx);
    bCtx.translate(-px, -py);
    bCtx.fillStyle = 'rgba(128,128,128,0.85)';
    bCtx.beginPath();
    bCtx.arc(px, py, rx * 0.78, 0, Math.PI * 2);
    bCtx.fill();
    bCtx.restore();
  });

  return {
    map: configureColorTexture(colorCanvas, anisotropy, 9, 5),
    bumpMap: configureLinearDataTexture(bumpCanvas, anisotropy, 9, 5),
    roughnessMap: configureLinearDataTexture(roughCanvas, anisotropy, 9, 5),
  };
}

export function createSidewalkConcreteTextures(anisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = 512;
  colorCanvas.height = 512;
  const cCtx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 512;
  roughCanvas.height = 512;
  const rCtx = roughCanvas.getContext('2d')!;

  cCtx.fillStyle = '#7C818A';
  cCtx.fillRect(0, 0, 512, 512);
  bCtx.fillStyle = '#909090';
  bCtx.fillRect(0, 0, 512, 512);
  rCtx.fillStyle = '#D4D4D4';
  rCtx.fillRect(0, 0, 512, 512);

  // Subtle tonal slab variations
  const step = 128;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const shade = 114 + ((x * 13 + y * 29) % 16);
      cCtx.fillStyle = `rgb(${shade}, ${shade + 3}, ${shade + 7})`;
      cCtx.fillRect(x * step + 3, y * step + 3, step - 6, step - 6);
    }
  }

  // Concrete surface pores & speckles
  for (let i = 0; i < 4800; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const dark = Math.random() < 0.5;
    cCtx.fillStyle = dark ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
    cCtx.fillRect(x, y, 2, 2);
    bCtx.fillStyle = dark ? '#787878' : '#A4A4A4';
    bCtx.fillRect(x, y, 2, 2);
  }

  // Deep scored expansion joints
  cCtx.strokeStyle = '#4B4F57';
  cCtx.lineWidth = 4;
  bCtx.strokeStyle = '#383838';
  bCtx.lineWidth = 5;
  for (let i = 0; i <= 4; i++) {
    const p = i * step;
    cCtx.beginPath();
    cCtx.moveTo(p, 0);
    cCtx.lineTo(p, 512);
    cCtx.moveTo(0, p);
    cCtx.lineTo(512, p);
    cCtx.stroke();

    bCtx.beginPath();
    bCtx.moveTo(p, 0);
    bCtx.lineTo(p, 512);
    bCtx.moveTo(0, p);
    bCtx.lineTo(512, p);
    bCtx.stroke();
  }

  return {
    map: configureColorTexture(colorCanvas, anisotropy, 9, 2),
    bumpMap: configureLinearDataTexture(bumpCanvas, anisotropy, 9, 2),
    roughnessMap: configureLinearDataTexture(roughCanvas, anisotropy, 9, 2),
  };
}

export function createStuccoBumpTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 6000; i++) {
    const v = 105 + Math.floor(Math.random() * 48);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  return configureLinearDataTexture(canvas, anisotropy, 6, 3);
}

export function createBrushedMetalTextures(anisotropy: number): {
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const bCanvas = document.createElement('canvas');
  bCanvas.width = 256;
  bCanvas.height = 256;
  const bCtx = bCanvas.getContext('2d')!;

  const rCanvas = document.createElement('canvas');
  rCanvas.width = 256;
  rCanvas.height = 256;
  const rCtx = rCanvas.getContext('2d')!;

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 256, 256);
  rCtx.fillStyle = '#505050';
  rCtx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y++) {
    const b = 114 + Math.floor(Math.random() * 28);
    bCtx.fillStyle = `rgb(${b},${b},${b})`;
    bCtx.fillRect(0, y, 256, 1);

    const r = 58 + Math.floor(Math.random() * 34);
    rCtx.fillStyle = `rgb(${r},${r},${r})`;
    rCtx.fillRect(0, y, 256, 1);
  }

  return {
    bumpMap: configureLinearDataTexture(bCanvas, anisotropy, 2, 2),
    roughnessMap: configureLinearDataTexture(rCanvas, anisotropy, 2, 2),
  };
}

export function createSubwayBumpTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Recessed mortar joints (#303030), raised glazed ceramic faces (#D8D8D8)
  ctx.fillStyle = '#303030';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 8;
  const cols = 4;
  const tileH = 512 / rows;
  const tileW = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : tileW / 2;
    for (let c = -1; c <= cols; c++) {
      const x = c * tileW + offset;
      const y = r * tileH;
      ctx.fillStyle = '#DCDCDC';
      ctx.fillRect(x + 4, y + 4, tileW - 8, tileH - 8);
    }
  }
  return configureLinearDataTexture(canvas, anisotropy, 4, 2);
}

export function createWoodPlankTextures(anisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const cCanvas = document.createElement('canvas');
  cCanvas.width = 512;
  cCanvas.height = 512;
  const cCtx = cCanvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = 512;
  bCanvas.height = 512;
  const bCtx = bCanvas.getContext('2d')!;

  const rCanvas = document.createElement('canvas');
  rCanvas.width = 512;
  rCanvas.height = 512;
  const rCtx = rCanvas.getContext('2d')!;

  cCtx.fillStyle = '#241812';
  cCtx.fillRect(0, 0, 512, 512);
  bCtx.fillStyle = '#404040';
  bCtx.fillRect(0, 0, 512, 512);
  rCtx.fillStyle = '#909090';
  rCtx.fillRect(0, 0, 512, 512);

  const rows = 8;
  const plankH = 512 / rows;
  for (let row = 0; row < rows; row++) {
    const y = row * plankH;
    const offset = (row % 2) * 128;
    for (let col = -1; col < 3; col++) {
      const x = col * 256 + offset;
      const tone = 82 + ((row * 17 + col * 31) % 28);
      cCtx.fillStyle = `rgb(${tone + 38}, ${tone + 6}, ${Math.floor(tone * 0.52)})`;
      cCtx.fillRect(x + 2, y + 2, 252, plankH - 4);

      bCtx.fillStyle = '#B8B8B8';
      bCtx.fillRect(x + 2, y + 2, 252, plankH - 4);

      const rv = 95 + ((row * 11 + col * 7) % 30);
      rCtx.fillStyle = `rgb(${rv},${rv},${rv})`;
      rCtx.fillRect(x + 2, y + 2, 252, plankH - 4);

      // Wood grain streaks
      for (let g = 0; g < 10; g++) {
        const gy = y + 5 + g * 5.5;
        cCtx.fillStyle = g % 2 === 0 ? 'rgba(40,18,6,0.16)' : 'rgba(255,215,170,0.06)';
        cCtx.fillRect(x + 4, gy, 248, 2);
        bCtx.fillStyle = g % 2 === 0 ? '#989898' : '#C8C8C8';
        bCtx.fillRect(x + 4, gy, 248, 1.5);
      }
    }
  }

  return {
    map: configureColorTexture(cCanvas, anisotropy, 4, 4),
    bumpMap: configureLinearDataTexture(bCanvas, anisotropy, 4, 4),
    roughnessMap: configureLinearDataTexture(rCanvas, anisotropy, 4, 4),
  };
}

export function createLeatherBumpTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 4200; i++) {
    const v = 100 + Math.floor(Math.random() * 55);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.beginPath();
    ctx.arc(Math.random() * 256, Math.random() * 256, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  return configureLinearDataTexture(canvas, anisotropy, 3, 3);
}

export function createBeefPattyTexture(
  anisotropy: number,
  state: 'raw' | 'cooked' | 'burnt'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = state === 'raw' ? '#B94341' : state === 'cooked' ? '#4F2813' : '#181514';
  ctx.fillRect(0, 0, 256, 256);

  // Marbling, seasoning & crispy smash-burger crust detail
  for (let i = 0; i < 2400; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    if (state === 'raw') {
      const r = Math.random();
      ctx.fillStyle =
        r < 0.24
          ? 'rgba(255,228,224,0.5)'
          : r < 0.3
            ? 'rgba(25,20,18,0.55)'
            : 'rgba(128,24,24,0.32)';
    } else if (state === 'cooked') {
      const r = Math.random();
      ctx.fillStyle =
        r < 0.32
          ? 'rgba(24,10,4,0.55)'
          : r < 0.72
            ? 'rgba(138,74,30,0.42)'
            : 'rgba(212,135,58,0.28)';
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
    }
    ctx.fillRect(x, y, 3, 3);
  }

  // Caramelized golden-brown lacy edge & smash sear marks on cooked patty
  if (state === 'cooked') {
    const grad = ctx.createRadialGradient(128, 128, 72, 128, 128, 128);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.75, 'rgba(42,16,5,0.25)');
    grad.addColorStop(1, 'rgba(20,7,2,0.75)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = 'rgba(22, 8, 2, 0.62)';
    ctx.lineWidth = 9;
    for (let y = 38; y < 225; y += 42) {
      ctx.beginPath();
      ctx.moveTo(18, y);
      ctx.lineTo(238, y + 10);
      ctx.stroke();
    }
  }

  return configureColorTexture(canvas, anisotropy);
}

export function createRightDoorMakkahDecalTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(215, 232, 245, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Makkah Arabic & English branch badge
  ctx.textAlign = 'center';
  ctx.fillStyle = '#141517';
  ctx.font = '700 36px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('أربش بايتس · مكة', 256, 200);

  ctx.font = '700 24px "Outfit", sans-serif';
  ctx.fillText('MAKKAH · AL-SHAWQIYYA', 256, 246);

  // Delivery App Pickup Badges (HungerStation & Jahez)
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.roundRect(106, 360, 300, 56, 12);
  ctx.fill();
  ctx.fillStyle = '#111827';
  ctx.font = '800 24px "Outfit", sans-serif';
  ctx.fillText('HUNGERSTATION PICKUP', 256, 396);

  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.roundRect(106, 434, 300, 56, 12);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 24px "Outfit", sans-serif';
  ctx.fillText('JAHEZ · ARBISH APP', 256, 470);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function createStorageSignTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#181A1F';
  ctx.fillRect(0, 0, 512, 160);
  ctx.strokeStyle = '#E61919';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 144);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#F4F4F5';
  ctx.font = '800 38px "Outfit", sans-serif';
  ctx.fillText('STORAGE & WALK-IN', 256, 74);

  ctx.fillStyle = '#9CA3AF';
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.fillText('DRY GOODS · -18°C FREEZER', 256, 118);

  return configureColorTexture(canvas, anisotropy);
}

export function createCrateLabelTexture(
  anisotropy: number,
  title: string,
  accent: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#A6835B';
  ctx.fillRect(0, 0, 256, 160);
  ctx.strokeStyle = '#735638';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 244, 148);

  ctx.fillStyle = accent;
  ctx.fillRect(18, 22, 220, 42);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 22px "Outfit", sans-serif';
  ctx.fillText('ARBISH MAKKAH', 128, 50);

  ctx.fillStyle = '#291D12';
  ctx.font = '700 26px "JetBrains Mono", monospace';
  ctx.fillText(title, 128, 112);

  return configureColorTexture(canvas, anisotropy);
}

/**
 * Custom white parchment tray liner printed with tiled diagonal red cursive "Arbish" logos,
 * matching the stainless steel serving trays at Arbish Bites Makkah.
 */
export function createArbishTrayPaperTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const draw = () => {
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = 'rgba(220, 38, 38, 0.78)';
    ctx.font = '400 34px "Sacramento", "Brush Script MT", cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 5; col++) {
        const x = col * 116 + (row % 2 === 0 ? 40 : -18);
        const y = row * 88 + 38;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.26);
        ctx.fillText('Arbish', 0, 0);
        ctx.restore();
      }
    }
  };

  draw();
  const tex = configureColorTexture(canvas, anisotropy);
  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => {
      draw();
      tex.needsUpdate = true;
    });
  }
  return tex;
}

/**
 * Kraft paper loaded-fries bowl wrap printed with "ARBISH · Taste so good"
 * matching the real Arbish Fries / Nashville Fries / Brisket Fries bowls.
 */
export function createArbishBowlTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#D4A574';
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = '#C49260';
  ctx.fillRect(0, 0, 512, 26);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#B91C1C';
  ctx.font = '800 44px "Outfit", sans-serif';
  ctx.fillText('ARBISH', 256, 118);

  ctx.fillStyle = '#18181B';
  ctx.font = '400 30px "Sacramento", "Brush Script MT", cursive';
  ctx.fillText('Taste so good', 256, 162);

  return configureColorTexture(canvas, anisotropy);
}

/**
 * Glowing digital TV menu boards mounted above the front kitchen pass at Arbish Bites Makkah.
 */
export function createCounterTvScreenTexture(
  anisotropy: number,
  variant: 'left' | 'right'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#14171F';
  ctx.fillRect(0, 0, 512, 256);

  // Subtle dark slate panels matching TV screen in Makkah photo
  ctx.fillStyle = '#1E2330';
  ctx.fillRect(14, 14, 232, 228);
  ctx.fillRect(266, 14, 232, 228);

  const drawCard = (
    x: number,
    titleEn: string,
    titleAr: string,
    price: string,
    accent: string
  ) => {
    ctx.fillStyle = accent;
    ctx.fillRect(x + 14, 28, 120, 6);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '800 22px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(titleEn, x + 14, 62);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(titleAr, x + 14, 92);

    // Stylized Smash Burger Graphic
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.ellipse(x + 148, 168, 52, 20, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x + 98, 168, 100, 8);
    ctx.fillStyle = '#451A03';
    ctx.fillRect(x + 96, 176, 104, 14);
    ctx.fillStyle = '#B45309';
    ctx.fillRect(x + 100, 190, 96, 12);

    ctx.fillStyle = '#F59E0B';
    ctx.font = '800 32px "JetBrains Mono", monospace';
    ctx.fillText(price, x + 14, 214);
  };

  if (variant === 'left') {
    drawCard(14, 'DOUBLE SMASH', 'دبل سماش', '23', '#EF4444');
    drawCard(266, 'SUPREME SMASH', 'سوبريم سماش', '24', '#F59E0B');
  } else {
    drawCard(14, 'ARBISH FRIES', 'أربيش فرايز', '19', '#EF4444');
    drawCard(266, 'NASHVILLE FRIES', 'ناشفيل فرايز', '20', '#F97316');
  }

  return configureColorTexture(canvas, anisotropy);
}




