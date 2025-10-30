
FROM node:20-alpine AS builder


WORKDIR /app


COPY package*.json ./


COPY packages ./packages

COPY tsconfig*.json .


COPY apps/frontend ./apps/frontend


RUN npm install


RUN npm run build -- --emptyOutDir --minify


FROM nginx:alpine AS production


RUN rm -rf /usr/share/nginx/html/*


COPY --from=builder /apps/frontend/dist /usr/share/nginx/html


EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]
