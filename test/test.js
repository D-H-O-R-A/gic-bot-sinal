const {decodeLog,decodeinputswap} = require("../src/config/logs")
const {getSwapGraph,getAllPairs,dexdata,getPairDetails} = require("../src/config/subgraph")
const {checkLog} = require("../src/bot/realtime");
const {isEthereumToken,getTokenConfig,getTokenConfigDetails,getTransactionLogs,getLogsAddress,getChartFromLogs} = require('../src/config/tools');
const {providerwss} = require("../src/config/env")
var Success = []

function TestDecodeLog(){
    console.log("Star Test Decode Log:")
    try{
// Exemplo de uso com logs Swap e Sync
const swapLog = {
    "address": "0xdb17c4949b7c52b3a4346541f0638ab6254efda2",
    "blockNumber": "0x13c966",
    "data": "0x0000000000000000000000000000000000000000000000b1fbd78e24535b3fdc00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000206df3d30ea6e81e437",
    "gasPrice": "0x3b9aca07",
    "gasUsed": "0x2b869",
    "logIndex": "0x4",
    "timeStamp": "0x67db88db",
    "topics": [
      "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
      "0x000000000000000000000000283ae8d9a55e2995fd06953cb211ec39503042ec",
      "0x000000000000000000000000283ae8d9a55e2995fd06953cb211ec39503042ec",
      null
    ],
    "transactionHash": "0x2a6cf02d7d58a9cc25d0b5226f1f050bd3ed89672736fe65e7b3f5a546246967",
    "transactionIndex": "0x0"
  };
  
  const syncLog = {
    "address": "0xdb17c4949b7c52b3a4346541f0638ab6254efda2",
    "blockNumber": "0x13c966",
    "data": "0x00000000000000000000000000000000000000000000fc12dd4e9cbe4906a8f100000000000000000000000000000000000000000002deacb0d41ad1da0254cf",
    "gasPrice": "0x3b9aca07",
    "gasUsed": "0x2b869",
    "logIndex": "0x3",
    "timeStamp": "0x67db88db",
    "topics": [
      "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1",
      null, null, null
    ],
    "transactionHash": "0x2a6cf02d7d58a9cc25d0b5226f1f050bd3ed89672736fe65e7b3f5a546246967",
    "transactionIndex": "0x0"
  };
  
  console.log("Swap Log Decoded:");
  var sde = decodeLog(swapLog, true)
  console.log(sde);
  console.log(sde.decoded.parameters)
  
  console.log("\nSync Log Decoded:");
  var sld = decodeLog(syncLog, false)
  console.log(sld);
  console.log(sld.decoded.parameters)
  console.log("Success in Test Decode Log!");
  Success.push("OK")
    }catch(e){
        console.log(e)
        console.log("Error in Test Decode Log!");
        Success.push("Fail")
    }
}


async function TestgetSwapGraph(){
  try{
    let pair = "0xdB17C4949B7c52B3A4346541F0638ab6254eFdA2"
    let result = await getSwapGraph(pair)
    console.log("Result TestgetSwapGraph:",JSON.stringify(result))
    Success.push("OK")
  }catch(e){
    console.log(e)
    console.log("Error in TestgetSwapGraph!");
    Success.push("Fail")
  }
}

async function TestgetAllPairs(params) {
  try{
    let result = await getAllPairs()
    console.log("Result TestgetAllPairs:",JSON.stringify(result))
    Success.push("OK")
  }catch(e){
    console.log(e)
    console.log("Error in TestgetAllPairs!");
    Success.push("Fail")
  }
}

async function Testdexdata(params) {
  try{
    let result = await dexdata()
    console.log("Result Testdexdata:",JSON.stringify(result))
    Success.push("OK")
  }catch(e){
    console.log(e)
    console.log("Error in Testdexdata!");
    Success.push("Fail")
  }
}

async function TestgetPairDetails(){
  try{
    let pair = "0xdB17C4949B7c52B3A4346541F0638ab6254eFdA2"
    let result = await getPairDetails(pair)
    console.log("Result TestgetPairDetails:",JSON.stringify(result))
    Success.push("OK")
  }catch(e){
    console.log(e)
    console.log("Error in TestgetPairDetails!");
    Success.push("Fail")
  }
}

