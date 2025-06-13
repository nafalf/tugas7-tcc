const baseURL = "https://notes-be207-797713225706.us-central1.run.app";
window.BASE_URL = baseURL;

const axiosJWT = axios.create({
  baseURL: baseURL,
  withCredentials: true
});

// Interceptor untuk refresh token otomatis
axiosJWT.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosJWT.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Jika accessToken expired (401), coba refresh
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(`${baseURL}/refresh`, {}, { withCredentials: true });
        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        // Set ulang Authorization header
        axiosJWT.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return axiosJWT(originalRequest); // Ulangi request asli
      } catch (refreshError) {
        console.error("Refresh token gagal:", refreshError);
        window.location.href = "login.html"; // Redirect ke login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
