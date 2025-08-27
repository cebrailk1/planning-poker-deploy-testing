<script>
import GameRoom from "./components/GameRoom.vue";
import CreateRoom from "./components/CreateRoom.vue";
export default {
  data() {
    return {
      socket: null,
      authenticated: false,
    };
  },
  components: {
    CreateRoom,
    GameRoom,
  },
  methods: {},
};
</script>

<template>
  <div><RouterView></RouterView></div>
</template>

<style scoped></style>
