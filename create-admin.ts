import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://usudpkfktkpnrwfsqjmp.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdWRwa2ZrdGtwbnJ3ZnNxam1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTMxNDAsImV4cCI6MjA4ODM2OTE0MH0.K1azwAqR3JKhfEqm2nE0ckr5BvZmtIS7AVlJzs4yuvk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createAdmin() {
    console.log("Signing up admin user...");
    const { data, error } = await supabase.auth.signUp({
        email: 'admin@evolutechsystem.com',
        password: 'EvolutechAdmin!2025'
    });

    if (error) {
        console.error("Error signing up:", error.message);
    } else {
        console.log("Success! User created:", data?.user?.id);

        // Note: To make this user an admin, we would normally need the Service Role Key
        // If sign-up works, we will just login with it and see if the user_roles table 
        // requires a manual INSERT from the Supabase SQL editor.
    }
}

createAdmin();
