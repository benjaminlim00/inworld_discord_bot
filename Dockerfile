FROM node:latest

WORKDIR /usr/src/app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --production=false

COPY . .
RUN yarn build

# Prune dev dependencies, modules ts files, yarn cache after build
RUN yarn install --production && \
    yarn autoclean --init && \
    echo *.ts >> .yarnclean && \
    yarn autoclean --force && \
    yarn cache clean

CMD yarn start