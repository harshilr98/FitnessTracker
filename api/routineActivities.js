const express = require("express");
const routineActivitiesRouter = express.Router();
const jwt = require("jsonwebtoken");
const {
  getRoutineActivityById,
  destroyRoutineActivity,
  getRoutineById,
  updateRoutineActivity,
  canEditRoutineActivity
} = require("../db");
const { requireUser } = require("./utils");

// PATCH /api/routine_activities/:routineActivityId

routineActivitiesRouter.patch("/:routineActivityId",requireUser, async (req, res, next) => {
  const user = req.user;
  const id = req.params.routineActivityId;
  console.log("PATCH ROUTINEaCTIVITIES")
    try {
      const update = await canEditRoutineActivity(id, user.id);
      const routineActivity = await getRoutineActivityById(id);
      const routine = await getRoutineById(routineActivity.routineId);

      if (!update) {
        res.send({error: "Error!",
        message: `User ${user.username} is not allowed to update ${routine.name}`,
        name: "Error",
        status: 401})
      } else {
        const routineActivityToUpdate = await updateRoutineActivity({ id, ...req.body });
        if (routineActivityToUpdate) {
          res.send(routineActivityToUpdate);
        }
      }
    } catch (error) {
      next(error);
    }
  }
);


// DELETE /api/routine_activities/:routineActivityId
routineActivitiesRouter.delete("/:routineActivityId",requireUser,async (req, res, next) => {
  const user = req.user;
  const id = req.params.routineActivityId;
    try {
      const canDelete = await canEditRoutineActivity(id, user.id);
      if (!canDelete) {
        const routineActivity = await getRoutineActivityById(id);
          const routine = await getRoutineById(routineActivity.routineId);
          next({
              error: "Error",
              message: `User ${user.username} is not allowed to delete ${routine.name}`,
              name: "Error",
              status: 403
          });
      } else {
        const routineActivityToDelete = await destroyRoutineActivity(id);
        if (routineActivityToDelete) {
            res.send(routineActivityToDelete);
        }
      }
    } catch (error) {
      next(error);
    }
  }
);


module.exports = routineActivitiesRouter;
