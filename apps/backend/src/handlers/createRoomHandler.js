import {roomHasher} from "../utils/roomUtils.js";

export function handleCreateRoom(ws,username, rooms) {
  const userNameWhiteList = /^[A-Za-z0-9]+$/;
  if (!username.match(userNameWhiteList)) {
    ws.send(JSON.stringify({ type: "wrong-format" }));
    return;
  }

  const roomId = roomHasher();
  rooms[roomId] = {
    players: [],
    roundStarted: false,
    stories: [],
    stagedStory: "",
    discussion: false,
    discussedStories: [],
    timerActive: false,
    timerValue: 0,
    timerInterval: null,
    doppelteKarten: { 1: [], 2: [], 3: [], 5: [], 8: [], 13: [] },
  };

  rooms[roomId].players.push({
    name: username.toLowerCase(),
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
