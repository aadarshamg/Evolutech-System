import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  Server, Lock, Camera, Database, Bell, Network, Cpu
} from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const sections = [
  {
    icon: Server,
    title: "Server Design & Deployment",
    desc: "Enterprise-grade rack servers, tower servers, blade servers, and high-availability clustering. We handle architecture planning, OS installation, virtualization (VMware, Hyper-V), and deployment with redundancy for business-critical applications.",
  },
  {
    icon: Lock,
    title: "Access Control Systems",
    desc: "Biometric (fingerprint, face recognition), RFID proximity cards, smart card systems, and multi-factor authentication. Integrated with attendance tracking, visitor management, and centralized access dashboards.",
  },
  {
    icon: Camera,
    title: "Intelligent Surveillance",
    desc: "IP-based CCTV with AI analytics — intrusion detection, people counting, ANPR, night vision cameras, PTZ domes, and cloud/local NVR recording. Remote monitoring via mobile and web apps.",
  },
  {
    icon: Database,
    title: "Data Center Solutions",
    desc: "Complete data center infrastructure — server racks, structured cabling (Cat6/Cat6A/fiber), UPS and power management, precision cooling, environmental monitoring, and physical security.",
  },
  {
    icon: Bell,
    title: "Alarm & Detection Systems",
    desc: "Fire alarm systems, smoke and heat detectors, gas leak sensors, panic buttons, perimeter intrusion detection, and integrated alert management with SMS/email notifications.",
  },
  {
    icon: Network,
    title: "Networking & Intercom Systems",
    desc: "Enterprise LAN/WAN design, managed switches, routers, firewalls, Wi-Fi 6 access points, VPN setup, and IP intercom/video door phone systems for secure internal communications.",
  },
  {
    icon: Cpu,
    title: "Custom Electronics",
    desc: "Bespoke electronic solutions including IoT-based monitoring systems, custom PCB design, industrial automation controllers, and embedded systems for specialized operational needs.",
  },
];

const HardwareSolutions = () => (
  <Layout>
    <section className="relative overflow-hidden py-16 md:py-24" style={{ background: 'linear-gradient(135deg, hsl(215 85% 10%), hsl(215 85% 18%))' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(24_92%_55%/0.1),transparent_60%)]" />
      <div className="container relative z-10 max-w-3xl text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 font-display text-4xl font-extrabold text-white md:text-5xl">
          Hardware Solutions
        </motion.h1>
        <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-white/30" />
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="text-lg text-white/80">
          Enterprise-grade hardware infrastructure — servers, security, surveillance, and networking built for reliability and scale.
        </motion.p>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="container space-y-10">
        {sections.map((s, i) => (
          <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
            <Card className="group overflow-hidden border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                  <s.icon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="mb-2 font-display text-xl font-bold text-foreground">{s.title}</h2>
                  <p className="leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>

    <section className="bg-gradient-to-r from-secondary to-background py-12 text-center">
      <div className="container">
        <h2 className="mb-4 font-display text-2xl font-bold text-foreground">Need a Custom Hardware Solution?</h2>
        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25"><Link to="/contact">Get a Quote</Link></Button>
      </div>
    </section>
  </Layout>
);

export default HardwareSolutions;
