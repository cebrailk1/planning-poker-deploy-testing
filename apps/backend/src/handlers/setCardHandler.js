import { sendToEveryClient } from "../utils/sendToClients.js";

export function handleSetCard(ws, data, rooms) {
  const { card, user, roomId } = JSON.parse(data);
  console.log("user",user)
  rooms[roomId].players.forEach((player) => {
    if (player.name === user.toLowerCase()) {
      player.card = card === null ? null : card;
    }
  });
  for (const keys in rooms[roomId].doppelteKarten) {
    for (let i = 0; i < rooms[roomId].doppelteKarten[keys].length; i++) {
      if (rooms[roomId].doppelteKarten[keys][i].name === user.toLowerCase()) {
        rooms[roomId].doppelteKarten[keys].splice(i, 1);
      }
    }
  }
  if (card !== null) {
    rooms[roomId].doppelteKarten[card].push({ card, name: user.toLowerCase() });
  }

  let payload = {
    type: "set-card",
    name: user.toLowerCase(),
    card: card,
    doppelteKarten: rooms[roomId].doppelteKarten,
  };
  sendToEveryClient(roomId, payload, rooms);
}
