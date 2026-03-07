import { useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentResult = () => {
  const [params] = useSearchParams();
  const status = params.get("status");
  const txnid = params.get("txnid");

  const isSuccess = status === "success";
  const isFailed = status === "failed";

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center py-16">
        <div className="text-center max-w-md">
          {isSuccess ? (
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          ) : isFailed ? (
            <XCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
          ) : (
            <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
          )}
          <h1 className="mb-2 font-display text-3xl font-bold">
            {isSuccess ? "Payment Successful!" : isFailed ? "Payment Failed" : "Payment " + (status || "Unknown")}
          </h1>
          <p className="mb-6 text-muted-foreground">
            {isSuccess
              ? "Thank you for your payment. We'll be in touch shortly."
              : "Something went wrong with your payment. Please try again or contact us."}
          </p>
          {txnid && <p className="mb-4 text-xs text-muted-foreground">Transaction ID: {txnid}</p>}
          <div className="flex justify-center gap-3">
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentResult;
