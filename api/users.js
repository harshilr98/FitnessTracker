/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const { createUser, getUserByUsername, getUser } = require("../db/users");

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;


// POST /api/users/register
usersRouter.post('/register', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: 'UserExistsError',
        message: 'A user by that username already exists'
      });
    }

    const user = await createUser({
      username,
      password
    });

    const token = jwt.sign({ 
      id: user.id, 
      username
    }, process.env.JWT_SECRET, {
      expiresIn: '1w'
    });

    res.send({ 
      message: "thank you for signing up",
      token 
    });
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
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      const token = jwt.sign({id: `${user.id}`, username: `${username}`, password: `${password}`}, process.env.JWT_SECRET);
      res.send({ message: "you're logged in!", token: token });
    } else {
      next({ 
        name: 'IncorrectCredentialsError', 
        message: 'Username or password is incorrect'
      });
    }
  } catch(error) {
    console.log(error);
    next(error);
  }
});

// GET /api/users/me
usersRouter.get('/me', async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');

  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    try {
      const user = getUser(req.username);
      res.send(user)
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
});

// GET /api/users/:username/routines

module.exports = usersRouter;
