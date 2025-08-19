import WebSocket, { WebSocketServer } from "ws";
import { sendToEveryClient } from "../utils/sendToClients.js";
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
        discussion:false,
        discussedStories:[]
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
      const { roomId, user,wantsVisitor } = JSON.parse(data);

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
      if(wantsVisitor){
        rooms[roomId].players.push({
          name:user,
          role:"Visitor",
          socket:ws,
          card:null
        })
      }else{
          rooms[roomId].players.push({
          name: user,
          role: "Player",
          socket: ws,
          card: null,
        });
      }
      console.log("Räume", rooms);
      const joinedUserIdx = rooms[roomId].players.findIndex((ele)=>ele.name===user)

      ws.send(
        JSON.stringify({
          type: "room-joined",
          message: "User angelegt",
          room: rooms[roomId],
          card: null,
          stories:rooms[roomId].stories,
          stagedStory: rooms[roomId].stagedStory,
          discussedStories:rooms[roomId].discussedStories,
          role:rooms[roomId].players[joinedUserIdx].role
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
              role: rooms[roomId].players[joinedUserIdx].role,
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
            stagedStory: rooms[roomId].stagedStory,
            discussedStories:rooms[roomId].discussedStories
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

      let payload = {type:"set-card",name:user,card:currentPlayerChangedCard.card}
      sendToEveryClient(roomId,payload,rooms)
    }

    if (type === "start round") {
      const { roomId } = JSON.parse(data);

      rooms[roomId].roundStarted = true;
      rooms[roomId].players.forEach((player) => {
        player.card = null;
      });
      console.log("runde startet alle Karten auf null", rooms[roomId]);


      let payload = {type: "started-round",
              roundStarted: rooms[roomId].roundStarted,
              room:rooms[roomId].players}

      sendToEveryClient(roomId,payload,rooms)
    }

    if (type === "end round") {
      const { roomId,storyPoints,story } = JSON.parse(data);

      rooms[roomId].roundStarted = false;
      rooms[roomId].discussion = false
      rooms[roomId].stagedStory = ''
    let discussedStoryIndex= rooms[roomId].stories.findIndex((ele)=>ele.name===story.name)
    rooms[roomId].stories[discussedStoryIndex].points = storyPoints
    rooms[roomId].discussedStories.push(rooms[roomId].stories[discussedStoryIndex])
    rooms[roomId].stories.splice(discussedStoryIndex,1)

      let payload = {type: "ended-round",
              roundEnded: rooms[roomId].roundStarted,
              stories:rooms[roomId].stories,
              discussedStories:rooms[roomId].discussedStories}
      sendToEveryClient(roomId,payload,rooms)
    }

    if(type==="set story"){
      const {story,roomId} = JSON.parse(data)

      rooms[roomId].stories.push({name:story,points:null})
      console.log(rooms[roomId].stories)
      let payload = {
            type:"set-new-story",
            stories:rooms[roomId].stories
          }

          sendToEveryClient(roomId,payload,rooms)
    }

    if(type === "stage story"){
      const {story,roomId} = JSON.parse(data)

      rooms[roomId].stagedStory = story
      console.log(rooms[roomId].stagedStory)
      let payload = {type:"story-staged",story:rooms[roomId].stagedStory}
      sendToEveryClient(roomId,payload,rooms)

    }

    if(type === "start discussion"){
      const {roomId} =JSON.parse(data)

      rooms[roomId].discussion = true
      console.log("starting discussionphase")
     let payload =  {type:"discussion-started",discussion:rooms[roomId].discussion}
     sendToEveryClient(roomId,payload,rooms)

    }

    if(type === "leave room"){
      const {roomId,user} = JSON.parse(data)
    
     const leavingUser = rooms[roomId].players.findIndex((player)=>player.name===user)

      const isScrumMaster = checkUserRole(leavingUser,rooms[roomId].players)

      if(isScrumMaster){
        let payload = {type:"left"}
        sendToEveryClient(roomId,payload,rooms)
        delete rooms[roomId]
        return
     }

     rooms[roomId].players.splice(leavingUser,1)
     console.log("User left",rooms[roomId].players)
     if(rooms[roomId].players.length===0){
      delete rooms[roomId]
      ws.send(JSON.stringify({type:"left"}))
     }else{
     ws.send(JSON.stringify({type:"left"}))
     rooms[roomId].players.forEach((player)=>{
      if( player.socket !== ws &&player.socket.readyState===WebSocket.OPEN){
        player.socket.send(JSON.stringify({type:"user-left",room:rooms[roomId]}))
      }
    })}
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

function checkUserRole(leavingUser,players){
  if(players[leavingUser].role==="Scrum Master"){
    return true
  }
  return false
}