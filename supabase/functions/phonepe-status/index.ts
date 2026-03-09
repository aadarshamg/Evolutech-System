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
        const { txnid } = await req.json();

        if (!txnid) {
            return new Response(JSON.stringify({ error: 'Missing txnid' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const CLIENT_ID = Deno.env.get('PHONEPE_CLIENT_ID');
        const CLIENT_SECRET = Deno.env.get('PHONEPE_CLIENT_SECRET');
        const CLIENT_VERSION = Deno.env.get('PHONEPE_CLIENT_VERSION') || '1';

        if (!CLIENT_ID || !CLIENT_SECRET) {
            throw new Error('PhonePe credentials not configured');
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const isSandbox = Deno.env.get('PHONEPE_ENV') === 'sandbox';

        // ─────────────────────────────────────────────────
        // STEP 1: Get OAuth Token from PhonePe Identity Manager
        // ─────────────────────────────────────────────────
        const authBaseUrl = isSandbox
            ? 'https://api-preprod.phonepe.com/apis/pg-sandbox'
            : 'https://api.phonepe.com/apis/identity-manager';

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
        if (!tokenResponse.ok) {
            throw new Error(`PhonePe OAuth token request failed (${tokenResponse.status}): ${tokenText}`);
        }

        const tokenData = JSON.parse(tokenText);
        const accessToken = tokenData.access_token;
        if (!accessToken) {
            throw new Error(`PhonePe OAuth did not return an access_token. Response: ${tokenText}`);
        }

        // ─────────────────────────────────────────────────
        // STEP 2: PhonePe V2 Status API
        // GET /checkout/v2/order/{merchantOrderId}/status
        // ─────────────────────────────────────────────────
        const apiBaseUrl = isSandbox
            ? 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2'
            : 'https://api.phonepe.com/apis/pg/checkout/v2';

        console.log(`Checking PhonePe V2 Status for ${txnid}...`);

        // IMPORTANT: In V2 OAuth, the merchantId is NOT required in the URL, just the txnid
        const statusResponse = await fetch(`${apiBaseUrl}/order/${txnid}/status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `O-Bearer ${accessToken}`, // V2 uses O-Bearer, not X-Verify
            },
        });

        const statusText = await statusResponse.text();
        console.log('PhonePe Status API raw response:', statusText);

        if (!statusResponse.ok) {
            console.error("PhonePe API Error:", statusResponse.status, statusText);
            throw new Error(`Failed to check PhonePe status: ${statusText}`);
        }

        const statusObj = JSON.parse(statusText);
        const state = statusObj.state || statusObj.data?.state;

        let paymentStatus = 'pending';
        if (state === 'COMPLETED') {
            paymentStatus = 'success';
        } else if (state === 'FAILED' || state === 'ABORTED' || state === 'TIMED_OUT') {
            paymentStatus = 'failed';
        }

        // Update DB
        await supabase.from('payments')
            .update({ status: paymentStatus })
            .eq('transaction_id', txnid);

        return new Response(JSON.stringify({ success: true, status: paymentStatus, data: statusObj }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('PhonePe Check Status error:', msg);
        return new Response(JSON.stringify({ error: msg }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
