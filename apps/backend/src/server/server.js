import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
let users = {};
let rooms = {};
wss.on("connection", function connection(ws) {
  ws.on("error", console.error);
  ws.on("message", function message(data, isBinary) {
    const { username, type } = JSON.parse(data);

    if (type === "create room") {
      const roomId = roomHasher();
      rooms[roomId] = [];
      rooms[roomId].push({ name: username, role: "Scrum Master", socket: ws });
      console.log(rooms);
      ws.send(
        JSON.stringify({ type: "room-created", roomId, room: rooms[roomId] })
      );
    }

    if (type === "join room") {
      const { roomId, user } = JSON.parse(data);

      if (!rooms[roomId]) {
        ws.send(
          JSON.stringify({ type: "room-joined", error: "Raum nicht gefunden" })
        );
        return;
      }
      console.log("adding player", roomId, user);
      rooms[roomId].push({ name: user, role: "Player", socket: ws });
      console.log(rooms);

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
  });
});

function roomHasher() {
  return crypto.randomUUID();
}

function createNewRoom() {}
