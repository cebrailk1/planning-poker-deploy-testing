<script>
export default {
  data() {
    return {
      username: "",
    };
  },
  methods: {
    createRoom() {
      if (this.username === "") {
        alert("type username in...");
      } else {
        this.$socketConnect.createRoom(this.username);
      }
    },
  },

  watch: {
    "$socketConnect.createdRoomBool"(newVal) {
      if (newVal) {
        console.log("watcher triggered", this.$socketConnect.roomHash);
        localStorage.setItem(
          "rooms",
          JSON.stringify({
            [this.$socketConnect.roomHash]: this.username,
            createdRoom: true,
          })
        );
        this.$router.push({
          name: "GameRoom",
          params: { hash: this.$socketConnect.roomHash },
        });
      }
    },
  },
};
</script>

<template>
  <div class="relative flex items-center justify-center min-h-screen bg-green-900">
    <div class="bg-white shadow-2xl rounded-xl opacity-90 p-20 transform transition duration-300 hover:scale-105">
      <h1 class="text-3xl mb-8 text-center tracking-wide">Welcome to Planningpoker</h1>
      <input
        type="text"
        placeholder="Enter your Username"
        v-model="this.username"
        class="rounded-lg px-4 py-3 border border-gray-300 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
        />
      <button @click="createRoom" class="rounded-lg px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 border-gray-300 shadow-sm hover:from-yellow-500 hover:to-yellow-700 transition duration-200" >Create Room</button>
     <p class="text-center text-gray-500 mt-6 text-sm">
        Plan together, work smarter.
      </p>
    </div>
    <p class="absolute bottom-4 right-4 text-gray-300 text-sm opacity-60 hover:opacity-100 transform hover:-translate-y-1 transition duration-300">👥 By your Azubi-Team from Hamburg</p>
  </div>
</template>
