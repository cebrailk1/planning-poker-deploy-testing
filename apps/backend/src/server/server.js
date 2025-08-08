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
      rooms[roomId].push({
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
      rooms[roomId].push({
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
              card: null,
            })
          );
        }
      });
    }

    if (type === "rejoin") {
      const { user, roomId } = JSON.parse(data);
      const rejoinedPlayer = rooms[roomId].find(
        (player) => player.name === user
      );
      if (rejoinedPlayer) {
        rejoinedPlayer.socket = ws
        ws.send(JSON.stringify({ type: "user-rejoined", room: rooms[roomId],role:rejoinedPlayer.role }));
      }
    }

    if (type === "set card") {
      const { card, user, roomId } = JSON.parse(data);
      let currentPlayerChangedCard;
      rooms[roomId].forEach((player) => {
        if (player.name === user) {
          if (card === null) {
            player.card = null;
          } else {
            player.card = card;
          }
        }
        currentPlayerChangedCard = rooms[roomId].find(
          (player) => player.name === user
        );
      });
      rooms[roomId].forEach((player) => {
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
