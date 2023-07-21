const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  try {
    const { rows: [user] } = await client.query(`
      INSERT INTO users(username, password)
      VALUES($1, $2)
      ON CONFLICT (username) DO NOTHING
      RETURNING *
  `, [username, password])
    delete user.password;
    return user;
  } catch (error) {
    console.error(error);
  }
}

async function getUser({ username, password }) {
  try {
    const { rows: [user] } = await client.query(`
    SELECT * FROM users
    WHERE username=$1
    AND password=$2
    `, [username, password])
    delete user.password;
    return user;
  } catch (error) {
    console.error;
  }
}

async function getUserById(userId) {
  const { rows: [user] } = await client.query(`
  SELECT * FROM users
  WHERE id=$1
  `, [userId])
  delete user.password;
  return user;
}

async function getUserByUsername(username) {
  const { rows: [user] } = await client.query(`
  SELECT * FROM users
  WHERE username=$1
  `, [username])
  return user;
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
