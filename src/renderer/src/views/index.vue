<template>
    1
  <div class="canvas-wrap">
    <canvas id="live2d-canvas" class="live2d-canvas" width="100" height="300"></canvas>
  </div>
</template>

<script setup>
import * as PIXI from 'pixi.js'
import * as pixiFnPatch from "@pixi/unsafe-eval"
import { Live2DModel } from 'pixi-live2d-display'
import jsonFile from '/Resources/Haru/Haru.model3.json?url'
// 全局注册
let windowRef  = window;
windowRef.PIXI = PIXI;
// 修复@pixi/unsafe-eval无法正常安装问题
pixiFnPatch.install(PIXI);

async function initLive2D(){
  let model = await Live2DModel.from(jsonFile);
  const app = new PIXI.Application({
    view: document.getElementById('live2d-canvas') ,
    width: 100,
    height: 300,
    autoStart:true,
    backgroundAlpha:0
  });
  app.stage.addChild(model);
  // app.renderer.backgroundColor = 0x0161639;
  // transforms 模型方位
  model.x = -10; // 方位（单位像素）
  model.y = -20
  // model.rotation = Math.PI
  // model.skew.x = Math.PI
  model.scale.set(0.6)  // 缩放
  model.anchor.set(0, 0) // 锚点，以画布中心下方为中心点,x，y（单位：倍）
  model.on('hit', (hitAreas) => {
    // if (hitAreas.includes('body')) {
    //   model.motion('tap_body')
    // }
  })
}
onMounted(() => {
  initLive2D();
})
</script>
<style scoped>
.canvas-wrap {
  width: 100%;
  height: 100%;
  cursor: move;
  -webkit-app-region: drag;
}
.live2d-canvas {
  width: 100%;
  height: 100%;
}
</style>
