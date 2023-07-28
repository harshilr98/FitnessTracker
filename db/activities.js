const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  try {
    const { rows: [activity] } = await client.query(`
      INSERT INTO activities(name, description)
      VALUES($1, $2)
      ON CONFLICT (name) DO NOTHING
      RETURNING *
    `, [name, description]);
    return activity;
  } catch (error) {
    console.error(error);
  }
}

async function getAllActivities() {
  // select and return an array of all activities
  try {
    const { rows: activities } = await client.query(`
    SELECT * FROM activities`)
    return activities;
  } catch (error) {
    console.error(error);
  }
}

async function getActivityById(id) {
  try {
    const { rows: [activity] } = await client.query(`
    SELECT * FROM activities
    WHERE id=$1
    `, [id])
    return activity;

  } catch (error) {
    console.error(error);

  }
}

async function getActivityByName(name) {
  try {
    const { rows: [activity] } = await client.query(`
    SELECT * FROM activities
    WHERE name=$1
    `, [name])
    return activity;
  } catch (error) {
    console.error(error);
  }
}

// used as a helper inside db/routines.js

async function attachActivitiesToRoutine(routines) {
  try{
    const routineIds = routines.map((routine) => routine.id);
    const { rows: routineActivities } = await client.query(
      `
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities
      JOIN routine_activities
      ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" 
      IN (${routineIds})
    `);

    const routinesWithActivities =  routines.map((routine) => {
      routine.activities = routineActivities.filter(
        (routineActivity) => routineActivity.routineId === routine.id);
        return routine;
    });

    return routinesWithActivities;

  } catch (error) {
    console.error(error)
    throw error;
  }
}

async function updateActivity({ id, ...fields }) {
  const {name, description} = fields;

  try {
    if (name !== undefined && description !== undefined) {
      const {rows: [activity]} = await client.query(`
        UPDATE activities
        SET name=$1, description=$2
        WHERE id=$3
        RETURNING *
      `, [name, description, id]);
      return activity;
    } else if (name !== undefined) {
      const {rows: [activity]} = await client.query(`
        UPDATE activities
        SET name=$1
        WHERE id=$2
        RETURNING *
      `, [name, id]);
      return activity;
    } else if (description !== undefined) {
      const {rows: [activity]} = await client.query(`
        UPDATE activities
        SET description=$1
        WHERE id=$2
        RETURNING *
      `, [description, id]);
      return activity;
    }
  } catch (error) {
    console.error(error);
  }
}


module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutine,
  createActivity,
  updateActivity,
};
