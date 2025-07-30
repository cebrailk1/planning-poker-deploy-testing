import { reactive } from "vue"

export default{
    install: app=>{
            const socketConnecter = reactive(new SocketConnecter())
        app.config.globalProperties.$socketConnect = socketConnecter
    }
}
class SocketConnecter{
    constructor(){
        this.socket = null
        this.roomHash=null
    }
    createRoom(username,callback){
        console.log("creating room...",username)
        this.socket = new WebSocket("ws://localhost:8080")
        this.socket.onopen=()=>{
            this.socket.send(JSON.stringify({type:"create room",username}))
            this.socket.onmessage=(message)=>{
                const response = JSON.parse(message.data)
                console.log(response)
                if(response.type==="room-created"){
                    this.roomHash = response.roomId
                    console.log("roomhash",this.roomHash)
                    callback(this.roomHash)
                }
            }
        }
    }
    joinRoom(roomId){
        this.socket.onopen=()=>{
            this.socket.send(JSON.stringify({type:"join room",roomId}))
        }
    }  
}