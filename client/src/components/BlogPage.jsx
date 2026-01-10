// src/components/BlogPage.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { FaClock, FaSearch, FaTimes, FaShareAlt, FaBookmark, FaArrowLeft, FaRocket } from "react-icons/fa";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "../Style/BlogPage.css";

const BlogPage = React.memo(() => {
  const [activeArticle, setActiveArticle] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [keyboardNavIndex, setKeyboardNavIndex] = useState(-1);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const cardRefs = useRef([]);

  const toggleBookmark = (articleTitle) => {
    setBookmarks(prev => 
      prev.includes(articleTitle) 
        ? prev.filter(t => t !== articleTitle) 
        : [...prev, articleTitle]
    );
  };

  const getTOC = (content) => {
    const lines = content.split("\n");
    return lines
      .filter(line => line.startsWith("## "))
      .map(line => line.replace("## ", ""));
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openArticle = (article) => {
    setActiveArticle(article);
    document.body.style.overflow = "hidden";
  };

  const closeArticle = () => {
    setActiveArticle(null);
    document.body.style.overflow = "auto";
    setKeyboardNavIndex(-1);
  };

  const shareArticle = (article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("Sharing is not supported in this browser. Link copied to clipboard!");
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const blogArticles = useMemo(() => [
    {
      title: "Getting Started with JustCoding AI Assistant",
      excerpt: "Learn how to use our AI assistant to write better code, debug faster, and learn programming concepts in minutes.",
      content: `JustCoding's AI Assistant is your personal coding companion. Here's how to make the most of it:

## Features:
1. Code Completion - Get intelligent suggestions as you type
2. Debugging Help - AI identifies and explains errors
3. Code Explanation - Understand complex code snippets

## Productivity Wins:
Using AI reduces debugging time by up to 40%. It's like having a senior developer pair-programming with you 24/7.`,
      author: "GitHub Copilot",
      date: "Feb 28, 2025",
      readTime: "5 min",
      tags: ["AI", "Productivity", "Guide"],
      category: "tutorial",
      featured: true
    },
    {
      title: "Modern UI Trends in Developer Tools",
      excerpt: "Exploring the rise of glassmorphism and minimal design in 2025 code editors.",
      content: `The developer experience (DX) has never been more visual. Let's explore why:

## Glassmorphism 2.0:
Modern tools use sophisticated backdrop filters and subtle borders to create depth without clutter.

## Typography Matters:
High-performance fonts like Fira Code or JetBrains Mono improve readability and reduce eye strain.

### Why Design Matters for Devs:
- Better focus
- Reduced cognitive load
- Just looks cooler!`,
      author: "Design Lead",
      date: "Feb 25, 2025",
      readTime: "4 min",
      tags: ["UI/UX", "Design", "Frontend"],
      category: "update"
    },
    {
      title: "Optimizing React Performance in 2025",
      excerpt: "Master the latest React features to build blazing fast web applications.",
      content: `React continues to evolve. Here's how to keep your apps fast:

## Key Techniques:
- Use Server Components for initial load
- Leverage the 'use' hook for data fetching
- Optimize re-renders with automatic memoization

### Example Code:
\`\`\`javascript
const SlowComponent = () => {
  const data = use(fetchData());
  return <div>{data.title}</div>;
};
\`\`\``,
      author: "React Expert",
      date: "Feb 20, 2025",
      readTime: "8 min",
      tags: ["React", "Performance", "Frontend"],
      category: "tools"
    },
    {
      title: "Clean Code Principles for JavaScript",
      excerpt: "Write maintainable, readable JavaScript code using these clean code principles.",
      content: `## Clean JavaScript Guidelines:

### Naming Conventions:
- Use camelCase for variables/functions
- Use PascalCase for classes/components
- Use UPPER_CASE for constants

### Function Rules:
- Keep functions small (max 20 lines)
- One responsibility per function
- Use descriptive names
- Limit parameters (max 3)

### Code Structure:
- Group related functions
- Use consistent formatting
- Add meaningful comments
- Remove dead code`,
      author: "JustCoding Team",
      date: "Feb 15, 2025",
      readTime: "7 min",
      tags: ["JavaScript", "Best Practices", "Clean Code"],
      category: "tutorial"
    },
    {
      title: "Debugging Like a Pro in JustCoding",
      excerpt: "Master the debugging tools in JustCoding to find and fix bugs faster.",
      content: `## Debugging Tools:

### 1. Breakpoints
- Set breakpoints by clicking line numbers
- Use conditional breakpoints
- View variable values on hover

### 2. Console
- Interactive JavaScript console
- Log messages with console.log()
- View errors and warnings

### 3. Step Debugging
- Step Into functions
- Step Over lines
- Step Out of functions

## Pro Tips:
- Use console.table() for arrays
- Utilize debugger statement
- Check browser console for errors`,
      author: "Anu Soni",
      date: "Feb 10, 2025",
      readTime: "5 min",
      tags: ["Debugging", "Tools", "Tips"],
      category: "tutorial"
    }
  ], []);

  const filteredArticles = useMemo(() => (
    activeFilter === "all" 
      ? blogArticles 
      : blogArticles.filter(article => article.category === activeFilter)
  ), [activeFilter, blogArticles]);

  const searchedArticles = useMemo(() => (
    searchQuery 
      ? filteredArticles.filter(article => 
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : filteredArticles
  ), [searchQuery, filteredArticles]);

  const featuredArticle = useMemo(() => (
    blogArticles.find(a => a.featured) || blogArticles[0]
  ), [blogArticles]);

  const displayArticles = useMemo(() => (
    searchedArticles.filter(a => a !== (searchQuery ? null : (activeFilter === "all" ? featuredArticle : null)))
  ), [searchedArticles, searchQuery, activeFilter, featuredArticle]);

  // Keyboard navigation logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeArticle) return; // Don't navigate while reading

      switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          setKeyboardNavIndex(prev => Math.min(prev + 1, displayArticles.length - 1));
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          setKeyboardNavIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          if (keyboardNavIndex >= 0) {
            openArticle(displayArticles[keyboardNavIndex]);
          }
          break;
        case 'Escape':
          setKeyboardNavIndex(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayArticles, activeArticle, keyboardNavIndex]);

  useEffect(() => {
    if (keyboardNavIndex >= 0 && cardRefs.current[keyboardNavIndex]) {
        cardRefs.current[keyboardNavIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [keyboardNavIndex]);

  return (
    <div className="blog-container">
      {/* Visual Enhancements: Particles */}
      <div className="particles-container">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 15 + 10}px`,
              height: `${Math.random() * 15 + 10}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>

      {/* Background Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      {/* Floating Progress Bar */}
      <div className="progress-bar-container">
        <motion.div className="progress-bar" style={{ scaleX }} />
      </div>

      <header className="blog-header">
        <motion.h1
          className="blog-title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Developer <span style={{ color: "var(--blog-primary)" }}>Hub</span>
        </motion.h1>
        <motion.p 
          className="blog-subtitle"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Your ultimate destination for tech updates, coding tutorials, and industry insights.
        </motion.p>
      </header>

      {/* Featured Entry */}
      {featuredArticle && !searchQuery && activeFilter === "all" && (
        <section className="blog-hero-section" aria-labelledby="featured-post-title">
          <motion.div 
            className="hero-card"
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => openArticle(featuredArticle)}
            role="button"
            tabIndex="0"
            onKeyDown={(e) => e.key === 'Enter' && openArticle(featuredArticle)}
          >
            <div className="hero-image-wrapper">
              <FaRocket aria-hidden="true" />
            </div>
            <div className="hero-content">
              <span className="hero-badge">Featured Post</span>
              <h2 id="featured-post-title" className="hero-title">{featuredArticle.title}</h2>
              <p className="hero-excerpt">{featuredArticle.excerpt}</p>
              <div className="card-footer">
                <div className="author-meta">
                  <div className="author-avatar">{featuredArticle.author.charAt(0)}</div>
                  <span className="author-name">{featuredArticle.author}</span>
                </div>
                <span className="reading-time">
                  <FaClock /> {featuredArticle.readTime}
                </span>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Search and Filter */}
      <section className="blog-search-section">
        <div className="blog-search-container">
          <div className="blog-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search the hub..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="blog-search-input"
            />
          </div>
          
          <div className="blog-filter-container">
            {["all", "tutorial", "update", "tools"].map((filter) => (
              <motion.button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`blog-filter-btn ${activeFilter === filter ? "active" : ""}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    background: activeFilter === filter ? "linear-gradient(90deg, #6366f1, #8b5cf6)" : "rgba(255, 255, 255, 0.05)",
                    color: "#fff",
                    padding: "0.5rem 1.5rem",
                    borderRadius: "50px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    cursor: "pointer"
                }}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="blog-list-section" aria-label="Articles Grid">
        <div className="blog-masonry-grid" role="list">
          <AnimatePresence>
            {displayArticles.map((article, index) => (
              <motion.div
                key={article.title}
                ref={el => cardRefs.current[index] = el}
                layoutId={`card-${article.title}`}
                className={`blog-card ${keyboardNavIndex === index ? "kb-active" : ""}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => openArticle(article)}
                role="listitem"
                tabIndex="0"
                aria-label={`Read article: ${article.title}`}
                whileHover={{ y: -5 }}
              >
                {index === 0 && <div className="card-new-tag">New</div>}
                <div className={`card-category-badge category-${article.category}`}>
                  {article.category}
                </div>
                <h3 className="card-title">{article.title}</h3>
                <p className="card-excerpt">{article.excerpt}</p>
                <div className="card-footer">
                  <span className="reading-time">
                    <FaClock aria-hidden="true" /> {article.readTime}
                  </span>
                  <div className="author-meta">
                    <span className="author-name">{article.author}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Advanced Reading Mode Overlay */}
      <AnimatePresence>
        {activeArticle && (
          <motion.div 
            className="article-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button className="close-article" onClick={closeArticle}>
              <FaTimes />
            </button>

            <div className="article-layout">
              <aside className="article-sidebar">
                <button className="action-btn" onClick={closeArticle} style={{ marginBottom: "2rem" }}>
                  <FaArrowLeft /> Back to Hub
                </button>
                
                <div className="sidebar-section">
                  <h4 className="sidebar-title">Table of Contents</h4>
                  <ul className="toc-list">
                    {getTOC(activeArticle.content).map((item, i) => (
                      <li 
                        key={i} 
                        className="toc-item"
                        onClick={() => scrollToSection(`section-${i}`)}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="sidebar-section">
                  <h4 className="sidebar-title">Actions</h4>
                  <div className="article-actions">
                    <button 
                      className="action-btn" 
                      onClick={() => toggleBookmark(activeArticle.title)}
                      style={{ color: bookmarks.includes(activeArticle.title) ? "#8b5cf6" : "white" }}
                    >
                      <FaBookmark /> {bookmarks.includes(activeArticle.title) ? "Saved" : "Save"}
                    </button>
                    <button className="action-btn" onClick={() => shareArticle(activeArticle)}>
                      <FaShareAlt /> Share
                    </button>
                  </div>
                </div>
              </aside>

              <motion.div 
                className="article-container"
                layoutId={`card-${activeArticle.title}`}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <header className="article-header">
                  <div className={`card-category-badge category-${activeArticle.category}`}>
                    {activeArticle.category}
                  </div>
                  <h1 className="article-full-title">{activeArticle.title}</h1>
                  <div className="author-meta" style={{ marginBottom: "2rem" }}>
                    <div className="author-avatar" style={{ width: "48px", height: "48px", fontSize: "1.2rem" }}>
                      {activeArticle.author.charAt(0)}
                    </div>
                    <div>
                      <div className="author-name" style={{ fontSize: "1.1rem" }}>{activeArticle.author}</div>
                      <div className="reading-time">{activeArticle.date} • {activeArticle.readTime} read</div>
                    </div>
                  </div>
                </header>

                <div className="article-content">
                  {activeArticle.content.split("\n\n").map((block, idx) => {
                    if (block.startsWith("## ")) {
                      const sectionId = `section-${getTOC(activeArticle.content).indexOf(block.replace("## ", ""))}`;
                      return <h2 key={idx} id={sectionId}>{block.replace("## ", "")}</h2>;
                    } else if (block.startsWith("### ")) {
                      return <h3 key={idx}>{block.replace("### ", "")}</h3>;
                    } else if (block.startsWith("```")) {
                      const lines = block.split("\n");
                      const language = lines[0].replace("```", "") || "javascript";
                      const code = lines.slice(1, -1).join("\n");
                      return (
                        <div key={idx} className="code-block-container">
                          <SyntaxHighlighter 
                            language={language} 
                            style={atomDark}
                            customStyle={{ margin: 0, padding: "1.5rem" }}
                          >
                            {code}
                          </SyntaxHighlighter>
                        </div>
                      );
                    } else if (block.startsWith("- ")) {
                      return (
                          <ul key={idx}>
                              {block.split("\n").map((li, i) => (
                                  <li key={i}>{li.replace("- ", "")}</li>
                              ))}
                          </ul>
                    );
                  } else {
                    return <p key={idx}>{block}</p>;
                  }
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Newsletter CTA */}
    <motion.section 
      className="blog-newsletter"
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="newsletter-title">Stay Ahead of the Curve</h2>
      <p className="newsletter-text">
        Join 10,000+ developers receiving our weekly newsletter on performance, AI, and the future of coding.
      </p>
      <div className="blog-newsletter-form">
        <input type="email" placeholder="Your email address" className="blog-newsletter-input" />
        <motion.button
          className="blog-subscribe-btn"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(99, 102, 241, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          style={{
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              color: "white",
              border: "none",
              padding: "1rem 2rem",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer"
          }}
        >
          Subscribe
        </motion.button>
      </div>
    </motion.section>

    </div>
  );
});

export default BlogPage;
