<script>
export default{
  data(){
    return{
      username:""
    }
  },
  methods:{
    createRoom(){
      this.$socketConnect.createRoom(this.username, (roomHash) => {
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
