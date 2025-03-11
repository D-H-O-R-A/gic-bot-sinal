function isEthereumToken(token) {
    // Define a regular expression to match the Ethereum address pattern (0x followed by 40 hex characters)
    const ethereumAddressPattern = /^0x[a-fA-F0-9]{40}$/;
  
    // Test if the token matches the pattern
    return ethereumAddressPattern.test(token);
}

const {GIC_CONFIG} = require('./env');
const fs = require('fs');
const path = require('path');

// Função para obter o endereço do token armazenado no arquivo de configuração
async function getTokenConfig(ctx) {
    // Caminho para o arquivo de configuração
    const configPath = path.join(__dirname, 'config.json');

    // Verificar se o arquivo de configuração existe
    if (!fs.existsSync(configPath)) {
        return GIC_CONFIG.GIC_ADDRESS;
    }

    // Ler o arquivo de configuração
    const data = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(data)[ctx.chat.id];

    // Verificar se o endereço do token está presente
    if (!config.tokenAddress) {
        return GIC_CONFIG.GIC_ADDRESS;
    }

    // Retornar o endereço do token
    return config.tokenAddress;
}

async function setConfigCommand(ctx) {
    // Verificar se o comando foi chamado em um grupo
    if (!ctx.chat || (ctx.chat.type !== 'supergroup' && ctx.chat.type !== 'group')) {
        console.log(ctx.chat.type)
        return ctx.reply('This command can only be called in a group.');
    }

    // Obter a lista de administradores do grupo
    try {
        const administrators = await ctx.getChatAdministrators();  // Usando a função para obter administradores
        const isAdmin = administrators.some(admin => admin.user.id === ctx.from.id);  // Verificar se o usuário é administrador

        if (!isAdmin) {
            return ctx.reply('Only administrators can use this command.');
        }
    } catch (error) {
        console.error('Error fetching administrators:', error);
        return ctx.reply('There was an error while checking administrators.');
    }

    // Obter o parâmetro (endereço ERC20) do comando
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return ctx.reply('You need to provide a valid ERC20 address.');
    }

    const tokenAddress = args[1];
    const imagem = args[2];
    if(!imagem || !tokenAddress){
        return ctx.reply('You need to provide a valid ERC20 address and a valid image url.');
    }

    // Validar o endereço ERC20
    if (!isEthereumToken(tokenAddress)) {
        return ctx.reply('Invalid address. Please provide a valid ERC20 address.');
    }
    const configPath = path.join(__dirname, 'config.json');

    // Tentar ler o arquivo de configuração ou criar um novo
    let config = {};
    
    if (fs.existsSync(configPath)) {
        try {
            const data = fs.readFileSync(configPath, 'utf8');
            config = JSON.parse(data);
        } catch (error) {
            console.error("Erro ao ler o arquivo JSON:", error);
            config = {}; // Se der erro, recomeça com um objeto vazio
        }
    }
    
    // Verifica se o chat ID já existe no JSON, se não, inicializa
    if (!config[ctx.chat.id]) {
        config[ctx.chat.id] = {};
    }
    
    // Atualizar o arquivo de configuração com o novo endereço ERC20
    config[ctx.chat.id].tokenAddress = tokenAddress;
    config[ctx.chat.id].imagem = imagem;
    
    // Salvar as configurações no arquivo JSON
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log("Configuração salva com sucesso.");
    } catch (error) {
        console.error("Erro ao salvar o arquivo JSON:", error);
    }

    // Responder ao usuário
    ctx.reply(`Configuração do bot para o chat ${ctx.chat.id} foi atualizada com sucesso! Endereço ERC20: ${tokenAddress}, Gif: ${imagem}`);
}


// Função para o comando 'addimage'
async function addimage(ctx) {
    console.log(ctx)
}

module.exports = {isEthereumToken,getTokenConfig,setConfigCommand,addimage};