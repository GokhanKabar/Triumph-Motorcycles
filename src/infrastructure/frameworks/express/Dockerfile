FROM node:21-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++

ENV NODE_ENV=development

COPY package*.json ./
RUN npm install

RUN npm install -g ts-node nodemon

EXPOSE 3001

CMD ["nodemon"]