<script>

export default{
    props:{hash:String}, 
    data(){
        return{
            hasUsername:false,
            username:"",
            existingUser:null,
        }
    },
    methods:{
        getUsernameForRoom(){
           const savedRooms =  JSON.parse(localStorage.getItem("rooms"))
           console.log(savedRooms[this.hash])
           //this.userList.push(savedRooms[this.hash])
            if(savedRooms[this.hash]){
                this.existingUser = savedRooms[this.hash]
                this.hasUsername = true
            }
        },
        UserJoinRoom(){
            this.$socketConnect.joinRoom(this.hash,this.username,((room)=>{
                localStorage.setItem("rooms",JSON.stringify({[this.hash]:this.username}))
                console.log("der raum",room)
                //this.userList = room
                this.getUsernameForRoom()
            }))
        }   
    },
    computed:{
        userList(){
            return this.$socketConnect.userList
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
        <h1>Welcome {{ this.existingUser }}</h1>
        <p>Your room-link: <strong>http://localhost:5173/room/{{ this.hash }}</strong></p>
        <ul>
            <li>d{{ this.userList }}</li>
        </ul>
    </div>
</template>
<style scoped></style>