global.db = global.db || { users: {} }

const BASE_LIMIT = 10

function getExpNeeded(level) {
  return 1000 * Math.pow(10, level - 1)
}

function getUser(sender) {
  if (!global.db.users[sender]) {
    global.db.users[sender] = {
      registered: false,
      exp: 0,
      level: 1,
      credit: 0,
      premium: false,
      limit: {
        daily: BASE_LIMIT,
        lastReset: Date.now()
      },
      game: {},
      afk: null,
      age: null
    }
  }
  return global.db.users[sender]
}

function resetLimit(user) {
  const now = Date.now()
  if (now - user.limit.lastReset > 86400000) {
    user.limit.daily = user.premium ? 999 : BASE_LIMIT
    user.limit.lastReset = now
  }
}

function useLimit(user, amount = 1) {
  resetLimit(user)
  if (user.premium) return true
  if (user.limit.daily < amount) return false
  user.limit.daily -= amount
  return true
}

function buyLimit(user, amount = 1) {
  const price = amount * 10
  if (user.credit < price) return false
  user.credit -= price
  user.limit.daily += amount
  return true
}

function addExp(user, amount = 1) {
  let levelUp = false
  user.exp += amount
  while (user.exp >= getExpNeeded(user.level)) {
    user.exp -= getExpNeeded(user.level)
    user.level++
    levelUp = true
  }
  return levelUp
}

function addCredit(user, amount = 1) {
  user.credit += amount
}

function isPremiumUser(user, isOwner) {
  return isOwner || user.premium === true
}

function canAccessNSFW(user) {
  if (!user || !user.age) return false
  return user.age >= 18
}

module.exports = {
  getUser,
  useLimit,
  buyLimit,
  addExp,
  addCredit,
  getExpNeeded,
  isPremiumUser,
  canAccessNSFW
}
