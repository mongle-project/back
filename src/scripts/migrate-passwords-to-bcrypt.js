/**
 * 기존 평문 비밀번호를 bcrypt로 암호화하는 마이그레이션 스크립트
 * 
 * 실행 방법:
 * node src/scripts/migrate-passwords-to-bcrypt.js
 */

import "dotenv/config";
import * as userModel from "../models/user.model.js";
import * as authService from "../services/auth.service.js";

const migratePasswords = async () => {
  try {
    console.log("비밀번호 암호화 마이그레이션 시작...");

    // 모든 사용자 조회
    const users = await userModel.findAllUsers();
    console.log(`총 ${users.length}명의 사용자를 찾았습니다.`);

    if (users.length === 0) {
      console.log("마이그레이션할 사용자가 없습니다.");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // 각 사용자의 비밀번호를 암호화
    for (const user of users) {
      try {
        // 이미 bcrypt 해시인지 확인 (bcrypt 해시는 $2a$, $2b$, $2y$로 시작)
        const isAlreadyHashed = user.password.startsWith("$2a$") || 
                                 user.password.startsWith("$2b$") || 
                                 user.password.startsWith("$2y$");

        if (isAlreadyHashed) {
          console.log(`사용자 ${user.id} (${user.email}): 이미 암호화된 비밀번호입니다. 건너뜁니다.`);
          continue;
        }

        // 평문 비밀번호를 bcrypt로 해시
        const hashedPassword = await authService.hashPassword(user.password);

        // 데이터베이스 업데이트
        await userModel.updateUserPassword(user.id, hashedPassword);

        console.log(`✓ 사용자 ${user.id} (${user.email}): 비밀번호 암호화 완료`);
        successCount++;
      } catch (error) {
        console.error(`✗ 사용자 ${user.id} (${user.email}): 오류 발생`, error.message);
        errorCount++;
      }
    }

    console.log("\n마이그레이션 완료!");
    console.log(`성공: ${successCount}명`);
    console.log(`오류: ${errorCount}명`);
    console.log(`건너뜀: ${users.length - successCount - errorCount}명`);

  } catch (error) {
    console.error("마이그레이션 중 오류 발생:", error);
    process.exit(1);
  }
};

// 스크립트 실행
migratePasswords()
  .then(() => {
    console.log("\n스크립트가 성공적으로 완료되었습니다.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("스크립트 실행 중 오류:", error);
    process.exit(1);
  });

