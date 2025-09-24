<script>
export default {
  data(){
    return{
      active:false,
    }
  },
  props: ["existingUser","isMobile"],
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
    handleMouseOver(event){
      console.log("mouse hovered over")
      this.active = !this.active
    }
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
  watch: {
    "$socketConnect.roundStarted"(newVal, oldVal) {
      if (oldVal === true && newVal === false) {
        this.$socketConnect.userList.forEach((p) => (p.card = null));
      }
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
        v-if="!this.$socketConnect.revealCards&&!this.isMobile"
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
        v-else-if="!this.isMobile"
        v-for="(votingArr, key) in this.$socketConnect.doppelteKarten"
        
        class="flex flex-col items-center p-5 m-5"
        >
        <div class="relative h-36 flex justify-center mb-auto overflow-visible" :style="{
            height: Math.max(144, 96 + (votingArr.length - 1) * 30) + 'px'
          }">
          <div
            class="w-16 h-24 bg-white rounded-md border-2 border-gray-300 flex absolute items-center justify-center cursor-pointer text-2xl font-bold text-gray-800 transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-md active:scale-95"
            :class="{
              'border-yellow-400 shadow-lg bg-yellow-50 z-10':
                userCard !== null,
            }"
            v-for="(user, index) in votingArr" :style="'top:'+index * 30+'px'"
          >
            <div class="relative flex w-full justify-center items-center h-24"      v-on:mouseover="this.active = true"
        v-on:mouseleave="this.active = false">
              {{ key }}
              <div
                class="absolute top-1 right-1 text-sm rounded-full border-2 border-black flex justify-center items-center w-5 h-5 bg-black text-white"
              v-if="!this.active"
                >
                {{ user.name[0] }}
              </div>
              <div v-else @click="this.active = !this.active" class="absolute top-1 right-5 text-sm flex justify-center items-center w-5 h-5 text-black">
                {{ user.name }}
              </div>

              <div v-if="votingArr.length>1" class="absolute bottom-1 right-1 rounded-full text-xs  border-black flex justify-center items-center w-5 h-5 bg-black text-white" @mouseover="mouseOver()" @mouseleave="this.active = false">
                {{ votingArr.length }}x
              </div>
            </div>
          </div>
        </div>

        <div v-if="
              isScrumMaster && 
              isDiscussionPhase &&
              votingArr.length > 0
            " class="mt-auto ">

          <button
            v-if="
              isDiscussionPhase &&
              votingArr.length > 0
            "
            @click="chooseEstimate(key)"
            class="mt-7 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
            title="Diese Schätzung für die Story wählen"
          >
            Choose this estimate
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- :key="`revealed-${index}`" -->
</template>
