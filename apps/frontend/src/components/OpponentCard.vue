<script>
export default {
  props: ["existingUser"],
  data() {
    return {};
  },
  methods: {
    getInitals(index) {
      let firstLetter = this.$socketConnect.userList.filter(
        (player) => player.role !== "Scrum Master"
      );
      return firstLetter[index].name[0].toUpperCase();
    },
    chooseEstimate(cardValue) {
      if (
        this.$socketConnect.userRole === "Scrum Master" &&
        this.$socketConnect.stagedStory
      ) {
        this.$socketConnect.chooseEstimate(
          this.$socketConnect.stagedStory,
          cardValue,
          this.$parent.hash
        );
      }
    },
  },
  computed: {
    userCardsList() {
      return this.$socketConnect.userList
        .filter((player) => player.role !== "Scrum Master")
        .map((player) => player.card);
    },
    isScrumMaster() {
      return this.$socketConnect.userRole === "Scrum Master";
    },
    isDiscussionPhase() {
      return this.$socketConnect.discussionPhase;
    },
  },
};
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <div
      class="w-full max-w-6xl bg-green-700 border-[10px] border-yellow-400 rounded-full h-[500px] flex justify-center items-center"
    >
      <div
        v-if="!this.$socketConnect.revealCards"
        v-for="(userCard, index) in userCardsList"
        :key="`hidden-${index}`"
        class="w-16 h-24 bg-white rounded-md border-2 border-gray-300 flex items-center justify-center cursor-pointer text-2xl font-bold text-gray-800 relative transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-md active:scale-95 m-3"
        :class="{
          'border-yellow-400 shadow-lg bg-yellow-50 z-10': userCard !== null,
        }"
      >
        ?
        <div
          class="absolute top-1 right-1 text-sm rounded-full border-2 border-black flex justify-center items-center w-5 h-5 bg-black text-white"
        >
          {{ this.getInitals(index) }}
        </div>
      </div>

      <div
        v-else
        v-for="(userCard, index) in userCardsList"
        :key="`revealed-${index}`"
        class="flex flex-col items-center m-3"
      >
        <div
          class="w-16 h-24 bg-white rounded-md border-2 border-gray-300 flex items-center justify-center cursor-pointer text-2xl font-bold text-gray-800 relative transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-md active:scale-95"
          :class="{
            'border-yellow-400 shadow-lg bg-yellow-50 z-10': userCard !== null,
          }"
        >
          {{ userCard || "Keine Value" }}
          <div
            class="absolute top-1 right-1 text-sm rounded-full border-2 border-black flex justify-center items-center w-5 h-5 bg-black text-white"
          >
            {{ this.getInitals(index) }}
          </div>
        </div>

        <button
          v-if="
            isScrumMaster &&
            isDiscussionPhase &&
            userCard !== null &&
            userCard !== 'Keine Value'
          "
          @click="chooseEstimate(userCard)"
          class="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
          title="Diese Schätzung für die Story wählen"
        >
          Choose this estimate
        </button>
      </div>
    </div>
  </div>
</template>
