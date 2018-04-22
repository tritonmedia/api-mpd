FROM node:9.11-alpine

WORKDIR "/app"
CMD [ "node", "/app/index.js" ]

COPY . /app