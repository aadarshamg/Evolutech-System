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
    const CLIENT_SECRET = Deno.env.get('PHONEPE_CLIENT_SECRET');
    const CLIENT_ID = Deno.env.get('PHONEPE_CLIENT_ID');
    if (!CLIENT_SECRET || !CLIENT_ID) {
      throw new Error('PhonePe credentials not configured');
    }

    const body = await req.json();
    const { response: encodedResponse } = body;

    if (!encodedResponse) {
      throw new Error('Missing response payload');
    }

    // Verify checksum
    const xVerify = req.headers.get('X-VERIFY') || '';
    const checksumString = encodedResponse + CLIENT_SECRET; // The Salt Key is appended directly to the base64 response
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(checksumString));
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // Extract Salt Index from Salt Key (e.g., xxx-x-x-1 -> 1)
    let saltIndex = '1';
    if (CLIENT_SECRET.includes('-') && !isNaN(parseInt(CLIENT_SECRET.split('-').pop()!))) {
      saltIndex = CLIENT_SECRET.split('-').pop()!;
    }
    const computedChecksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') + `###${saltIndex}`;

    if (computedChecksum !== xVerify) {
      console.error('PhonePe checksum verification failed');
      return new Response('Checksum mismatch', { status: 400, headers: corsHeaders });
    }

    // Decode response
    const decodedResponse = JSON.parse(atob(encodedResponse));
    const { merchantTransactionId, code } = decodedResponse.data || decodedResponse;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let paymentStatus = 'failed';
    if (code === 'PAYMENT_SUCCESS') {
      paymentStatus = 'success';
    } else if (code === 'PAYMENT_PENDING') {
      paymentStatus = 'pending';
    } else if (code === 'PAYMENT_CANCELLED') {
      paymentStatus = 'cancelled';
    }

    await supabase.from('payments')
      .update({ status: paymentStatus })
      .eq('transaction_id', merchantTransactionId);

    // Respond with success (PhonePe S2S callback expects 200)
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('PhonePe callback error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
