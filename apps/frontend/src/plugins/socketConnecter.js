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
    this.userList = []; //[{name,role,card}]
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

      if (response.type === "room-created") {
        roomHash = response.roomId;
        this.userRole = response.room[0].role;
        this.userList.push({
          name: response.room[0].name,
          role: response.room[0].role,
          card: response.room[0].card,
        });
        if (this._onRoomCreatedCallback) {
          this._onRoomCreatedCallback(roomHash);
          this._onRoomCreatedCallback = null;
        }
      }

      if (response.type === "room-joined") {
        if (this._onRoomJoinedCallback) {
          response.room.forEach((player) => {
            this.userList.push({
              name: player.name,
              role: player.role,
              card: player.card,
            });
          });
          this._onRoomJoinedCallback(response.room);
          this._onRoomJoinedCallback = null;
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
        if (this._onRoomJoinedCallback) {
          this._onRoomJoinedCallback({
            error: "user-exists",
            message: "Username already taken",
          });
        }
      }

      if (response.type === "user-rejoined") {
        this.userList = response.room;
        this.userRole = response.role
      }

      if (response.type === "set-card") {
        this.userList.find((player) => {
          if (player.name === response.name) {
            player.card = response.card;
          }
        });
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

  rejoin(user, roomId) {
    this.connect(() => {
      socket.send(JSON.stringify({ type: "rejoin", user, roomId }));
    });
  }

}
