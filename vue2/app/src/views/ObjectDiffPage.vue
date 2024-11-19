<template>
  <ObjectDiff :newObject="getNew" :oldObject="getOld" :excluded="getExcluded" />
</template>

<script>
import {mapGetters} from "vuex";
import ObjectDiff from "../../../components/objectDiff/ObjectDiff.vue";

export default {
  name: "ObjectDiffPage",
  components: {
    ObjectDiff
  },
  computed: {
    ...mapGetters("objectDiff", ["getOld", "getNew", "getExcluded"]),
  },
}
</script>

<style scoped>
</style>