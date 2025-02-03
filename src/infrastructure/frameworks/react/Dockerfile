FROM node:21-alpine

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Créer les répertoires nécessaires
RUN mkdir -p /usr/src/domain /usr/src/application /usr/src/infrastructure /usr/src/interfaces

# Copier les dossiers nécessaires
COPY src/domain /usr/src/domain
COPY src/application /usr/src/application
COPY src/infrastructure /usr/src/infrastructure
COPY src/interfaces /usr/src/interfaces

# Copier le projet React
COPY src/infrastructure/frameworks/react /usr/src/app

# Mettre à jour la configuration pour pointer vers ces dossiers
RUN sed -i 's|@domain/|/usr/src/domain/|g' tsconfig.json
RUN sed -i 's|@application/|/usr/src/application/|g' tsconfig.json
RUN sed -i 's|@infrastructure/|/usr/src/infrastructure/|g' tsconfig.json
RUN sed -i 's|@interfaces/|/usr/src/interfaces/|g' tsconfig.json

# Installer les dépendances
RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev"]