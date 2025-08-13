import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
let rooms = {};//neue struktur  {hash:{player:[],roundstarted:bool}}
wss.on("connection", function connection(ws) {
  ws.on("error", console.error);
  ws.on("message", function message(data, isBinary) {
    const { username, type } = JSON.parse(data);

    if (type === "create room") {
      const roomId = roomHasher();
      rooms[roomId] = {
        players: [],
        roundStarted: false,
        stories :[],//{name,points}
        stagedStory:'',
        discussion:false
      };
      rooms[roomId].players.push({
        name: username,
        role: "Scrum Master",
        socket: ws,
        card: null,
      });
      ws.send(
        JSON.stringify({
          type: "room-created",
          roomId,
          room: rooms[roomId],
          card: null,
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
      rooms[roomId].players.push({
        name: user,
        role: "Player",
        socket: ws,
        card: null,
      });
      console.log("Räume", rooms);

      ws.send(
        JSON.stringify({
          type: "room-joined",
          message: "User angelegt",
          room: rooms[roomId],
          card: null,
          stories:rooms[roomId].stories
        })
      );

      rooms[roomId].players.forEach((player) => {
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
              card: null,
            })
          );
        }
      });
    }

    if (type === "rejoin") {
      const { user, roomId } = JSON.parse(data);
      const rejoinedPlayer = rooms[roomId].players.find(
        (player) => player.name === user
      );
      if (rejoinedPlayer) {
        rejoinedPlayer.socket = ws;
        console.log("rejoining...", rooms[roomId]);
        console.log(rooms[roomId]);
        ws.send(
          JSON.stringify({
            type: "user-rejoined",
            room: rooms[roomId],
            role: rejoinedPlayer.role,
            stories:rooms[roomId].stories,
            stagedStory: rooms[roomId].stagedStory
          })
        );
      }
    }

    if (type === "set card") {
      const { card, user, roomId } = JSON.parse(data);
      let currentPlayerChangedCard;
      rooms[roomId].players.forEach((player) => {
        if (player.name === user) {
          if (card === null) {
            player.card = null;
          } else {
            player.card = card;
          }
        }
        currentPlayerChangedCard = rooms[roomId].players.find(
          (player) => player.name === user
        );
      });
      rooms[roomId].players.forEach((player) => {
        if (player.socket.readyState === WebSocket.OPEN) {
          player.socket.send(
            JSON.stringify({
              type: "set-card",
              name: user,
              card: currentPlayerChangedCard.card,
            })
          );
        }
      });
    }

    if (type === "start round") {
      const { roomId } = JSON.parse(data);

      rooms[roomId].roundStarted = true;
      rooms[roomId].players.forEach((player) => {
        player.card = null;
      });
      console.log("runde startet alle Karten auf null", rooms[roomId]);

      rooms[roomId].players.forEach((player) => {
        if (player.socket.readyState === WebSocket.OPEN) {
          player.socket.send(
            JSON.stringify({
              type: "started-round",
              roundStarted: rooms[roomId].roundStarted,
              room:rooms[roomId].players
            })
          );
        }
      });
    }

    if (type === "end round") {
      const { roomId } = JSON.parse(data);

      rooms[roomId].roundStarted = false;
      rooms[roomId].discussion = false
      rooms[roomId].players.forEach((player) => {
        if (player.socket.readyState === WebSocket.OPEN) {
          player.socket.send(
            JSON.stringify({
              type: "ended-round",
              roundEnded: rooms[roomId].roundStarted,
            })
          );
        }
      });
    }

    if(type==="set story"){
      const {story,roomId} = JSON.parse(data)

      //rooms[roomId].stories = []
      //rooms[roomId].stories.push(story)
      rooms[roomId].stories.push({name:story,points:null})
      console.log(rooms[roomId].stories)
      rooms[roomId].players.forEach((player)=>{
        if(player.socket.readyState === WebSocket.OPEN){
          player.socket.send(JSON.stringify({
            type:"set-new-story",//✅
            stories:rooms[roomId].stories
          }))
        }
      })
    }

    if(type === "stage story"){
      const {story,roomId} = JSON.parse(data)

      rooms[roomId].stagedStory = story
      console.log(rooms[roomId].stagedStory)
      rooms[roomId].players.forEach((player)=>{
        if(player.socket.readyState === WebSocket.OPEN){
          player.socket.send(JSON.stringify({type:"story-staged",story:rooms[roomId].stagedStory}))
        }
      })
    }

    if(type === "start discussion"){
      const {roomId} =JSON.parse(data)

      rooms[roomId].discussion = true

      rooms[roomId].players.forEach((player)=>{
        if(player.socket.readyState === WebSocket.OPEN){
          player.socket.send(JSON.stringify({type:"discussion-started",discussion:rooms[roomId].discussion}))
        }
      })
    }

  });
});

function roomHasher() {
  return crypto.randomUUID();
}

function checkUserExists(room, user) {
  for (let e of room.players) {
    if (e.name === user) {
      return true;
    }
  }
}

function sendToEveryClient() {}
