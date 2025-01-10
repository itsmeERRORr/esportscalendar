export const gameLogos: { [key: string]: string } = {
  'CS2': 'https://static.wikia.nocookie.net/logopedia/images/4/49/Counter-Strike_2_%28Icon%29.png/revision/latest?cb=20230330015359',
  'Dota 2': 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/570/0bbb630d63262dd66d2fdd0f7d37e8661a410075.jpg',
  'League of Legends': 'https://static.wikia.nocookie.net/leagueoflegends/images/8/86/League_of_Legends_Cover.jpg',
  'Valorant': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt9a8139fc4f7e5099/5e8cdc21baf2bd3cc4753c7a/Valorant_Favicon.png',
  'Overwatch': 'https://blz-contentstack-images.akamaized.net/v3/assets/blt9c12f249ac15c7ec/blt4d3b4a7e4c30d5b4/62ea8957c87999116773c1f3/OW2_2022_Logos_GameLogo.png',
  // Adicione mais jogos conforme necessário
};

export function getGameLogo(gameName: string): string {
  return gameLogos[gameName] || 'https://via.placeholder.com/30'; // Logo padrão se o jogo não for encontrado
}

