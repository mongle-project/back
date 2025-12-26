import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRouter from "./routes/index.js";
import pool from "./config/db.config.js";
import { startNewsCronJob, initializeNewsCache } from "./jobs/news.job.js";

const app = express();
const PORT = process.env.PORT || 3001;
const DB = pool;

// CORS 설정: 프론트엔드 주소만 허용 (보안)
app.use(
  cors({
    origin: "http://localhost:5173", // Vite 개발 서버 기본 포트
    credentials: true, // 쿠키/세션 허용 시 true
  })
);

app.use(express.json()); // JSON 데이터 파싱

// 라우팅 설정
// localhost:3001/api/... 로 들어오는 모든 요청은 apiRouter로 보냄
app.use("/api", apiRouter);

// 기본 경로 (Health Check용)
app.get("/", (req, res) => {
  res.send("Mongle Mongle API Server is running... 🐶");
});

// (1) 404 Not Found (위의 경로에 해당 안 되는 경우)
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

// 서버 시작 전 초기 크롤링 및 크론잡 시작
await initializeNewsCache();
startNewsCronJob();

// 서버 실행
app.listen(PORT, () => {
  console.log(`
  #############################################
  🛡️  Server listening on port: ${PORT} 🛡️
  #############################################
  `);
});
