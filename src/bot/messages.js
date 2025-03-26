const { Markup } = require('telegraf');
const {getChartFromLogs,getTokenConfigDetails } = require('../config/tools');
const {oneGetTokenMessage} = require('./functions.messages');
const { GIC_CONFIG,checkStatus } = require('../config/env');
const { createCanvas } = require('canvas');
const { Chart, registerables } = require('chart.js');
require('chartjs-adapter-moment');//Importa o adaptador de datas
Chart.register(...registerables);


function generateChartImage(data, TOKEN) {
  const canvas = createCanvas(1200, 600); // Dimensões mais compactas
  const ctx = canvas.getContext('2d');

  // Processamento dos dados mantido
  const numericData = data
    .map(item => ({...item, timestamp: new Date(item.timestamp)}))
    .sort((a, b) => a.timestamp - b.timestamp);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: numericData.map(d => d.timestamp),
      datasets: [{
        label: "",
        data: numericData.map(d => d.amountUSD),
        borderColor: '#4BC0C0', // Cor similar à imagem
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 0, // Remove pontos
        fill: true
      }]
    },
    options: {
      responsive: false,
      animation: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: 0,
            font: {
              size: 18,
              weight: 'bold'
            }
          }
        },
        title: {
          display: true,
          text: `${TOKEN}/USDT Price Chart`,
          font: {
            size: 22,
            weight: 'bold'
          },
          padding: 20
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day', // Alterado de 'hour' para 'day'
            displayFormats: {
              day: 'dd/MM' // Formato ajustado para dia/mês
            }
          },
          grid: {
            display: true
          },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            font: {
              size: 14
            }
          }
        },
        y: {
          position: 'left',
          ticks: {
            callback: function(value) {
              return '$' + value.toFixed(4); // 4 casas decimais
            },
            stepSize: 0.001,
            font: {
              size: 14
            },
            padding: 10
          },
          grid: {
            color: '#EBEBEB',
            lineWidth: 1
          },
          border: {
            display: false
          }
        }
      },
      elements: {
        line: {
          borderWidth: 2
        }
      },
      layout: {
        padding: {
          top: 40,
          right: 30,
          left: 30,
          bottom: 30
        }
      }
    }
  });

  // Adicionar texto de footer
  ctx.fillStyle = '#666';
  ctx.font = '14px Arial';
  ctx.textAlign = 'right';
  const now = new Date();
  const formattedDate = now.toLocaleString('en-GB', { timeZoneName: 'short' }).replace(',', '');
  ctx.fillText(`Generated on ${formattedDate} by GIC Tools`, canvas.width - 30, canvas.height - 20);

  return canvas.toBuffer('image/png');
}


