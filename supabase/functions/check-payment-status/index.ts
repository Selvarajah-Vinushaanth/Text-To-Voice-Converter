import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'https://esm.sh/stripe@12.4.0?target=deno';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Get the request body
    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Check if the payment was successful
    const isSuccessful = session.payment_status === 'paid';

    if (isSuccessful && session.customer) {
      // If successful, update the user's subscription status in the database
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: session.client_reference_id, // This should be set to user_id when creating checkout
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: 'active',
          price_id: session.metadata?.price_id,
          created_at: new Date().toISOString(),
          current_period_end: session.metadata?.current_period_end,
        });

      if (subscriptionError) {
        console.error('Error updating subscription:', subscriptionError);
        return new Response(
          JSON.stringify({ error: 'Failed to update subscription', success: false }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: isSuccessful,
        payment_status: session.payment_status,
        session_id: session.id,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error checking payment status:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to check payment status',
        success: false,
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}); 