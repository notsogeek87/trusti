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
# npm/yarn ne servent qu'à installer : on les retire de l'image finale (ils
# embarquent leurs propres dépendances, signalées par le scan de sécurité),
# et on applique les correctifs Alpine (zlib...).
RUN npm ci --omit=dev && npm cache clean --force \
 && apk upgrade --no-cache \
 && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx \
           /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg /root/.npm
COPY api ./api
COPY server ./server
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "server/production.js"]
