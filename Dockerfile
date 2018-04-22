FROM node:9.11-alpine

WORKDIR "/app"
CMD [ "node", "/app/index.js" ]

COPY package.json /app
RUN yarn
COPY . /app