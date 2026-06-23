<script setup>
import Task from './components/Task.vue'
import { ref, computed } from 'vue'

// Task structure: [name, description, deadline, priority, completed]
const priorityOptions = ['Critical', 'High', 'Medium', 'Low', 'Optional']
const defaultTask = () => ['', '', '', '', false]

let taskArray = JSON.parse(localStorage.getItem('tasks'))
if (taskArray === null) {
  taskArray = [defaultTask()]
} else {
  // Sort tasks by completion status
  taskArray.sort((a, b) => b[4] - a[4])
}

const tasks = ref(taskArray)

// Helpers to parse YYYY-MM-DD into a local Date at midnight.
// We parse into a local Date using `new Date(year, month-1, day)` to avoid
// timezone offsets that can occur when using `new Date('YYYY-MM-DD')`.
function toLocalDate(dateStr) {
  if (!dateStr) return null
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return null
  return new Date(parts[0], parts[1] - 1, parts[2])
}

function isTaskValid(task) {
  const [name, , deadline, priority] = task
  return (
    typeof name === 'string' &&
    name.trim().length > 0 &&
    toLocalDate(deadline) !== null &&
    priorityOptions.includes(priority)
  )
}

function getTaskBorderClass(task) {
  if (!isTaskValid(task)) return 'border-amber-500'
  return task[4] ? 'border-green-500' : 'border-red-500'
}

// Number of tasks marked completed / incomplete.
// These are `computed` so the template updates reactively when `tasks` change.
const completedCount = computed(() => tasks.value.filter((t) => t[4]).length)
const incompleteCount = computed(() => tasks.value.length - completedCount.value)
const invalidTaskCount = computed(() => tasks.value.filter((task) => !isTaskValid(task)).length)
const canSaveAll = computed(() => invalidTaskCount.value === 0)

// Count tasks whose deadline is today (local date).
// The `reduce` uses `acc` (accumulator) as the running count of matching tasks;
// it starts from 0 and is incremented when a task's date matches the target.
const dueTodayCount = computed(() => {
  const now = new Date()
  return tasks.value.reduce((acc, t) => {
    const d = toLocalDate(t[2])
    if (!d) return acc
    if (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    ) {
      // `acc + 1` increments the running total when this task is due today
      return acc + 1
    }
    return acc
  }, 0)
})

// Count tasks whose deadline is exactly tomorrow (local date).
// `acc` is the running count passed through each reduce iteration.
const dueTomorrowCount = computed(() => {
  const now = new Date()
  const tmr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return tasks.value.reduce((acc, t) => {
    const d = toLocalDate(t[2])
    if (!d) return acc
    if (
      d.getFullYear() === tmr.getFullYear() &&
      d.getMonth() === tmr.getMonth() &&
      d.getDate() === tmr.getDate()
    ) {
      // increment accumulator when deadline matches tomorrow
      return acc + 1
    }
    return acc
  }, 0)
})

// Count tasks due within the next 7 days (including today).
// Uses local-midnight comparisons to avoid timezone-related off-by-one issues.
// `acc` is the running count; it begins at 0 and increments for each matching task.
const dueNextWeekCount = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // today at local midnight
  const end = new Date(start)
  end.setDate(start.getDate() + 6) // 7-day window including today
  return tasks.value.reduce((acc, t) => {
    const d = toLocalDate(t[2])
    if (!d) return acc
    const dMid = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if (dMid >= start && dMid <= end) return acc + 1
    return acc
  }, 0)
})

function addTask() {
  tasks.value.push(defaultTask())
}

function deleteTask(index) {
  tasks.value.splice(index, 1)
}

function updateTaskName(index, newName) {
  tasks.value[index][0] = newName
}

function updateTaskDescription(index, newDescription) {
  tasks.value[index][1] = newDescription
}

function saveTasks() {
  if (!canSaveAll.value) return
  localStorage.setItem('tasks', JSON.stringify(tasks.value))
}

function sortByCompletion() {
  tasks.value.sort((a, b) => b[4] - a[4])
}

function sortByDeadline() {
  const deadlineTime = (deadline) => {
    const parsed = toLocalDate(deadline)
    return parsed ? parsed.getTime() : Number.POSITIVE_INFINITY
  }

  tasks.value.sort((a, b) => deadlineTime(a[2]) - deadlineTime(b[2]))
}

function sortAlphabetically() {
  tasks.value.sort((a, b) => a[0].localeCompare(b[0]))
}

function sortByPriority() {
  const priorityRank = (priority) => {
    const rank = priorityOptions.indexOf(priority)
    return rank === -1 ? priorityOptions.length : rank
  }

  tasks.value.sort((a, b) => priorityRank(a[3]) - priorityRank(b[3]))
}

