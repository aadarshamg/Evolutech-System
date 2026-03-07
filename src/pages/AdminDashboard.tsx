import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Mail, CreditCard, Eye, Trash2, CheckCircle } from "lucide-react";
import logo from "@/assets/logo.webp";

interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  description: string | null;
  transaction_id: string | null;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/admin/login"); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").single();
    if (!roles || roles.role !== "admin") {
      await supabase.auth.signOut();
      navigate("/admin/login");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const [subs, pays] = await Promise.all([
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
    ]);
    if (subs.data) setSubmissions(subs.data as ContactSubmission[]);
    if (pays.data) setPayments(pays.data as Payment[]);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("contact_submissions").update({ is_read: true }).eq("id", id);
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, is_read: true } : s));
    toast({ title: "Marked as read" });
  };

  const deleteSubmission = async (id: string) => {
    await supabase.from("contact_submissions").delete().eq("id", id);
    setSubmissions(prev => prev.filter(s => s.id !== id));
    toast({ title: "Submission deleted" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const unreadCount = submissions.filter(s => !s.is_read).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur" style={{ background: 'hsla(215, 85%, 10%, 0.95)' }}>
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Evolutech" className="h-8 w-auto" />
            <span className="font-display text-sm font-bold text-white">Admin Panel</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/70 hover:text-white">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Inquiries</div>
            <div className="mt-1 text-2xl font-bold">{submissions.length}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Unread</div>
            <div className="mt-1 text-2xl font-bold text-accent">{unreadCount}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Payments</div>
            <div className="mt-1 text-2xl font-bold">{payments.length}</div>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="inquiries">
          <TabsList>
            <TabsTrigger value="inquiries" className="gap-2">
              <Mail className="h-4 w-4" /> Inquiries {unreadCount > 0 && <Badge className="bg-accent text-accent-foreground text-xs">{unreadCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" /> Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inquiries" className="mt-4 space-y-3">
            {loading ? <p className="text-muted-foreground">Loading...</p> : submissions.length === 0 ? (
              <p className="text-muted-foreground">No inquiries yet.</p>
            ) : submissions.map(s => (
              <Card key={s.id} className={s.is_read ? "opacity-70" : "border-accent/30"}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{s.full_name}</span>
                        {!s.is_read && <Badge className="bg-accent text-accent-foreground text-xs">New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{s.email} {s.phone && `· ${s.phone}`}</p>
                      <p className="mt-2 text-sm">{s.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-1">
                      {!s.is_read && (
                        <Button variant="ghost" size="icon" onClick={() => markAsRead(s.id)} title="Mark as read">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => deleteSubmission(s.id)} title="Delete" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="payments" className="mt-4 space-y-3">
            {loading ? <p className="text-muted-foreground">Loading...</p> : payments.length === 0 ? (
              <p className="text-muted-foreground">No payments yet.</p>
            ) : payments.map(p => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">₹{p.amount}</span>
                        <Badge variant={p.status === 'success' ? 'default' : p.status === 'failed' ? 'destructive' : 'secondary'}>
                          {p.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{p.description}</p>
                      {p.customer_name && <p className="text-sm">{p.customer_name} · {p.customer_email}</p>}
                      <p className="text-xs text-muted-foreground mt-1">TXN: {p.transaction_id} · {new Date(p.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
