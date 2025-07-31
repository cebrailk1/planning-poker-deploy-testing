import WebSocket, { WebSocketServer } from "ws"

const wss = new WebSocketServer({port:8080})
let users = {}
let rooms = {}
wss.on("connection",function connection(ws){
    ws.on('error',console.error)

    ws.on('message',function message(data){
       const {username,type} = JSON.parse(data)
       const usersLength = Object.keys(users).length
       if(type==="create room"){
       const roomId =roomHasher()
        rooms[roomId] = []
        rooms[roomId].push({name:username,type:"Scrum Master"})
        console.log(rooms)
        ws.send(JSON.stringify({type:"room-created",roomId}))
       }
       if(type === "join room"){
        const {roomId,user} = JSON.parse(data)
        console.log("adding player",roomId,user)
        rooms[roomId].push( {name:user,type:"Player"})
        console.log(rooms)
        ws.send(JSON.stringify({type:"room-joined",message:"User angelegt"}))
       }
       
    })
})


function roomHasher(){
    let hasher = ''
    for(let i=0;i<15;i++){
      const randomNumber =  Math.round(Math.random(i))
        hasher +=randomNumber
    }
    return hasher
}

function createNewRoom(){}