FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json ./tsconfig.json
COPY ./src ./src
COPY meals.sql reset.sql ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/meals.sql ./meals.sql
COPY --from=builder /app/reset.sql ./reset.sql
EXPOSE 4100
CMD ["node", "dist/server.js"]

