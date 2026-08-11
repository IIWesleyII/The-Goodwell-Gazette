import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./styles/ArticlePage.css";
import type { Article } from "../types/article";
import PaywallModal from "./PaywallModal";

function formatPublishedDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getStoredArticleAccess(slug: string): string | null {
  const stored = localStorage.getItem(`article-access:${slug}`);

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as {
      token: string;
      expiresAt: string;
    };

    if (!parsed.token || !parsed.expiresAt) {
      localStorage.removeItem(`article-access:${slug}`);
      return null;
    }

    const expiresAtMs = new Date(parsed.expiresAt).getTime();

    if (Date.now() >= expiresAtMs) {
      localStorage.removeItem(`article-access:${slug}`);
      return null;
    }

    return parsed.token;
  } catch {
    localStorage.removeItem(`article-access:${slug}`);
    return null;
  }
}

function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  useEffect(() => {
    async function fetchArticle(): Promise<void> {
      if (!slug) {
        setError("Article not found.");
        setLoading(false);
        return;
      }

      try {
        const storedToken = getStoredArticleAccess(slug);

        if (storedToken) {
          const paidResponse = await fetch(`/api/articles/${slug}`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (paidResponse.ok) {
            const paidArticle: Article = await paidResponse.json();
            setArticle(paidArticle);
            setShowPaywallModal(false);
            return;
          }

          localStorage.removeItem(`article-access:${slug}`);
        }

        const response = await fetch("/api/articles");

        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const articles: Article[] = await response.json();
        const matchingArticle = articles.find((article) => article.slug === slug);

        if (!matchingArticle) {
          setError("Article not found.");
          return;
        }

        setArticle(matchingArticle);
        setShowPaywallModal(true);
      } catch (fetchError) {
        console.error("Error fetching article:", fetchError);
        setError("This article could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [slug]);

  if (loading) {
    return <main className="article-page">Loading article...</main>;
  }

  if (error || !article) {
    return <main className="article-page">{error ?? "Article not found."}</main>;
  }

  const imageUrl = article.image_url ?? article.thumbnail_url;
  const articleText = article.body ?? article.preview;
  const isFullArticle = Boolean(article.body);

  return (
    <main className="article-page">
      <PaywallModal
        isOpen={showPaywallModal}
        slug={slug ?? ""}
        onClose={() => setShowPaywallModal(false)}
        onArticlePurchased={(paidArticle) => {
          setArticle(paidArticle);
          setShowPaywallModal(false);
        }}
      />

      <article className="article-page__article">
        {imageUrl ? (
          <div className="article-page__media">
            <img src={imageUrl} alt={article.title} />
          </div>
        ) : null}

        <div className="article-page__content">
          <p className="article-page__eyebrow">
            {isFullArticle ? "Full Article" : "Article Preview"}
          </p>

          <h1 className="article-page__title">{article.title}</h1>

          <div className="article-page__meta">
            <span>{article.author ?? "Goodwell Gazette Staff"}</span>
            <span>{formatPublishedDate(article.published_at)}</span>
          </div>

          {articleText ? (
            <p className="article-page__preview">{articleText}</p>
          ) : null}
        </div>
      </article>
    </main>
  );
}

export default ArticlePage;
