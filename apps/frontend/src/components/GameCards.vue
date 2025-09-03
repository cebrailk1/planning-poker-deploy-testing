<script>
export default {
  emits: ["card"],
  data() {
    return {
      fibonacciCards: [1, 2, 3, 5, 8, 13],
      selectedCard: null,
    };
  },
  methods: {
    toggleCard(card) {
      if (this.$socketConnect.roundStarted) {
        if (this.selectedCard === card) {
          this.resetCard();
        } else {
          this.selectedCard = card;
          this.$emit("card", card);
        }
      }
    },
    resetCard() {
      this.selectedCard = null;
      this.$emit("card", null);
    },
  },
  watch: {
    "$socketConnect.roundStarted"(newVal, oldVal) {
      if (oldVal && !newVal) this.resetCard();
    },
    "$socketConnect.revealCards"(newVal, oldVal) {
      if (oldVal && !newVal) this.resetCard();
    },
  },
};
</script>

<template>
  <div class="absolute w-full bottom-30">
    <div class="flex justify-center items-center">
      <div
        v-for="card in fibonacciCards"
        :key="card"
        @click="toggleCard(card)"
        class="w-16 h-24 bg-white rounded-md border-2 border-gray-300 flex items-center justify-center cursor-pointer text-2xl font-bold text-gray-800 relative transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-md active:scale-95 m-3"
        :class="{
          'border-yellow-400 shadow-lg bg-yellow-50 z-10':
            selectedCard === card,
        }"
      >
        {{ card }}
        <div
          v-if="selectedCard === card"
          class="absolute top-1 right-1 text-yellow-500 text-sm"
        >
          ✓
        </div>
      </div>
    </div>
  </div>
</template>
