import { Block, DECIMALS, hash, uint256, Pool, formatUnits } from "./deps.ts";
import { STARTING_BLOCK, LAUNCHPAD_ADDRESS, STREAM_URL } from "./constants.ts";

const ConnectionString = Deno.env.get("POSTGRES_CONNECTION_STRING")!;
const pool = new Pool(ConnectionString, 1, true);
const connection = await pool.connect();

try {
  await connection.queryObject`
    DELETE FROM token_transactions WHERE transaction_type = 'buy'
  `;
} finally {
  connection.release();
}

const filter = {
  header: {
    weak: true,
  },
  events: [
    {
      fromAddress: Deno.env.get("LAUNCHPAD_ADDRESS") ?? LAUNCHPAD_ADDRESS.SEPOLIA,
      keys: [hash.getSelectorFromName("BuyToken")],
      includeReceipt: false,
    },
  ],
};

export const config = {
  streamUrl: STREAM_URL ?? "https://sepolia.starknet.a5a.ch",
  startingBlock: STARTING_BLOCK,
  network: "starknet",
  finality: "DATA_STATUS_ACCEPTED",
  filter,
  sinkType: "postgres",
  sinkOptions: {
    connectionString: Deno.env.get("POSTGRES_CONNECTION_STRING"),
    tableName: "token_transactions",
  },
};

export default function DecodeBuyToken({ header, events }: Block) {
  const { blockNumber, blockHash, timestamp: block_timestamp } = header!;

  return (events ?? []).map(({ event, transaction }) => {
    if (!event.data) return;

    const transactionHash = transaction.meta.hash;
    const transfer_id = `${transactionHash}_${event.index}`;

    // const [token_address, caller] = event.keys!;
    const [_, caller, token_address] = event.keys;

    const [
      amount_low,
      amount_high,
      price_low,
      price_high,
      protocol_fee_low,
      protocol_fee_high,
      last_price_low,
      last_price_high,
      timestamp_u64,
      quote_amount_low,
      quote_amount_high,
    ] = event.data;

    const amount_raw = uint256.uint256ToBN({
      low: amount_low,
      high: amount_high,
    });
    const amount = formatUnits(amount_raw, DECIMALS).toString();

    const price_raw = uint256.uint256ToBN({ low: price_low, high: price_high });
    const price = formatUnits(price_raw, DECIMALS);

    const protocol_fee_raw = uint256.uint256ToBN({
      low: protocol_fee_low,
      high: protocol_fee_high,
    });
    const protocol_fee = formatUnits(protocol_fee_raw, DECIMALS).toString();

    const last_price_raw = uint256.uint256ToBN({
      low: last_price_low,
      high: last_price_high,
    });
    const last_price = formatUnits(last_price_raw, DECIMALS).toString();

    const quote_amount_raw = uint256.uint256ToBN({
      low: quote_amount_low,
      high: quote_amount_high,
    });
    const quote_amount = formatUnits(quote_amount_raw, DECIMALS).toString();

    const time_stamp = new Date(
      Number(BigInt(timestamp_u64)) * 1000
    ).toISOString();

    console.log({
      memecoin_address: token_address,
      caller: caller,
    });

    return {
      transfer_id,
      network: "starknet-sepolia",
      block_hash: blockHash,
      block_number: Number(blockNumber),
      block_timestamp: block_timestamp,
      transaction_hash: transactionHash,
      memecoin_address: token_address,
      owner_address: caller,
      last_price,
      quote_amount,
      price,
      amount: Number(amount),
      protocol_fee,
      time_stamp,
      transaction_type: "buy",
      created_at: new Date().toISOString(),
    };
  });
}
