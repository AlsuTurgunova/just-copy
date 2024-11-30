<template>
  <div class="custom_date">
    <div class="custom_date__row">
      <span>Pattern from</span>
      <input type="text" v-model="patternFrom">
    </div>
    <div class="custom_date__row">
      <span>Date from</span>
      <input type="text" v-model="dateFrom">
    </div>
    <div class="custom_date__row custom_date__decoded">
      <span>Decoded date: {{decodedDateFrom.getFullYear()}} {{decodedDateFrom.getMonth() + 1}} {{ decodedDateFrom.getDate()}}</span>
    </div>
    <div class="custom_date__row">
      <span>Pattern to</span>
      <input type="text" v-model="patternTo">
    </div>
    <div class="custom_date__row">
      <span>Date to</span>
      <input type="text" readonly v-model="dateTo">
    </div>
  </div>
</template>

<script>
import {CustomDate} from "../../../components/customDate/CustomDate";

export default {
  name: "CustomDatePage",
  data() {
    return {
      patternFrom: "YYYY-MM-DD",
      dateFrom: "2024-12-10",
      patternTo: "YYYY MM DD",
    }
  },
  computed: {
    decodedDateFrom() {
      return CustomDate.decodeDate(this.patternFrom, this.dateFrom);
    },
    dateTo() {
      return CustomDate.encodeDate(this.patternFrom, this.decodedDateFrom);
    }
  },
}
</script>

<style scoped lang="less">
.custom_date {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
  width: 300px;

  * {
    font-size: 20px;
  }

  &__row {
    display: flex;
    width: 100%;
    align-items: center;

    span {
      width: 100%;
    }

    input {
      width: 100%;
      padding: 10px 10px;
      border: 1px solid #707070;
      border-radius: 5px;
    }
  }

  &__decoded {
    border-top: 1px solid #222222;
    border-bottom: 1px solid #222222;
    padding: 5px;
  }
}
</style>