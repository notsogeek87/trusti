# --- Étape 1 : build du front (Vite) ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Étape 2 : image d'exécution ---
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY api ./api
COPY server ./server
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "server/production.js"]
