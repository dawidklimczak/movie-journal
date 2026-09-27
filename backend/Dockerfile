FROM node:22-slim

# better-sqlite3 bywa budowany ze źródeł, jeśli nie ma gotowego prebuildu dla tej platformy.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

# Katalog na plik SQLite (nieużywany, gdy ustawiono DATABASE_URL).
RUN mkdir -p /app/data
VOLUME /app/data

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "src/server.js"]
