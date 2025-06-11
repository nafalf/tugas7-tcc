import express from "express"
import { createNotes, deleteNotes, getNotes, updateNotes } from "../controller/NotesController.js";
import {
  getUsers,
  register,
  login,
  logout,
  updateUser,
  deleteUser,
} from "../controller/userController.js";

import {
  refreshToken,
} from "../controller/RefreshToken.js";

import { verifyToken } from "../middleware/VerifyToken.js";


const router =  express.Router()


router.get("/notes", getNotes);
router.post("/add-notes",verifyToken, createNotes);
router.put("/edit-notes/:id",verifyToken, updateNotes);
router.delete("/delete-notes/:id", verifyToken, deleteNotes);

//endpoint table user
router.get("/users", getUsers);
router.post("/login", login);
router.post("/register", register);
router.put("/profile/update/:username", verifyToken, updateUser);
router.delete("/profile/delete/:username", verifyToken, deleteUser);
router.delete("/logout", logout);

// REFRESH TOKEN
router.get("/profile/:username", refreshToken);

export default router;