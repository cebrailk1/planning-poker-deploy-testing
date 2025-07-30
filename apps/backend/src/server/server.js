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
        rooms[roomId].push(username)
        console.log(rooms)
        ws.send(JSON.stringify({type:"room-created",roomId}))
       }
       if(type === "join room"){
        const {roomId} = JSON.parse(data)
        console.log(roomId)
        
       }
       if(usersLength==0){
        users[username] = new Set()
        users[username]["role"] = "Scrum Master"
        ws.send(JSON.stringify({type:"success",message:"User angelegt"}))
       }else{
        if(!users[username]){
          users[username] = new Set()
            ws.send(JSON.stringify({type:"success",message:"User angelegt"}))
        }else{
            ws.send(JSON.stringify({type:"error",message:"User already exists"}))
        }
    }
    })
})


function roomHasher(){
    let hasher = ''
    for(let i=0;i<15;i++){
      const randomNumber =  Math.round(Math.random(i))
        hasher +=randomNumber
    }
    console.log(hasher)
    return hasher
}

function createNewRoom(){}