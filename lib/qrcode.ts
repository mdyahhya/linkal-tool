/**
 * Pure TypeScript Zero-Dependency QR Code Generator
 * Generates ISO/IEC 18004 compliant QR code matrices, SVGs, and downloadable PNG data URLs.
 */

// QR Code Type 1 through 10 tables and Galois Field math for Byte Mode (8-bit) with Error Correction Level M
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_EXP[i + 255] = x;
    GF256_LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d; // polynomial x^8 + x^4 + x^3 + x^2 + 1
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function polyMul(p1: Uint8Array | number[], p2: Uint8Array | number[]): number[] {
  const result: number[] = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return result;
}

function getGeneratorPoly(numEcBytes: number): number[] {
  let g: number[] = [1];
  for (let i = 0; i < numEcBytes; i++) {
    g = polyMul(g, [1, GF256_EXP[i]]);
  }
  return g;
}

function calculateEcc(data: Uint8Array, numEcBytes: number): Uint8Array {
  const gen = getGeneratorPoly(numEcBytes);
  const msg = new Uint8Array(data.length + numEcBytes);
  msg.set(data);

  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }

  return msg.slice(data.length);
}

// Version table for Byte mode with Medium error correction (M)
// [totalDataCodewords, ecCodewordsPerBlock, numBlocks]
const VERSION_SPECS_M: Array<[number, number, number]> = [
  [0, 0, 0], // unused 0
  [16, 10, 1], // v1: 21x21
  [28, 16, 1], // v2: 25x25
  [44, 26, 1], // v3: 29x29
  [64, 18, 2], // v4: 33x33
  [86, 24, 2], // v5: 37x37
  [108, 16, 4], // v6: 41x41
  [124, 18, 4], // v7: 45x45
  [154, 22, 4], // v8: 49x49
  [182, 22, 5], // v9: 53x53
  [216, 26, 5], // v10: 57x57
];

function selectVersion(dataLen: number): number {
  for (let v = 1; v <= 10; v++) {
    const [dataCapacity] = VERSION_SPECS_M[v];
    // In byte mode: 4 bits mode + 8 bits count + data
    const overhead = 1 + (v <= 9 ? 1 : 2); // bytes
    if (dataLen + overhead <= dataCapacity) {
      return v;
    }
  }
  return 10;
}

