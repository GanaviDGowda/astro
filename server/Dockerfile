FROM node:20

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./
RUN npm install --production
COPY . .
RUN npm run build
