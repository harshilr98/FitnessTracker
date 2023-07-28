const express = require('express');
const router = express.Router();
const {
  getRoutineActivityById,
  destroyRoutineActivity,
  getRoutineById,
  updateRoutineActivity,
} = require("../db");

// PATCH /api/routine_activities/:routineActivityId

// DELETE /api/routine_activities/:routineActivityId

module.exports = router;
