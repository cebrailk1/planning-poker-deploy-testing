<script>
export default {
  data() {
    return {
      fibonacciCards: [1, 2, 3, 5, 8, 13],
      selectedCard: null,
    };
  },
  methods: {
    selectCard(card) {
      this.selectedCard = card;
      this.$emit("card", card);
    },
  },
};
</script>

<template>
  <div
    v-for="card in fibonacciCards"
    :key="card"
    @click="selectCard(card)"
    class="w-16 h-24 bg-white rounded-md border-2 border-gray-300 flex items-center justify-center cursor-pointer text-2xl font-bold text-gray-800 relative transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-md active:scale-95"
    :class="{
      'border-yellow-400 shadow-lg bg-yellow-50 z-10': selectedCard === card,
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
</template>
