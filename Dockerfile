FROM node:12.14 as base

WORKDIR /app
COPY . /app

RUN npm run test

ENV NODE_ENV=production

RUN npm ci \
    && npm cache clean --force

RUN npm run build

EXPOSE 9376

CMD [ "npm", "start" ]