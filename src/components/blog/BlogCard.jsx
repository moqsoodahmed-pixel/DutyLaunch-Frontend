import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge.jsx';
import { formatDate } from '../../utils/format.js';

import { cn } from '../../utils/cn.js';

export function BlogCard({ post, featured = false, tone = 'light' }) {
  const dark = tone === 'dark';

  if (featured) {
    return (
      <article className={cn(
        "group relative grid gap-6 rounded-xl p-6 lg:grid-cols-12 lg:p-8",
        dark ? "border border-night-line bg-night-card text-white" : "border border-line bg-white"
      )}>
        <div className="lg:col-span-7">
          <Badge tone={dark ? "frost" : "azure"}>{post.category}</Badge>
          <h2 className={cn("mt-4 text-h2 font-bold", dark ? "text-white" : "text-ink")}>
            <Link to={`/blog/${post.slug}`} className="before:absolute before:inset-0">
              {post.title}
            </Link>
          </h2>
          <p className={cn("mt-3 max-w-prose text-lead", dark ? "text-slate-300" : "text-slate-600")}>{post.excerpt}</p>
        </div>
        <div className="flex items-end lg:col-span-4 lg:col-start-9">
          <p className={cn("text-small", dark ? "text-slate-400" : "text-slate-500")}>
            {formatDate(post.publishedAt)} · {post.readingMinutes} min read
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className={cn(
      "group relative flex flex-col rounded-xl p-5 transition-all duration-300",
      dark
        ? "border border-night-line bg-night-card shadow-crystal text-white hover:border-frost-300/60 hover:-translate-y-1"
        : "border border-line bg-white hover:border-slate-300"
    )}>
      <Badge tone={dark ? "frost" : "outline"}>{post.category}</Badge>
      <h3 className={cn("mt-3.5 text-h3 font-bold leading-snug", dark ? "text-white group-hover:text-frost-300 transition-colors" : "text-ink")}>
        <Link to={`/blog/${post.slug}`} className="before:absolute before:inset-0">
          {post.title}
        </Link>
      </h3>
      <p className={cn("mt-2.5 flex-1 text-small", dark ? "text-slate-300" : "text-slate-600")}>{post.excerpt}</p>
      <p className={cn("mt-5 border-t pt-3.5 text-caption", dark ? "border-white/10 text-slate-400" : "border-line text-slate-500")}>
        {formatDate(post.publishedAt)} · {post.readingMinutes} min read
      </p>
    </article>
  );
}
