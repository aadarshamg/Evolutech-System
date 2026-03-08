import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const PaymentResult = () => {
  const [params] = useSearchParams();
  const rawStatus = params.get("status");
  const txnid = params.get("txnid");

  const [status, setStatus] = useState<string | null>(rawStatus);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!txnid) return;

    let pollInterval: number;
    let pollCount = 0;
    const maxPolls = 15; // Poll for ~30 seconds

    const checkStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('status')
          .eq('transaction_id', txnid)
          .single();

        if (error) {
          console.error('Error fetching payment status:', error);
          return;
        }

        if (data && data.status) {
          if (data.status === 'success' || data.status === 'failed' || data.status === 'cancelled') {
            setStatus(data.status);
            clearInterval(pollInterval);
            setLoading(false);
          } else if (pollCount === 0) {
            // Give it some time to update from the webhook
            setLoading(true);
          }
        }
      } catch (err) {
        console.error('Failed to check status', err);
      }
    };

    // First check immediately
    checkStatus();

    // The payment status might still be pending or initiated if the user
    // returns from the gateway faster than the webhook fires.
    pollInterval = window.setInterval(() => {
      pollCount++;
      checkStatus();
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
        setLoading(false);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [txnid]);

  const isSuccess = status === "success";
  const isFailed = status === "failed";
  const isPendingOrLoading = loading || status === "pending" || status === "initiated";

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center py-16">
        <div className="text-center max-w-md">
          {isPendingOrLoading ? (
            <Loader2 className="mx-auto mb-4 h-16 w-16 text-primary animate-spin" />
          ) : isSuccess ? (
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          ) : isFailed ? (
            <XCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
          ) : (
            <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
          )}

          <h1 className="mb-2 font-display text-3xl font-bold">
            {isPendingOrLoading
              ? "Confirming Payment..."
              : isSuccess
                ? "Payment Successful!"
                : isFailed
                  ? "Payment Failed"
                  : "Payment " + (status || "Unknown")}
          </h1>

          <p className="mb-6 text-muted-foreground">
            {isPendingOrLoading
              ? "Please wait while we confirm your payment status. Do not close this page."
              : isSuccess
                ? "Thank you for your payment. We'll be in touch shortly."
                : "Something went wrong with your payment. Please try again or contact us."}
          </p>

          {txnid && <p className="mb-4 text-xs text-muted-foreground">Transaction ID: {txnid}</p>}

          {!isPendingOrLoading && (
            <div className="flex justify-center gap-3 mt-8">
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/">Go Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PaymentResult;
