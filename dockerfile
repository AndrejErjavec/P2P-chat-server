ARG NODE_VERSION=16.5.0

# =============== DEVELOPMENT STAGE ===============

FROM node:${NODE_VERSION}-alpine as development

WORKDIR /usr/src/app

COPY package*.json ./
COPY public ./

RUN npm install

COPY . .

RUN npm run build

# =============== PRODUCTION STAGE ===============

# copy build to another container - more clean
FROM node:${NODE_VERSION}-alpine as production

WORKDIR /usr/src/app

ENV NODE_ENV production

COPY package*.json ./

# install all non-dev dependencies
RUN npm install --only-production

COPY --from=development /usr/src/app/build ./build
COPY --from=development /usr/src/app/public ./public

EXPOSE 5757

CMD ["node", "build/server.js"]
