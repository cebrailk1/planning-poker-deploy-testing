export function exportGameData(room){
  const date = new Date()
  let text = `# Ergebnisse PlaningPoker vom ${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()} : \n`
  for(let i = 0;i<room.discussedStories.length;i++){
    text += `**${room.discussedStories[i].name}**: ${room.discussedStories[i].points} Points \n`
  }
  return text
}