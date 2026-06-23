<script setup>
defineOptions({
  name: 'TaskItem',
})

  // Makes variables update to parent component (App.vue)
  const props = defineProps({taskName : String, taskDescription : String})
  const emit = defineEmits(['update:taskName', 'update:taskDescription'])

</script>

<template>
  <input id="taskName"
    placeholder="Task name"
    required
    :value="props.taskName"
    @input="emit('update:taskName', $event.target.value)"
  />
  <input id="taskDescription"
    placeholder="Task description"
    :value="props.taskDescription"
    @input="emit('update:taskDescription', $event.target.value)"
  />

</template>

<style>
  #taskName {
    font-size: 20px;
    max-width: 95%;
  }

  #taskDescription {
    max-width: 95%;
  }
</style>
