import { useEffect, useState } from 'react'
import { Routes, Route } from "react-router-dom";
import './App.css'
import Header from './components/Header'
import Navbar from './components/Navbar'
import ArticleMain from './components/ArticleMain'
import ArticleCarousel from './components/ArticleCarousel'
import ArticlePage from './components/ArticlePage';
import type { Article } from './types/article';

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles(): Promise<void> {
      try {
        const response = await fetch("/api/articles");

        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data: Article[] = await response.json();
        setArticles(data);
      } catch (fetchError) {
        console.error("Error fetching articles:", fetchError);
        setError("The latest edition could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  const mainArticle = articles[0];
  const carouselArticles = articles.slice(1);

  return (
    <div className="app-shell">
      <Header />
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <main className="homepage">
              {loading ? <p className="app-status">Loading the latest edition...</p> : null}
              {!loading && error ? <p className="app-status">{error}</p> : null}
              {!loading && !error && mainArticle ? (
                <>
                  <ArticleMain article={mainArticle} />
                  <ArticleCarousel articles={carouselArticles.length >= 5 ? carouselArticles : articles} />
                </>
              ) : null}
            </main>
          }
        />
        <Route
          path="/articles/:slug"
          element={<ArticlePage />}
        />
      </Routes>
    </div>
  )
}

export default App
