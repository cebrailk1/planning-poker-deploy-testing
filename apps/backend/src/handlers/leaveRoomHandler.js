import { sendToEveryClient } from "../utils/sendToClients.js";
import { checkUserRole } from "../utils/roomUtils.js";

export function handleLeaveRoom(ws, data, rooms) {
  const { roomId, user } = JSON.parse(data);

  const leavingUser = rooms[roomId].players.findIndex(
    (player) => player.name === user.toLowerCase()
  );

  const isScrumMaster = checkUserRole(leavingUser, rooms[roomId].players);

  if (isScrumMaster) {
    let payload = { type: "left" };
    sendToEveryClient(roomId, payload, rooms);
    delete rooms[roomId];
    return;
  }

  rooms[roomId].players.splice(leavingUser, 1);

  if (rooms[roomId].players.length === 0) {
    delete rooms[roomId];
    ws.send(JSON.stringify({ type: "left" }));
  } else {
    ws.send(JSON.stringify({ type: "left" }));
    rooms[roomId].players.forEach((player) => {
      if (player.socket !== ws && player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(
          JSON.stringify({ type: "user-left", room: rooms[roomId] })
        );
      }
    });
  }
}
