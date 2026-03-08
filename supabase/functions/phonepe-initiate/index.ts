import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // PhonePe V2 credentials (from PhonePe dashboard Developer Settings)
    const CLIENT_ID = Deno.env.get('PHONEPE_CLIENT_ID');
    const CLIENT_SECRET = Deno.env.get('PHONEPE_CLIENT_SECRET');
    const CLIENT_VERSION = Deno.env.get('PHONEPE_CLIENT_VERSION') || '1'; // Default to 1 if not set

    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('PhonePe credentials (PHONEPE_CLIENT_ID or PHONEPE_CLIENT_SECRET) not configured');
    }

    const { amount, description, customer_name, customer_email, customer_phone } = await req.json();

    if (!amount || !customer_name || !customer_email || !customer_phone) {
      return new Response(JSON.stringify({ error: 'Missing required fields: amount, customer_name, customer_email, customer_phone' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const txnid = `PP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record in DB
    const { data: payment, error: dbError } = await supabase.from('payments').insert({
      amount,
      description: description || 'Payment',
      transaction_id: txnid,
      status: 'initiated',
      customer_name,
      customer_email,
      customer_phone,
      gateway: 'phonepe',
    }).select().single();

    if (dbError) throw dbError;

    // ─────────────────────────────────────────────────
    // STEP 1: Get OAuth Token from PhonePe Identity Manager
    // ─────────────────────────────────────────────────
    // Sandbox:    https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token
    // Production: https://api.phonepe.com/apis/identity-manager/v1/oauth/token
    //
    // Set PHONEPE_ENV=sandbox in Supabase secrets to use the test environment.
    const isSandbox = Deno.env.get('PHONEPE_ENV') === 'sandbox';
    const authBaseUrl = isSandbox
      ? 'https://api-preprod.phonepe.com/apis/pg-sandbox'
      : 'https://api.phonepe.com/apis/identity-manager';
    const apiBaseUrl = isSandbox
      ? 'https://api-preprod.phonepe.com/apis/pg-sandbox'
      : 'https://api.phonepe.com/apis/pg';

    console.log('PhonePe V2: Environment:', isSandbox ? 'SANDBOX' : 'PRODUCTION');
    console.log('PhonePe V2: Fetching OAuth token from', `${authBaseUrl}/v1/oauth/token`);

    const tokenResponse = await fetch(`${authBaseUrl}/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_version: CLIENT_VERSION,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    });

    const tokenText = await tokenResponse.text();
    console.log('PhonePe V2: Token response status:', tokenResponse.status, 'body:', tokenText);

    if (!tokenResponse.ok) {
      throw new Error(`PhonePe OAuth token request failed (${tokenResponse.status}): ${tokenText}`);
    }

    const tokenData = JSON.parse(tokenText);
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      throw new Error(`PhonePe OAuth did not return an access_token. Response: ${tokenText}`);
    }

    // ─────────────────────────────────────────────────
    // STEP 2: Create Payment using checkout/v2/pay
    // ─────────────────────────────────────────────────
    const siteUrl = Deno.env.get('SITE_URL') || 'https://evolutechsystem.com';

    const paymentPayload = {
      merchantOrderId: txnid,
      amount: Math.round(amount * 100), // in paise
      expireAfter: 1800, // 30 minutes
      metaInfo: {
        udf1: customer_name,
        udf2: customer_email,
        udf3: customer_phone,
      },
      paymentFlow: {
        type: 'PG_CHECKOUT',
        merchantUrls: {
          redirectUrl: `${siteUrl}/payment-result?status=pending&txnid=${txnid}&gateway=phonepe`,
          /**
           * PhonePe V2 requires the server-to-server webhook callback to be passed here
           * depending on your API contract, or it's configured globally in their dashboard.
           * We pass it here explicitly to ensure PhonePe knows where to send updates.
           */
          callbackUrl: `https://${Deno.env.get('SUPABASE_PROJECT_ID')}.supabase.co/functions/v1/phonepe-callback`,
        },
      },
    };

    console.log('PhonePe V2: Initiating payment at', `${apiBaseUrl}/checkout/v2/pay`);
    console.log('PhonePe V2: Payment payload:', JSON.stringify(paymentPayload));

    const ppResponse = await fetch(`${apiBaseUrl}/checkout/v2/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${accessToken}`,
      },
      body: JSON.stringify(paymentPayload),
    });

    const ppText = await ppResponse.text();
    console.log('PhonePe V2: Payment response status:', ppResponse.status, 'body:', ppText);

    const ppData = JSON.parse(ppText);

    // V2 response: { orderId, state, redirectUrl } — no 'success' boolean
    const redirectUrl = ppData.redirectUrl || ppData.data?.redirectUrl;
    const orderId = ppData.orderId || ppData.data?.orderId;

    if (redirectUrl) {
      // Update payment with phonePe order ID
      await supabase.from('payments').update({
        easebuzz_id: ppData.orderId || ppData.data?.orderId || txnid,
      }).eq('id', payment.id);

      return new Response(JSON.stringify({
        success: true,
        payment_url: redirectUrl,
        payment_id: payment.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id);
      throw new Error(ppData.message || ppData.code || 'Failed to initiate PhonePe payment');
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('PhonePe initiate error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
