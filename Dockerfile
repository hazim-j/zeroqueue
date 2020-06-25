FROM node:12.14 as base

WORKDIR /app
COPY . .

ENV NODE_ENV=development

RUN npm ci \
    && npm cache clean --force

RUN npm run test

RUN npm run build

EXPOSE 9376

CMD [ "npm", "start" ]