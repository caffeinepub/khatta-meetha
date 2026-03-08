import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useGetMenuItemsByCategory } from "../hooks/useQueries";

const CATEGORIES = [
  { key: "appetizers", label: "Appetizers", emoji: "🥗" },
  { key: "main", label: "Main Course", emoji: "🍛" },
  { key: "desserts", label: "Desserts", emoji: "🍮" },
  { key: "drinks", label: "Drinks", emoji: "🥤" },
];

function MenuItemCard({
  item,
  index,
}: {
  item: {
    id: bigint;
    name: string;
    description: string;
    price: number;
    available: boolean;
    category: string;
  };
  index: number;
}) {
  return (
    <motion.article
      data-ocid={`menu.item.${index + 1}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={`group flex items-start justify-between gap-4 p-5 rounded-xl border transition-all duration-200 ${
        item.available
          ? "bg-card border-border hover:border-primary/40 hover:bg-card/80"
          : "bg-muted/50 border-border/50 opacity-60"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="font-display font-semibold text-foreground text-base leading-tight">
            {item.name}
          </h3>
          {!item.available && (
            <Badge variant="secondary" className="font-ui text-xs shrink-0">
              Unavailable
            </Badge>
          )}
        </div>
        <p className="font-ui text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {item.description}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <span className="font-ui font-bold text-primary text-lg">
          ₹{item.price.toFixed(0)}
        </span>
      </div>
    </motion.article>
  );
}

function CategoryContent({ category }: { category: string }) {
  const {
    data: items = [],
    isLoading,
    isError,
  } = useGetMenuItemsByCategory(category);

  if (isLoading) {
    return (
      <div data-ocid="menu.loading_state" className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map((key) => (
          <div
            key={key}
            className="flex items-start justify-between gap-4 p-5 rounded-xl border border-border"
          >
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="menu.error_state"
        className="text-center py-12 text-muted-foreground font-ui"
      >
        <p className="text-destructive">
          Failed to load menu items. Please try again.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div data-ocid="menu.empty_state" className="text-center py-16">
        <p className="font-display text-2xl text-muted-foreground/60 mb-2">
          No items yet
        </p>
        <p className="font-ui text-sm text-muted-foreground">
          This category is coming soon.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={category}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-3"
      >
        {items.map((item, i) => (
          <MenuItemCard key={String(item.id)} item={item} index={i} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("appetizers");

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-card border-b border-border py-14 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 spice-pattern pointer-events-none" />
        <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-ui text-xs text-primary tracking-widest uppercase font-semibold mb-3">
              Handcrafted with Love
            </p>
            <h1 className="font-display font-black text-5xl md:text-6xl text-foreground mb-4">
              Our <span className="text-gold-gradient">Menu</span>
            </h1>
            <div className="ornament-divider max-w-xs mx-auto">
              <span className="text-primary text-lg">✦</span>
            </div>
            <p className="font-ui text-muted-foreground mt-5 max-w-lg mx-auto">
              Every dish celebrates India's rich culinary heritage — bold
              spices, fresh herbs, and recipes passed down through generations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Menu Tabs */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs
            defaultValue="appetizers"
            value={activeCategory}
            onValueChange={setActiveCategory}
          >
            <TabsList className="flex flex-wrap h-auto gap-1 bg-card border border-border p-1 rounded-xl w-full mb-10">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.key}
                  value={cat.key}
                  data-ocid="menu.tab"
                  className="flex-1 font-ui font-medium py-2.5 text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  <span className="mr-1.5">{cat.emoji}</span>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map((cat) => (
              <TabsContent key={cat.key} value={cat.key}>
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {cat.emoji} {cat.label}
                  </h2>
                  <p className="font-ui text-sm text-muted-foreground mt-1">
                    {cat.key === "appetizers" &&
                      "Start your journey with our vibrant starters"}
                    {cat.key === "main" &&
                      "Heartwarming classics and bold curries"}
                    {cat.key === "desserts" &&
                      "Sweet endings to a perfect meal"}
                    {cat.key === "drinks" &&
                      "Refreshing beverages to complement your meal"}
                  </p>
                </div>
                <CategoryContent category={cat.key} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </div>
  );
}