async function TestgetTokenConfigDetails(){
  try{
    const result = await getTokenConfigDetails()
    console.log("Result TestgetTokenConfigDetails:",JSON.stringify(result));
    Success.push("OK")
  }catch(e){
    console.log(e)
    console.log("Error in TestgetTokenConfigDetails!");
    Success.push("Fail")
  }
}

function TestisEthereumToken() {
  try{
    const result = isEthereumToken("0xB47a97E4c65A38F7759d17C6414292E498A01538")
    console.log("Result TestisEthereumToken:",result);
    if(result){
      return Success.push("OK")
    }
    Success.push("Fail")
  }catch(e){
    console.log(e)
    console.log("Error in TestisEthereumToken!");
    Success.push("Fail")
  }
}

function TestFaillisEthereumToken() {
  try{
    const result = isEthereumToken("0xB47a97E4c65A38F7759d17C6414292E49A01538")
    console.log("Result TestFaillisEthereumToken:",!result);
    if(result){
      return Success.push("Fail")
    }
    Success.push("OK")
  }catch(e){
    console.log(e)
    console.log("Error in TestFaillisEthereumToken!");
    Success.push("Fail")
  }
}

function TestgetTokenConfig(){
  try{
    const result = getTokenConfig()
    console.log("Result TestgetTokenConfig:",result);
    Success.push("OK")
  }catch(e){
    console.log(e)
    console.log("Error in TestgetTokenConfig!");
    Success.push("Fail")
  }
}

async function TestcheckLog(){
  try{
    const tokenInfo = await getTokenConfigDetails();
    const result = await checkLog(null, tokenInfo,"1379056") 
    console.log("Result TestcheckLog:",result);
    Success.push("OK")
  }catch(e){
    console.log(e)
    console.log("Error in TestcheckLog!");
    Success.push("Fail")
  }
}

function TestInputData(){
  try{
    var data = "0x791ac947000000000000000000000000000000000000000000000a98dd3d6e5c8077a1fa000000000000000000000000000000000000000000001d6c5d927a68f5ff132f00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000cc4a75e1a2c7b4c5e3f1259dd7ffb202818db480000000000000000000000000000000000000000000000000000000067e34a310000000000000000000000000000000000000000000000000000000000000002000000000000000000000000829f41402bd438e7c7121fbda9e29976062d877f000000000000000000000000b47a97e4c65a38f7759d17c6414292e498a01538"
    var result = decodeinputswap(data)
    console.log("Result TestInputData:",result);
    Success.push("OK")
  }catch(e){
    console.log(e)
    console.log("Error in TestcheckLog!");
    Success.push("Fail")
  }
}

async function TestGetTxData(){
  try{
    var txHash = "0xe97d1f0741d5b576f0cf56e4fb330892acc69bc77e810439afd3674ce52b4552"
    const result = await providerwss.getTransaction(txHash)
    console.log("Result TestGetTxData:",result);
    Success.push("OK")
  }catch(e){
    console.log(e)
    console.log("Error in TestcheckLog!");
    Success.push("Fail")
  }
}

(async () => {
  TestDecodeLog();  //0
  await TestgetSwapGraph();  //1
  await TestgetAllPairs();
  await Testdexdata();
  await TestgetPairDetails();
  await TestgetTokenConfigDetails();
  TestisEthereumToken();
  TestFaillisEthereumToken();
  TestgetTokenConfig();
  await TestcheckLog();
  TestInputData();
  await TestGetTxData();

console.log(`
  Details Test:
  
  TestDecodeLog: ${Success[0]}
  TestgetSwapGraph: ${Success[1]}
  TestgetAllPairs: ${Success[2]}
  Testdexdata: ${Success[3]}
  TestgetPairDetails: ${Success[4]}
  TestgetTokenConfigDetails: ${Success[5]}
  TestisEthereumToken: ${Success[6]}
  TestFaillisEthereumToken: ${Success[7]}
  TestgetTokenConfig: ${Success[8]}
  TestcheckLog: ${Success[9]}
  TestInputData: ${Success[10]}
  TestGetTxData: ${Success[11]}
  `)
})();