const ethers = require('ethers');

function decodeLog(log, isSwap) {
  const abi = [
    "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)",
    "event Sync(uint112 reserve0, uint112 reserve1)"
  ];
  const iface = new ethers.utils.Interface(abi);

  let eventType = isSwap ? "Swap" : "Sync";
  let eventTopic = iface.getEventTopic(eventType);

  if (log.topics[0] !== eventTopic) {
    throw new Error(`Log does not match ${eventType} event`);
  }

  const filteredTopics = log.topics.filter(topic => topic !== null);

  let decoded;
  if (isSwap) {
    decoded = iface.decodeEventLog("Swap", log.data, filteredTopics);
  } else {
    decoded = iface.decodeEventLog("Sync", log.data, filteredTopics);
  }

  let smartContractHash;
  if (isSwap) {
    smartContractHash = ethers.utils.getAddress(decoded.sender);
  } else {
    smartContractHash = ethers.utils.getAddress(log.address); // Para Sync, usa o endereço do log
  }

  return {
    address: {
      ens_domain_name: null,
      hash: ethers.utils.getAddress(log.address),
      implementations: [],
      is_contract: false,
      is_verified: null,
      metadata: null,
      name: null,
      private_tags: [],
      proxy_type: null,
      public_tags: [],
      watchlist_names: []
    },
    block_hash: log.blockHash || null,
    block_number: parseInt(log.blockNumber, 16),
    data: log.data,
    decoded: {
      method_call: `${eventType}(${isSwap ? "address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to" : "uint112 reserve0, uint112 reserve1"})`,
      method_id: log.topics[0].slice(2, 10),
      parameters: isSwap ? [
        { indexed: true, name: "sender", type: "address", value: ethers.utils.getAddress(decoded.sender) },
        { indexed: false, name: "amount0In", type: "uint256", value: decoded.amount0In.toString() },
        { indexed: false, name: "amount1In", type: "uint256", value: decoded.amount1In.toString() },
        { indexed: false, name: "amount0Out", type: "uint256", value: decoded.amount0Out.toString() },
        { indexed: false, name: "amount1Out", type: "uint256", value: decoded.amount1Out.toString() },
        { indexed: true, name: "to", type: "address", value: ethers.utils.getAddress(decoded.to) }
      ] : [
        { indexed: false, name: "reserve0", type: "uint112", value: decoded.reserve0.toString() },
        { indexed: false, name: "reserve1", type: "uint112", value: decoded.reserve1.toString() }
      ]
    },
    index: parseInt(log.logIndex, 16),
    smart_contract: {
      ens_domain_name: null,
      hash: smartContractHash,
      implementations: [],
      is_contract: true,
      is_scam: false,
      is_verified: false,
      metadata: null,
      name: null,
      private_tags: [],
      proxy_type: "unknown",
      public_tags: [],
      watchlist_names: []
    },
    topics: log.topics,
    transaction_hash: log.transactionHash,
    timestamp: parseInt(log.timeStamp, 16),
    event_type: eventType
  };
}

module.exports = {decodeLog};
