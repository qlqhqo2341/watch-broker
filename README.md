# watch-broker

파일 추가를 감지하여 외부 ssh서버로 전송 시켜주는 서버입니다.

### 환경변수 적용

- .env파일에 작성해두면 됩니다.

#### 환경 변수

- WATCH_DIR : 파일 watching할 디렉토리
- WATCH_FILE_EXTENSIONS : watching대상 확장자
- TRANSFERRED_FILE_EXTENSIONS : 처리후 해당 파일에 덧붙일 확장자명 (없을경우 해당 동작 실행안함)
- SCP_TARGET_PATH : scp로 파일 전송할 대상 디렉토리
  - os의 scp명령어를 그대로 사용하므로 직접 cli로 작동여부를 확인해야합니다.
  - `~/.ssh/config` 파일에 연결 설정을 넣어 두는 것을 추천합니다.

### 실행 방법 (foreground)

- `npm run dev`

### pm2로 백그라운드로 띄우기

- `npm install -g pm2`
  - pm2를 시스템 전역으로 설치 해야합니다.
- `./bootstrap.sh`
  - 한번만 실행하세요! 여러개 등록됩니다.
  - 이후 실행은 `./restart.sh`를 사용하세요.

### pm2를 시스템 서비스에 등록하기

- `pm2 startup`
  - 여기서 나오는 커맨드를 **수동으로** 실행해주어야함.
- `pm2 save`
  - 현재 pm2에서 돌고있는 서비스 상태를 저장합니다.
  - 추후 시스템 리부팅, pm2 데몬이 다시 시작할 때 이 상태를 기준으로 다시 서비스를 실행시킵니다.

## 참조

- [pm2 가이드](https://velog.io/@cckn/2019-11-05-0611-작성됨-17k2kwsgms)
- [pm2 startup](https://jybaek.tistory.com/721)
