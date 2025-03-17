const axios = require('axios');
const {GIC_CONFIG} = require('./env');
const fs = require('fs');
const path = require('path');
const { getTokenInfo,checkPairExists } = require('../blockchain/contract');

function isEthereumToken(token) {
    // Define a regular expression to match the Ethereum address pattern (0x followed by 40 hex characters)
    const ethereumAddressPattern = /^0x[a-fA-F0-9]{40}$/;
  
    // Test if the token matches the pattern
    return ethereumAddressPattern.test(token);
}


const fetchLogs = async (endpoint, type, identifier) => {
  try {
    const url = `${GIC_CONFIG.API_EXPLORER}/${endpoint}/${identifier}/logs`;
    const response = await axios.get(url, {
      headers: { accept: "application/json" },
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao buscar os logs de ${type}:`, identifier, error.message);
    throw new Error(`Erro ao buscar os logs de ${type}: ${identifier}`);
  }
};

const getTransactionLogs = (txid) => fetchLogs("transactions", "transação", txid);
const getLogsAddress = (address) => fetchLogs("addresses", "endereço", address);

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


async function getChartFromLogs(ctx, ppaddress) {
    try {
      const token = await getTokenConfig(ctx);
      let processedTxs =  new Set();
      const pairAddress = ppaddress == undefined ? await checkPairExists(GIC_CONFIG.GIC_ADDRESS, token) : ppaddress;
      const logs = await getLogsAddress(pairAddress);
      if (!logs || !logs.items || logs.items.length === 0) {
        throw new Error("⚠️ No logs found for this pair address.");
      }
      const filteredLogs = logs.items.filter((item) => {
        if (
          item.decoded.method_call.includes("Swap")
        ) {
          if (processedTxs.has(item.transaction_hash)) {
            return false; // Ignora transações já processadas
          }
          processedTxs.add(item.transaction_hash);
          return true;
        }
        return false;
      });
      console.log(filteredLogs)
    } catch (e) {
      return { error: e.message, e: e }; // Retorna o erro como um objeto
    }
}

async function getTokenConfigDetails(ctx){
        // Caminho para o arquivo de configuração
        const configPath = path.join(__dirname, 'config.json');

        // Verificar se o arquivo de configuração existe
        if (!fs.existsSync(configPath)) {
            return {tokenAddress:GIC_CONFIG.GIC_ADDRESS, tokenName: "GIC Token", tokenInfo:"GIC", swapToken: "0x230c655Bb288f3A5d7Cfb43a92E9cEFebAAB46eD",pairaddress:"0x37a5915f514411623bB1e52B232fB3cbDF0dA50B",swapTokenSymbol:"gUSDT"};
        }
    
        // Ler o arquivo de configuração
        const data = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(data)[ctx.chat.id];
    
        // Verificar se o endereço do token está presente
        if (!config.tokenAddress) {
            return  {...config,tokenAddress:GIC_CONFIG.GIC_ADDRESS, tokenName: "GIC Token", tokenInfo:"GIC", swapToken: "0x230c655Bb288f3A5d7Cfb43a92E9cEFebAAB46eD",pairaddress:"0x37a5915f514411623bB1e52B232fB3cbDF0dA50B", swapTokenSymbol:"gUSDT"};
        }
    
        // Retornar o endereço do token
        return config;
}

async function setConfigCommand(ctx) {
    // Verificar se o comando foi chamado em um grupo
    if (!ctx.chat || (ctx.chat.type !== 'supergroup' && ctx.chat.type !== 'group')) {
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
    const swaptoken = args[2]
    const imagem = args[3];
    if(!imagem || !tokenAddress || !swaptoken){
        return ctx.reply('You need to provide a valid ERC20 address for main token & swap token, and a valid image url.');
    }

    // Validar o endereço ERC20
    if (!isEthereumToken(tokenAddress) || !isEthereumToken(swaptoken)) {
        return ctx.reply('Invalid address. Please provide a valid ERC20 address.');
    }
    var info = await getTokenInfo(tokenAddress);
    var infoswaptoken = await getTokenInfo(swaptoken);
    const pair = await checkPairExists(tokenAddress,swaptoken)
    if(!pair){
        return ctx.reply(`You need add liquidity in pair ${tokenAddress}/${swaptoken} to continue.`);
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
    config[ctx.chat.id].tokenName = info.name;
    config[ctx.chat.id].tokenSymbol = info.symbol;
    config[ctx.chat.id].tokenTotalSupply = info.totalSupply;
    config[ctx.chat.id].swapToken = swaptoken;
    config[ctx.chat.id].swapTokenSymbol = infoswaptoken.symbol;
    config[ctx.chat.id].pairaddress = pair;
    
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


function isBuyTx(json){
    console.log("isBuyTx:",json)
    if(
        ((json?.decoded?.method_call).toLowerCase()).includes("swap")&&
        json?.decoded?.parameters?.[1]?.value === "0" &&
        json?.decoded?.parameters?.[2]?.value !== "0" &&
        json?.decoded?.parameters?.[3]?.value !== "0" &&
        json?.decoded?.parameters?.[4]?.value === "0"
    ){
      return {amount1In:json?.decoded?.parameters?.[2]?.value,amount0Out:json?.decoded?.parameters?.[3]?.value}
    }else{
        return null;
    }
}



module.exports = {isEthereumToken,getTokenConfig,setConfigCommand,isBuyTx,getTokenConfigDetails,getTransactionLogs,getLogsAddress,getChartFromLogs};