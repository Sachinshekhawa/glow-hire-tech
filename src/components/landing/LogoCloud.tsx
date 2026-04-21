const logos = [
  "Acme Staffing",
  "Northwind HR",
  "Globex",
  "Initech",
  "Umbrella Talent",
  "Hooli",
  "Stark Industries",
  "Wayne Enterprises",
];

const LogoCloud = () => {
  return (
    <section className="py-12 border-y border-border/60 bg-secondary/30">
      <div className="container">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
          Trusted by modern hiring teams worldwide
        </p>
        <div className="relative overflow-hidden">
          <div className="flex gap-16 animate-marquee whitespace-nowrap">
            {[...logos, ...logos].map((l, i) => (
              <span
                key={i}
                className="font-display text-xl md:text-2xl font-semibold text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                {l}
              </span>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default LogoCloud;
