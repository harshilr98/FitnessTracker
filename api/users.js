/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const { createUser, getUserByUsername, getUserById } = require("../db/users");
const { getPublicRoutinesByUser, getAllRoutinesByUser } = require('../db/routines.js')

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;


// POST /api/users/register
usersRouter.post('/register', async (req, res, next) => {
  const { username, password } = req.body;
  if (password.length < 8) {
    res.send({
      error: "Short Password",
      message: "Password Too Short!",
      name: "Password error"
    });
    res.status(401);
  }
  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      res.send({
        error: "UserExists",
        message: `User ${username} is already taken.`,
        name: "Username error"
      });
      res.status(401);
    } else {
        const user = await createUser({username,password});
    
        const token = jwt.sign({id: user.id, username}, 
          JWT_SECRET,{
          expiresIn: '1w'
        });
    
        res.send({ 
          message: "thank you for signing up",
          token: token,
          user
        });
    }
  } catch ({ name, message }) {
    next({ name, message })
  }
});

// POST /api/users/login
usersRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password"
    });
    res.status(401);
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      const token = jwt.sign({id: user.id, username: username, password: password}, JWT_SECRET);
      res.send({ message: "you're logged in!", token: token, user });
    } else {
      next({
        name: 'IncorrectCredentialsError',
        message: 'Username or password is incorrect'
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// GET /api/users/me
usersRouter.get('/me', async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');
  if (!auth || !auth.startsWith(prefix)) {
    res.send({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${ prefix }`,
      status: 401
    });
    res.status(401);
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        const user = await getUserById(id);
        res.send(user);
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    res.send({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${ prefix }`
    });
    res.status(401);
  }
});

// GET /api/users/:username/routines
usersRouter.get("/:username/routines", async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');
  const token = auth.slice(prefix.length);
  const { id } = jwt.verify(token, JWT_SECRET);
  const { username } = req.params;

  const user = await getUserByUsername(username);

  try {
    if (!user) {
      next({
        name: "User Doesn't Exist",
        message: "User Doesn't Exist",
      });
      res.status(404);
    } else if (user.id === id) {
      const routinesByUser = await getAllRoutinesByUser({ username });
      res.send(routinesByUser);
    } else {
      const publicRoutinesByUser = await getPublicRoutinesByUser({ username });
      res.send(publicRoutinesByUser);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
