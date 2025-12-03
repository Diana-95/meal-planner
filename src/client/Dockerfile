FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./tsconfig.json
COPY tailwind.config.js ./tailwind.config.js
COPY postcss.config.js ./postcss.config.js
COPY public ./public
COPY src ./src
ENV HOST=0.0.0.0
EXPOSE 3000
CMD ["npm", "start"]

