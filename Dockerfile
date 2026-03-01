FROM node:20

WORKDIR /app/backend

COPY package*.json ./

RUN npm install --production

COPY backend/ .

EXPOSE 5000

CMD ["node", "server.js"]