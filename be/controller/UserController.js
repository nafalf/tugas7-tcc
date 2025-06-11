import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { compareArrays, ErrorWithStatusCode } from "../utils/index.js";

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

// Fungsi LOGIN
async function login(req, res) {
  try {
    // Ambil email dan password dari request body,
    // karena kita login pake email & password
    const { email, password } = req.body;

    // Cek apakah email terdaftar di db
    const user = await User.findOne({
      where: { email: email },
    });

    // Kalo email ada (terdaftar)
    if (user) {
      // Konversi data user dari JSON ke dalam bentuk object
      const userPlain = user.toJSON(); // Konversi ke object

      // Disini kita mau mengcopy isi dari variabel userPlain ke variabel baru namanya safeUserData
      // Tapi di sini kita gamau copy semuanya, kita gamau copy password sama refresh_token karena itu sensitif
      const { password: _, refresh_token: __, ...safeUserData } = userPlain;

      // Ngecek apakah password sama kaya yg ada di DB
      const isPasswordValid = await bcrypt.compare(password, user.password);

      // Kalau password benar, artinya berhasil login
      if (isPasswordValid) {
        // Membuat access token dengan masa berlaku 30 detik
        const accessToken = jwt.sign(
          safeUserData, // <- Payload yang akan disimpan di token
          process.env.ACCESS_TOKEN_SECRET, // <- Secret key untuk verifikasi
          { expiresIn: "15m" } // <- Masa berlaku token
        );

        // Membuat refresh token dengan masa berlaku 1 hari
        const refreshToken = jwt.sign(
          safeUserData,
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "1d" }
        );

        // Update refresh token di database untuk user yang login
        await User.update(
          { refresh_token: refreshToken },
          {
            where: { id: user.id },
          }
        );

        // Masukkin refresh token ke cookie
        res.cookie("refreshToken", refreshToken, {
          // httpOnly:
          // - `true`: Cookie tidak bisa diakses via JavaScript (document.cookie)
          // - Mencegah serangan XSS (Cross-Site Scripting)
          // - Untuk development bisa `false` agar bisa diakses via console
          httpOnly: false, // <- Untuk keperluan PRODUCTION wajib true

          // sameSite:
          // - "strict": Cookie, hanya dikirim untuk request SAME SITE (domain yang sama)
          // - "lax": Cookie dikirim untuk navigasi GET antar domain (default)
          // - "none": Cookie dikirim untuk CROSS-SITE requests (butuh secure:true)
          sameSite: "none", // <- Untuk API yang diakses dari domain berbeda

          // maxAge:
          // - Masa aktif cookie dalam milidetik (1 hari = 24x60x60x1000)
          // - Setelah waktu ini, cookie akan otomatis dihapus browser
          maxAge: 24 * 60 * 60 * 1000,

          // secure:
          // - `true`: Cookie hanya dikirim via HTTPS
          // - Mencegah MITM (Man-in-the-Middle) attack
          // - WAJIB `true` jika sameSite: "none"
          secure: true,
        });

        // Kirim respons berhasil (200)
        return res.status(200).json({
          status: "Success",
          message: "Login Berhasil",
          data: safeUserData, // <- Data user tanpa informasi sensitif
          accessToken,
        });
      } else {
        // Kalau password salah, masuk ke catch, kasi message "Password atau email salah" (400)
        throw new ErrorWithStatusCode("Password atau email salah", 400);
      }
    } else {
      // Kalau email salah, masuk ke catch, kasi message "Password atau email salah" (400)
      throw new ErrorWithStatusCode("Password atau email salah", 400);
    }
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
}

// Fungsi LOGOUT
async function logout(req, res) {
  try {
    // ngambil refresh token di cookie
    const refreshToken = req.cookies.refreshToken;

    // Ngecek ada ga refresh tokennya, kalo ga ada kirim status code 401
    if (!refreshToken)
      throw new ErrorWithStatusCode("Refresh token tidak ada", 401);

    // Kalau ada, cari user berdasarkan refresh token tadi
    const user = await User.findOne({
      where: { refresh_token: refreshToken },
    });

    // Kalau user gaada, kirim status code 401
    if (!user.refresh_token)
      throw new ErrorWithStatusCode("User tidak ditemukan", 401);

    // Kalau user ketemu (ada), ambil user id
    const userId = user.id;

    // Hapus refresh token dari DB berdasarkan user id tadi
    await User.update({ refresh_token: null }, { where: { id: userId } });

    // Ngehapus refresh token yg tersimpan di cookie
    res.clearCookie("refreshToken");

    // Kirim respons berhasil (200)
    return res.status(200).json({
      status: "Success",
      message: "Logout Berhasil",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
}


// Tambahkan semua fungsi autentikasi yang belum ada (login, register, logout)
export { 
  getUsers, 
  createUser, 
  login,            // <-- Tambahkan ini
  logout,           // <-- Tambahkan ini
  updateUser, 
  deleteUser 
};
