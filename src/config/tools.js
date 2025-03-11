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
async function getTokenConfig() {
    // Caminho para o arquivo de configuração
    const configPath = path.join(__dirname, 'config.json');

    // Verificar se o arquivo de configuração existe
    if (!fs.existsSync(configPath)) {
        return GIC_CONFIG.GIC_ADDRESS;
    }

    // Ler o arquivo de configuração
    const data = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(data);

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

    // Validar o endereço ERC20
    if (!isEthereumToken(tokenAddress)) {
        return ctx.reply('Invalid address. Please provide a valid ERC20 address.');
    }

    // Caminho para o arquivo de configuração
    const configPath = path.join(__dirname, 'config.json');

    // Tentar ler o arquivo de configuração ou criar um novo
    let config = {};
    if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(data);
    }

    // Atualizar o arquivo de configuração com o novo endereço ERC20
    config.tokenAddress = tokenAddress;

    // Salvar as configurações no arquivo JSON
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    // Responder ao usuário
    ctx.reply(`Configuração do token foi atualizada com sucesso! Endereço ERC20: ${tokenAddress}`);
}


// Função para o comando 'addimage'
async function addimage(ctx) {
    console.log(ctx)
}

module.exports = {isEthereumToken,getTokenConfig,setConfigCommand,addimage};