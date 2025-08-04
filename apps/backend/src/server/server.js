import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
let rooms = {};
wss.on("connection", function connection(ws) {
  ws.on("error", console.error);
  ws.on("message", function message(data, isBinary) {
    const { username, type } = JSON.parse(data);

    if (type === "create room") {
      const roomId = roomHasher();
      rooms[roomId] = [];
      rooms[roomId].push({ name: username, role: "Scrum Master", socket: ws });
      ws.send(
        JSON.stringify({
          type: "room-created",
          roomId,
          room: rooms[roomId],
        })
      );
    }

    if (type === "join room") {
      const { roomId, user } = JSON.parse(data);

      if (checkUserExists(rooms[roomId], user)) {
        ws.send(
          JSON.stringify({
            type: "user-exists",
            message: "User already exists",
          })
        );
        return;
      }

      if (!rooms[roomId]) {
        ws.send(
          JSON.stringify({ type: "room-joined", error: "Raum nicht gefunden" })
        );
        return;
      }
      rooms[roomId].push({ name: user, role: "Player", socket: ws });

      ws.send(
        JSON.stringify({
          type: "room-joined",
          message: "User angelegt",
          room: rooms[roomId],
        })
      );

      rooms[roomId].forEach((player) => {
        if (
          player.socket !== ws &&
          player.socket.readyState === WebSocket.OPEN
        ) {
          console.log("Sending to each client");
          player.socket.send(
            JSON.stringify({
              type: "user-joined",
              name: user,
              role: "Player",
            })
          );
        }
      });
    }
    if (type === "set card") {
      const { card, user, roomId } = JSON.parse(data);

      rooms[roomId].forEach((player)=>{
        if(player.name===user){
          if(player.card && player.card === card){
            player.card = null
          }else{
            player["card"] = card
          }
          console.log("spieler karte",player.card)
        }
        const currentPlayerChangedCard= rooms[roomId].find((player)=>(player.name===user))

        if(player.socket.readyState===WebSocket.OPEN){
          player.socket.send(JSON.stringify({type:"set-card",card:currentPlayerChangedCard.card}))
        }
      })

    }
  });
});

function roomHasher() {
  return crypto.randomUUID();
}

function checkUserExists(room, user) {
  for (let e of room) {
    if (e.name === user) {
      return true;
    }
  }
}

function createNewRoom() {}
