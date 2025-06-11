import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Mengambil semua data user (hanya username dan id).
 */
export async function getUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: ['id_user', 'username']
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error saat mengambil users:", error.message);
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
}

/**
 * Mendaftarkan user baru dengan password yang di-hash.
 */
export async function register(req, res) {
  const { username, password } = req.body;

  // Validasi input
  if (!username || !password) {
    return res.status(400).json({ msg: "Username dan password tidak boleh kosong" });
  }

  try {
    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user baru ke database
    await User.create({
      username: username,
      password: hashedPassword,
    });

    // Kirim respon sukses
    return res.status(201).json({ msg: "Registrasi Berhasil" });
  } catch (error) {
    console.error("Error saat registrasi:", error.message);
    // Kemungkinan besar username sudah ada
    return res.status(409).json({ msg: "Username sudah digunakan" });
  }
}

/**
 * Login user menggunakan username dan password.
 */
export async function login(req, res) {
  try {
    // 1. Cari user berdasarkan username
    const user = await User.findOne({
      where: { username: req.body.username },
    });

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(404).json({ msg: "Username tidak ditemukan" });
    }

    // 2. Bandingkan password yang diinput dengan yang ada di database
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

    // Jika password tidak cocok
    if (!isPasswordValid) {
      return res.status(400).json({ msg: "Password salah" });
    }

    // 3. Jika password cocok, buat token
    const userPayload = {
      id_user: user.id_user,
      username: user.username,
    };

    const accessToken = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '20m', // Token berlaku selama 20 menit
    });

    const refreshToken = jwt.sign(userPayload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '1d', // Token berlaku selama 1 hari
    });

    // 4. Simpan refresh token ke database
    await User.update({ refresh_token: refreshToken }, {
      where: { id_user: user.id_user }
    });

    // 5. Kirim refresh token sebagai http-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
      // Untuk production di GCP (HTTPS), tambahkan secure: true dan sameSite: 'none'
      // secure: true,
      // sameSite: 'none'
    });

    // 6. Kirim access token sebagai JSON
    return res.json({ accessToken });

  } catch (error) {
    console.error("Error saat login:", error.message);
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
}

/**
 * Logout user dengan menghapus refresh token.
 */
export async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204); // No content, tidak perlu diapa-apakan

    const user = await User.findOne({
      where: { refresh_token: refreshToken },
    });

    // Jika user dengan token tsb tidak ada, tidak perlu diapa-apakan
    if (!user) return res.sendStatus(204);

    // Hapus refresh token dari database
    await User.update({ refresh_token: null }, {
      where: { id_user: user.id_user }
    });

    // Hapus cookie dari browser
    res.clearCookie('refreshToken');
    return res.status(200).json({ msg: "Logout berhasil" });
  } catch (error) {
    console.error("Error saat logout:", error.message);
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
}

/*
  CATATAN: Fungsi createUser, updateUser, dan deleteUser di bawah ini
  adalah versi sederhana. Sebaiknya disesuaikan lagi untuk keamanan,
  misalnya updateUser tidak boleh mengubah username, dll.
*/

export async function createUser(req, res) {
  try {
    // Fungsi ini tidak aman untuk registrasi karena tidak hash password
    // Gunakan fungsi register()
    const inputResult = req.body;
    const result = await User.create(inputResult);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error saat create user:", error.message);
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const inputResult = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    await User.update(inputResult, { where: { id_user: id } }); // sesuaikan dengan primary key `id_user`
    return res.status(200).json({ msg: "User Updated" });
  } catch (error) {
    console.error("Error saat update user:", error.message);
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    await User.destroy({ where: { id_user: id } }); // sesuaikan dengan primary key `id_user`
    return res.status(200).json({ msg: "User Deleted" });
  } catch (error) {
    console.error("Error saat delete user:", error.message);
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
}
