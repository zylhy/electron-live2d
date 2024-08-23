<script setup>
electron.ipcRenderer.on("key-down", (event, arg) => {
  console.log(`Received key down event from main process: ${arg}`);
});
</script>

<template>
  <router-view></router-view>
</template>
