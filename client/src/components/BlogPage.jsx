// src/components/BlogPage.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaCalendar, FaUser, FaClock, FaTags, FaArrowRight, FaSearch, FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BlogPage = () => {
  const [activeArticle, setActiveArticle] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const openArticle = (index) => {
    setActiveArticle(activeArticle === index ? null : index);
  };

  const blogArticles = [
    {
      title: "Getting Started with JustCoding AI Assistant",
      excerpt: "Learn how to use our AI assistant to write better code, debug faster, and learn programming concepts in minutes.",
      content: `JustCoding's AI Assistant is your personal coding companion. Here's how to make the most of it:

## Features:
1. Code Completion - Get intelligent suggestions as you type
2. Debugging Help - AI identifies and explains errors
3. Code Explanation - Understand complex code snippets
4. Best Practices - Learn industry-standard coding patterns

## Pro Tips:
- Use comments to ask specific questions
- Press Ctrl+Space for AI suggestions
- Click the robot icon for instant help`,
      author: "Anu Soni",
      date: "Mar 15, 2025",
      readTime: "5 min",
      tags: ["AI", "Tutorial", "Beginners"],
      category: "tutorial",
      featured: true
    },
    {
      title: "Collaborative Coding Best Practices",
      excerpt: "Master real-time collaboration with your team using JustCoding's powerful collaboration features.",
      content: `Real-time collaboration is at the heart of JustCoding. Here are best practices:

## Session Management:
1. Create named sessions for different projects
2. Set permissions (view/edit) appropriately
3. Use session templates for recurring meetings

## Collaboration Tips:
- Assign different colors to team members
- Use @mentions to get attention
- Enable notifications for changes
- Regularly save shared sessions`,
      author: "Team JustCoding",
      date: "Mar 10, 2025",
      readTime: "4 min",
      tags: ["Collaboration", "Teams", "Productivity"],
      category: "tutorial",
      featured: true
    },
    {
      title: "10 VS Code Extensions You Can Use in JustCoding",
      excerpt: "Discover how JustCoding integrates with popular VS Code extensions to enhance your coding experience.",
      content: `JustCoding supports many VS Code-like extensions:

## Essential Extensions:
1. ES7+ React/Redux Snippets - React development
2. Prettier - Code formatting
3. GitLens - Git integration
4. Live Share - Enhanced collaboration
5. Material Icon Theme - Better file icons

## How to Enable:
1. Go to Settings → Extensions
2. Search for your favorite extensions
3. Click Install and restart editor`,
      author: "Anu Soni",
      date: "Mar 5, 2025",
      readTime: "6 min",
      tags: ["VS Code", "Extensions", "Tools"],
      category: "tools"
    },
    {
      title: "JavaScript Tips & Tricks for Beginners",
      excerpt: "Level up your JavaScript skills with these essential tips and hidden features.",
      content: `## Modern JavaScript Features:

### 1. Optional Chaining
\`\`\`javascript
// Safe property access
const name = user?.profile?.name;
\`\`\`

### 2. Nullish Coalescing
\`\`\`javascript
// Default values
const count = input ?? 0;
\`\`\`

### 3. Array Methods
- Use map() for transformations
- Use filter() for selections
- Use reduce() for aggregations`,
      author: "JustCoding Team",
      date: "Feb 28, 2025",
      readTime: "8 min",
      tags: ["JavaScript", "Tips", "Programming"],
      category: "tutorial"
    },
    {
      title: "New Feature: Real-time Collaboration",
      excerpt: "We've launched real-time collaboration! Work with your team simultaneously on the same code.",
      content: `## What's New:

### 🎯 Real-time Features:
- Multi-user editing - See teammates' cursors
- Live chat - Discuss code in real-time
- Version history - Track all changes
- Export options - Save to multiple formats

### 🚀 How to Use:
1. Click "Collaborate" button
2. Share the room link
3. Start coding together
4. Save your session`,
      author: "JustCoding Team",
      date: "Feb 25, 2025",
      readTime: "3 min",
      tags: ["Update", "Collaboration", "New"],
      category: "update"
    },
    {
      title: "JustCoding Now Supports Python 3.11",
      excerpt: "We've added support for Python 3.11 with all its new features and improvements.",
      content: `## Python 3.11 Features Now Available:

### Performance Improvements:
- Faster execution - Up to 60% faster
- Better error messages - More informative
- New typing features - Enhanced type hints

### New Syntax Features:
\`\`\`python
# Exception groups
try:
    ...
except* ValueError as e:
    # Handle ValueError group
    pass
\`\`\`

### Updated Libraries:
- All standard libraries updated
- Popular packages pre-installed`,
      author: "Anu Soni",
      date: "Feb 20, 2025",
      readTime: "4 min",
      tags: ["Python", "Update", "Languages"],
      category: "update"
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
  ];

  const filteredArticles = activeFilter === "all" 
    ? blogArticles 
    : blogArticles.filter(article => article.category === activeFilter);

  const searchedArticles = searchQuery 
    ? filteredArticles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : filteredArticles;

  return (
        <motion.div 
        className="faq-container blog-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ 
            paddingTop: '80px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}
        >
      <header className="faq-header blog-header">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="faq-title blog-title"
          style={{ 
           
            textAlign: 'center',
           
        }}
        >
          Just<span className="highlight">Coding</span> Blog
        </motion.h1>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="faq-subtitle blog-subtitle"
        >
          Tutorials, updates, and coding tips from the JustCoding team
        </motion.p>
      </header>

      {/* Search and Filter */}
      <motion.section 
        className="blog-search-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="blog-search-container">
          <div className="blog-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="blog-search-input"
            />
          </div>
          
          <div className="blog-filter-container">
            <FaFilter />
            {["all", "tutorial", "update", "tools"].map((filter) => (
              <motion.button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`blog-filter-btn ${activeFilter === filter ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Blog Articles List */}
      <section className="blog-list-section">
        <h2 className="blog-section-title">
          {searchedArticles.length} Articles Found
          {searchQuery && ` for "${searchQuery}"`}
        </h2>
        
        <div className="blog-list">
          <AnimatePresence>
            {searchedArticles.map((article, index) => (
              <motion.div
                key={index}
                className="blog-item-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <button
                  onClick={() => openArticle(index)}
                  className="blog-question-btn"
                >
                  <div className="blog-question-content">
                    <div className="blog-article-header">
                      <h3 className="blog-article-title">{article.title}</h3>
                      <div className="blog-meta">
                        <span><FaUser /> {article.author}</span>
                        <span><FaCalendar /> {article.date}</span>
                        <span><FaClock /> {article.readTime} read</span>
                      </div>
                    </div>
                    <p className="blog-excerpt">{article.excerpt}</p>
                    <div className="blog-tags">
                      {article.tags.map(tag => (
                        <span key={tag} className="blog-tag">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <motion.div
                    className="faq-chevron"
                    animate={{ rotate: activeArticle === index ? 180 : 0 }}
                  >
                    <FaChevronDown />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {activeArticle === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="blog-answer-container"
                    >
                      <div className="blog-answer-content">
                        <div className="blog-full-meta">
                          <div className="blog-author-info">
                            <div className="blog-author-avatar">
                              {article.author.charAt(0)}
                            </div>
                            <div>
                              <h4>{article.author}</h4>
                              <p>{article.date} • {article.readTime} min read</p>
                            </div>
                          </div>
                          <div className="blog-article-tags">
                            <FaTags />
                            {article.tags.map(tag => (
                              <span key={tag} className="blog-full-tag">#{tag}</span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="blog-full-content">
                          {article.content.split('\n').map((line, idx) => {
                            if (line.startsWith('## ')) {
                              return <h3 key={idx}>{line.replace('## ', '')}</h3>;
                            } else if (line.startsWith('### ')) {
                              return <h4 key={idx}>{line.replace('### ', '')}</h4>;
                            } else if (line.startsWith('- ')) {
                              return <li key={idx}>{line.replace('- ', '')}</li>;
                            } else if (line.startsWith('```')) {
                              return null; // Skip code block markers
                            } else if (line.trim() === '') {
                              return <br key={idx} />;
                            } else {
                              return <p key={idx}>{line}</p>;
                            }
                          })}
                        </div>
                        
                        <div className="blog-article-footer">
                          <button 
                            className="blog-back-btn"
                            onClick={() => setActiveArticle(null)}
                          >
                            Back to Articles
                          </button>
                          <div className="blog-share-options">
                            <button className="blog-share-btn">Share</button>
                            <button className="blog-save-btn">Save</button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Newsletter CTA */}
      <motion.section 
        className="faq-contact-section blog-newsletter"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h2 className="faq-contact-title">Stay Updated</h2>
        <p className="faq-contact-text">
          Get the latest tutorials, updates, and coding tips delivered to your inbox.
        </p>
        <div className="blog-newsletter-form">
          <input type="email" placeholder="Your email address" className="blog-newsletter-input" />
          <motion.button
            className="faq-contact-button blog-subscribe-btn"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(99, 102, 241, 0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            Subscribe
          </motion.button>
        </div>
        <p className="faq-contact-footer">
          No spam ever. Unsubscribe anytime.
        </p>
      </motion.section>

      {/* Add Blog-specific CSS */}
      <style jsx>{`
        .blog-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .blog-title {
          font-size: 3.5rem;
        }
        
        .blog-subtitle {
          font-size: 1.2rem;
          color: #94a3b8;
          max-width: 600px;
          margin: 0 auto 2rem;
        }
        
        .blog-featured-section {
          margin: 4rem 0;
        }
        
        .blog-section-title {
          font-size: 2rem;
          margin-bottom: 2rem;
          color: #fff;
          border-left: 4px solid #6366f1;
          padding-left: 1rem;
        }
        
        .blog-featured-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }
        
        .blog-featured-card {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
        }
        
        .featured-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .blog-featured-content h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #fff;
        }
        
        .blog-featured-content p {
          color: #cbd5e1;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        .blog-meta {
          display: flex;
          gap: 1rem;
          color: #94a3b8;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        
        .blog-meta span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .blog-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        
        .blog-tag {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.85rem;
        }
        
        .blog-read-btn {
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .blog-read-btn:hover {
          transform: translateX(5px);
        }
        
        .blog-search-section {
          margin-bottom: 3rem;
        }
        
        .blog-search-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .blog-search-box {
          display: flex;
          align-items: center;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 50px;
          padding: 0.75rem 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .blog-search-box svg {
          color: #94a3b8;
          margin-right: 0.75rem;
        }
        
        .blog-search-input {
          background: none;
          border: none;
          color: white;
          flex: 1;
          font-size: 1rem;
          outline: none;
        }
        
        .blog-filter-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .blog-filter-container svg {
          color: #94a3b8;
        }
        
        .blog-filter-btn {
          padding: 0.5rem 1.5rem;
          border-radius: 50px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .blog-filter-btn.active {
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          color: #fff;
        }
        
        .blog-list-section {
          margin-bottom: 4rem;
        }
        
        .blog-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .blog-item-card {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .blog-question-btn {
          width: 100%;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          text-align: left;
        }
        
        .blog-question-content {
          flex: 1;
        }
        
        .blog-article-header {
          margin-bottom: 1rem;
        }
        
        .blog-article-title {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
          color: #fff;
        }
        
        .blog-excerpt {
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .blog-answer-container {
          overflow: hidden;
        }
        
        .blog-answer-content {
          padding: 0 1.5rem 1.5rem;
          color: #cbd5e1;
          line-height: 1.6;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 1rem;
          padding-top: 1.5rem;
        }
        
        .blog-full-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .blog-author-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .blog-author-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
        }
        
        .blog-author-info h4 {
          margin: 0;
          color: #fff;
        }
        
        .blog-author-info p {
          margin: 0;
          color: #94a3b8;
          font-size: 0.9rem;
        }
        
        .blog-article-tags {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .blog-article-tags svg {
          color: #94a3b8;
        }
        
        .blog-full-tag {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.85rem;
        }
        
        .blog-full-content {
          margin-bottom: 2rem;
        }
        
        .blog-full-content h3 {
          color: #fff;
          margin: 2rem 0 1rem;
          font-size: 1.5rem;
        }
        
        .blog-full-content h4 {
          color: #cbd5e1;
          margin: 1.5rem 0 1rem;
          font-size: 1.2rem;
        }
        
        .blog-full-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }
        
        .blog-full-content li {
          margin-bottom: 0.5rem;
          margin-left: 1.5rem;
        }
        
        .blog-article-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .blog-back-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .blog-back-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .blog-share-options {
          display: flex;
          gap: 0.5rem;
        }
        
        .blog-share-btn, .blog-save-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .blog-share-btn {
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          color: white;
        }
        
        .blog-save-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        
        .blog-newsletter {
          text-align: center;
        }
        
        .blog-newsletter-form {
          display: flex;
          gap: 1rem;
          max-width: 500px;
          margin: 2rem auto;
        }
        
        .blog-newsletter-input {
          flex: 1;
          padding: 1rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(30, 41, 59, 0.5);
          color: white;
          font-size: 1rem;
          outline: none;
        }
        
        .blog-subscribe-btn {
          padding: 1rem 2rem;
        }
        
        @media (max-width: 768px) {
          .blog-title {
            font-size: 2.5rem;
          }
          
          .blog-featured-grid {
            grid-template-columns: 1fr;
          }
          
          .blog-full-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          
          .blog-article-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          
          .blog-newsletter-form {
            flex-direction: column;
          }
        }
        
        @media (max-width: 480px) {
          .blog-title {
            font-size: 2rem;
          }
          
          .blog-question-btn {
            padding: 1rem;
          }
          
          .blog-meta {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default BlogPage;