function clearAll() {
  for (let i = tasks.value.length - 1; i > -1; i--) {
    deleteTask(i)
  }
}
</script>

<template>
  <main class="app-shell">
    <header class="app-header">
      <p class="app-eyebrow">Task manager</p>
      <h1 class="app-title">Plan, prioritize, and finish your day with less friction</h1>
      <p class="app-description">
        Create tasks, add deadlines and priority levels, then sort everything to match how you want
        to work.
      </p>
    </header>

    <div id="summary" class="summary">
      <p class="app-eyebrow">Summary</p>
      <p class="bullet">Completed: {{ completedCount }}</p>
      <p class="bullet">Not finished yet: {{ incompleteCount }}</p>
      <p class="bullet">Due today: {{ dueTodayCount }}</p>
      <p class="bullet">Due tomorrow: {{ dueTomorrowCount }}</p>
      <p class="bullet">Due this week: {{ dueNextWeekCount }}</p>
    </div>

    <div id="menu" class="toolbar">
      <button @click="addTask">Add new task</button>
      <button @click="saveTasks" :disabled="!canSaveAll">Save All</button>
      <button @click="sortByCompletion">Sort by completion</button>
      <button @click="sortByDeadline">Sort by deadline</button>
      <button @click="sortAlphabetically">Sort alphabetically</button>
      <button @click="sortByPriority">Sort by priority</button>
      <button @click="clearAll">Clear All</button>
    </div>

    <p v-if="!canSaveAll" class="validation-note" role="status">
      Fill in the task name, deadline, and priority for every task before saving.
    </p>

    <div id="finished" v-for="(task, index) in tasks" :key="index">
      <tab v-if="task[4]">
        <div
          class="bg-white shadow-md rounded-lg p-4 m-4 w-full box-border border-2"
          :class="getTaskBorderClass(task)"
        >
          <h3 class="text-green-600 font-bold mb-2">Finished task</h3>
          <Task
            :taskName="task[0]"
            @update:taskName="(newName) => updateTaskName(index, newName)"
            :taskDescription="task[1]"
            @update:taskDescription="(newDesc) => updateTaskDescription(index, newDesc)"
          />

          <div>
            <label style="display: inline-block">Deadline:</label>
            <input type="date" v-model="task[2]" required />
          </div>

          <div>
            <label style="display: inline-block">Priority:</label>
            <select v-model="task[3]" required>
              <option disabled value="">Select priority</option>
              <option v-for="option in priorityOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <div style="display: inline-block">
            <input type="checkbox" :id="`done-${index}`" v-model="task[4]" />
            <label :for="`done-${index}`">Mark as Done</label>
          </div>

          <br />
          <button @click="deleteTask(index)" class="delete-btn">Delete Task</button>
        </div>
      </tab>
      <tab v-else>
        <div
          class="bg-white shadow-md rounded-lg p-4 m-4 w-full box-border border-2"
          :class="getTaskBorderClass(task)"
        >
          <h3 class="text-red-600 font-bold mb-2">Unfinished task</h3>
          <Task
            :taskName="task[0]"
            @update:taskName="(newName) => updateTaskName(index, newName)"
            :taskDescription="task[1]"
            @update:taskDescription="(newDesc) => updateTaskDescription(index, newDesc)"
          />

          <div>
            <label style="display: inline-block">Deadline:</label>
            <input type="date" v-model="task[2]" required />
          </div>

          <div>
            <label style="display: inline-block">Priority:</label>
            <select v-model="task[3]" required>
              <option disabled value="">Select priority</option>
              <option v-for="option in priorityOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <div style="display: inline-block">
            <input type="checkbox" :id="`done-${index}`" v-model="task[4]" />
            <label :for="`done-${index}`">Mark as Done</label>
          </div>

          <br />
          <button @click="deleteTask(index)" class="delete-btn">Delete Task</button>
        </div>
      </tab>
    </div>
  </main>
</template>

<style scoped>
input {
  display: block;
  margin: 5px 0;
}

.delete-btn {
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  margin-top: 10px;
}

button {
  margin: 10px 0;
  padding: 10px 15px;
  cursor: pointer;
}

.toolbar button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  transform: none;
  box-shadow: none;
}

.validation-note {
  margin: -12px 0 24px;
  color: #b45309;
  font-weight: 600;
}

#menu {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  width: 100%;
  flex-wrap: wrap;
}

/* Finished / unfinished heading colors are handled with Tailwind classes now. */

#finished {
  display: inline-block;
}

#unfinished {
  display: inline-block;
}
</style>
