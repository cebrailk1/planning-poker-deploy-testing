<script>export default{
    props:{hash:String}, 
    data(){
        return{
            hasUsername:false,
            username:""
        }
    },
    methods:{
        getUsernameForRoom(){
           const savedRooms =  JSON.parse(localStorage.getItem("rooms"))
           console.log(savedRooms[this.hash])
            if(savedRooms[this.hash]){
                this.hasUsername = true
            }
        },
        UserJoinRoom(){
            this.$socketConnect.joinRoom(this.hash,this.username,(()=>{
                localStorage.setItem("rooms",JSON.stringify({[this.hash]:this.username}))
                this.getUsernameForRoom()
            }))
        }   
    },
    mounted(){
        this.getUsernameForRoom()
    }
}</script>
<template>
    <div v-if="!this.hasUsername">
        <input type="text" placeholder="username" v-model="username">
        <button @click="UserJoinRoom">Join Room</button>
    </div>
    <div v-else id="game-board">Du bist im Spiel
        <p>{{ this.hash }}</p>
    </div>
</template>
<style scoped></style>