const {ERC20_ABI, pairABI} = require('./abi');
const {web3rpc,GIC_CONFIG,factoryContract} = require('../config/env');
const BigNumber = require('bignumber.js'); // Certifique-se de instalar o BigNumber

async function checkPairExists(tokenA, tokenB) {
    try {
      const pairAddress = await factoryContract.methods.getPair(tokenA, tokenB).call();
      console.log('Pair address:', pairAddress);
      return pairAddress;
    } catch (error) {
      console.error('Error checking pair:', error);
      return false;
    }
}

async function getUSDTTOkenPrice(token) {
    const pairAddressGIC = await checkPairExists(GIC_CONFIG.USDT_ADDRESS,GIC_CONFIG.GIC_ADDRESS);
    const priceGIC = formatPrice((await getTokenPrice(pairAddressGIC, GIC_CONFIG.USDT_ADDRESS))["price["+GIC_CONFIG.GIC_ADDRESS+"]"]);
    if(token == GIC_CONFIG.GIC_ADDRESS){
        return priceGIC;
    }
    const pairAddress = await checkPairExists(GIC_CONFIG.GIC_ADDRESS, token);
    const priceToken = formatPrice((await getTokenPrice(pairAddress,token ))["price["+GIC_CONFIG.GIC_ADDRESS+"]"]);
    console.log(priceGIC,priceToken)
    const price = priceToken / priceGIC;
    return price
}
  

function formatPrice(value) {
    if (!value) return null;
    return parseFloat(value).toFixed(2); // Formata para 2 casas decimais
}


async function getTokenPrice(pairAddress, token1Address) {
    try {
        // Criando o contrato do par de liquidez
        const pairContract = new web3rpc.eth.Contract(pairABI, pairAddress); // Contract ABI for the pair

        // Obtendo os endereços dos tokens no par
        const token0 = await pairContract.methods.token0().call();
        const token1 = await pairContract.methods.token1().call();

        // Verificando a ordem dos tokens (token0 e token1) e associando as reservas corretamente
        const reserves = await pairContract.methods.getReserves().call();
        let reserveTokenA, reserveTokenB;

        // Se token0 for o token1 que foi passado
        if (token0.toLowerCase() === token1Address.toLowerCase()) {
            reserveTokenA = new BigNumber(reserves[0]);
            reserveTokenB = new BigNumber(reserves[1]);
        } else {
            reserveTokenA = new BigNumber(reserves[1]);
            reserveTokenB = new BigNumber(reserves[0]);
        }

        // Calculando o preço de TokenA em TokenB (TokenA/TokenB)
        const priceTokenAInTokenB = reserveTokenA.dividedBy(reserveTokenB);

        // Calculando o preço de TokenB em TokenA (TokenB/TokenA)
        const priceTokenBInTokenA = reserveTokenB.dividedBy(reserveTokenA);

        // Retornando as reservas e os preços no formato reserve[token]
        return {
            [`reserve[${token0}]`]: reserveTokenA.toFixed(18),
            [`reserve[${token1}]`]: reserveTokenB.toFixed(18),
            [`price[${token0}]`]: priceTokenAInTokenB.toFixed(18),
            [`price[${token1}]`]: priceTokenBInTokenA.toFixed(18)
        };
    } catch (error) {
        console.error('Error getting token price:', error);
        return null;
    }
}

  
  
async function getTokenInfo(tokenAddress) {
  const tokenContract = new web3rpc.eth.Contract(ERC20_ABI, tokenAddress);

  try {
    const name = await tokenContract.methods.name().call();
    const symbol = await tokenContract.methods.symbol().call();
    const totalSupply = await tokenContract.methods.totalSupply().call();

    return {
      name:name,
      symbol:symbol,
      totalSupply: web3rpc.utils.fromWei(totalSupply, 'ether'), // Converte o totalSupply para a unidade padrão do token
      id:tokenAddress
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    return null;
  }
}

module.exports = { checkPairExists, getTokenPrice, getTokenInfo,getUSDTTOkenPrice };