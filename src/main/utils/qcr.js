
const screenshot = require('screenshot-desktop');
const sharp = require('sharp');
import { createWorker } from 'tesseract.js'

const worker = createWorker();

let workerReady = false;

// 初始化 OCR Worker（只需一次）
async function initWorker() {
  if (workerReady) return;
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789',
  });
  workerReady = true;
}

// 主函数：传入截取区域，返回识别结果
async function recognizeDigits(region) {
  await initWorker();

  const imgBuffer = await screenshot({ format: 'png' });
  const croppedBuffer = await sharp(imgBuffer)
    .extract(region)         // { left, top, width, height }
    .grayscale()
    .threshold(180)
    .toBuffer();

  const result = await worker.recognize(croppedBuffer);
  return result.data.text.replace(/\D/g, '');
}

// 可选：终止 worker，释放内存
async function stopWorker() {
  await worker.terminate();
  workerReady = false;
}

export {recognizeDigits,stopWorker}

