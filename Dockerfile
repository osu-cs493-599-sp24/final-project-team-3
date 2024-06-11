# Use the official Node.js image.
FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

# Install production dependencies.
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
