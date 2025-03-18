const { Markup } = require('telegraf');
const {getTokenConfig,getChartFromLogs,getTokenConfigDetails } = require('../config/tools');
const {oneGetTokenMessage,twogetTokenMessage} = require('./functions.messages');
const { GIC_CONFIG,checkStatus } = require('../config/env');
const { createCanvas } = require('canvas');
const { Chart, registerables } = require('chart.js');
Chart.register(...registerables);

function generateChartImage(data,TOKEN) {
  const canvas = createCanvas(1200, 800);
  const ctx = canvas.getContext('2d');



  // Converter para números
  const numericData = data.map(d => ({
    ...d,
    ratio: parseFloat(d.ratio),
    block_number: parseInt(d.block_number)
  }));

  // Ordenar por block_number
  numericData.sort((a, b) => a.block_number - b.block_number);

  console.log(numericData)
  console.log(numericData.map(d => d.block_number))

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: numericData.map(d => d.block_number),
      datasets: [{
        label: `(${TOKEN}/USDT)`,
        data: numericData.map(d => d.ratio),
        borderColor: '#36A2EB',
        tension: 0.1
      }]
    },
    options: {
      scales: {
        x: {
          type: 'linear', // Usar escala numérica
          display: false
        },
        y: {
          beginAtZero: false,
          grace: '5%' // Espaço adicional no eixo Y
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    }
  });

  return canvas.toBuffer('image/png');
}



// 3. Função para enviar via Telegram
async function sendChart(ctx, processedData,TOKEN) {
  try {
    const imageBuffer = generateChartImage(processedData,TOKEN);
    
    await ctx.replyWithPhoto({ source: imageBuffer });
    await ctx.replyWithMarkdownV2(`📊 (${TOKEN}/USD) 📈 

🔹 *Data Displayed in Order of Collection* 
→ First Block: ${processedData[processedData.length-1].block_number}  
→ Last Block: ${processedData[0].block_number} 
→ Total Points: ${processedData.length}

📌 *Current Value (Last Block):* 
$${processedData[processedData.length-1].ratio}

💡 *Details:* 
- Raw data preserves chronological order of record 

#CryptoAnalytic #DeFi #BlockchainData #GIC`.replaceAll(/[#!.;_()*&-¨]/g, '\\$&'))
    
  } catch (error) {
    console.error('Erro:', error);
    ctx.reply('❌ Falha ao gerar gráfico');
  }
}

const Analytics = (tokenAddress, currentPrice, hv24, symbol, lastTX) => {
  const response = `📊 **Token Analytics** 📊

🪙 Token: \`${tokenAddress}\` (${symbol})
💰 Current Price: $${currentPrice}
📈 24h Volume: ${hv24} ${symbol}
`;
  return response;
};

const TradeAlert = (price, symbol, symbolPrice, txhash,totalA,totalB,priceusdt) => {
  const response = `
🚨 \\*\\*New Trade Alert\\*\\* 🚨
────────────────────
🪙 Main Token: ${symbol}
🪙 Price Token: ${symbolPrice}
📈 Price: $${priceusdt}
💸 Total ${symbol}: ${totalA}
💸 Total ${symbolPrice}: ${totalB}
TxId: [${txhash}](${GIC_CONFIG.EXPLORER}/tx/${txhash})
────────────────────
\\#GIC \\#${symbol} \\#TradingAlert
`;
  return response;
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


async function chartdetails(ctx){
  var charts = await getChartFromLogs(ctx)
  const config = await getTokenConfigDetails(ctx)
  if(charts == [])
    return "No trades were identified in the configured token!"
  await sendChart(ctx, charts, config.tokenSymbol);
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
  

async function consultCommand(ctx) {
  try {
    const timeout = 30000; // 30 segundos

    // Criar uma promessa que rejeita após 30s
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout: consulta demorou mais de 30s")), timeout)
    );

    // Criar a lógica da consulta dentro de outra promessa
    const consultPromise = (async () => {
      const args = ctx.message.text.split(" ").slice(1); // Remove o '/consult' comando

      if (args.length === 0) {
        return oneGetTokenMessage(ctx, [await getTokenConfig(ctx)]);
      }
      if (args.length === 2) {
        return twogetTokenMessage(ctx, args);
      }
      if (args.length === 1 && args[0].toLowerCase().includes("help")) {
        const consultMessage = `🔍 **/consult \\- Check token stats**
      
This command allows you to check the data of one or more specific tokens on the GSwap DEX\\. To check the tokens, send the command in the following format:
  
\`/consult ${"tokenId1 tokenId2"}\`
or
\`/consult ${"tokenId1"}\` \\- Value in dollars, must be paired with GIC
  
For example: \`/consult 0x0\\.\\.\\. 0x0\\.\\.\\.\`
  
Please send **tokenId1** and **tokenId2** that you want to check\\.`;

        return await ctx.replyWithMarkdownV2(consultMessage);
      }
      if (args.length === 1) {
        return oneGetTokenMessage(ctx, args);
      }
      const errorMessage = `⚠️ To use the command correctly, send two tokenIds in the format:
  
\`/consult ${"tokenId1 tokenId2"}\`
    
Example: \`/consult 0x0\\.\\.\\. 0x0\\.\\.\\.\``;

      return await ctx.replyWithMarkdownV2(errorMessage);
    })();

    // Executa a consulta e o timeout ao mesmo tempo
    await Promise.race([consultPromise, timeoutPromise]);
  } catch (e) {
    if (e.message.includes("Timeout")) {
      console.log("Timeout: consulta demorou mais de 30s");
    }

    await ctx.replyWithMarkdownV2(
      `Oops\\.\\.\\. We\\’re having trouble fetching the coin price\\. Please try again later\\—we\\’re on it at transaction speed\\! ⚡
Getting Technical details\\.\\.\\.`
    );
    await statusnode(ctx);
  }
}

module.exports = { startCommand, Analytics, TradeAlert,consultCommand,statusnode,devdetails,chartdetails };
