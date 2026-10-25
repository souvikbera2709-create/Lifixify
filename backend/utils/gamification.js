const BADGE_DEFINITIONS = [
  { id: 'first_step', name: 'First Step', description: 'Completed your first daily challenge task', icon: '🎯' },
  { id: 'streak_3', name: 'Momentum Builder', description: 'Achieved a 3-day active streak', icon: '🔥' },
  { id: 'streak_7', name: 'Iron Will', description: 'Maintained a 7-day consistency streak', icon: '⚡' },
  { id: 'scholar_100', name: 'Deep Focus', description: 'Completed over 100 minutes of focused study', icon: '📚' },
  { id: 'fitness_starter', name: 'Iron Athlete', description: 'Logged your first fitness workout', icon: '💪' },
  { id: 'finance_master', name: 'Wealth Warden', description: 'Logged your first financial transaction', icon: '💰' },
  { id: 'level_5', name: 'Ascended Hero', description: 'Reached Level 5 in LiFixify', icon: '👑' }
];

const calculateLevel = (xp) => {
  if (!xp || xp < 0) return 1;
  return Math.floor(Math.sqrt(xp / 50)) + 1;
};

const getNextLevelXp = (currentLevel) => {
  return Math.pow(currentLevel, 2) * 50;
};

const evaluateBadges = (user, context = {}) => {
  const unlocked = new Set((user.unlockedBadges || []).map((b) => (typeof b === 'string' ? b : b.id || b.name)));
  const newlyUnlocked = [];

  if (context.taskCompleted && !unlocked.has('first_step')) {
    newlyUnlocked.push(BADGE_DEFINITIONS.find((b) => b.id === 'first_step'));
  }
  if (user.streak >= 3 && !unlocked.has('streak_3')) {
    newlyUnlocked.push(BADGE_DEFINITIONS.find((b) => b.id === 'streak_3'));
  }
  if (user.streak >= 7 && !unlocked.has('streak_7')) {
    newlyUnlocked.push(BADGE_DEFINITIONS.find((b) => b.id === 'streak_7'));
  }
  if (context.totalStudyMinutes >= 100 && !unlocked.has('scholar_100')) {
    newlyUnlocked.push(BADGE_DEFINITIONS.find((b) => b.id === 'scholar_100'));
  }
  if (context.fitnessLogged && !unlocked.has('fitness_starter')) {
    newlyUnlocked.push(BADGE_DEFINITIONS.find((b) => b.id === 'fitness_starter'));
  }
  if (context.financeLogged && !unlocked.has('finance_master')) {
    newlyUnlocked.push(BADGE_DEFINITIONS.find((b) => b.id === 'finance_master'));
  }
  if (user.level >= 5 && !unlocked.has('level_5')) {
    newlyUnlocked.push(BADGE_DEFINITIONS.find((b) => b.id === 'level_5'));
  }

  return newlyUnlocked.filter(Boolean);
};

const awardUserRewards = async (user, { xp = 0, coins = 0, context = {} }) => {
  const previousLevel = user.level || 1;
  user.xp = (user.xp || 0) + Number(xp);
  user.coins = (user.coins || 0) + Number(coins);

  const calculatedLevel = calculateLevel(user.xp);
  const leveledUp = calculatedLevel > previousLevel;
  user.level = calculatedLevel;

  const newBadges = evaluateBadges(user, context);
  if (newBadges.length > 0) {
    if (!user.unlockedBadges) user.unlockedBadges = [];
    newBadges.forEach((badge) => {
      user.unlockedBadges.push({
        id: badge.id,
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        unlockedAt: new Date()
      });
    });
  }

  await user.save();

  return {
    xpAdded: xp,
    coinsAdded: coins,
    totalXp: user.xp,
    totalCoins: user.coins,
    level: user.level,
    leveledUp,
    nextLevelXp: getNextLevelXp(user.level),
    newBadges
  };
};

module.exports = {
  BADGE_DEFINITIONS,
  calculateLevel,
  getNextLevelXp,
  evaluateBadges,
  awardUserRewards
};
