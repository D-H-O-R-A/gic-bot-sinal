# Escolha a imagem base com Node.js
FROM node:22-slim

# Instalar dependências necessárias para o Puppeteer e o Chrome
RUN apt-get update && apt-get install -y \
  libatk-1.0-0 \
  libatk-bridge-2.0-0 \
  libcups2 \
  libgdk-pixbuf2.0-0 \
  libpango-1.0-0 \
  libx11-xcb1 \
  libnss3 \
  libgbm1 \
  libxcomposite1 \
  libxrandr2 \
  libxss1 \
  libxtst6 \
  fonts-liberation \
  libappindicator3-1 \
  libnspr4 \
  libu2f-udev \
  lsb-release \
  libcairo2 \
  wget \
  ca-certificates \
  --no-install-recommends && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Baixar e instalar o Google Chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    dpkg -i google-chrome-stable_current_amd64.deb && \
    apt-get install -f -y && \
    rm google-chrome-stable_current_amd64.deb

# Definir diretório de trabalho
WORKDIR /app

# Copiar o package.json e package-lock.json (caso exista)
COPY package*.json ./

# Instalar as dependências do Node.js
RUN npm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Expor a porta que a aplicação irá rodar (modifique se necessário)
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]

# Adicionar as configurações para o Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"
