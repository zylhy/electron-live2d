import { createWorker } from 'tesseract.js';

let worker = null;

export async function initOCR() {
  if (worker) return;

  worker = await createWorker();


}

export async function recognizeBuffer(buffer) {
  if (!worker) throw new Error('OCR worker 未初始化，请先调用 initOCR()');

  const { data: { text } } = await worker.recognize(buffer, 'eng', {
    tessedit_char_whitelist: '0123456789',
    user_defined_dpi: '96',
    preserve_interword_spaces: '1',
  });

  return text.replace(/\D/g, '');
}

export async function terminateOCR() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
