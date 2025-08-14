export  function sendToEveryClient(roomId,payload,rooms) {
  rooms[roomId].players.forEach((player)=>{
    if(player.socket.readyState===WebSocket.OPEN){
      player.socket.send(JSON.stringify(payload))
    }
  })
} 
