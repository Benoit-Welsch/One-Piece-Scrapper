FROM alpine

RUN apk add nodejs npm
RUN mkdir -p /scrapper/output

COPY src /scrapper/src
COPY ./package-lock.json /scrapper/package-lock.json
COPY ./package.json /scrapper/package.json

RUN cd /scrapper/ && npm i

CMD ["node", "/scrapper/src/app_docker.js"]
