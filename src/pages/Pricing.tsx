import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { CheckCircle, Camera, Lock, Bell, Server, Wrench, Package, IndianRupee } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

interface PlanCard {
  title: string;
  price: string;
  period?: string;
  features: string[];
  popular?: boolean;
  quote?: boolean;
  amount?: number;
  description?: string;
}

const cctvPlans: PlanCard[] = [
  { title: "Basic", price: "₹8,500", amount: 8500, features: ["2 HD Cameras", "4-Channel DVR", "500GB Storage", "Basic Installation", "30-Day Warranty"] },
  { title: "Standard", price: "₹20,000", amount: 20000, popular: true, features: ["4 Full HD Cameras", "8-Channel DVR", "1TB Storage", "Night Vision", "Remote Access", "90-Day Warranty"] },
  { title: "Advanced", price: "₹50,000", amount: 50000, features: ["8 IP Cameras (4MP)", "16-Channel NVR", "4TB Storage", "AI Analytics", "Mobile App", "1-Year AMC"] },
];

const accessPlans: PlanCard[] = [
  { title: "Basic", price: "₹45,000", amount: 45000, features: ["Single Door System", "Biometric Reader", "Attendance Software", "Installation Included", "6-Month Warranty"] },
  { title: "Multi-Door", price: "Custom", quote: true, features: ["Multiple Access Points", "Centralized Dashboard", "Visitor Management", "Integration Support", "Custom Configuration"] },
];

const storagePlans: PlanCard[] = [
  { title: "DVR System", price: "₹10,000", amount: 10000, features: ["4/8/16 Channel Options", "H.265 Compression", "Local Storage", "Mobile Viewing"] },
  { title: "NVR System", price: "₹15,000", amount: 15000, popular: true, features: ["IP Camera Support", "PoE Built-in", "4K Recording", "Remote Playback"] },
  { title: "Hybrid System", price: "₹20,000", amount: 20000, features: ["Analog + IP Support", "Flexible Configuration", "Advanced Search", "RAID Storage"] },
  { title: "Cloud Storage", price: "₹1,000", period: "/mo", amount: 1000, features: ["Offsite Backup", "Encrypted Storage", "Anytime Access", "Auto Sync"] },
];

type Gateway = "phonepe" | "easebuzz";

