import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const EASEBUZZ_SALT = Deno.env.get('EASEBUZZ_SALT');
    const EASEBUZZ_KEY = Deno.env.get('EASEBUZZ_KEY');
    if (!EASEBUZZ_SALT || !EASEBUZZ_KEY) {
      throw new Error('Easebuzz credentials not configured');
    }

    let body: Record<string, string>;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text));
    } else {
      body = await req.json();
    }

    const { txnid, status, amount, hash: receivedHash } = body;

    // Verify hash from Easebuzz
    const reverseHashString = `${EASEBUZZ_SALT}|${status}|||||||||||${body.email || ''}|${body.firstname || ''}|${body.productinfo || ''}|${amount}|${txnid}|${EASEBUZZ_KEY}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(reverseHashString);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (computedHash !== receivedHash) {
      console.error('Hash verification failed');
      return new Response('Hash mismatch', { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const paymentStatus = status === 'success' ? 'success' : status === 'failure' ? 'failed' : status === 'userCancelled' ? 'cancelled' : status;

    await supabase.from('payments')
      .update({ status: paymentStatus })
      .eq('transaction_id', txnid);

    // Redirect user to result page
    const baseUrl = Deno.env.get('SITE_URL') || 'https://evolutechsystem.com';
    const redirectUrl = `${baseUrl}/payment-result?status=${paymentStatus}&txnid=${txnid}`;

    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': redirectUrl },
    });
  } catch (error) {
    console.error('Easebuzz callback error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
