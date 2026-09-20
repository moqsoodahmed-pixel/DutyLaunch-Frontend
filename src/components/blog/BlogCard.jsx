import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge.jsx';
import { formatDate } from '../../utils/format.js';

export function BlogCard({ post, featured = false }) {
  if (featured) {
    return (
      <article className="group relative grid gap-6 rounded-lg border border-line bg-white p-6 lg:grid-cols-12 lg:p-8">
        <div className="lg:col-span-7">
          <Badge tone="azure">{post.category}</Badge>
          <h2 className="mt-4 text-h2 font-bold">
            <Link to={`/blog/${post.slug}`} className="before:absolute before:inset-0">
              {post.title}
            </Link>
          </h2>
          <p className="mt-3 max-w-prose text-lead text-slate-600">{post.excerpt}</p>
        </div>
        <div className="flex items-end lg:col-span-4 lg:col-start-9">
          <p className="text-small text-slate-500">
            {formatDate(post.publishedAt)} · {post.readingMinutes} min read
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col rounded-lg border border-line bg-white p-5 transition-colors hover:border-slate-300">
      <Badge tone="outline">{post.category}</Badge>
      <h3 className="mt-3.5 text-h3 font-bold leading-snug">
        <Link to={`/blog/${post.slug}`} className="before:absolute before:inset-0">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2.5 flex-1 text-small text-slate-600">{post.excerpt}</p>
      <p className="mt-5 border-t border-line pt-3.5 text-caption text-slate-500">
        {formatDate(post.publishedAt)} · {post.readingMinutes} min read
      </p>
    </article>
  );
}
