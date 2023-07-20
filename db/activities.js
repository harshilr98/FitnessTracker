const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  try {
    const { rows: [activity] } = await client.query(`
    INSERT INTO TABLE activities (name, description)
    VALUES ($1, $2)
    ON CONFLICT name do nothing
    RETURNING *
    `, [name, description])
    return activity;

  } catch (error) {
    console.error(error);

  }
}

async function getAllActivities() {
  // select and return an array of all activities
  try {
    const { rows: [activities] } = await client.query(`
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
    SELECT * FROM activity
    WHERE name=$1
    `, [name])
    return activity;

  } catch (error) {
    console.error(error);

  }
}

// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  try {
    const { rows: [activity] } = await client.query(`
    UPDATE activities
    SET name=$1, description =$2
    WHERE id=$3
    RETURNING *
    `, [fields.name, fields.description, id])
    return activity;

  } catch (error) {
    console.error(error);

  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
