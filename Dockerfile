FROM node:8.11.0

RUN mkdir /em
WORKDIR /em

COPY package.json .
COPY .npmrc .

RUN npm install
COPY . /em
RUN npm run pack

VOLUME /dist
CMD cp /em/dist/*.AppImage /dist
