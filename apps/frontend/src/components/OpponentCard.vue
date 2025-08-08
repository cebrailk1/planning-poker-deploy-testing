<script>
export default {
    props:['existingUser'],
  data() {
    return {};
  },
  methods: {
    getInitals(index) {
      let b = this.$socketConnect.userList.filter(
        (player) => player.name !== this.existingUser
      );
      console.log(b[index]);
      return b[index].name[0].toUpperCase();
    },
  },
  computed: {
    userCardsList() {
      return this.$socketConnect.userList
        .filter((player) => player.name !== this.existingUser)
        .map((player) => player.card);
    },
  },
};
</script>
<template>
  <div
    v-for="(userCard, index) in userCardsList"
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
</template>