// 3. Função para enviar via Telegram
async function sendChart(ctx, processedData,config,priceUSDT) {
  try {
    processedData = processedData
    .map(item => ({...item, timestamp: new Date(item.timestamp)}))
    .sort((a, b) => a.timestamp - b.timestamp);
    const imageBuffer = generateChartImage(processedData,config.tokenSymbol);
    const now = new Date(); // Data e hora atual
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h atrás

    // Filtra apenas os dados das últimas 24 horas
    const filteredData = processedData.filter(item => new Date(item.timestamp) >= last24Hours);
    var formattedTotalVolume,changePercentage;
    if (filteredData.length > 0) {
      const firstValue = filteredData[0].amountUSD; // Primeiro valor
      const lastValue = filteredData[filteredData.length - 1].amountUSD; // Último valor
      
      // Calcular a variação percentual
      changePercentage = (((lastValue - firstValue) / firstValue) * 100).toFixed(2);
      
      // Formatar o totalVolume para moeda USD
      const totalVolume = filteredData.reduce((sum, item) => sum + item.volume, 0);
      formattedTotalVolume = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(totalVolume);
    
      // Exibir os resultados
      console.log(`Total Volume das últimas 24 horas: ${formattedTotalVolume}`);
      console.log(`24hr Change: ${changePercentage}%`);
    } else {
      formattedTotalVolume="Not enough data";
      changePercentage="Not enough data"
    }

    //chart volume 
    var formattedTotalVolumeChart,changePercentageChart;
    if (processedData.length > 0) {
      const firstValue = processedData[0].amountUSD; // Primeiro valor
      const lastValue = processedData[processedData.length - 1].amountUSD; // Último valor
      
      // Calcular a variação percentual
      changePercentageChart = (((lastValue - firstValue) / firstValue) * 100).toFixed(2);
      
      // Formatar o totalVolume para moeda USD
      const totalVolume = processedData.reduce((sum, item) => sum + item.volume, 0);
      formattedTotalVolumeChart = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(totalVolume);
    
      // Exibir os resultados
      console.log(`Total Volume das últimas 24 horas: ${formattedTotalVolume}`);
      console.log(`24hr Change: ${changePercentage}%`);
    } else {
      formattedTotalVolume="Not enough data";
      changePercentage="Not enough data"
    }

    const Marketcap = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(config.tokenTotalSupply)*priceUSDT);

    await ctx.replyWithPhoto({ source: imageBuffer });
    await ctx.replyWithMarkdownV2(`📊 (${config.tokenSymbol}/USD) 📈 

📌 *Trade Details:*

Price: $${priceUSDT} USD
24hr Change: ${changePercentage >0 ? "+"+changePercentage : changePercentage}%
24h Volume: ${formattedTotalVolume}
Chart Volume: ${formattedTotalVolumeChart}
Chart Change: ${changePercentageChart >0 ? "+"+changePercentageChart : changePercentageChart}%
Market Cap: ${Marketcap}
Total Supply: ${config.tokenTotalSupply}

#CryptoAnalytic #DeFi #BlockchainData #GIC`.replaceAll(/[#!.;_()*&-¨]/g, '\\$&'))
    
  } catch (error) {
    console.error('Erro:', error);
    ctx.reply('❌ Falha ao gerar gráfico');
  }
}

async function chartdetails(ctx){
  var config = await getTokenConfigDetails(ctx)
  var charts = await getChartFromLogs(ctx,config)
  if(charts == [])
    return await ctx.replyWithMarkdownV2("\\⚠️ No logs found for this pair address\\.");
  console.log(charts)
  const priceUSDT = charts.price;
  await sendChart(ctx, charts.swaps, config,priceUSDT);
}


const Analytics = (tokenAddress, currentPrice, hv24, symbol, lastTX) => {
  const response = `📊 **Token Analytics** 📊

🪙 Token: \`${tokenAddress}\` (${symbol})
💰 Current Price: $${currentPrice}
📈 24h Volume: ${hv24} ${symbol}
`;
  return response;
};

const TradeAlert = (symbol, symbolPrice, txhash,totalA,totalB,priceusdt) => {
  const response = `
🚨 \\*\\*New Trade Alert\\*\\* 🚨

📈 Price Tx: $${priceusdt}
💸 Total ${symbol}: ${totalA}
💸 Total ${symbolPrice}: ${totalB}
TxId: ${txhash.replaceAll("-0","")}
────────────────────
\\#GIC \\#${symbol} \\#TradingAlert
`;
  return response.replaceAll("-","\\-");
};

async function devdetails(ctx) {
  const msg = `Technical  Details\\:
  
  RPC URL: ${GIC_CONFIG.RPC_URL}
  API GSCSCAN URL: ${GIC_CONFIG.API_EXPLORER}
  WSS URL: ${GIC_CONFIG.WSS_URL}
  WS URL: ${GIC_CONFIG.WS_URL}`
  return await ctx.replyWithMarkdownV2((msg.replaceAll(".","\\.")).replaceAll(":","\\:"))
}

async function statusnode(ctx) {
  await ctx.replyWithMarkdownV2("Checking\\.\\.\\. this operation can take up to 5s")
  const nodeMSG = `Status Node Connection GIC\\:
  
  WSS\\: ${await checkStatus.wss()}
  WS\\: ${await checkStatus.ws()}
  RPC\\: ${await checkStatus.rpc()}
  API GSCSCAN\\: ${await checkStatus.api()}
  ` 
  await ctx.replyWithMarkdownV2(nodeMSG)
  if(nodeMSG.includes("❌"))
    return await ctx.replyWithMarkdownV2("NOTICE\\: Services marked with ❌ are currently under maintenance by the GIC dev team\\. We\\'re working to enhance performance and ensure the best blockchain experience for our users\\. Thank you for your patience\\! 🚀")
}




async function startCommand(ctx) {
    const welcomeMessage = `🚀 **GIC Blockchain Trading Bot** 🚀
  
  📊 Real\\-time trading signals for GSwap DEX
  🔔 Get instant swap notifications
  📈 Track token prices and volume
  
  ⚙️ Commands:

  /price \\- Get price of a token
  /startmonitoring \\- Start monitoring swaps from token and token swap configured \\(admin only\\)
  /setconfig \\- Set token, swap token e video for alerts \\(admin only\\)
  /statusnode \\- Check node RPC and API GSCSCAN Connection\\.
  /devdetails \\- Check url for endpoints used in gic bot\\.
  /chart \\- Get the currency trading chart\\.`;
  
  
    const keyboard = Markup.inlineKeyboard([
      Markup.button.url('Official Website', 'https://gswapdex.finance'),
    ]);
  
    await ctx.replyWithMarkdownV2(welcomeMessage, {
      ...keyboard,
      parse_mode: 'MarkdownV2'
    });
}
  

async function priceCommand(ctx) {
  return oneGetTokenMessage(ctx);
}

module.exports = { startCommand, Analytics, TradeAlert,priceCommand,statusnode,devdetails,chartdetails };
