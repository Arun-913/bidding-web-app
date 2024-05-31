## Quick Setup Locally

#### Setup the backend

Clone the project

```bash
  git clone https://github.com/Arun-913/chat-web-app.git
```

Go to the project directory

```bash
  cd bidding-web-app/backend
```

Install dependencies

```bash
  npm install
```

Copy the .env.example to .env
```bash
  cp .env.example .env
```

Add the required environment variables
Start the server
```bash
  npm run build
  node dist/bin.js
```

#### Test the backend with vitest ans supertest library

Go to the project directory

```bash
  cd bidding-web-app/backend
```
Start the testing

```bash
  ./scripts/run-integration.sh
```

#### Setup the frontend

Go to the project directory

```bash
  cd bidding-web-app/frontend
```

Install dependencies

```bash
  npm install
```

Copy the .env.example to .env
```bash
  cp .env.example .env
```

Add the required environment variables
Start the frontend app
```bash
  npm run dev
```