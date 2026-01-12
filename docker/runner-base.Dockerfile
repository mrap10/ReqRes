FROM node:20-alpine

WORKDIR /runner

RUN echo '{ \
  "name": "runner-base", \
  "dependencies": { \
    "express": "^5.2.1", \
    "jest": "^30.0.0", \
    "supertest": "^7.2.2", \
    "jsonwebtoken": "^9.0.2", \
    "zod": "^4.3.5" \
  } \
}' > package.json

RUN npm install --no-audit --no-fund && \
    npm cache clean --force

ENV NODE_ENV=production \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    PATH=/runner/node_modules/.bin:$PATH

LABEL maintainer="reqres-runner" \
      version="2.0" \
      description="Pre-built Jest runner environment (JavaScript only)"
