import express from "express";
import routes from "./routes.js";
import cors from "cors";

const app = express();

const corsOptions = {
  origin: [
    "https://frontend-production-929f.up.railway.app",
    "http://localhost:5173",
  ],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("", routes);

export default app;
