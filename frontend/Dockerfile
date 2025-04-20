# Устанавливаем dev зависимости и собираем проект
FROM node:latest AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# Устанавливаем prod зависимости и копируем собранный проект, подготавливая к запуску
FROM node:latest
WORKDIR /app
EXPOSE 3000
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/build ./build
CMD ["npm", "run", "start"]