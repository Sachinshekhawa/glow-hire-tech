const stats = [
  { v: "70%", l: "Faster time-to-hire", d: "From job open to offer accepted" },
  { v: "50%", l: "Lower cost per hire", d: "Less tooling, less recruiter overhead" },
  { v: "3×", l: "Candidate engagement", d: "Multi-channel response uplift" },
  { v: "92%", l: "Recruiter satisfaction", d: "Less admin, more strategic work" },
];

const Roi = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-50 -z-10" />
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Impact
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Outcomes that <span className="gradient-text">move the P&L.</span>
          </h2>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s) => (
            <div
              key={s.l}
              className="relative glass-card rounded-2xl p-8 text-center group hover:border-primary/40 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="font-display text-5xl md:text-6xl font-bold gradient-text">
                {s.v}
              </div>
              <div className="mt-3 font-semibold">{s.l}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Roi;
