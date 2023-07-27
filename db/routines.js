const client = require("./client");
const {attachActivitiesToRoutine} = require("./activities");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows: [routine] } = await client.query(`
      INSERT INTO routines("creatorId", public, name, goal)
      VALUES($1, $2, $3, $4)
      RETURNING *
    ;`, [creatorId, isPublic, name, goal])
    return routine;
  } catch (error) {
    console.error("Error creating routine:", error.message);
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const { rows: [routine]} = await client.query(`
      SELECT * FROM routines
      WHERE id=$1
    ;`, [id])
    return routine;
  } catch (error) {
    console.error(error)
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows: routines } = await client.query(`
      SELECT * FROM routines
    ;`)
    return routines;
  } catch (error) {
    console.error(error)
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT * FROM routines
    ;`)
    const routinesWithActivities = await attachActivitiesToRoutine(routines);
    return routinesWithActivities;
  } catch (error) {
    console.error(error)
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT * FROM routines
      WHERE public=$1
    ;`, [true])
    const routinesWithActivities = await attachActivitiesToRoutine(routines);
    return routinesWithActivities;
  } catch (error) {
    console.error(error)
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(`
    SELECT * FROM routines
    WHERE username=$1 AND public=$2
    ;`, [username, true])
    const routinesWithActivities = await attachActivitiesToRoutines(routines);
    return routinesWithActivities;
  } catch (error) {
    console.error(error)
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(`
    SELECT * FROM routines
    WHERE username=$1 AND public=$2
    ;`, [username, true])
    return routines;
  } catch (error) {
    console.error(error)
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routines } = await client.query(`
    SELECT * FROM routines
    WHERE "id"=$1 AND public=$2
    ;`, [id, true])
    return routines;
  } catch (error) {
    console.error(error)
  }
}

async function updateRoutine({ id, ...fields }) {
  try {
    const { rows: [routine] } = await client.query(`
    UPDATE routines
    SET name=$1, goal=$2
    WHERE id=$3
    RETURNING *
    ;`, [fields.name, fields.goal, id])
    return routine;
  } catch (error) {
    console.error(error)
  }
}

async function destroyRoutine(id) {
  try {
    await client.query(`
    DELETE FROM routine_activities
    WHERE "routineId"=$1;
    `, [id]);

    await client.query(`
    DELETE FROM routines
    WHERE id=$1;
    `, [id]);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
