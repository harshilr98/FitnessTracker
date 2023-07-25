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

    console.log(activity);
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
    console.log("GET ALL ACTIVITIES: ", activities)
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
//{ routineId, activityId, count, duration }
async function addActivityToRoutines(routines) {
  const { routineId, activityId, count, duration } = routines;
  try {
    const {rows: [routineActivity]} = client.query(`
    INSERT INTO routine_activities("routineId", "activityId", count, duration)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT ("routineId", "activityId") DO NOTHING;
  `, [routineId, activityId, count, duration]);
  return routineActivity;
  } catch (error) {
    console.error(error);
  }
}

async function updateActivity({ id, ...fields }) {
  const name = fields.name;
  const description = fields.description;

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
  addActivityToRoutines,
  createActivity,
  updateActivity,
};
