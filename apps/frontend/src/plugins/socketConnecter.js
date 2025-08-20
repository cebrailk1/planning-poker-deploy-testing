import { reactive } from "vue";

export default {
  install: (app) => {
    app.config.globalProperties.$socketConnect = new SocketConnecter();
  },
};
let socket;

class SocketConnecter {
  constructor() {
    this.roomHash;
    this.createdRoomBool = false;
    this.onRoomCreatedCallback = null;
    this.onRoomJoinedCallback = null;
    this.userList = []; //[{name,role,card}]
    this.userRole = null;
    this.storyList = [];
    this.stagedStory = "";
    this.roundStarted = false;
    this.revealCards = false;
    this.discussionPhase = false;
    this.discussedStories = [];
    this.gameLeft = false;
    return reactive(this);
  }

  connect(callback) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      callback();
      return;
    }

    socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      if (callback) callback();
    };

    socket.onmessage = (message) => {
      const response = JSON.parse(message.data);

      if (response.type === "room-created") {
        this.roomHash = response.roomId;
        console.log(response.room.players[0].role);
        this.userRole = response.room.players[0].role;
        this.userList.push({
          name: response.room.players[0].name,
          role: response.room.players[0].role,
          card: response.room.players[0].card,
        });

        this.createdRoomBool = true;
      }

      if (response.type === "room-joined") {
        if (this.onRoomJoinedCallback) {
          response.room.players.forEach((player) => {
            this.userList.push({
              name: player.name,
              role: player.role,
              card: player.card,
            });
          });
          //this.gameLeft = false
          this.userRole = response.role
          this.storyList = response.stories;
          this.stagedStory = response.stagedStory;
          this.discussedStories = response.discussedStories;
          this.onRoomJoinedCallback(response.room);
          this.onRoomJoinedCallback = null;
        }
      }

      if (response.type === "user-joined") {
        this.userList.push({
          name: response.name,
          role: response.role,
          card: response.card,
        });
      }

      if (response.type === "user-exists") {
        if (this.onRoomJoinedCallback) {
          this.onRoomJoinedCallback({
            error: "user-exists",
            message: "Username already taken",
          });
        }
      }

      if (response.type === "user-rejoined") {
        this.userList = response.room.players;
        this.userRole = response.role;
        this.roundStarted = response.room.roundStarted;
        this.storyList = response.stories;
        this.stagedStory = response.stagedStory;
        this.discussedStories = response.discussedStories;
      }

      if (response.type === "set-card") {
        this.userList.find((player) => {
          if (player.name === response.name) {
            player.card = response.card;
          }
        });
      }

      if (response.type === "started-round") {
        this.roundStarted = response.roundStarted;
        this.revealCards = false;
        this.userList = response.room;
      }

      if (response.type === "ended-round") {
        this.roundStarted = response.roundEnded;
        this.storyList = response.stories;
        //this.revealCards = true;
        this.discussionPhase = false;
        this.discussedStories = response.discussedStories;
        this.stagedStory = "";
      }

      if (response.type === "set-new-story") {
        this.storyList = response.stories;
      }

      if (response.type === "story-staged") {
        this.stagedStory = response.story;
        console.log("Story staged to everyone", this.stagedStory);
      }

      if (response.type === "discussion-started") {
        this.revealCards = true;
        this.discussionPhase = response.discussion;
      }

      if (response.type === "left") {
        console.log("YOU left");
        this.gameLeft = true;
        socket.onclose();
      }

      if (response.type === "user-left") {
        console.log("spieler left");
        this.userList = response.room.players;
      }

      if(response.type === "exported-data"){
        navigator.clipboard.writeText(response.exportedData)
      }

      if(response.type === "wrong-format"){
        console.log(response.type)
        alert("wrong format of Username")
      }
      if (response.type === "user-list-update") {
        this.userList = response.players;
      }
      if (response.type === "user-list-update") {
        this.userList = response.players;
      }

      if(response.type === "exported-data"){
        navigator.clipboard.writeText(response.exportedData)
      }

      if(response.type === "wrong-format"){
        console.log(response.type)
        alert("wrong format of Username")
      }

      if(response.type === "story-exists")[
        alert("Story already in backlog")
      ]

    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };
  }

  createRoom(username) {
    this.connect(() => {
      socket.send(JSON.stringify({ type: "create room", username }));
    });
  }

  joinRoom(roomId, user,wantsVisitor, callback) {
    this.onRoomJoinedCallback = callback;
    this.connect(() => {
      socket.send(JSON.stringify({ type: "join room", roomId, user,wantsVisitor }));
    });
  }

  setCard(card, user, roomId) {
    this.connect(() => {
      socket.send(JSON.stringify({ type: "set card", card, user, roomId }));
    });
  }

  rejoin(user, roomId) {
    this.connect(() => {
      socket.send(JSON.stringify({ type: "rejoin", user, roomId }));
    });
  }
  startRound(roomId) {
    this.connect(() => {
      socket.send(JSON.stringify({ type: "start round", roomId }));
    });
  }
  endRound(roomId, storyPoints, story) {
    this.connect(() => {
      socket.send(
        JSON.stringify({ type: "end round", roomId, storyPoints, story })
      );
    });
  }
  addStory(story, roomId) {
    this.connect(() => {
      socket.send(JSON.stringify({ type: "set story", story, roomId }));
    });
  }
  stageStory(story, roomId) {
    this.connect(() => {
      socket.send(JSON.stringify({ type: "stage story", story, roomId }));
    });
  }
  startDiscussion(roomId) {
    this.connect(() => {
      socket.send(JSON.stringify({ type: "start discussion", roomId }));
    });
  }
  leaveRoom(roomId, user) {
    this.connect(() => {
      socket.send(JSON.stringify({ type: "leave room", roomId, user }));
    });
  }

  exportRoomData(roomId){
    this.connect(()=>{
      socket.send(JSON.stringify({type: "copy stories",roomId}))
    })
  }
  changeName(roomId, oldName, newName) {
    this.connect(() => {
      socket.send(
        JSON.stringify({
          type: "change-name",
          roomId,
          oldName,
          newName,
        })
      );
    });
  }
  changeName(roomId, oldName, newName) {
    this.connect(() => {
      socket.send(
        JSON.stringify({
          type: "change-name",
          roomId,
          oldName,
          newName,
        })
      );
    });
  }
  changeName(roomId, oldName, newName) {
    this.connect(() => {
      socket.send(
        JSON.stringify({
          type: "change-name",
          roomId,
          oldName,
          newName,
        })
      );
    });
  }

  exportRoomData(roomId){
    this.connect(()=>{
      socket.send(JSON.stringify({type: "copy stories",roomId}))
    })
  }
}
