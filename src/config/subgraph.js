const axios = require('axios');
const {GIC_CONFIG} = require("./env")
const https = require('https');
const {logger} = require('../config/logger');

const httpsAgent = new https.Agent({  
  rejectUnauthorized: false  // Disable SSL validation
});

const SubgraphFactory = async (query) => {
  const url = GIC_CONFIG.GRAPH_FACTORY;
  const requestData = {
    query: query,
    variables: null,
    extensions: {
      headers: null
    }
  };

  try {
    const response = await axios.post(url, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
      httpsAgent: httpsAgent  // Add the agent here
    });
    return response.data;
  } catch (error) {
    logger.error('Error during API request:', error.response ? error.response.data : error.message);
    return [];
  }
};

async function getSwapForRealtime(pair){
  const input = `
{
      swaps(first: 100 orderBy: timestamp, orderDirection: desc, where: { pair: "${pair.toLowerCase()}"}) {
       id
       transaction {
        block
        id
       }
       timestamp
       sender
       amount0In
       amount0Out
       amount1In
       amount1Out
       amountUSD
       to
       }
}
  `
  return (await SubgraphFactory(input))
}

async function getSwapGraph(pair,skip=0,first=100,timestamp_gte){
    // se isparortoken for true, então é par, se false é token
    const input = `{
    swaps(first: ${first}, skip: ${skip}, orderBy: timestamp, orderDirection: desc, where: { pair: "${(pair).toLowerCase()}"${timestamp_gte?`,timestamp_gte:${timestamp_gte}`:""} }) {
       id
       transaction {
         id
       }
       timestamp
       sender
       amount0In
       amount0Out
       amount1In
       amount1Out
       amountUSD
       to
       }
    }
   `
   return (await SubgraphFactory(input))
}

function getAllPairs(skip=0){
    const input = `{
  pairs(first: 100, skip: ${skip}, orderBy: id, orderDirection: asc) {
    id
    token0 {
      id
      symbol
    }
    token1 {
      id
      symbol
    }
    reserve0
    reserve1
    volumeToken0
    volumeToken1
    totalSupply
  }
}
`
return SubgraphFactory(input)
}

function dexdata(first=1,skip=0){
    const input = `{
      pancakeDayDatas(first:${first}, skip:${skip}, orderBy: date, orderDirection: desc) {
        id
        date
        dailyVolumeBNB
        dailyVolumeUSD
        totalLiquidityUSD
      }
    }`
    return SubgraphFactory(input)
}

function getPairDetails(pair){
    const input = `{
        pair(id: "${(pair).toLowerCase()}") {
          id
          token0 {
            id
            symbol
            name
            derivedUSD
          }
          token1 {
            id
            symbol
            name
            derivedUSD
          }
          reserve0
          reserve1
          totalSupply
          volumeUSD
          volumeToken0
          volumeToken1
          token0Price
          token1Price
        }
    }`
    return SubgraphFactory(input)
}

module.exports = {getSwapGraph,getAllPairs,dexdata,getPairDetails,getSwapForRealtime}