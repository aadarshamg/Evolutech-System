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
    const EASEBUZZ_KEY = Deno.env.get('EASEBUZZ_KEY');
    const EASEBUZZ_SALT = Deno.env.get('EASEBUZZ_SALT');
    if (!EASEBUZZ_KEY || !EASEBUZZ_SALT) {
      throw new Error('Easebuzz credentials not configured');
    }

    const { amount, description, customer_name, customer_email, customer_phone } = await req.json();

    if (!amount || !customer_name || !customer_email || !customer_phone) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Create payment record
    const txnid = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: payment, error: dbError } = await supabase.from('payments').insert({
      amount,
      description: description || 'Payment',
      transaction_id: txnid,
      status: 'initiated',
      customer_name,
      customer_email,
      customer_phone,
    }).select().single();

    if (dbError) throw dbError;

    // Generate Easebuzz hash
    const hashString = `${EASEBUZZ_KEY}|${txnid}|${amount}|${description || 'Payment'}|${customer_name}|${customer_email}|||||||||||${EASEBUZZ_SALT}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(hashString);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Initiate Easebuzz transaction
    const formData = new URLSearchParams();
    formData.append('key', EASEBUZZ_KEY);
    formData.append('txnid', txnid);
    formData.append('amount', amount.toString());
    formData.append('productinfo', description || 'Payment');
    formData.append('firstname', customer_name);
    formData.append('email', customer_email);
    formData.append('phone', customer_phone);
    formData.append('surl', `${Deno.env.get('SUPABASE_URL')}/functions/v1/easebuzz-callback`);
    formData.append('furl', `${Deno.env.get('SUPABASE_URL')}/functions/v1/easebuzz-callback`);
    formData.append('hash', hash);

    const ebResponse = await fetch('https://pay.easebuzz.in/payment/initiateLink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const ebData = await ebResponse.json();

    if (ebData.status === 1 && ebData.data) {
      await supabase.from('payments').update({ easebuzz_id: ebData.data }).eq('id', payment.id);
      
      return new Response(JSON.stringify({ 
        success: true, 
        payment_url: `https://pay.easebuzz.in/pay/${ebData.data}`,
        payment_id: payment.id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id);
      throw new Error(ebData.error || 'Failed to initiate payment');
    }
  } catch (error) {
    console.error('Easebuzz initiate error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
