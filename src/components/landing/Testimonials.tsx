import { Quote } from "lucide-react";

const testimonials = [
  {
    q: "We replaced four tools with Glohire and cut our time-to-hire from 38 days to 11. The AI interviewer alone saved us 200 recruiter hours a month.",
    a: "Priya Menon",
    r: "VP Talent, Northwind HR",
  },
  {
    q: "The unified inbox is a game-changer. Candidates respond on WhatsApp now and we never lose a conversation across channels.",
    a: "Daniel Ross",
    r: "Head of Recruiting, Acme Staffing",
  },
  {
    q: "Glohire's AI screens 4,000 applicants overnight with scary-good accuracy. Our recruiters finally focus on closing — not chasing.",
    a: "Mariana Costa",
    r: "Director of TA, Globex",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Loved by recruiters
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Hiring leaders are <span className="gradient-text">switching to Glohire.</span>
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <figure
              key={t.a}
              className="glass-card rounded-2xl p-7 flex flex-col hover:border-primary/40 transition-colors"
            >
              <Quote className="h-6 w-6 text-primary opacity-60" />
              <blockquote className="mt-4 text-sm text-foreground/90 leading-relaxed flex-1">
                "{t.q}"
              </blockquote>
              <figcaption className="mt-6 pt-6 border-t border-border">
                <div className="font-semibold text-sm">{t.a}</div>
                <div className="text-xs text-muted-foreground">{t.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
