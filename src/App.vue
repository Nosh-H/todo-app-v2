<script setup>
  import Task from './components/Task.vue'
  import { ref } from 'vue'

  import { onMounted } from 'vue';

// Task structure: [name, description, deadline, priority, completed]
  const defaultTask = () => ['New task', 'New description', null, 'Medium', false];

  let taskArray = null;
  taskArray = JSON.parse(localStorage.getItem('tasks'));
  if (taskArray === null) {
    taskArray = [defaultTask()];
  } else {
    // Sort tasks by completion status
    taskArray.sort((a, b) => b[4] - a[4]);
  }

  const tasks = ref(taskArray);

  function addTask() {
    tasks.value.push(defaultTask());
  }

  function deleteTask(index) {
    tasks.value.splice(index, 1);
  }

  function updateTaskName(index, newName) {
    tasks.value[index][0] = newName;
  }

  function updateTaskDescription(index, newDescription) {
    tasks.value[index][1] = newDescription;
  }

  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks.value));
  }

  function sortByCompletion() {
    tasks.value.sort((a, b) => b[4] - a[4]);
  }

  function sortByDeadline() {
    tasks.value.sort((a, b) => new Date(a[2]) - new Date(b[2]));
  }

  function sortAlphabetically() {
    tasks.value.sort((a, b) => a[0].localeCompare(b[0]));
  }

  function sortByPriority() {
    const priorityOrder = ['Critical', 'High', 'Medium', 'Low', 'Optional'];
    tasks.value.sort((a, b) => priorityOrder.indexOf(a[3]) - priorityOrder.indexOf(b[3]));
  }

</script>

<template>

  <h1>TODO APP</h1>

  <div id="menu">
    <button @click="addTask">Add new task</button>
    <button @click="saveTasks">Save</button>
    <button @click="sortByCompletion">Sort by completion</button>
    <button @click="sortByDeadline">Sort by deadline</button>
    <button @click="sortAlphabetically">Sort alphabetically</button>
    <button @click="sortByPriority">Sort by priority</button>
  </div>

  <div id="finished" v-for="(task, index) in tasks" :key="index">
    <tab v-if=task[4]>
      <div class="task">
        <h3 id="finishedText">Finished task</h3>
        <Task
          :taskName="task[0]"
          @update:taskName="(newName) => updateTaskName(index, newName)"
          :taskDescription="task[1]"
          @update:taskDescription="(newDesc) => updateTaskDescription(index, newDesc)"
        />

        <div>
          <label style="display: inline-block">Deadline:</label>
          <input type="date" v-model="task[2]" />
        </div>

        <div>
          <label style="display: inline-block">Priority:</label>
          <select v-model="task[3]">
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Optional">Optional</option>
          </select>
        </div>

        <div style="display: inline-block">
          <input type="checkbox" :id="`done-${index}`" v-model="task[4]" />
          <label :for="`done-${index}`">Mark as Done</label>
        </div>

        <br>
        <button @click="deleteTask(index)" class="delete-btn">Delete Task</button>
      </div>
    </tab>
    <tab v-else>
      <div class="task">
        <h3 id="unfinishedText">Unfinished task</h3>
        <Task
          :taskName="task[0]"
          @update:taskName="(newName) => updateTaskName(index, newName)"
          :taskDescription="task[1]"
          @update:taskDescription="(newDesc) => updateTaskDescription(index, newDesc)"
        />

        <div>
          <label style="display: inline-block">Deadline:</label>
          <input type="date" v-model="task[2]" />
        </div>

        <div>
          <label style="display: inline-block">Priority:</label>
          <select v-model="task[3]">
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Optional">Optional</option>
          </select>
        </div>

        <div style="display: inline-block">
          <input type="checkbox" :id="`done-${index}`" v-model="task[4]" />
          <label :for="`done-${index}`">Mark as Done</label>
        </div>

        <br>
        <button @click="deleteTask(index)" class="delete-btn">Delete Task</button>
        </div>
      </tab>
  </div>
</template>

<style scoped>
  input {
    display: block;
    margin: 5px 0;
  }

  .task {
    border: 5px solid black;
    padding: 10px;
    margin: 10px;
    width: 85%;
    display: inline-block;
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

  #menu {
    display: flex;
    justify-content: flex-start;
    gap: 20px;
    width: 90vw;
    flex-wrap: wrap;
  }

  #finishedText {
    color: green;
    font-weight: bold
  }

  #unfinishedText {
    color: red;
    font-weight: bold
  }

  #finished {
    display: inline-block;
  }

  #unfinished {
    display: inline-block;
  }

</style>
