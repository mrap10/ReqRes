FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "test", "--", "--runInBand"]

# todo: will touch down here after some progress to /apps