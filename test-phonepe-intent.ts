import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const txnid = `PP_${Date.now()}`;
const CLIENT_ID = process.env.PHONEPE_CLIENT_ID || 'M23CHUIDH3GKY';
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || '5746ce0b-60b6-4ca9-bcba-fbc957134372';
const isSandbox = true;

const authBaseUrl = isSandbox
    ? 'https://api-preprod.phonepe.com/apis/pg-sandbox'
    : 'https://api.phonepe.com/apis/identity-manager';

const apiBaseUrl = isSandbox
    ? 'https://api-preprod.phonepe.com/apis/pg-sandbox'
    : 'https://api.phonepe.com/apis/pg';

async function testPayLoad(paymentFlowType: string, flowConfig: any = {}) {
    // Get Token
    const tokenResponse = await fetch(`${authBaseUrl}/v1/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_version: '1',
            client_secret: CLIENT_SECRET,
            grant_type: 'client_credentials',
        }),
    });
    const tokenText = await tokenResponse.text();
    const accessToken = JSON.parse(tokenText).access_token;

    const paymentPayload = {
        merchantOrderId: txnid,
        amount: 10000,
        expireAfter: 1800,
        metaInfo: { udf1: 'Test', udf2: 'test', udf3: '9999999999' },
        paymentFlow: {
            type: paymentFlowType,
            merchantUrls: {
                redirectUrl: `https://evolutechsystem.com/payment-result`,
                callbackUrl: `https://evolutechsystem.com/callback`,
            },
            ...flowConfig
        },
    };

    const ppResponse = await fetch(`${apiBaseUrl}/checkout/v2/pay`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `O-Bearer ${accessToken}`,
        },
        body: JSON.stringify(paymentPayload),
    });
    console.log(`Testing ${paymentFlowType}`);
    console.log(await ppResponse.text());
}

async function run() {
    await testPayLoad('UPI_INTENT');
    await testPayLoad('PAY_PAGE');
    await testPayLoad('B2B_PG');
}
run();
