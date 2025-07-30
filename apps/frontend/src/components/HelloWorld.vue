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
      this.$socketConnect.createRoom(this.username, (roomHash) => {
       console.log("router pushing",this.username)
       localStorage.setItem("rooms",JSON.stringify({[roomHash]:this.username}))
       this.$router.push({ name: 'GameRoom', params: { hash: roomHash }})
      })
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
