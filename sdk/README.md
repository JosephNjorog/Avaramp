# @avaramp/sdk

Official Node.js / TypeScript client for the AvaRamp API. Source lives here in
the main repo — **not yet published to npm** (see [docs/sdks](https://avaramp.vercel.app/docs/sdks)
for current status). Until it's published, install it directly from the repo:

```bash
npm install github:avaramp/avaramp#path:sdk
```

## Usage

```ts
import { AvaRamp } from "@avaramp/sdk";

const client = new AvaRamp({
  apiKey: process.env.AVARAMP_API_KEY!, // an x-api-key from Dashboard → Settings → API Keys
});

const payment = await client.payments.create({
  amountFiat: "500",
  fiatCurrency: "KES",
  reference: "Order #001",
});

console.log(payment.depositAddress);

client.payments.onSettled(payment.id, (data) => {
  console.log("Settled:", data.status);
});
```

Use a **test** API key (`avr_test_...`) while integrating — test-mode payments
auto-confirm and auto-settle without touching real crypto or fiat. See
[docs/webhooks](https://avaramp.vercel.app/docs/webhooks) for production-grade
event handling instead of polling with `onSettled`.
