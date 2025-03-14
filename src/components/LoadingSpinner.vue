<template>
  <div class="loadingLayer">
    <img class="loadingSpinner" src="/img/loading_spinner.svg" />
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.loadingLayer {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.loadingSpinner {
  width: 10vw;
  height: 10vw;
}
</style>
