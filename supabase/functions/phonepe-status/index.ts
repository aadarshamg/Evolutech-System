import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

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

        if (!CLIENT_ID || !CLIENT_SECRET) {
            throw new Error('PhonePe credentials not configured');
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // Get payment ID mapping because V2 status API often needs the "merchantId" 
        const isSandbox = Deno.env.get('PHONEPE_ENV') === 'sandbox';

        // ─────────────────────────────────────────────────
        // PhonePe V2 Status API
        // GET /apis/pg-sandbox/pg/v1/status/{merchantId}/{merchantTransactionId}
        // ─────────────────────────────────────────────────
        const apiBaseUrl = isSandbox
            ? 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status'
            : 'https://api.phonepe.com/apis/pg/v1/status';

        const merchantId = CLIENT_ID; // In PhonePe V2, ClientId is often used as MerchantId for status API

        // X-VERIFY checksum for status is: SHA256("/pg/v1/status/" + merchantId + "/" + transactionId + saltKey) + "###" + saltIndex
        const endpoint = `/pg/v1/status/${merchantId}/${txnid}`;

        // Extract Salt Index from Salt Key (e.g., xxx-x-x-1 -> 1)
        let saltIndex = '1';
        if (CLIENT_SECRET.includes('-') && !isNaN(parseInt(CLIENT_SECRET.split('-').pop()!))) {
            saltIndex = CLIENT_SECRET.split('-').pop()!;
        }

        const checksumString = endpoint + CLIENT_SECRET;
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(checksumString));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') + `###${saltIndex}`;

        console.log(`Checking PhonePe Status for ${txnid}...`);

        const tokenResponse = await fetch(`${apiBaseUrl}/${merchantId}/${txnid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': merchantId,
            },
        });

        const tokenText = await tokenResponse.text();
        console.log('PhonePe Status API raw response:', tokenText);

        if (!tokenResponse.ok) {
            console.error("PhonePe API Error:", tokenResponse.status, tokenText);
            throw new Error(`Failed to check PhonePe status: ${tokenText}`);
        }

        const tokenData = JSON.parse(tokenText);
        const code = tokenData.code || tokenData.data?.code;

        let paymentStatus = 'pending';
        if (code === 'PAYMENT_SUCCESS') {
            paymentStatus = 'success';
        } else if (code === 'PAYMENT_ERROR' || code === 'PAYMENT_DECLINED' || code === 'TIMED_OUT') {
            paymentStatus = 'failed';
        } else if (code === 'PAYMENT_CANCELLED') {
            paymentStatus = 'cancelled';
        }

        // Update DB
        await supabase.from('payments')
            .update({ status: paymentStatus })
            .eq('transaction_id', txnid);

        return new Response(JSON.stringify({ success: true, status: paymentStatus, data: tokenData }), {
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
