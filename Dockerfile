FROM node:20-alpine
RUN npm install -g pnpm@9.5.0
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ENV NODE_ENV=test
CMD ["node", "src/index.js"]
