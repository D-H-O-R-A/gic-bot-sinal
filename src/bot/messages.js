const { Markup } = require('telegraf');
const {getChartFromLogs,getTokenConfigDetails } = require('../config/tools');
const {oneGetTokenMessage} = require('./functions.messages');
const { GIC_CONFIG,checkStatus } = require('../config/env');
const {checkmonitoring} = require("./realtime")
const { createCanvas } = require('canvas');
const { Chart, registerables } = require('chart.js');
require('chartjs-adapter-moment');//Importa o adaptador de datas
Chart.register(...registerables);
const puppeteer = require('puppeteer');
const {logger} = require('../config/logger');


async function gerarhtml(swapData,tokenSymbol) {
  // Gerar o HTML dinâmico com base nos dados de swap
  const htmlContent = `<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TradingView Gráfico Profissional</title>
    <script src="https://unpkg.com/lightweight-charts@3.6.0/dist/lightweight-charts.standalone.production.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }
        #chart-container {
            width: 100%;
            height: max-content;
            position: relative;
            padding: 20px;
            background-color: #131722;

        }
        #chart {
            width: 100%;
            height: 70%;
        }
        #volume-chart {
            width: 100%;
            height: 30%;
            margin-top: -60px;
        }
        .tv-lightweight-charts{
            width: 100% !important;
        }
        tr td:nth-child(1){
            display: none;
        }
        #chart-container p {
            color: #d1d4dc;
            font-size: 20px;
            text-align: center;
            margin-top: 20px;
            width: 100%;
            background-color: #131722;
            margin: 0px;
            padding: 20px 0px;
        }
    </style>
</head>
<body>
    <div id="chart-container">
        <p>${tokenSymbol}/USD Price Chart</p>
        <div id="chart"></div>
        <div id="volume-chart"></div>
    </div>
    
    <script>
    function formatData(data) {
        return data.map(item => ({
                time: Math.floor(new Date(item.timestamp).getTime() / 1000), // Converter para segundos
                value: item.amountUSD,
                volume: item.volume
        }));
    }
        // Dados formatados
        const swaps = ${JSON.stringify(swapData)};

        // Ordenar os dados por tempo

        // Função para agrupar e processar os dados
        function processSwaps(data) {
            const groupedData = {};

            data.forEach(item => {
                const key = item.timestamp;

                if (!groupedData[key]) {
                    groupedData[key] = {
                        timestamp: item.timestamp,
                        amountUSD: item.amountUSD,
                        volume: item.volume
                    };
                } else {
                    groupedData[key].volume += item.volume; // Somar o volume
                    groupedData[key].amountUSD = Math.max(groupedData[key].amountUSD, item.amountUSD); // Manter o maior amountUSD
                }
            });

            // Converter o objeto agrupado de volta para uma lista
            return Object.values(groupedData);
        }

        // Processar os dados
        const processedSwaps = processSwaps(swaps);

        // Função para converter os dados para o formato esperado pelo LightweightCharts
        function formatData(data) {
            return data.map(item => ({
                time: Math.floor(new Date(item.timestamp).getTime() / 1000), // Converter para segundos
                value: item.amountUSD,
                volume: item.volume
            }));
        }

        // Ordenar os dados por tempo
        processedSwaps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Formatar os dados
        const formattedData = formatData(processedSwaps);

        // Criar o gráfico principal (preço)
        const chart = LightweightCharts.createChart(document.getElementById('chart'), {
            width: window.innerWidth,
            height: 500,
            layout: {
                backgroundColor: '#131722', // Fundo azul escuro
                textColor: '#d1d4dc', // Cor do texto
            },
            grid: {
                vertLines: {
                    color: 'rgba(255, 255, 255, 0.1)', // Linhas verticais suaves
                },
                horzLines: {
                    color: 'rgba(255, 255, 255, 0.1)', // Linhas horizontais suaves
                },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
                vertLine: {
                    color: '#758696', // Cor da linha vertical do crosshair
                    labelBackgroundColor: '#758696',
                },
                horzLine: {
                    color: '#758696', // Cor da linha horizontal do crosshair
                    labelBackgroundColor: '#758696',
                },
            },
            priceScale: {
                scaleMargins: {
                    top: 0.2, // Margem superior
                    bottom: 0.2 // Margem inferior
                },
                borderVisible: false, // Remover a borda do eixo Y
                autoScale: true, // Habilitar escala automática
                visible: true,
                priceFormat: {
                    type: 'price',
                    precision: 12, // Precisão de 6 casas decimais
                    minMove: 0.000000000001
                }
            },
            timeScale: {
                borderColor: '#485c7b', // Cor da borda do eixo de tempo
                timeVisible: true,
                secondsVisible: false,
                tickMarkFormatter: (time) => {
                  const date = new Date(time * 1000); // Converter segundos para milissegundos
                  return `+"`${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} `"+`;
                }
            },
        });

        // Adicionar a série de área para o preço com cores dinâmicas
        const lineSeries = chart.addAreaSeries({
            topColor: 'rgba(38, 166, 154, 0.56)', // Sombreamento verde suave
            bottomColor: 'rgba(38, 166, 154, 0.04)',
            lineColor: '#26a69a', // Cor da linha padrão
            lineWidth: 2,
            priceFormat: {
                type: 'price',
                precision: 6, // Precisão de 6 casas decimais
                minMove: 0.000001,
            },
        });

        // Atualizar as cores dinamicamente com base na variação do preço
        lineSeries.setData(formattedData.map((item, index) => ({
            time: item.time,
            value: item.value,
            color: index > 0 ? (item.value > formattedData[index - 1].value ? '#26a69a' : '#ef5350') : '#b2b5be'
        })));

        // Focar no último valor (zoom no final dos dados)
        chart.timeScale().fitContent();
        chart.timeScale().scrollToRealTime();

        // Criar o gráfico de volume
        const volumeChart = LightweightCharts.createChart(document.getElementById('volume-chart'), {
            width: window.innerWidth,
            height: 300,
            layout: {
                backgroundColor: '#131722', // Fundo azul escuro
                textColor: '#d1d4dc', // Cor do texto
            },
            grid: {
                vertLines: {
                    visible: false, // Ocultar linhas verticais
                },
                horzLines: {
                    color: 'rgba(255, 255, 255, 0.1)', // Linhas horizontais suaves
                },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
                vertLine: {
                    color: '#758696', // Cor da linha vertical do crosshair
                    labelBackgroundColor: '#758696',
                },
                horzLine: {
                    color: '#758696', // Cor da linha horizontal do crosshair
                    labelBackgroundColor: '#758696',
                },
            },
            priceScale: {
                borderVisible: false, // Remover a borda do eixo Y
                visible: true,
                priceFormat: {
                    type: 'volume',
                }
            },
            timeScale: {
                borderColor: '#485c7b', // Cor da borda do eixo de tempo
                timeVisible: true,
                secondsVisible: false,
            },
        });

        // Adicionar a série de barras para o volume com cores dinâmicas
        const volumeSeries = volumeChart.addHistogramSeries({
            color: '#26a69a', // Cor padrão das barras
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '', // Usa a escala padrão
        });

        // Atualizar as cores das barras de volume com base na variação do preço
        volumeSeries.setData(formattedData.map(item => ({
            time: item.time,
            value: item.volume,
            color: item.color,
        })));

        // Focar no último valor (zoom no final dos dados)
        volumeChart.timeScale().fitContent();
        volumeChart.timeScale().scrollToRealTime();

        // Ajustar o tamanho do gráfico conforme a janela
        window.addEventListener('resize', () => {
            chart.resize(window.innerWidth, 500);
            volumeChart.resize(window.innerWidth, 300);
        });
    </script>
</body>
</html>`
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']  // Adicionando as flags para evitar o erro de rodar como root
  });
  const page = await browser.newPage();

  // Definir o conteúdo da página
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Capturar a imagem do chart-container
  const element = await page.$('#chart-container');
  const imageBuffer = await element.screenshot({ omitBackground: true });

  // Fechar o navegador
  await browser.close();

  // Retornar a imagem como buffer
  return Buffer.from(imageBuffer);
}

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
    const imageBuffer = await gerarhtml(processedData,config.tokenSymbol);
    logger.info("imageBuffer:",imageBuffer)
    const now = new Date(); // Data e hora atual
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h atrás

    // Filtra apenas os dados das últimas 24 horas
    const filteredData = processedData.filter(item => new Date(item.timestamp) >= last24Hours);
    let formattedTotalVolume,changePercentage;
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
      logger.info(`Total Volume das últimas 24 horas: ${formattedTotalVolume}`);
      logger.info(`24hr Change: ${changePercentage}%`);
    } else {
      formattedTotalVolume="Not enough data";
      changePercentage="Not enough data"
    }

    //chart volume 
    let formattedTotalVolumeChart,changePercentageChart;
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
      logger.info(`Total Volume das últimas 24 horas: ${formattedTotalVolume}`);
      logger.info(`24hr Change: ${changePercentage}%`);
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

