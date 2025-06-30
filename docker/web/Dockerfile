# 1. Image officielle Node
FROM node:18-alpine

# 2. Crée et définit le dossier de travail dans le conteneur
WORKDIR /app

# 3. Copie les fichiers de dépendances (package.json + package-lock.json)
COPY package*.json ./

# 4. Installe les dépendances (incluant tailwind, postcss, autoprefixer)
RUN npm install

# 5. Copie le reste du code source
COPY . .

# 6. Génère les fichiers Tailwind (optionnel : ici on laisse au dev de lancer init)
# RUN npx tailwindcss init -p

# 7. Expose le port 3000 (Next.js par défaut)
EXPOSE 3000

# 8. Lance le serveur de dev Next.js (à remplacer par build + start en prod)
CMD ["npm", "run", "dev"]
