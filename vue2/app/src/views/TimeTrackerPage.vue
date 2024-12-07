<template>
  <div class="tracker">
    <button class="tracker__add-btn" @click="addEntry">Добавить карточку</button>
    <table class="tracker__table">
      <template v-for="(entry, ri) in tracker">
        <tr class="tracker__table__row-start" :key="ri">
          <td>
            <button class="tracker__table__add-task" @click="addTask(ri)">Добавить трекер</button>
          </td>
          <td>
            <input type="text" v-model="entry.name">
          </td>
          <td>
            <input type="text" v-model="entry.description">
            <div class="tracker__table__actions">
              <DeleteIcon @click="removeEntry(ri)"/>
            </div>
          </td>
        </tr>
        <tr v-for="(task, ti) in entry.tasks" :key="`${ri}${ti}`" class="tracker__table__row-end">
          <td>
            <input type="text" v-model="task.comment">
          </td>
          <td>
            {{ formatDate(task.startTime) }}
          </td>
          <td>
            {{ formatTime(task.endTime) }}
            <div class="tracker__table__actions">
              <StopIcon v-if="task.state === STATE.COUNTING" @click="task.state = STATE.STOPPED"/>
              <StartIcon v-else @click="resetCounter(task)"/>
              <DeleteIcon @click="removeTask(ri, ti)"/>
            </div>
          </td>
        </tr>
      </template>
    </table>
  </div>
</template>

<script>
import {CustomDate} from "../../../components/customDate/CustomDate";
import StopIcon from "../../../components/timeTracker/icons/StopIcon.vue";
import DeleteIcon from "../../../components/timeTracker/icons/DeleteIcon.vue";
import StartIcon from "../../../components/timeTracker/icons/StartIcon.vue";

const STATE = {
  COUNTING: 0,
  STOPPED: 1
}

export default {
  name: "TimeTrackerPage",
  components: {StopIcon, DeleteIcon, StartIcon},
  computed: {
    STATE() {
      return STATE;
    }
  },
  data() {
    return {
      tracker: [
      ],
      timerId: null
    }
  },
  methods: {
    pad(number) {
      return String(number).padStart(2, "0");
    },
    formatDate(date) {
      let minutes = this.pad(date.getMinutes());
      let hours = this.pad(date.getHours());
      return (new CustomDate(date).format("YYYY-MM-DD")) + ` ${hours}:${minutes}`;
    },
    formatTime(date) {
      let seconds = this.pad(date % 60);
      let minutes = this.pad(Math.floor(date / 60) % 60);
      let hours = this.pad(Math.floor(date / 3600) % 60);
      return `${hours}:${minutes}:${seconds}`;
    },
    updateTimer() {
      this.timerId = setInterval(() => {
        this.tracker.forEach((entry) => {
          entry.tasks.forEach((task) => {
            if (task.state === STATE.COUNTING) {
              task.endTime = Math.floor(((new Date()) - task.countFromDate) / 1000);
            }
          })
        })
      }, 1000);
    },
    removeTask(rowIndex, taskIndex) {
      this.tracker[rowIndex].tasks.splice(taskIndex, 1);
    },
    addTask(rowIndex) {
      this.tracker[rowIndex].tasks.push({
        state: STATE.COUNTING,
        comment: "",
        startTime: new Date(),
        countFromDate: new Date(),
        endTime: 0
      });
    },
    removeEntry(rowIndex) {
      this.tracker.splice(rowIndex, 1);
    },
    addEntry() {
      this.tracker.push({name: "Имя", description: "Описание", tasks: []})
    },
    resetCounter(task) {
      task.state = STATE.COUNTING;
      task.countFromDate = new Date(Date.now() - (task.endTime * 1000));
    }
  },
  created() {
    this.updateTimer();
  },
  beforeDestroy() {
    clearInterval(this.timerId);
  }
}
</script>

<style scoped lang="less">
.tracker {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  * {
    font-family: "Roboto", sans-serif;
    font-size: 20px;
  }

  &__add-btn {
    margin-bottom: 20px;
    background: #f8f9fa;
    color: #212529;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
  }

  &__table {
    width: 800px;
    border-collapse: collapse;

    td {
      padding: 10px;

      input {
        background: none;
        border: none;
        outline: none;
      }
    }

    tr {
      position: relative;

      &:hover .tracker__table__actions {
        visibility: visible;
        opacity: 1;
      }

      .tracker__table__actions {
        display: flex;
        align-items: center;
        justify-content: center;
        color: red;
        position: absolute;
        cursor: pointer;
        top: 50%;
        right: 0;
        transform: translate(100%, -50%);
        padding: 10px;
        visibility: hidden;
        opacity: 0;
        transition: all .4s ease;
        gap: 6px;

        svg {
          height: 1em;
          width: 1em;
        }
      }
    }

    &__add-task {
      border: none;
      outline: none;
      cursor: pointer;
      background: none;
    }

    &__row-start {
      font-weight: bold;
    }

    &__row-end {
      background: rgba(0, 0, 0, .05);
    }
  }
}
</style>