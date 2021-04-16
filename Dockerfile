FROM node:alpine
VOLUME [ "/build" ]
COPY . /build
WORKDIR /build
RUN npm i
CMD [ "node", "build/src/index.js" ]
