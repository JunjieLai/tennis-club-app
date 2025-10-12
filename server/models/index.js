const Member = require('./Member');
const Challenge = require('./Challenge');
const Match = require('./Match');

// Define associations
Challenge.belongsTo(Member, { as: 'Challenger', foreignKey: 'ChallengerMEID' });
Challenge.belongsTo(Member, { as: 'Challenged', foreignKey: 'ChallengedMEID' });

Match.belongsTo(Member, { as: 'Player1', foreignKey: 'Player1MEID' });
Match.belongsTo(Member, { as: 'Player2', foreignKey: 'Player2MEID' });
Match.belongsTo(Member, { as: 'Winner', foreignKey: 'WinnerMEID' });
Match.belongsTo(Member, { as: 'Loser', foreignKey: 'LoserMEID' });
Match.belongsTo(Challenge, { foreignKey: 'CID' });

Member.hasMany(Challenge, { as: 'ChallengesReceived', foreignKey: 'ChallengedMEID' });
Member.hasMany(Challenge, { as: 'ChallengesSent', foreignKey: 'ChallengerMEID' });
Member.hasMany(Match, { as: 'MatchesWon', foreignKey: 'WinnerMEID' });
Member.hasMany(Match, { as: 'MatchesLost', foreignKey: 'LoserMEID' });

module.exports = {
  Member,
  Challenge,
  Match
};
