# Formbricks Vanity Server - Docker Deployment Guide

## Quick Start

### 1. Build the Docker Image

```bash
docker build -t marcogll/soul23_form_mgr:latest .
```

### 2. Run the Container

```bash
docker run -d \
  -p 3011:3011 \
  -e FORMBRICKS_SDK_URL=https://your-formbricks-instance.com \
  -e FORMBRICKS_API_KEY=your_api_key_here \
  -e ADMIN_API_TOKEN=your_admin_token_here \
  -v $(pwd)/data:/app/data \
  --name formbricks-vanity \
  marcogll/soul23_form_mgr:latest
```

### 3. Using Docker Compose (Recommended)

Create a `docker-compose.yml` file:

```yaml
version: "3.8"

services:
  formbricks-vanity:
    image: marcogll/soul23_form_mgr:latest
    container_name: formbricks-vanity
    ports:
      - "3011:3011"
    environment:
      - PORT=3011
      - FORMBRICKS_SDK_URL=https://your-formbricks-instance.com
      - FORMBRICKS_API_KEY=your_api_key_here
      - ADMIN_API_TOKEN=your_admin_token_here
      - FORMBRICKS_ENV_ID=your_environment_id
      - BASE_DOMAIN=https://your-formbricks-instance.com
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

Then run:

```bash
docker-compose up -d
```

## Environment Variables

| Variable             | Required | Description                                           |
| -------------------- | -------- | ----------------------------------------------------- |
| `PORT`               | No       | Server port (default: 3011)                           |
| `FORMBRICKS_SDK_URL` | Yes      | Your Formbricks instance URL                          |
| `FORMBRICKS_API_KEY` | Yes      | Formbricks API key                                    |
| `ADMIN_API_TOKEN`    | Yes      | Token for admin UI access                             |
| `FORMBRICKS_ENV_ID`  | No       | Environment ID (optional, for backward compatibility) |
| `BASE_DOMAIN`        | No       | Base domain for the application                       |
| `SQLITE_DB_PATH`     | No       | Custom SQLite database path                           |

## Publishing to Docker Hub

### 1. Login to Docker Hub

```bash
docker login
```

### 2. Tag Your Image

```bash
docker tag formbricks-vanity-server:latest marcogll/soul23_form_mgr:latest
docker tag formbricks-vanity-server:latest marcogll/soul23_form_mgr:v1.0.0
```

### 3. Push to Docker Hub

```bash
docker push marcogll/soul23_form_mgr:latest
docker push marcogll/soul23_form_mgr:v1.0.0
```

## Data Persistence

The SQLite database is stored in `/app/data` inside the container. Make sure to mount a volume to persist data:

```bash
-v $(pwd)/data:/app/data
```

## Accessing the Application

- **Surveys**: `http://localhost:3011/{alias}/{survey_name}`
- **Admin UI**: `http://localhost:3011/admin`

## Health Check

Add a health check to your docker-compose.yml:

```yaml
healthcheck:
  test:
    [
      "CMD",
      "wget",
      "--quiet",
      "--tries=1",
      "--spider",
      "http://localhost:3011/admin",
    ]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Troubleshooting

### Container won't start

- Check logs: `docker logs formbricks-vanity`
- Verify environment variables are set correctly
- Ensure the data directory has proper permissions

### Database issues

- The database is created automatically on first run
- If you need to reset, stop the container and delete the `data` directory

### Port conflicts

- Change the host port mapping: `-p 8080:3011` (maps host port 8080 to container port 3011)