export function generateQrMatrix(text: string): boolean[][] {
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(text);
  const version = selectVersion(rawBytes.length);
  const [totalDataBytes, ecBytesPerBlock, numBlocks] = VERSION_SPECS_M[version];

  // Bit buffer for byte mode
  const bits: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  // 1. Mode indicator (0100 for 8-bit byte mode)
  pushBits(0b0100, 4);

  // 2. Character count indicator (8 bits for v1-9, 16 for v10+)
  const countBits = version <= 9 ? 8 : 16;
  pushBits(rawBytes.length, countBits);

  // 3. Data bytes
  for (let i = 0; i < rawBytes.length; i++) {
    pushBits(rawBytes[i], 8);
  }

  // 4. Terminator (up to 4 zeroes)
  const totalDataBits = totalDataBytes * 8;
  const termLen = Math.min(4, totalDataBits - bits.length);
  for (let i = 0; i < termLen; i++) bits.push(0);

  // 5. Pad to multiple of 8 bits
  while (bits.length % 8 !== 0) bits.push(0);

  // 6. Pad bytes (0xEC, 0x11 alternating)
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < totalDataBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to byte array
  const dataBytes = new Uint8Array(totalDataBytes);
  for (let i = 0; i < totalDataBytes; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bits[i * 8 + b];
    }
    dataBytes[i] = byteVal;
  }

  // Split into blocks and compute ECC
  const blockSize = Math.floor(totalDataBytes / numBlocks);
  const dataBlocks: Uint8Array[] = [];
  const eccBlocks: Uint8Array[] = [];

  for (let b = 0; b < numBlocks; b++) {
    const start = b * blockSize;
    const end = b === numBlocks - 1 ? totalDataBytes : (b + 1) * blockSize;
    const blockData = dataBytes.slice(start, end);
    dataBlocks.push(blockData);
    eccBlocks.push(calculateEcc(blockData, ecBytesPerBlock));
  }

  // Interleave data and ECC codewords
  const finalCodewords: number[] = [];
  const maxDataBlockLen = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxDataBlockLen; i++) {
    for (let b = 0; b < numBlocks; b++) {
      if (i < dataBlocks[b].length) {
        finalCodewords.push(dataBlocks[b][i]);
      }
    }
  }
  for (let i = 0; i < ecBytesPerBlock; i++) {
    for (let b = 0; b < numBlocks; b++) {
      finalCodewords.push(eccBlocks[b][i]);
    }
  }

  // Grid dimensions
  const size = version * 4 + 17;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isReserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function setModule(r: number, c: number, val: boolean) {
    matrix[r][c] = val;
    isReserved[r][c] = true;
  }

  // Position detection patterns (7x7 with separator)
  function drawFinder(top: number, left: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = top + r;
        const col = left + c;
        if (row >= 0 && row < size && col >= 0 && col < size) {
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
            const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            setModule(row, col, isBorder || isCenter);
          } else {
            setModule(row, col, false); // separator
          }
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isReserved[6][i]) setModule(6, i, i % 2 === 0);
    if (!isReserved[i][6]) setModule(i, 6, i % 2 === 0);
  }

  // Alignment patterns (for version >= 2)
  const ALIGN_POS: Record<number, number[]> = {
    2: [6, 18],
    3: [6, 22],
    4: [6, 26],
    5: [6, 30],
    6: [6, 34],
    7: [6, 22, 38],
    8: [6, 24, 42],
    9: [6, 26, 46],
    10: [6, 28, 50],
  };

  if (version >= 2 && ALIGN_POS[version]) {
    const pos = ALIGN_POS[version];
    for (const r of pos) {
      for (const c of pos) {
        if (isReserved[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isAlignBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const isAlignCenter = dr === 0 && dc === 0;
            setModule(r + dr, c + dc, isAlignBorder || isAlignCenter);
          }
        }
      }
    }
  }

  // Reserve format information areas
  for (let i = 0; i < 9; i++) {
    if (i < size) {
      isReserved[8][i] = true;
      isReserved[i][8] = true;
    }
  }
  for (let i = size - 8; i < size; i++) {
    isReserved[8][i] = true;
    isReserved[i][8] = true;
  }
  setModule(size - 8, 8, true); // dark module

  // Place Codewords in zigzag pattern
  let codewordIdx = 0;
  let bitIdx = 7;
  let upwards = true;

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // skip vertical timing line
    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const c of [right, right - 1]) {
        if (!isReserved[r][c]) {
          let bit = false;
          if (codewordIdx < finalCodewords.length) {
            bit = ((finalCodewords[codewordIdx] >> bitIdx) & 1) === 1;
            bitIdx--;
            if (bitIdx < 0) {
              bitIdx = 7;
              codewordIdx++;
            }
          }
          // Apply mask pattern 000: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = mask ? !bit : bit;
        }
      }
    }
    upwards = !upwards;
  }

  // Format information bits for Medium error correction (M = 00) and Mask 000
  // Standard format string for EC Level M + Mask 0: 101010000010010
  const FORMAT_BITS = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];

  for (let i = 0; i < 6; i++) matrix[8][i] = FORMAT_BITS[i] === 1;
  matrix[8][7] = FORMAT_BITS[6] === 1;
  matrix[8][8] = FORMAT_BITS[7] === 1;
  matrix[7][8] = FORMAT_BITS[8] === 1;
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = FORMAT_BITS[i] === 1;

  for (let i = 0; i < 7; i++) matrix[size - 1 - i][8] = FORMAT_BITS[i] === 1;
  for (let i = 7; i < 15; i++) matrix[8][size - 15 + i] = FORMAT_BITS[i] === 1;

  return matrix;
}

/**
 * Generate a standalone, vector SVG string for the QR code
 */
export function generateQrSvg(
  text: string,
  options?:
    | number
    | {
        size?: number;
        margin?: number;
        darkColor?: string;
        lightColor?: string;
      }
): string {
  const opts = typeof options === 'number' ? { size: options } : (options || {});
  const matrix = generateQrMatrix(text);
  const moduleCount = matrix.length;
  const margin = opts.margin ?? 4;
  const darkColor = opts.darkColor || '#000000';
  const lightColor = opts.lightColor || '#ffffff';
  const totalModules = moduleCount + margin * 2;
  const size = opts.size || 320;

  let rects = '';
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r][c]) {
        rects += `<rect x="${c + margin}" y="${r + margin}" width="1" height="1" fill="${darkColor}" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalModules} ${totalModules}" width="${size}" height="${size}" shape-rendering="crispEdges">
    <rect width="${totalModules}" height="${totalModules}" fill="${lightColor}" />
    ${rects}
  </svg>`;
}

/**
 * Trigger client-side browser download of the QR code in PNG format
 */
export function downloadQrPng(text: string, filename = 'linkal-store-qr.png', size = 800) {
  if (typeof window === 'undefined') return;
  const svg = generateQrSvg(text, { size });
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = filename;
      a.href = pngUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  img.src = url;
}

/**
 * Trigger client-side browser download of the QR code in SVG format
 */
export function downloadQrSvg(text: string, filename = 'linkal-store-qr.svg') {
  if (typeof window === 'undefined') return;
  const svg = generateQrSvg(text);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = filename;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
