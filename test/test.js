// Testes unitários para as funções de decodificação, subgraph e configuração de tokens
const { decodeLog, decodeinputswap } = require("../src/config/decode");
const { getSwapGraph, getAllPairs, dexdata, getPairDetails } = require("../src/config/subgraph");
const { isEthereumToken, getTokenConfig, getTokenConfigDetails } = require('../src/config/tools');
const { providerwss } = require("../src/config/env");
const { logger } = require('../src/config/logger');

let Success = [];

jest.setTimeout(30000);  // Configura um tempo maior de espera para chamadas assíncronas

describe('Test Suite for Decode, Subgraph, and Token Config', () => {
  beforeAll(() => {
    logger.info("Starting Tests...");
  });

  afterAll(() => {
    logger.info("Tests Completed.");
    logger.info(`Test Results:
    TestDecodeLog: ${Success[0]}
    TestgetSwapGraph: ${Success[1]}
    TestgetAllPairs: ${Success[2]}
    Testdexdata: ${Success[3]}
    TestgetPairDetails: ${Success[4]}
    TestgetTokenConfigDetails: ${Success[5]}
    TestisEthereumToken: ${Success[6]}
    TestFaillisEthereumToken: ${Success[7]}
    TestgetTokenConfig: ${Success[8]}
    TestInputData: ${Success[9]}
    TestGetTxData: ${Success[10]}`);
  });

  test('Test Decode Log', async () => {
    try {
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

      const sde = decodeLog(swapLog, true);
      logger.info("Swap Log Decoded: ", sde);
      const sld = decodeLog(syncLog, false);
      logger.info("Sync Log Decoded: ", sld);

      Success.push("OK");
    } catch (e) {
      logger.error("Error in Test Decode Log:", e);
      Success.push("Fail");
    }
    expect(Success[0]).toBe("OK");
  });

  test('Test getSwapGraph', async () => {
    try {
      const pair = "0xdB17C4949B7c52B3A4346541F0638ab6254eFdA2";
      const result = await getSwapGraph(pair);
      logger.info("Result TestgetSwapGraph:", (result));
      Success.push("OK");
    } catch (e) {
      logger.error("Error in TestgetSwapGraph:", e);
      Success.push("Fail");
    }
    expect(Success[1]).toBe("OK");
  });

  test('Test getAllPairs', async () => {
    try {
      const result = await getAllPairs();
      logger.info("Result TestgetAllPairs:", (result));
      Success.push("OK");
    } catch (e) {
      logger.error("Error in TestgetAllPairs:", e);
      Success.push("Fail");
    }
    expect(Success[2]).toBe("OK");
  });

  test('Test dexdata', async () => {
    try {
      const result = await dexdata();
      logger.info("Result Testdexdata:", (result));
      Success.push("OK");
    } catch (e) {
      logger.error("Error in Testdexdata:", e);
      Success.push("Fail");
    }
    expect(Success[3]).toBe("OK");
  });

  test('Test getPairDetails', async () => {
    try {
      const pair = "0xdB17C4949B7c52B3A4346541F0638ab6254eFdA2";
      const result = await getPairDetails(pair);
      logger.info("Result TestgetPairDetails:", (result));
      Success.push("OK");
    } catch (e) {
      logger.error("Error in TestgetPairDetails:", e);
      Success.push("Fail");
    }
    expect(Success[4]).toBe("OK");
  });

  test('Test getTokenConfigDetails', async () => {
    try {
      const result = await getTokenConfigDetails();
      logger.info("Result TestgetTokenConfigDetails:", (result));
      Success.push("OK");
    } catch (e) {
      logger.error("Error in TestgetTokenConfigDetails:", e);
      Success.push("Fail");
    }
    expect(Success[5]).toBe("OK");
  });

  test('Test isEthereumToken', () => {
    try {
      const result = isEthereumToken("0xB47a97E4c65A38F7759d17C6414292E498A01538");
      logger.info("Result TestisEthereumToken:", result);
      if (result) {
        Success.push("OK");
      } else {
        Success.push("Fail");
      }
    } catch (e) {
      logger.error("Error in TestisEthereumToken:", e);
      Success.push("Fail");
    }
    expect(Success[6]).toBe("OK");
  });

  test('Test Faillis isEthereumToken', () => {
    try {
      const result = isEthereumToken("0xB47a97E4c65A38F7759d17C6414292E49A01538");
      logger.info("Result TestFaillisEthereumToken:", !result);
      if (!result) {
        Success.push("OK");
      } else {
        Success.push("Fail");
      }
    } catch (e) {
      logger.error("Error in TestFaillisEthereumToken:", e);
      Success.push("Fail");
    }
    expect(Success[7]).toBe("OK");
  });

  test('Test getTokenConfig', () => {
    try {
      const result = getTokenConfig();
      logger.info("Result TestgetTokenConfig:", result);
      Success.push("OK");
    } catch (e) {
      logger.error("Error in TestgetTokenConfig:", e);
      Success.push("Fail");
    }
    expect(Success[8]).toBe("OK");
  });
  test('Test Input Data', () => {
    try {
      const data = "0x791ac947000000000000000000000000000000000000000000000a98dd3d6e5c8077a1fa000000000000000000000000000000000000000000001d6c5d927a68f5ff132f00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000cc4a75e1a2c7b4c5e3f1259dd7ffb202818db480000000000000000000000000000000000000000000000000000000067e34a310000000000000000000000000000000000000000000000000000000000000002000000000000000000000000829f41402bd438e7c7121fbda9e29976062d877f000000000000000000000000b47a97e4c65a38f7759d17c6414292e498a01538";
      const result = decodeinputswap(data);
      logger.info("Result TestInputData:", result);
      Success.push("OK");
    } catch (e) {
      logger.error("Error in TestInputData:", e);
      Success.push("Fail");
    }
    expect(Success[9]).toBe("OK");
  });

  test('Test Get Tx Data', async () => {
    try {
      const txHash = "0xe97d1f0741d5b576f0cf56e4fb330892acc69bc77e810439afd3674ce52b4552";
      const result = await providerwss.getTransaction(txHash);
      logger.info("Result TestGetTxData:", result);
      Success.push("OK");
    } catch (e) {
      logger.error("Error in Test Get Tx Data:", e);
      Success.push("Fail");
    }
    expect(Success[10]).toBe("OK");
  });
});
