import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import heroBg from "@/assets/hero-bg.jpg";
import {
  Shield, Server, Camera, Lock, Database, Cpu, Wrench,
  Network, CheckCircle, Users, Award, Clock, Layers,
  HeadphonesIcon, BookOpen, UserCheck
} from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const stats = [
  { value: "5+", label: "Years Experience", icon: Clock },
  { value: "200+", label: "Projects Delivered", icon: Layers },
  { value: "25+", label: "Certified Team", icon: UserCheck },
  { value: "500+", label: "Systems Deployed", icon: Server },
];

const expertise = [
  { title: "Expert Engineering", desc: "Precision-engineered security and server solutions tailored to enterprise needs.", icon: Wrench },
  { title: "Custom System Design", desc: "Bespoke systems designed around your infrastructure requirements.", icon: Cpu },
  { title: "Infrastructure", desc: "End-to-end infrastructure planning, deployment, and management.", icon: Database },
  { title: "Servers & Networks", desc: "Robust server architecture and network solutions for seamless operations.", icon: Network },
];

const services = [
  { title: "Server Design & Deployment", desc: "Enterprise-grade server architecture, rack configuration, and high-availability deployment.", icon: Server, link: "/hardware" },
  { title: "Access Control Systems", desc: "Biometric, RFID, and smart card access solutions for secure premises.", icon: Lock, link: "/hardware" },
  { title: "Intelligent Surveillance", desc: "AI-powered CCTV with analytics, night vision, and remote monitoring.", icon: Camera, link: "/hardware" },
  { title: "Data Center Solutions", desc: "Complete data center design — cooling, power, structured cabling, and security.", icon: Database, link: "/hardware" },
];

const whyCards = [
  { title: "Engineering Discipline", desc: "Every project follows rigorous engineering standards.", icon: Award },
  { title: "Seamless Integration", desc: "Hardware and software designed to work together flawlessly.", icon: Layers },
  { title: "Scalable Solutions", desc: "Systems that grow with your business requirements.", icon: Server },
  { title: "24/7 Support", desc: "Round-the-clock technical support and maintenance.", icon: HeadphonesIcon },
  { title: "Industry Best Practices", desc: "Following global standards for security and infrastructure.", icon: BookOpen },
  { title: "Certified Professionals", desc: "Team of certified engineers and security specialists.", icon: Users },
];

const Index = () => (
  <Layout>
    {/* Hero with full background image */}
    <section className="relative overflow-hidden min-h-[600px] flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(215,85%,10%,0.92)] via-[hsl(215,85%,12%,0.85)] to-[hsl(215,85%,15%,0.7)]" />
      <div className="container relative z-10 py-20 md:py-28 lg:py-36">
        <motion.div initial="hidden" animate="visible" className="max-w-2xl">
          <motion.span
            variants={fade} custom={0}
            className="mb-4 inline-block rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent"
          >
            5+ Years of Excellence
          </motion.span>
          <motion.h1 variants={fade} custom={1} className="mb-6 font-display text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
            Integrated Security, Server &amp; Technology Solutions
          </motion.h1>
          <motion.p variants={fade} custom={2} className="mb-8 text-lg leading-relaxed text-white/80">
            Evolutech Systems delivers enterprise-grade hardware infrastructure, intelligent surveillance, and digital transformation services — built for reliability and scale.
          </motion.p>
          <motion.div variants={fade} custom={3} className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25">
              <Link to="/pricing">View Pricing</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link to="/contact">Get a Quote</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* Stats with gradient accent bar */}
    <section className="relative border-b border-border bg-card py-10">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      <div className="container grid grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i} className="text-center">
            <s.icon className="mx-auto mb-2 h-8 w-8 text-accent" />
            <p className="font-display text-3xl font-extrabold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Who We Are */}
    <section className="py-16 md:py-24">
      <div className="container max-w-3xl text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 variants={fade} custom={0} className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">Who We Are</motion.h2>
          <motion.div variants={fade} custom={0} className="mx-auto mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-accent" />
          <motion.p variants={fade} custom={1} className="text-lg leading-relaxed text-muted-foreground">
            Evolutech Systems (OPC) Private Limited is an integrated technology company specializing in enterprise-grade security infrastructure, server solutions, and digital services. With over 5 years of hands-on expertise, we serve businesses across Pune and Maharashtra with tailored solutions that combine cutting-edge hardware and software for complete operational security and efficiency.
          </motion.p>
        </motion.div>
      </div>
    </section>

    {/* Core Expertise */}
    <section className="bg-gradient-to-br from-secondary via-background to-secondary py-16 md:py-24">
      <div className="container">
        <h2 className="mb-2 text-center font-display text-3xl font-bold text-foreground md:text-4xl">Core Expertise</h2>
        <div className="mx-auto mb-10 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-accent" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {expertise.map((e, i) => (
            <motion.div key={e.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
              <Card className="group h-full border-none bg-card shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                    <e.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold text-foreground">{e.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{e.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Service Highlights */}
    <section className="py-16 md:py-24">
      <div className="container">
        <h2 className="mb-2 text-center font-display text-3xl font-bold text-foreground md:text-4xl">Service Highlights</h2>
        <div className="mx-auto mb-10 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-accent" />
        <div className="grid gap-6 sm:grid-cols-2">
          {services.map((s, i) => (
            <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
              <Link to={s.link}>
                <Card className="group h-full border border-border hover:border-accent/40 hover:shadow-lg transition-all duration-300">
                  <CardContent className="flex gap-4 p-6">
                    <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-accent/20 group-hover:to-primary/20 transition-colors">
                      <s.icon className="h-6 w-6 text-primary group-hover:text-accent transition-colors" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-display text-lg font-semibold text-foreground">{s.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Why Evolutech */}
    <section className="relative overflow-hidden py-16 md:py-24" style={{ background: 'linear-gradient(135deg, hsl(215 85% 10%), hsl(215 85% 18%), hsl(215 70% 22%))' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(24_92%_55%/0.1),transparent_60%)]" />
      <div className="container relative z-10">
        <h2 className="mb-2 text-center font-display text-3xl font-bold text-white md:text-4xl">Why Evolutech</h2>
        <div className="mx-auto mb-10 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-white/30" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyCards.map((c, i) => (
            <motion.div key={c.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}
              className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
            >
              <c.icon className="mb-3 h-8 w-8 text-accent" />
              <h3 className="mb-2 font-display text-lg font-semibold text-white">{c.title}</h3>
              <p className="text-sm leading-relaxed text-white/70">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 text-center md:py-24">
      <div className="container max-w-2xl">
        <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">Ready to Secure Your Business?</h2>
        <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-accent" />
        <p className="mb-8 text-muted-foreground">Get in touch for a free consultation and customized proposal.</p>
        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25">
          <Link to="/contact">Contact Us Today</Link>
        </Button>
      </div>
    </section>
  </Layout>
);

export default Index;
