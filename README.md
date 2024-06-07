## Quick Setup Locally

### Installation

Clone the repository:

```bash
  git clone https://github.com/Arun-913/bidding-web-app.git
```

Navigate to the project Directort:

```bash
  cd bidding-web-app
```

Run the following command to start the application

```bash
  docker-compose up
```

#### Without Docker
  - Clone the repository:
  ```bash
    git clone https://github.com/Arun-913/bidding-web-app.git
  ```

  - Create a `.env` file based on the `.env.example` file in both the backend/ and frontend/ directorie

  - Install the dependencies in both the backend/ and frontend/ directories:
  ```bash
    npm install
  ```

  - To start the backend server, navigate to the backend/ directory and run:
  ```bash
    cd backend
    npm run build
    node dist/bin.js
  ```

  - To start the frontend application, navigate to the frontend/ directory and run:
  ```bash
    cd frontend
    npm run dev
  ```