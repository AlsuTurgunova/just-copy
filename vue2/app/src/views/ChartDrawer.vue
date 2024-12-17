<template>
  <div>
    <canvas class="chart-canvas" ref="canvas"></canvas>
  </div>
</template>

<script>
import { ChartDrawer } from "../../../components/chartDrawer/ChartDrawer";

export default {
  name: "ChartDrawer",
  data() {
    return {
      drawer: null,
    }
  },
  mounted() {
    this.drawer = new ChartDrawer(this.$refs.canvas);
  },
  beforeDestroy() {
    this.drawer.destroy();
  }
}
</script>

<style scoped lang="less">
.chart-canvas {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
}
</style>