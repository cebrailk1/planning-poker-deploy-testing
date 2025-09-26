<script>
export default {
  data() {
    return {};
  },
  computed: {
    userList() {
      return this.$socketConnect.userList;
    },
  },
};
</script>
<template>
  <div
    class="absolute top-25 left-4 text-sm bg-green-900 bg-opacity-80 p-4 rounded-lg shadow-lg w-80 space-y-3"
  >
    <div>
      <h2 class="text-2xl font-semibold mb-2">Player in room:</h2>
      <ul class="list-none list-inside space-y-1 text-lg text-white">
        <li v-for="user in userList" :key="user">
          {{ user.name.toUpperCase() }} ({{ user.role==='Visitor'? user.role+'👀':user.role}})
        </li>
      </ul>
    </div>
  </div>
</template>
