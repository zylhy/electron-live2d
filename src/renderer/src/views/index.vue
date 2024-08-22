<template>
  <div class="canvas-wrap">
    <canvas id="live2d-canvas" class="live2d-canvas" width="400" height="400"></canvas>
  </div>
</template>
<script setup>
import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display/cubism4";
import jsonFile from "/Resources/Haru/Haru.model3.json?url";
import * as pixiFnPatch from "@pixi/unsafe-eval";
window.PIXI = PIXI;
pixiFnPatch.install(PIXI);
const initLive2D = async () => {
  
  let model = await Live2DModel.from(jsonFile);
  const app = new PIXI.Application({
    view: document.getElementById("live2d-canvas"),
    autoStart: true,
    autoDensity: true,
    width: 400,
    height: 400,
    resolution: window.devicePixelRatio,
    backgroundAlpha: 1,
  });
  app.stage.addChild(model);
  setModel(model);
  model.on("hit",hit=>{
    console.log(hit)
  })
};
// 设置缩放比和设置模型位置
const setModel = (model) => {
  let bounds = model.getBounds();
  model.scale.set(Math.min(1, 400 / bounds.width, 400 / bounds.height));
  bounds = model.getBounds();
  // 左右居中
  model.x = 400 / 2 - bounds.width / 2;
};
onMounted(() => {
  initLive2D();
});
</script>
<style lang="scss" scoped>
.canvas-wrap {
  width: 100%;
  height: 100%;
}
.live2d-canvas {
  width: 100%;
  height: 100%;
  cursor: move;
}
</style>
