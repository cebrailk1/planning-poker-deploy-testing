<script>
export default{
  data(){
    return{
      username:""
    }
  },
  methods:{
    createRoom(){
      if(this.username===''){
        alert("type username in...")
      }else{
      this.$socketConnect.createRoom(this.username)
      }
    }},

    watch:{
    '$socketConnect.createdRoomBool'(newVal){
      if(newVal){
        console.log("watcher triggered",this.$socketConnect.roomHash)
         localStorage.setItem(
          "rooms",
          JSON.stringify({
            [this.$socketConnect.roomHash]: this.username,
            createdRoom: true
          })
        )
        this.$router.push({ name: 'GameRoom', params: { hash: this.$socketConnect.roomHash }})
      }
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
