import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./styles/ArticleCarousel.css";
import type { Article } from "../types/article";

interface ArticleCarouselProps {
  articles: Article[];
}

function formatMeta(article: Article): string {
  if (article.author) {
    return article.author;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(article.published_at));
}

function getSummary(article: Article): string {
  const preview = article.preview ?? article.body;

  if (!preview) {
    return "";
  }

  return preview.replace(/\s+/g, " ").trim();
}

function ArticleCarousel({ articles }: ArticleCarouselProps) {
  const trackId = useId();
  const trackRef = useRef<HTMLUListElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const currentTrack = track;

    function updateScrollState(): void {
      const maxScrollLeft = currentTrack.scrollWidth - currentTrack.clientWidth;
      setCanScrollPrev(currentTrack.scrollLeft > 4);
      setCanScrollNext(currentTrack.scrollLeft < maxScrollLeft - 4);
    }

    updateScrollState();
    currentTrack.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      currentTrack.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [articles.length]);

  function scrollByAmount(direction: -1 | 1): void {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    track.scrollBy({
      left: track.clientWidth * 0.5 * direction,
      behavior: "smooth",
    });
  }

  return (
    <section
      aria-label="More top stories"
      className="article-carousel"
    >
      <div className="article-carousel__header">
        <div>
          <h3 className="article-carousel__heading">More Top Stories</h3>
          <p className="article-carousel__deck">
            News from across the Panhandle.
          </p>
        </div>
        <div className="article-carousel__controls" aria-label="Carousel controls">
          <button
            aria-controls={trackId}
            aria-label="Scroll to previous stories"
            className="article-carousel__button"
            disabled={!canScrollPrev}
            onClick={() => scrollByAmount(-1)}
            type="button"
          >
            &larr;
          </button>
          <button
            aria-controls={trackId}
            aria-label="Scroll to next stories"
            className="article-carousel__button"
            disabled={!canScrollNext}
            onClick={() => scrollByAmount(1)}
            type="button"
          >
            &rarr;
          </button>
        </div>
      </div>

      <div className="article-carousel__viewport">
        <ul className="article-carousel__track" id={trackId} ref={trackRef}>
          {articles.slice(0, 5).map((article) => {
            const summary = getSummary(article);
            const imageUrl = article.thumbnail_url ?? article.image_url;

            return (
              <li className="article-carousel__item" key={article.id ?? article.slug}>
                <Link className="article-card" to={`/articles/${article.slug}`}>
                  {imageUrl ? (
                    <div className="article-card__image">
                      <img
                        src={imageUrl}
                        alt={article.title}
                        onError={(event) => {
                          if (article.image_url && event.currentTarget.src !== article.image_url) {
                            event.currentTarget.src = article.image_url;
                          }
                        }}
                      />
                    </div>
                  ) : null}
                  <div className="article-card__body">
                    <p className="article-card__meta">{formatMeta(article)}</p>
                    <h4 className="article-card__title">{article.title}</h4>
                    {summary ? <p className="article-card__summary">{summary}</p> : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default ArticleCarousel;
