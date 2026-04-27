const express = require("express");
const router  = express.Router();

const {
    createReservation
} = require("../controller/reservation.controller")