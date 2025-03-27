# Usar uma imagem base do Node.js
FROM node:22-alpine

# Definir o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copiar o package.json e o package-lock.json para o contêiner
COPY package*.json ./

# Instalar as dependências do Node.js
RUN npm install --f

# Copiar o restante dos arquivos do projeto para o contêiner
COPY . .

# Expor a porta 3000 (ou qualquer outra porta que o seu bot use)
EXPOSE 3000

# Definir a variável de ambiente
ENV NODE_ENV=production

# Rodar o bot ao iniciar o contêiner
CMD ["npm", "start"]
