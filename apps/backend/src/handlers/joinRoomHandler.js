import { checkUserExists } from "../utils/roomUtils.js";

export function handleJoinRoom(ws, data, rooms) {
  const userNameWhiteList = /^[A-Za-z0-9]+$/;

  const { roomId, user, wantsVisitor } = JSON.parse(data);

  if (!user.match(userNameWhiteList)) {
    ws.send(JSON.stringify({ type: "wrong-format" }));
    return;
  }

  const userLower = user.toLowerCase();

  if (!rooms[roomId]) {
    ws.send(
      JSON.stringify({ type: "room-joined", error: "Raum nicht gefunden" })
    );
    return;
  }

  if (checkUserExists(rooms[roomId], userLower)) {
    ws.send(
      JSON.stringify({
        type: "user-exists",
        message: "User already exists",
      })
    );
    return;
  }

  rooms[roomId].players.push({
    name: userLower,
    role: wantsVisitor ? "Visitor" : "Player",
    socket: ws,
    card: null,
  });

  console.log("das ist role", rooms[roomId].players.role);

  const joinedUserIdx = rooms[roomId].players.findIndex(
    (ele) => ele.name === userLower
  );

  ws.send(
    JSON.stringify({
      type: "room-joined",
      message: "User angelegt",
      room: rooms[roomId],
      card: null,
      stories: rooms[roomId].stories,
      stagedStory: rooms[roomId].stagedStory,
      discussedStories: rooms[roomId].discussedStories,
      role: rooms[roomId].players[joinedUserIdx].role,
    })
  );

  rooms[roomId].players.forEach((player) => {
    if (player.socket !== ws && player.socket.readyState === WebSocket.OPEN) {
      player.socket.send(
        JSON.stringify({
          type: "user-joined",
          name: userLower,
          role: rooms[roomId].players[joinedUserIdx].role,
          card: null,
        })
      );
    }
  });
}
