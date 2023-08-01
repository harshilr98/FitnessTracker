const client = require("./client");
const {attachActivitiesToRoutine} = require('./activities.js')
const {getUserByUsername} = require('./users.js')

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows: [routine] } = await client.query(`
      INSERT INTO routines("creatorId", public, name, goal)
      VALUES($1, $2, $3, $4)
      ON CONFLICT (name) DO NOTHING
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
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users
      ON users.id = routines."creatorId"
    `);

    const routinesWithActivities = attachActivitiesToRoutine(routines);
    return routinesWithActivities;
  } catch (error) {
    console.error(error);
  }
}

async function getAllPublicRoutines() {
  try {
    const routines = await getAllRoutines();
    const publicRoutines = routines.filter((routine)=> routine.public === true);
    return publicRoutines;
  } catch (error) {
    console.error(error)
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  const user = await getUserByUsername(username);
  const creatorId = user.id;
  try {
    const routines = await getAllRoutines();
    const routinesByUser = routines.filter((routine) => routine.creatorId === creatorId);
    return routinesByUser;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try{
    const userRoutines = await getAllRoutinesByUser({username});
    const publicRoutines = userRoutines.filter((routine)=> routine.public === true)
    return publicRoutines;
  } catch (error) {
    console.error(error)
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const routines = await getAllPublicRoutines();
    const routineByActivity = routines.filter((routine) => {
      return routine.activities.some(
        (activity) => activity.id === id
      );
    });
    return routineByActivity;
  } catch (error) {
    console.log(error);
  }
}

async function updateRoutine({ id, ...fields }) {
  const placeholders = Object.keys(fields).map((key, index) => `"${key}"=$${index + 1}`).join(", ");

  if (placeholders.length === 0) {
    return;
  }
  try {
    const {rows: [routine]} = await client.query(`
    UPDATE routines
    SET ${placeholders}
    WHERE id=${id}
    RETURNING *;
  `,Object.values(fields));
  console.log("We named the column 'public' not isPublic which I think is causing this error")
    return routine;
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
