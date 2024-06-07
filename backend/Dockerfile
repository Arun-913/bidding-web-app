FROM node:20-alpine

WORKDIR /app/backend

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npx prisma generate

EXPOSE 8000

# CMD ["node", "dist/bin.js"]
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/bin.js"]
