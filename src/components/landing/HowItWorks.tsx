const steps = [
  { n: "01", t: "Create the job", d: "Describe the role in plain text. AI generates the JD, scorecard and ideal candidate profile." },
  { n: "02", t: "AI sources candidates", d: "We scan job boards, LinkedIn, GitHub, Stack Overflow and your ATS for matches." },
  { n: "03", t: "Multi-channel outreach", d: "Personalized messages on email, WhatsApp, SMS and LinkedIn — at the right time." },
  { n: "04", t: "AI screens & interviews", d: "Voice/video interviews with sentiment scoring and proctoring." },
  { n: "05", t: "Ranked shortlist", d: "Top candidates ranked by fit, skill match and engagement signals." },
  { n: "06", t: "Hire", d: "Send offers, collect signatures and onboard — without leaving Glohire." },
];

const HowItWorks = () => {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            End-to-end
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            From open req to <span className="gradient-text">signed offer</span>.
          </h2>
        </div>

        <div className="mt-16 relative">
          {/* connecting line */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-6">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="relative"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-display font-bold shadow-glow">
                  {s.n}
                </div>
                <h3 className="mt-4 text-center font-display font-semibold">{s.t}</h3>
                <p className="mt-2 text-center text-xs text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
