FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY bin ./bin

ENTRYPOINT ["node", "/app/bin/cli.mjs"]
