import { reactive } from "vue";

export default {
  install: (app) => {
    //const socketConnecter = reactive(new SocketConnecter())
    app.config.globalProperties.$socketConnect = new SocketConnecter();
  },
};
let socket;
let roomHash;

class SocketConnecter {
  constructor() {
    this._onRoomCreatedCallback = null;
    this._onRoomJoinedCallback = null;
    this.userList = [];
    this.userRole = null;
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
      console.log("Message from server:", response);

      if (response.type === "room-created") {
        roomHash = response.roomId;
        this.userList.push(response.room[0].name);
        this.userRole = response.room[0].role;
        if (this._onRoomCreatedCallback) {
          this._onRoomCreatedCallback(roomHash);
          this._onRoomCreatedCallback = null;
        }
      }

      if (response.type === "room-joined") {
        if (this._onRoomJoinedCallback) {
          response.room.forEach((player) => {
            this.userList.push(player.name);
          });
          this._onRoomJoinedCallback(response.room);
          this._onRoomJoinedCallback = null;
        }
      }

      if (response.type === "user-joined") {
        console.log("neuer user joined",response)
        this.userList.push(response.name);
        console.log("Neuer Spieler:", response.name);
      }

      if (response.type === "user-exists") {
        if (this._onRoomJoinedCallback) {
          this._onRoomJoinedCallback({
            error: "user-exists",
            message: "Username already taken",
          });
        }       
      }

      if(response.type === "set-card"){
        console.log("Neue Karte gesetzt",response.card)
      }  
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };
  }

  createRoom(username, callback) {
    this._onRoomCreatedCallback = callback;
    this.connect(() => {
      socket.send(JSON.stringify({ type: "create room", username }));
    });
  }

  joinRoom(roomId, user, callback) {
    this._onRoomJoinedCallback = callback;
    this.connect(() => {
      socket.send(JSON.stringify({ type: "join room", roomId, user }));
    });
  }

  setCard(card, user, roomId) {
    this.connect(() => {
      socket.send(JSON.stringify({ type: "set card", card, user, roomId }));
    });
  }
}
