import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Clock, MapPin, Phone, Star } from "lucide-react";
import { type Variants, motion } from "motion/react";
import { useGetMenuItems } from "../hooks/useQueries";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

// Featured dishes to highlight (from seeded menu)
const FEATURED_NAMES = ["Butter Chicken", "Chicken Biryani", "Samosa Platter"];

const DISH_IMAGES: Record<string, string> = {
  "Butter Chicken": "/assets/generated/dish-butter-chicken.dim_600x400.jpg",
  "Chicken Biryani": "/assets/generated/dish-biryani.dim_600x400.jpg",
  "Samosa Platter": "/assets/generated/dish-samosa.dim_600x400.jpg",
};

const highlights = [
  { icon: Star, label: "4.9 Stars", sub: "Over 2,000 reviews" },
  { icon: Clock, label: "Since 1989", sub: "35 years of tradition" },
  { icon: MapPin, label: "Old Delhi", sub: "Spice Market Lane" },
  { icon: Phone, label: "Reservations", sub: "+91 98765 43210" },
];

export default function HomePage() {
  const { data: menuItems = [] } = useGetMenuItems();

  const featuredItems = menuItems.filter((item) =>
    FEATURED_NAMES.includes(item.name),
  );

  // Fall back to first 3 available items if seeded items aren't present
  const displayItems =
    featuredItems.length > 0
      ? featuredItems.slice(0, 3)
      : menuItems.filter((i) => i.available).slice(0, 3);

  return (
    <div className="overflow-x-hidden">
      {/* ─── Hero Section ──────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-khatta-meetha.dim_1920x700.jpg')",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/50" />
        {/* Warm glow bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 font-ui text-xs tracking-widest uppercase px-4 py-1.5">
                Authentic Indian Cuisine
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none mb-6"
            >
              <span className="text-gold-gradient">KHATTA</span>
              <br />
              <span className="text-foreground">MEETHA</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="font-ui text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl"
            >
              A symphony of sweet &amp; sour flavors — where ancient recipes
              meet bold Indian spices. Every dish tells a story of tradition,
              passion, and culinary artistry.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap gap-4"
            >
              <Button
                asChild
                size="lg"
                data-ocid="hero.primary_button"
                className="font-ui font-semibold px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
              >
                <Link to="/menu">
                  View Menu <ChevronRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                data-ocid="hero.secondary_button"
                className="font-ui font-semibold px-8 border-primary/50 text-primary hover:bg-primary/10"
              >
                <Link to="/menu">View Menu</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Highlights Bar ────────────────────────────────────────── */}
      <section className="bg-card border-y border-border py-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {highlights.map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <h.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-ui font-semibold text-foreground text-sm">
                    {h.label}
                  </p>
                  <p className="font-ui text-xs text-muted-foreground">
                    {h.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── About Section ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28 spice-pattern">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden glow-border">
                <img
                  src="/assets/generated/about-interior.dim_800x600.jpg"
                  alt="Khatta Meetha restaurant interior"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Floating tag */}
              <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground rounded-xl px-5 py-3 shadow-lg">
                <p className="font-display font-bold text-2xl leading-none">
                  35+
                </p>
                <p className="font-ui text-xs font-medium opacity-80">
                  Years of Craft
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              <p className="font-ui text-xs text-primary tracking-widest uppercase font-semibold mb-3">
                Our Story
              </p>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6 leading-tight">
                Where Tradition
                <br />
                <span className="text-gold-gradient">Meets Flavor</span>
              </h2>
              <div className="space-y-4 text-muted-foreground font-ui leading-relaxed">
                <p>
                  Founded in 1989 in the heart of Old Delhi, Khatta Meetha began
                  as a humble dhaba with one ambition — to serve the most
                  authentic, soul-warming Indian food the city had ever tasted.
                </p>
                <p>
                  Every recipe is passed down through three generations of the
                  Sharma family, using spices sourced directly from the farms of
                  Rajasthan and Kerala. We believe food is not just nourishment
                  — it&apos;s memory, culture, and joy on a plate.
                </p>
                <p>
                  Today, our kitchen serves hundreds of guests daily, but every
                  dish is made with the same care and love as our first.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-8 font-ui border-primary/40 text-primary hover:bg-primary/10"
              >
                <Link to="/menu">
                  Explore Our Menu <ChevronRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Featured Dishes ───────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-card">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="font-ui text-xs text-primary tracking-widest uppercase font-semibold mb-3">
              Chef's Recommendations
            </p>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
              Featured Dishes
            </h2>
            <div className="ornament-divider max-w-xs mx-auto">
              <span className="text-primary text-lg">✦</span>
            </div>
          </motion.div>

          {displayItems.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={staggerContainer}
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {displayItems.map((item, i) => (
                <motion.article
                  key={String(item.id)}
                  variants={fadeUp}
                  custom={i}
                  className="group rounded-2xl overflow-hidden bg-background border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="aspect-[3/2] overflow-hidden bg-muted">
                    <img
                      src={
                        DISH_IMAGES[item.name] ||
                        "/assets/generated/dish-butter-chicken.dim_600x400.jpg"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display font-semibold text-lg text-foreground leading-tight">
                        {item.name}
                      </h3>
                      <span className="font-ui font-bold text-primary shrink-0">
                        ₹{item.price.toFixed(0)}
                      </span>
                    </div>
                    <p className="font-ui text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                    <Badge
                      variant="secondary"
                      className="mt-3 text-xs font-ui capitalize"
                    >
                      {item.category}
                    </Badge>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    name: "Butter Chicken",
                    desc: "Tender chicken in a luscious tomato-cream sauce with aromatic spices.",
                    price: "₹380",
                    img: "/assets/generated/dish-butter-chicken.dim_600x400.jpg",
                    cat: "Main Course",
                  },
                  {
                    name: "Chicken Biryani",
                    desc: "Fragrant saffron-infused basmati rice layered with spiced chicken.",
                    price: "₹420",
                    img: "/assets/generated/dish-biryani.dim_600x400.jpg",
                    cat: "Main Course",
                  },
                  {
                    name: "Samosa Platter",
                    desc: "Crispy golden pastries filled with spiced potatoes and peas.",
                    price: "₹150",
                    img: "/assets/generated/dish-samosa.dim_600x400.jpg",
                    cat: "Appetizers",
                  },
                ].map((dish, i) => (
                  <motion.article
                    key={dish.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="group rounded-2xl overflow-hidden bg-background border border-border hover:border-primary/40 transition-all duration-300"
                  >
                    <div className="aspect-[3/2] overflow-hidden bg-muted">
                      <img
                        src={dish.img}
                        alt={dish.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-display font-semibold text-lg text-foreground">
                          {dish.name}
                        </h3>
                        <span className="font-ui font-bold text-primary shrink-0">
                          {dish.price}
                        </span>
                      </div>
                      <p className="font-ui text-sm text-muted-foreground leading-relaxed">
                        {dish.desc}
                      </p>
                      <Badge
                        variant="secondary"
                        className="mt-3 text-xs font-ui"
                      >
                        {dish.cat}
                      </Badge>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              asChild
              size="lg"
              className="font-ui font-semibold px-10 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/menu">
                Full Menu <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA Section ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-crimson/10 pointer-events-none" />
        <div className="relative container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-black text-4xl md:text-5xl text-foreground mb-5">
              Reserve Your Table <br />
              <span className="text-gold-gradient">Tonight</span>
            </h2>
            <p className="font-ui text-muted-foreground text-lg mb-8">
              Experience the vibrant flavors of India in an unforgettable
              atmosphere. Book now and let us prepare something extraordinary
              for you.
            </p>
            <Button
              asChild
              size="lg"
              className="font-ui font-semibold px-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/30"
            >
              <Link to="/menu">
                View Menu <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
