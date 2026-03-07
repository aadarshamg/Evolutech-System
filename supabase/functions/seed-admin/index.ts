import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, secret } = await req.json();

    // Simple secret to prevent unauthorized seeding
    if (secret !== 'evolutech-seed-2025') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create user with admin service role (bypasses email confirmation)
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      // If user exists, just ensure role
      if (createError.message.includes('already')) {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existingUser = users?.find(u => u.email === email);
        if (existingUser) {
          await supabase.from('user_roles').upsert({
            user_id: existingUser.id,
            role: 'admin',
          }, { onConflict: 'user_id,role' });
          return new Response(JSON.stringify({ success: true, message: 'Admin role assigned to existing user' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      throw createError;
    }

    // Assign admin role
    await supabase.from('user_roles').insert({
      user_id: user.user.id,
      role: 'admin',
    });

    return new Response(JSON.stringify({ success: true, message: 'Admin user created' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Seed admin error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
