import { Link } from "react-router-dom";
import "./styles/ArticleMain.css";
import type { Article } from "../types/article";

interface ArticleMainProps {
  article: Article;
}

function formatPublishedDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function ArticleMain({ article }: ArticleMainProps) {
  const summary = article.preview?.trim() ?? article.body?.trim();
  const imageUrl = article.image_url ?? article.thumbnail_url;

  return (
    <article className="article-main">
      {imageUrl ? (
        <div className="article-main__media">
          <img src={imageUrl} alt={article.title} />
        </div>
      ) : null}
      <div className="article-main__content">
        <p className="article-main__eyebrow">Lead Story</p>
        <h2 className="article-main__title">{article.title}</h2>
        <div className="article-main__meta">
          <span>{article.author ?? "Goodwell Gazette Staff"}</span>
          <span>{formatPublishedDate(article.published_at)}</span>
        </div>
        {summary ? <p className="article-main__summary">{summary}</p> : null}
        <Link className="article-main__link" to={`/articles/${article.slug}`}>
          Read article
        </Link>
      </div>
    </article>
  );
}

export default ArticleMain;
