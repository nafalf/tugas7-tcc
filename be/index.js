import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import UserRoute from "./routes/UserRoute.js";
import "dotenv/config";


const app = express();

app.use(cors({
  origin: [
    "http://localhost:8000",

    // "https://fe-notessyifa-dot-fit-crow-450802-e0.uc.r.appspot.com",
    // "https://notes-syifa194-797713225706.us-central1.run.app",
  ],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.use(UserRoute);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

