FROM --platform=$BUILDPLATFORM node:20-alpine as build
WORKDIR /build
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM --platform=$BUILDPLATFORM node:20-alpine as app
WORKDIR /app
COPY --from=build /build/package*.json ./
COPY --from=build /build/dist ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=app /app ./

CMD VERSION=$(npm pkg get version | xargs) node index.js