FROM node:12.14 as base

EXPOSE 9376

ENV NODE_ENV=production

WORKDIR /opt

COPY . .


RUN npm ci \
    && npm cache clean --force

##Stage 2

FROM base as dev

ENV NODE_ENV=development

ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt

RUN npm install --only=development

WORKDIR /opt/app

CMD [ "npm", "start" ]

##STAGE 3 (COPY)

FROM base as source

WORKDIR /opt/app

COPY . .

##STAGE 4 (TESTING)

FROM source as test

ENV NODE_ENV=development
ENV PATH=/opt/node_modules/.bin:$PATH

COPY --from=dev /opt/node_modules /opt/node_modules

RUN eslint . 

RUN npm run lint

FROM source as prod

CMD [ "npm", "start" ]