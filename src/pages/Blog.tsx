import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { blogPosts } from "@/data/blogPosts";

const BlogIndex = () => {
  const [hero, ...rest] = blogPosts;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground">
              The Glohire Blog
            </span>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Ideas for the future of <span className="gradient-text">autonomous hiring</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Research, playbooks, and product updates from the team building the AI recruiter.
            </p>
          </div>

          {/* Featured */}
          <Link
            to={`/blog/${hero.slug}`}
            className="mt-14 grid lg:grid-cols-2 gap-8 group glass-card rounded-3xl overflow-hidden border border-border hover:border-primary/40 transition-all"
          >
            <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
              <img
                src={hero.image}
                alt={hero.title}
                width={1024}
                height={640}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-medium">
                  Featured · {hero.category}
                </span>
              </div>
              <h2 className="mt-4 font-display text-2xl sm:text-3xl font-bold leading-tight group-hover:text-primary transition-colors">
                {hero.title}
              </h2>
              <p className="mt-4 text-muted-foreground">{hero.excerpt}</p>
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <span>{hero.author}</span>
                <span>·</span>
                <span>{hero.date}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {hero.readTime}
                </span>
              </div>
            </div>
          </Link>

          {/* Grid */}
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group glass-card rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    width={1024}
                    height={640}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-background/80 backdrop-blur px-3 py-1 text-xs font-medium border border-border">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{post.date}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {post.readTime}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Read article
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogIndex;
