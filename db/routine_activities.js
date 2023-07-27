const client = require("./client");
const {getRoutineById} = require("./routines");


async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const { rows: [routineActivity] } = await client.query(`
      INSERT INTO routine_activities ("routineId", "activityId", duration, count)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `, [routineId, activityId, duration, count]);
      return routineActivity;
  } catch (error) {
    console.error(error);
    throw error; 
  }
}

async function getRoutineActivityById(id) {
  try {
    const { rows: [routineActivity] } = await client.query(`
    SELECT * FROM routine_activities
    WHERE id=$1
    `, [id])
    return routineActivity;

  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: routineActivity } = await client.query(`
    SELECT * FROM routine_activities
    WHERE "routineId"=$1
    `, [id])
    return routineActivity;

  } catch (error) {
    console.error(error);
    throw error
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  const {count, duration} = fields;

  try {
    if (count !== undefined && duration !== undefined) {
      const {rows: [routineActivity]} = await client.query(`
        UPDATE routine_activities
        SET count=$1, duration=$2
        WHERE id=$3
        RETURNING *
      `, [count, duration, id]);
      return routineActivity;
    } else if (count !== undefined) {
      const {rows: [routineActivity]} = await client.query(`
        UPDATE routine_activities
        SET count=$1
        WHERE id=$2
        RETURNING *
      `, [count, id]);
      return routineActivity;
    } else if (duration !== undefined) {
      const {rows: [routineActivity]} = await client.query(`
        UPDATE aroutine_activities
        SET duration=$1
        WHERE id=$2
        RETURNING *
      `, [duration, id]);
      return routineActivity;
    }
  } catch (error) {
    console.error(error);
  }
}

async function destroyRoutineActivity(id) {
  try {
    const { rows: [routineActivity]} = await client.query(`
    DELETE FROM routine_activities
    WHERE id=$1
    RETURNING *
    ;`, [id])
    return routineActivity;
  } catch (error) {
    console.error(error)
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  const routineActivity = await getRoutineActivityById(routineActivityId);
  const routineId = routineActivity.routineId;
  const routine = await getRoutineById(routineId);
  if (routine.creatorId === userId){
    return true
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
