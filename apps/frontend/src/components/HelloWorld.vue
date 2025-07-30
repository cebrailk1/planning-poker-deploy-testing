<script>
export default{
  emits:["new-room"],
  data(){
    return{
      username:""
    }
  },
  methods:{
    createRoom(){
      this.$emit("new-room",this.username)
    }
  }
}
</script>

<template>
  <h1>Welcome to Planningpoker</h1>
  <input type="text" placeholder="Enter your Username" v-model="this.username">
  <button @click="createRoom">Create Room</button>
</template>

<style scoped>

</style>
