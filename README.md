# GIC Tools - Bot for telegram

## How do GIC tools work?

The gic tools bot provides the user with the ability to consult the chart, price and obtain real-time purchases of any token configured with /setconfig. 

The real-time price is obtained through graphql. 

The charts are created using the tradingview library with historical swap data obtained by graphql. 

## Realtime

With each new block detected, transactions that have sent a purchase request to the dex address are filtered. As soon as a purchase transaction is detected, we obtain the 2 input tokens by decoding the data and check if they belong to a group that ran the /startmonitoring command with the 2 tokens as input. If they do, we send a message to the groups with their respective configured gifs and swap data.

# How do I set up the bot in my Telegram group?

To set up the bot in a 100% functional way in the Telegram group, you first need to add the bot to the group, make it admin and run the /setconfig command with the input data. Ex: /setconfig (main token) (swap token) (gif url), or, /setconfig 0x829f41402bD438E7c7121fbDa9E29976062D877F 0xB47a97E4c65A38F7759d17C6414292E498A01538 https://files.catbox.moe/anidbu.mp4

*Remember that it needs to be a gif, since we sent the message using sendAnimation and not sendVideo.

After this configuration, the /price and /chart commands will work perfectly!

# How to configure .env?

And .env is the bot's configuration file, which contains confidential and essential data for the bot to function. Configuration example:

``` bash
RPC_URL=https://rpc.gscscan.com
WSS_URL=wss://wss.gscscan.com
CHAIN_ID=3364
FACTORY_ADDRESS=0x19A4293c6E94406F5756FCB2012c677F39e61D59
ROUTER_ADDRESS=0x283aE8d9a55E2995fd06953Cb211Ec39503042eC
EXPLORER=https://gscscan.com
API_EXPLORER=https://gscscan.com/api/v2
API_V1_EXPLORER=https://gscscan.com/api
BOT_TOKEN=713.........................-I
GIC_ADDRESS=0xB47a97E4c65A38F7759d17C6414292E498A01538
USDT_ADDRESS=0x230c655Bb288f3A5d7Cfb43a92E9cEFebAAB46eD
DEFAULT_GIF_URL="https://files.catbox.moe/5h8db7.mp4"
GRAPH_FACTORY="https://graph.gswapdex.finance/subgraphs/name/Factory"
```

## What is each field for?

Below is what each .env field is for

RPC_URL - Add the chain RPC url
WSS_URL - Add the chain WSS url
CHAIN_ID - Add the chain ID
FACTORY_ADDRESS - Add the dex Factory address, we will use it to get data. Remember that it needs to be compatible with the pancakswap-core smart contract
ROUTER_ADDRESS - Add the dex Factory address, we will use it to get data. Remember that it needs to be compatible with the pancakswap-core smart contract
EXPLORER - Add the chain explorer url
API_EXPLORER - Explorer API v2 link. Explorer must be built or compatible with blockscout requests
API_V1_EXPLORER - Explorer API v1 link. Explorer must be built or compatible with blockscout requests
BOT_TOKEN - When creating the bot in botfather, put the bot's API key in this field
GIC_ADDRESS - Wrapped Token chain
USDT_ADDRESS - USDT Token chain
DEFAULT_GIF_URL - Default gif url
GRAPH_FACTORY - GraphQL URL of the pancakeswap fork contract factory

# How to start bot?

After installing the dependencies and configuring the .env, run the command ```npm start``` in the terminal.

# Contact and Support

For more technical details contact Diego H. O. R. Antunes <diegoantunes2301@gmail.com>

Bot Created By [Better2Better.tech](https://better2better.tech) for the GIC Blockchain project.

## License

Este projeto está licenciado sob a Licença Apache 2.0 - veja o arquivo [LICENSE](./LICENSE) para detalhes.
