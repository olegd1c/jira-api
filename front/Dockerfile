FROM node:12-alpine

RUN mkdir /home/node/front
RUN mkdir /home/node/shared

#WORKDIR /home/node/shared
COPY ./shared /home/node/shared

WORKDIR /home/node/front
COPY ./front /home/node/front

#RUN npm config set registry http://registry.npmjs.org
RUN npm install

EXPOSE 4200

CMD ["npm", "run", "start-docker"]

#docker build -t jira-api-front .
#docker run -p 3008:3008 --name	jira-api-front
