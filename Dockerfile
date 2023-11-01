FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist/index.js .
RUN npm install --only=production
CMD ["node", "index.js"]
