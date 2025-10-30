
FROM node:20-alpine AS dev

WORKDIR /app

COPY package*.json ./

COPY packages ./packages

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


FROM node:20-alpine AS builder


WORKDIR /app


COPY package*.json ./


COPY packages ./packages

COPY tsconfig*.json .


COPY apps/frontend ./apps/frontend


RUN npm install


RUN npm run build --workspace=apps/frontend


FROM nginx:alpine AS production


RUN rm -rf /usr/share/nginx/html/*


COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html


EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]
