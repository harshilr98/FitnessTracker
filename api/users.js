/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const { createUser, getUserByUsername, getUser } = require("../db/users");

// POST /api/users/register

// POST /api/users/login

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;