Price: $${priceUSDT} USD
24hr Change: ${changePercentage >0 ? "+"+changePercentage : changePercentage}%
24h Volume: ${formattedTotalVolume}
Chart Volume: ${formattedTotalVolumeChart}
Chart Change: ${changePercentageChart >0 ? "+"+changePercentageChart : changePercentageChart}%
Market Cap: ${Marketcap}
Total Supply: ${new Intl.NumberFormat('en-US').format(parseFloat(config.tokenTotalSupply).toFixed(0))}
`.replaceAll(/[#!.;_():*&-¨]/g, '\\$&'))
    
  } catch (error) {
    logger.error('Erro:', error);
    ctx.reply('❌ Falha ao gerar gráfico');
  }
}

async function chartdetails(ctx){
  const check =await checkmonitoring(ctx,true)
  if(check)
  {
    const config = await getTokenConfigDetails(ctx)
    const charts = await getChartFromLogs(ctx,config)
    logger.info(charts)
    if(charts == [])
      return await ctx.replyWithMarkdownV2("\\⚠️ No logs found for this pair address\\.");
    logger.info(charts)
    const priceUSDT = charts.price;
    await sendChart(ctx, charts.swaps, config,priceUSDT);
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



async function devdetails(ctx) {
  const msg = `Technical  Details:
  
  RPC URL: ${GIC_CONFIG.RPC_URL}
  API GSCSCAN URL: ${GIC_CONFIG.API_EXPLORER}
  WSS URL: ${GIC_CONFIG.WSS_URL}
  
  Bot Created By Better2Better to GIC Community.`
  return await ctx.replyWithMarkdownV2((msg.replaceAll(".","\\.")).replaceAll(":","\\:"))
}

async function statusnode(ctx) {
  await ctx.replyWithMarkdownV2("Checking\\.\\.\\. this operation can take up to 5s")
  const nodeMSG = `Status Node Connection GIC\\:
  
  WSS\\: ${await checkStatus.wss()}
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
  
  ⚙️ Commands\\:

  /price \\- Get price of a token
  /checkmonitoring \\- Check if real\\-time monitoring is configured
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
  const check =await checkmonitoring(ctx,true)
  if(check)
  {
    return oneGetTokenMessage(ctx);
  }
}

module.exports = { startCommand, Analytics,priceCommand,statusnode,devdetails,chartdetails };
