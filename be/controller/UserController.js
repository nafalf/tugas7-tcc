import User from "../models/UserModel.js";

// GET (Ngambil Data)
async function getUsers(req, res) {
  try {
    const result = await User.findAll();
    return res.status(200).json(result);
  } catch (error) {
    console.log(error.message);
  }
}

// CREATE
async function createUser(req, res) {
  try {
    const inputResult = req.body;
    const result = await User.create(inputResult);
    return res.status(201).json(result);
  } catch (error) {
    console.log(error.message);
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const inputResult = req.body;

    const user = await User.findByPk(id);
    console.log(user);
    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    await User.update(inputResult, {
      where: { id: req.params.id },
    });
    return res.status(201).json({ msg: "User Updated" });
  } catch (error) {
    console.log(error.message);
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    await User.destroy({ where: { id } });
    return res.status(201).json({ msg: "User Deleted" });
  } catch (error) {
    console.log(error.message);
  }
}

// Tambahkan semua fungsi autentikasi yang belum ada (login, register, logout)
export { 
  getUsers, 
  register,         // <-- Tambahkan ini
  login,            // <-- Tambahkan ini
  logout,           // <-- Tambahkan ini
  updateUser, 
  deleteUser 
};