const PaymentDialog = ({
  open, onClose, plan
}: {
  open: boolean;
  onClose: () => void;
  plan: PlanCard | null;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [gateway, setGateway] = useState<Gateway>("phonepe");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const functionName = gateway === "phonepe" ? "phonepe-initiate" : "easebuzz-initiate";
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          amount: plan!.amount,
          description: plan!.description || `${plan!.title} - Evolutech Systems`,
          customer_name: form.name.trim(),
          customer_email: form.email.trim(),
          customer_phone: form.phone.trim(),
        },
      });
      if (error) throw error;
      if (data?.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error(data?.error || "Failed to initiate payment");
      }
    } catch (error: any) {
      toast({ title: "Payment failed", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Pay for {plan?.title} — {plan?.price}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handlePay} className="space-y-4">
          {/* Gateway selection */}
          <div>
            <Label className="mb-2 block">Payment Method</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={gateway === "phonepe" ? "default" : "outline"}
                className={gateway === "phonepe" ? "flex-1 bg-purple-600 text-white hover:bg-purple-700" : "flex-1 border-purple-600/30 text-purple-600 hover:bg-purple-600/10"}
                onClick={() => setGateway("phonepe")}
              >
                PhonePe
              </Button>
              <Button
                type="button"
                variant={gateway === "easebuzz" ? "default" : "outline"}
                className={gateway === "easebuzz" ? "flex-1 bg-emerald-600 text-white hover:bg-emerald-700" : "flex-1 border-emerald-600/30 text-emerald-600 hover:bg-emerald-600/10"}
                onClick={() => setGateway("easebuzz")}
              >
                Easebuzz
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="pay-name">Full Name *</Label>
            <Input id="pay-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} maxLength={100} placeholder="Your name" />
          </div>
          <div>
            <Label htmlFor="pay-email">Email *</Label>
            <Input id="pay-email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} maxLength={255} placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="pay-phone">Phone *</Label>
            <Input id="pay-phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} maxLength={15} placeholder="9137110358" />
          </div>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
            {loading ? "Processing..." : `Pay ${plan?.price} via ${gateway === "phonepe" ? "PhonePe" : "Easebuzz"}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const PricingCard = ({ plan, index, onPayNow }: { plan: PlanCard; index: number; onPayNow: (plan: PlanCard) => void }) => (
  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={index} className="flex">
    <Card className={`flex flex-col w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${plan.popular ? "border-accent shadow-lg ring-1 ring-accent/20" : "border-border"}`}>
      <CardHeader className="pb-2">
        {plan.popular && <Badge className="mb-2 w-fit bg-accent text-accent-foreground">Most Popular</Badge>}
        <CardTitle className="font-display text-lg">{plan.title}</CardTitle>
        <div className="mt-2">
          <span className="font-display text-3xl font-extrabold text-foreground">{plan.price}</span>
          {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {plan.quote ? (
          <Button asChild variant="outline" className="w-full border-accent/30 text-accent hover:bg-accent/10"><Link to="/contact">Get a Quote</Link></Button>
        ) : (
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => onPayNow(plan)}>Pay Now</Button>
        )}
      </CardFooter>
    </Card>
  </motion.div>
);

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="mb-6 flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
      <Icon className="h-5 w-5 text-accent" />
    </div>
    <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
  </div>
);

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanCard | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const { toast } = useToast();

  const handleCustomPay = () => {
    const amount = Number(customAmount);
    if (!amount || amount < 1) {
      toast({ title: "Please enter a valid amount (minimum ₹1)", variant: "destructive" });
      return;
    }
    setSelectedPlan({
      title: "Custom Payment",
      price: `₹${amount.toLocaleString("en-IN")}`,
      amount,
      description: customDescription.trim() || "Custom Payment",
      features: [],
    });
  };

  return (
    <Layout>
      <section className="relative overflow-hidden py-16 md:py-24" style={{ background: 'linear-gradient(135deg, hsl(215 85% 10%), hsl(215 85% 18%))' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(24_92%_55%/0.08),transparent_60%)]" />
        <div className="container relative z-10 max-w-3xl text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 font-display text-4xl font-extrabold text-white md:text-5xl">
            Pricing
          </motion.h1>
          <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-white/30" />
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="text-lg text-white/80">
            Transparent pricing for all our security and infrastructure solutions.
          </motion.p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container space-y-16">
          <div>
            <SectionHeader icon={Camera} title="CCTV Surveillance" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cctvPlans.map((p, i) => <PricingCard key={p.title} plan={p} index={i} onPayNow={setSelectedPlan} />)}
            </div>
          </div>

          <div>
            <SectionHeader icon={Lock} title="Access Control Systems" />
            <div className="grid gap-6 sm:grid-cols-2">
              {accessPlans.map((p, i) => <PricingCard key={p.title} plan={p} index={i} onPayNow={setSelectedPlan} />)}
            </div>
          </div>

          <div>
            <SectionHeader icon={Bell} title="Alarm & Detection Systems" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <PricingCard plan={{ title: "Basic System", price: "₹5,000", amount: 5000, features: ["Smoke Detector", "Alarm Panel", "SMS Alerts", "Basic Installation"] }} index={0} onPayNow={setSelectedPlan} />
              <PricingCard plan={{ title: "Advanced System", price: "Custom", quote: true, features: ["Multi-Zone Detection", "Fire + Gas + Intrusion", "Central Monitoring", "Integration Support"] }} index={1} onPayNow={setSelectedPlan} />
            </div>
          </div>

          <div>
            <SectionHeader icon={Server} title="Surveillance Servers & Storage" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {storagePlans.map((p, i) => <PricingCard key={p.title} plan={p} index={i} onPayNow={setSelectedPlan} />)}
            </div>
          </div>

          <div>
            <SectionHeader icon={Wrench} title="Installation & Support" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <PricingCard plan={{ title: "Standard Installation", price: "₹2,500", amount: 2500, features: ["Up to 4 Cameras", "Cable Laying", "Configuration", "Testing & Handover"] }} index={0} onPayNow={setSelectedPlan} />
              <PricingCard plan={{ title: "Advanced Installation", price: "₹3,000", amount: 3000, features: ["5–16 Cameras", "Structured Cabling", "Network Setup", "Remote Access Config"] }} index={1} onPayNow={setSelectedPlan} />
              <PricingCard plan={{ title: "Annual Maintenance", price: "₹500–₹1,200", period: "/yr per device", features: ["Preventive Maintenance", "Priority Support", "Parts at Cost", "Quarterly Checkup"], quote: true }} index={2} onPayNow={setSelectedPlan} />
            </div>
          </div>

          <div>
            <SectionHeader icon={IndianRupee} title="Custom Payment" />
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
              <Card className="max-w-md border-border">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Pay a Custom Amount</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="custom-amount">Amount (₹) *</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                      <Input
                        id="custom-amount"
                        type="number"
                        min={1}
                        placeholder="Enter amount"
                        className="pl-7"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="custom-desc">Description (optional)</Label>
                    <Input
                      id="custom-desc"
                      placeholder="e.g. Advance payment for CCTV installation"
                      className="mt-1"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      maxLength={200}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleCustomPay}>
                    Proceed to Pay
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-accent/20 p-8 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-accent" />
            <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Popular Packages</h2>
            <p className="mb-6 text-muted-foreground">Looking for a bundled solution? We offer custom packages combining surveillance, access control, and networking at discounted rates.</p>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25"><Link to="/contact">Request a Package Quote</Link></Button>
          </div>
        </div>
      </section>

      <PaymentDialog open={!!selectedPlan} onClose={() => setSelectedPlan(null)} plan={selectedPlan} />
    </Layout>
  );
};

export default Pricing;
