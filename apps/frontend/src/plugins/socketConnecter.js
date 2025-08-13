import { reactive } from "vue";

export default {
  install: (app) => {
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
    this.roundStarted = false;
    this.revealCards = false;
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
        console.log(response.room.players[0].role);
        this.userRole = response.room.players[0].role;
        this.userList.push({
          name: response.room.players[0].name,
          role: response.room.players[0].role,
          card: response.room.players[0].card,
        });
        if (this._onRoomCreatedCallback) {
          this._onRoomCreatedCallback(roomHash);
          this._onRoomCreatedCallback = null;
        }
      }

      if (response.type === "room-joined") {
        if (this._onRoomJoinedCallback) {
          response.room.players.forEach((player) => {
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
        this.userList = response.room.players;
        this.userRole = response.role;
        this.roundStarted = response.room.roundStarted;
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
        this.revealCards = true;
      }
      if (response.type === "user-list-update") {
        this.userList = response.players;
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
  startRound(roomId) {
    this.connect(() => {
      socket.send(JSON.stringify({ type: "start round", roomId }));
    });
  }
  endRound(roomId) {
    this.connect(() => {
      socket.send(JSON.stringify({ type: "end round", roomId }));
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
}
