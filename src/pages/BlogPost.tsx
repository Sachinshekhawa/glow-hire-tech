import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Share2 } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { blogPosts, getPostBySlug } from "@/data/blogPosts";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      <main className="pt-28 pb-24">
        <article className="container max-w-3xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to all posts
          </Link>

          <div className="mt-8">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
              {post.category}
            </span>
            <h1 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              {post.title}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">{post.excerpt}</p>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {post.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{post.author}</p>
                  <p className="text-xs text-muted-foreground">{post.authorRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{post.date}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {post.readTime}
                </span>
                <button
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => navigator.share?.({ title: post.title, url: window.location.href }).catch(() => {})}
                >
                  <Share2 className="h-3 w-3" /> Share
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl overflow-hidden border border-border">
            <img
              src={post.image}
              alt={post.title}
              width={1024}
              height={640}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="mt-12 space-y-8">
            {post.content.map((block, i) => (
              <div key={i}>
                {block.heading && (
                  <h2 className="font-display text-2xl font-bold mb-3">{block.heading}</h2>
                )}
                <p className="text-base leading-relaxed text-muted-foreground">
                  {block.paragraph}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 glass-card rounded-2xl border border-border p-8 text-center">
            <h3 className="font-display text-2xl font-bold">
              Build your <span className="gradient-text">autonomous hiring engine</span>
            </h3>
            <p className="mt-3 text-muted-foreground">
              See how Glohire can cut your time-to-hire by 70% in a personalized demo.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/#cta">Book a Demo</Link>
              </Button>
              <Button variant="outline-glow" size="lg" asChild>
                <Link to="/blog">More articles</Link>
              </Button>
            </div>
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="container mt-24">
            <h2 className="font-display text-2xl font-bold mb-8">Continue reading</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="group glass-card rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      width={1024}
                      height={640}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs text-muted-foreground">{p.category}</span>
                    <h3 className="mt-2 font-display text-lg font-semibold group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                      Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
