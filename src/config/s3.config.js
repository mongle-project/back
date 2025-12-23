import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 연결 테스트 로그
console.log(`[S3] AWS S3 Client initialized for region: ${process.env.AWS_REGION}`);

export default s3Client;
