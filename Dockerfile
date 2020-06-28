FROM node:12.14

WORKDIR /app
COPY . .

ENV NODE_ENV=production

RUN npm ci
RUN npm run build

EXPOSE 9376

CMD [ "npm", "start" ]