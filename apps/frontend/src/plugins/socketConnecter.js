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
        console.log("hallo", this.userList);
        if (this._onRoomCreatedCallback) {
          this._onRoomCreatedCallback(roomHash);
          this._onRoomCreatedCallback = null;
        }
      }

      if (response.type === "room-joined") {
        if (this._onRoomJoinedCallback) {
          console.log(
            this.userList,
            "userlist vor join des players",
            response.room
          );

          this.userList.push(response.room[response.room.length - 1]);
          console.log(this.userList, "das, ist dsakjs2");
          this._onRoomJoinedCallback(response.room);
          this._onRoomJoinedCallback = null;
        }
      }

      if (response.type === "user-joined") {
        console.log("ein neus spieler ist beigetrerten", response);
        this.userList.push(response.name);
        console.log("user list updated", this.userList);
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
}
