import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  Globe, Wifi, Code, ShoppingCart, Database, Cloud, Settings
} from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const sections = [
  { icon: Globe, title: "Web Technology & Digital Solutions", desc: "Responsive websites, progressive web apps, SEO optimization, and digital marketing solutions. Built with modern frameworks for speed, security, and user experience." },
  { icon: Wifi, title: "Internet & Platform Services", desc: "ISP setup and management, broadband connectivity solutions, platform integrations, API development, and SaaS application configuration for business operations." },
  { icon: Code, title: "Website & App Development", desc: "Full-stack web and mobile application development — React, Node.js, Flutter, and native platforms. From concept to deployment with CI/CD pipelines." },
  { icon: ShoppingCart, title: "E-Commerce Solutions", desc: "End-to-end e-commerce platforms with payment gateway integration, inventory management, order tracking, and analytics dashboards." },
  { icon: Database, title: "Data Management", desc: "Database design and administration (SQL, NoSQL), data migration, backup strategies, ETL pipelines, and business intelligence reporting." },
  { icon: Cloud, title: "Hosting & Licensing", desc: "Cloud hosting (AWS, Azure, GCP), domain management, SSL certificates, and software licensing — Microsoft 365, Google Workspace, and enterprise licenses." },
  { icon: Settings, title: "Custom Software Development", desc: "Bespoke software for ERP, CRM, inventory, billing, and operational management. Tailored to your business workflows with ongoing maintenance and support." },
];

const SoftwareSolutions = () => (
  <Layout>
    <section className="relative overflow-hidden py-16 md:py-24" style={{ background: 'linear-gradient(135deg, hsl(215 85% 10%), hsl(215 85% 18%))' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(24_92%_55%/0.1),transparent_60%)]" />
      <div className="container relative z-10 max-w-3xl text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 font-display text-4xl font-extrabold text-white md:text-5xl">
          Software Solutions
        </motion.h1>
        <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-white/30" />
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="text-lg text-white/80">
          Digital transformation services — web, mobile, cloud, and custom software built for modern businesses.
        </motion.p>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="container space-y-10">
        {sections.map((s, i) => (
          <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
            <Card className="group overflow-hidden border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 group-hover:from-accent/20 group-hover:to-primary/20 transition-colors">
                  <s.icon className="h-7 w-7 text-accent" />
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
        <h2 className="mb-4 font-display text-2xl font-bold text-foreground">Need Custom Software?</h2>
        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25"><Link to="/contact">Get a Quote</Link></Button>
      </div>
    </section>
  </Layout>
);

export default SoftwareSolutions;
