<script>
export default {
  props: ["hash"],
  data() {
    return {
      copySuccess: false,
    };
  },
  methods: {
    async exportData() {
      try {
        const data = await this.$socketConnect.exportRoomData(this.hash);
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        this.copySuccess = true;

        setTimeout(() => {
          this.copySuccess = false;
        }, 2000);
      } catch (err) {
        console.error("Export fehlgeschlagen:", err);
      }
    },
    leaveRoom() {
      this.hasUsername = false;
      const savedRooms = JSON.parse(localStorage.getItem("rooms"));
      localStorage.removeItem("rooms");
      this.$socketConnect.leaveRoom(this.hash, savedRooms[this.hash]);
    },
  },
  computed: {
    formattedTimer() {
      const seconds = this.$socketConnect.timerValue || 0;
      const min = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
      const sec = (seconds % 60).toString().padStart(2, "0");
      return `${min}:${sec}`;
    },
  },
};
</script>
<template>
  <header
    class="flex justify-between items-center w-full py-4 px-4 bg-green-900 relative"
  >
    <div class="flex flex-col items-start">
      <button
        @click="exportData"
        class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-sm transition duration-200 text-sm"
      >
        Export Data
      </button>
      <span
        v-if="copySuccess"
        class="mt-1 bg-green-200 text-green-900 px-2 py-1 rounded-lg shadow text-xs animate-bounce"
      >
        ✅ Copied!
      </span>
    </div>

    <div class="text-center">
      <h1 class="text-xl font-bold text-white">
        Current Story:
        {{ $socketConnect.stagedStory?.name || "Keine Story ausgewählt" }}
      </h1>
      <div class="mt-1 flex h-6 items-center justify-center">
        <p
          v-if="!this.$socketConnect.roundStarted"
          class="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
        >
          Waiting...
        </p>
        <p
          v-else-if="!$socketConnect.discussionPhase"
          class="mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
        >
          Round has started | Timer: {{ formattedTimer }}
        </p>
        <p
          v-else
          class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          Discussion
        </p>
      </div>
    </div>

    <button
      class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-sm transition duration-200 text-sm"
      @click="leaveRoom"
    >
      Leave
    </button>
  </header>
</template>
