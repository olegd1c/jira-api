FROM node:12-alpine


RUN mkdir /home/node/app
RUN mkdir /home/node/shared

WORKDIR /home/node/shared
COPY ./shared /home/node/shared

WORKDIR /home/node/app
COPY ./server /home/node/app

#WORKDIR /home/node/app

#ADD package.json /home/node/app/package.json

RUN npm config set registry http://registry.npmjs.org
RUN npm install

#ADD . /app

EXPOSE 3007

CMD ["npm", "run", "start"]

#docker build -t jira-api-server .
#docker run -p 3007:3007 --name	jira-api-server