-- users 테이블의 id 컬럼을 BIGINT에서 VARCHAR(255)로 변경
-- 기존 데이터가 있는 경우 주의해서 실행하세요

-- 방법 1: 테이블이 비어있거나 기존 데이터를 유지할 필요가 없는 경우
-- DROP TABLE IF EXISTS users;
-- CREATE TABLE users (
--     id VARCHAR(255) PRIMARY KEY,
--     email VARCHAR(255) NOT NULL UNIQUE,
--     password VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 방법 2: 기존 데이터를 유지하면서 컬럼 타입 변경 (MySQL 5.7+)
-- 주의: 기존 BIGINT 데이터가 문자열로 변환됩니다
ALTER TABLE users MODIFY COLUMN id VARCHAR(255) NOT NULL;

-- PRIMARY KEY 제약 조건 재설정 (필요한 경우)
-- ALTER TABLE users DROP PRIMARY KEY;
-- ALTER TABLE users ADD PRIMARY KEY (id);

