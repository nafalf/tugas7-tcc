import express from "express";
import {
  createUser,
  deleteUser,
  getUser,
  updateUser,
} from "../controller/UserController.js";

const router = express.Router();

router.get("/users", getUser);
router.post("/add-user", createUser);
router.put("/edit-user/:id", updateUser);
router.delete("/delete-user/:id", deleteUser);

export default router;