FROM node:fermium-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --silent && npm install pm2 -g

# Only copy the transpiled code to keep the image small. The Host machine 
# will need to npm run build before building this image
COPY dist .

EXPOSE 3000

CMD ["pm2-runtime","./dist/server.js"]

