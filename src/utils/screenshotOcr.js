/**
 * Lecture du texte d'une capture d'écran, entièrement dans le navigateur
 * (Tesseract.js) : l'image ne quitte jamais l'appareil. Seul le moteur de
 * lecture est téléchargé (une fois, puis mis en cache par le navigateur).
 *
 * Chargé à la demande (import dynamique) pour ne pas alourdir l'app.
 */

// Les captures en mode sombre (texte clair sur fond noir) sont mieux lues
// une fois inversées : on passe en niveaux de gris et on inverse si l'image
// est majoritairement sombre.
async function prepareImage(file) {
  const bitmap = await loadBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);
  if (bitmap.close) bitmap.close();

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = image;
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = gray;
    total += gray;
  }
  if (total / (data.length / 4) < 128) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i + 1] = data[i + 2] = 255 - data[i];
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

async function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // Safari ancien : on retombe sur <img>
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Lit le texte de plusieurs captures, l'une après l'autre.
 * @param {File[]} files
 * @param {(progress: {index: number, total: number, ratio: number, preparing: boolean}) => void} [onProgress]
 * @returns {Promise<string>} texte de toutes les captures, une ligne par app
 */
export async function readScreenshotsText(files, onProgress = () => {}) {
  const { createWorker } = await import('tesseract.js');
  let index = 0;
  onProgress({ index, total: files.length, ratio: 0, preparing: true });
  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        onProgress({ index, total: files.length, ratio: m.progress || 0, preparing: false });
      }
    },
  });
  try {
    const texts = [];
    for (; index < files.length; index++) {
      onProgress({ index, total: files.length, ratio: 0, preparing: false });
      const canvas = await prepareImage(files[index]);
      const { data } = await worker.recognize(canvas);
      texts.push(data.text || '');
    }
    return texts.join('\n');
  } finally {
    await worker.terminate();
  }
}
