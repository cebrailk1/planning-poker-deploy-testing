<script>
export default {
  props: ["username"],
  data() {
    return {
      wantsVisitor: false,
      user: "",
    };
  },
  methods: {
    UserJoinRoom() {
      console.log(this.user);
      this.$emit("joinRoom", this.user, this.wantsVisitor);
    },
  },
};
</script>
<template>
  <div
    class="relative flex items-center justify-center min-h-screen bg-green-900"
  >
    <div
      class="bg-white shadow-2xl rounded-xl opacity-90 p-20 transform transition duration-300 hover:scale-105"
    >
      <h1 class="text-3xl mb-8 text-center tracking-wide text-green-800">
        Join the Planning Poker room
      </h1>
      <p class="text-center text-gray-600 mb-6">
        You have been invited to join a Planning Poker room.<br />
        Please enter your name to continue.
      </p>

      <div class="mb-6">
        <input
          type="text"
          placeholder="Your username"
          v-model="this.user"
          @keyup.enter="UserJoinRoom"
          class="w-full rounded-lg px-4 py-3 border border-gray-300 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 text-lg"
        />
      </div>

      <div class="flex items-center mb-6">
        <input
          v-model="wantsVisitor"
          type="checkbox"
          id="visitorCheckbox"
          class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label for="visitorCheckbox" class="ml-2 block text-sm text-gray-700">
          Join as visitor(can´t vote)
        </label>
      </div>

      <button
        @click="UserJoinRoom"
        class="w-full rounded-lg px-4 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white border-gray-300 shadow-sm hover:from-green-600 hover:to-green-800 transition duration-200 font-medium"
      >
        Join room
      </button>

      <p class="text-center text-gray-500 mt-6 text-sm">
        Plan together, work smarter.
      </p>
    </div>

    <p
      class="absolute bottom-4 right-4 text-gray-300 text-sm opacity-60 hover:opacity-100 transform hover:-translate-y-1 transition duration-300"
    >
      👥 By your Azubi-Team from Hamburg
    </p>
  </div>
</template>
