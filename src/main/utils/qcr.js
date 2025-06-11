// const screenshot = require('screenshot-desktop');
// const sharp = require('sharp');
// const Tesseract = require('tesseract.js');

// export async function captureAndRecognize() {
//   try {
//     const imgBuffer = await screenshot({ format: 'png' });
//     let time = new Date().getTime();
//     // 裁剪并预处理图像（灰度、对比度增强）
//     const processedBuffer = await sharp(imgBuffer)
//       .extract({ left: 0, top: 0, width: 130, height: 100 }) // 裁剪目标区域
//       .grayscale() // 转为灰度图
//       .normalize() // 增强对比度
//       .threshold(150) // 二值化
//       .toBuffer();
//     const result = await Tesseract.recognize(processedBuffer, 'eng', {
//       // logger: m => console.log(m.status, m.progress),
//       tessedit_char_whitelist: '0123456789'
//     });

//     const text = result.data.text.trim();
//     console.log('1111111', text);

//     // 提取纯数字
//     const digits = text.match(/\d+/g)?.join('') || '';
//     console.log('222222', digits);
//     console.log(333333, new Date().getTime() - time)
//   } catch (err) {
//     console.error('识别失败:', err);
 
//   }
// }



// const screenshot = require('screenshot-desktop');
// const sharp = require('sharp');
// const tesseract = require('node-tesseract-ocr');
// const fs = require('fs');

// const config = {
//   lang: 'eng',
//   oem: 1,
//   psm: 6,
//   tessedit_char_whitelist: '0123456789', // 仅识别数字
// };

// // 调整这个区域
// const REGION = {
//   left: 0,
//   top: 0,
//   width: 130,
//   height: 100,
// };

// export async function captureAndRecognize() {
//   try {
//     let time = new Date().getTime();
//     const rawBuffer = await screenshot({ format: 'png' });

//     const processedBuffer = await sharp(rawBuffer)
//       .extract(REGION)
//       .grayscale()
//       .threshold(150) // 二值化
//       .toBuffer();

//     // 可选：写入调试图像
//     // fs.writeFileSync('cropped.png', processedBuffer);

//     const text = await tesseract.recognize(processedBuffer, config);
//     const cleaned = text.replace(/\D/g, ''); // 只保留数字

//     console.log(`[${new Date().toLocaleTimeString()}] 111:`, cleaned);
//     console.log(`[${new Date().toLocaleTimeString()}] 222:`, text);
//     console.log(333333, new Date().getTime() - time)
//     return cleaned;
//   } catch (err) {

//     console.error('识别失败222222:', err.message);
//   }
// }
 

// index.js
const screenshot = require('screenshot-desktop');
const sharp = require('sharp');
import { initOCR, recognizeBuffer } from './worker.js';
export async function captureAndRecognize() {
  try {
    await initOCR(); // 初始化一次即可

    const rawBuffer = await screenshot({ format: 'png' });

    const processedBuffer = await sharp(rawBuffer)
      .extract({ left: 0, top: 0, width: 130, height: 100 })
      .grayscale()
      .normalize()
      .threshold(150) // 可调：推荐 180~220
      .toBuffer();

    const start = Date.now();
    const digits = await recognizeBuffer(processedBuffer);
    const cost = Date.now() - start;

    console.log('111111', digits);
    console.log('22222', cost);
  } catch (err) {
    console.error('识别失败:', err);
  }
}

