<script>
export default{
    props:['hash'],
    data(){
        return{
            storyPoints:null,
            story:''
        }
    },
    methods:{
        addStory(){
            this.$socketConnect.addStory(this.story,this.hash)
            this.story = ''
        }
    }
}
</script>
<template>
    
  <div
    v-if="this.$socketConnect.userRole === 'Scrum Master'"
    class="absolute top-60 m-10"
  >
      <input v-if="this.$socketConnect.userRole==='Scrum Master'" class="placeholder:text-slate-400 text-sm border border-slate-200 rounded-md px-3 py-2" type="text" placeholder="Story..." @change="addStory" v-model="story"/>
    <button
      class="bg-yellow-200 p-1.5 rounded-2xl text-black"
      @click="this.$emit('startRound')"
    >
      Start new Game
    </button>
    <button class="bg-red-400 p-1.5 rounded-2xl text-black" @click="this.$emit('endRound',this.storyPoints)">
      End Round
    </button>
    <button class="p-1.5" @click="this.$emit('startDiscussion')">Start Discussion</button>
    <select
      v-if="this.$socketConnect.discussionPhase"
      v-model="this.storyPoints"
      class="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow cursor-pointer appearance-none"
    >
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="5">5</option>
      <option value="8">8</option>
      <option value="13">13</option>
    </select>
  </div>
</template>
