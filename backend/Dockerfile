# Development image — docker-compose mounts source as a volume over this,
# so this just needs deps installed and Prisma's client generated.
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "dev"]
