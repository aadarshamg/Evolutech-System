import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Shield, Target, Users, Award, Server, Cpu, Lock, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const team = [
  { role: "System Engineers", desc: "Designing and deploying enterprise hardware and security infrastructure.", icon: Cpu },
  { role: "Server Specialists", desc: "Managing server architecture, virtualization, and high-availability systems.", icon: Server },
  { role: "Security Architects", desc: "Planning and implementing physical and digital security frameworks.", icon: Lock },
  { role: "Project Managers", desc: "Coordinating end-to-end delivery with on-time, on-budget execution.", icon: Settings },
];

const About = () => (
  <Layout>
    <section className="relative overflow-hidden py-16 md:py-24" style={{ background: 'linear-gradient(135deg, hsl(215 85% 10%), hsl(215 85% 18%))' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(24_92%_55%/0.1),transparent_60%)]" />
      <div className="container relative z-10 max-w-3xl text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 font-display text-4xl font-extrabold text-white md:text-5xl">
          About Evolutech Systems
        </motion.h1>
        <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-white/30" />
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="text-lg text-white/80">
          Building secure, scalable, and reliable technology solutions since day one.
        </motion.p>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="container max-w-4xl">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mb-4 font-display text-2xl font-bold text-foreground">Company Profile</h2>
            <p className="leading-relaxed text-muted-foreground">
              Evolutech Systems (OPC) Private Limited is a Pune-based technology company delivering integrated security, server, and digital solutions. We combine hardware expertise with software innovation to provide businesses with comprehensive, reliable infrastructure that scales with their growth.
            </p>
          </div>
          <div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-primary/10">
              <Target className="h-7 w-7 text-accent" />
            </div>
            <h2 className="mb-4 font-display text-2xl font-bold text-foreground">Our Mission</h2>
            <p className="leading-relaxed text-muted-foreground">
              To deliver enterprise-grade technology solutions that empower businesses with security, efficiency, and innovation. We strive to be the trusted partner for organizations seeking reliable infrastructure and digital transformation — with quality, integrity, and client success at the core of everything we do.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-gradient-to-br from-secondary via-background to-secondary py-16 md:py-24">
      <div className="container">
        <div className="mb-10 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-accent" />
          <h2 className="font-display text-3xl font-bold text-foreground">Our Team</h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-accent" />
          <p className="mt-4 text-muted-foreground">A certified team of professionals driving every project to success.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((t, i) => (
            <motion.div key={t.role} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
              <Card className="group h-full border-none bg-card text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                    <t.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold text-foreground">{t.role}</h3>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="container max-w-3xl text-center">
        <Award className="mx-auto mb-3 h-10 w-10 text-accent" />
        <h2 className="mb-4 font-display text-3xl font-bold text-foreground">Our Values</h2>
        <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-accent" />
        <div className="grid gap-6 sm:grid-cols-3">
          {["Quality First", "Client Success", "Continuous Innovation"].map((v) => (
            <div key={v} className="rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-accent/10 p-5">
              <p className="font-display font-semibold text-foreground">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
