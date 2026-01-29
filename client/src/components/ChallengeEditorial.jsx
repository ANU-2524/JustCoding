import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const ChallengeEditorial = () => {
  const { slug } = useParams();
  const [editorial, setEditorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334'}/api/challenges/${slug}/editorial`)
      .then(res => {
        if (!res.ok) throw new Error('Editorial not found');
        return res.json();
      })
      .then(data => setEditorial(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Loading editorial...</div>;
  if (error) return <div style={{color:'red'}}>Editorial not available. <Link to={`/challenges/${slug}`}>Back to Challenge</Link></div>;
  if (!editorial) return <div>No editorial found.</div>;

  return (
    <div
      style={{
        maxWidth: 700,
        margin: '4.5rem auto 2rem auto',
        padding: 24,
        background: '#18181b',
        borderRadius: 12,
        boxShadow: '0 2px 8px #0008',
        overflow: 'auto',
        color: '#f3f4f6',
        fontSize: 17,
        lineHeight: 1.7
      }}
    >
      <h1 style={{ marginBottom: 16, color: '#a5b4fc' }}>Editorial & Hints</h1>
      {editorial.editorial ? (
        <ReactMarkdown
          components={{
            code({node, inline, className, children, ...props}) {
              return (
                <code
                  style={{
                    background: '#27272a',
                    color: '#facc15',
                    borderRadius: 6,
                    padding: '2px 6px',
                    fontSize: 15
                  }}
                  {...props}
                >{children}</code>
              );
            },
            h2({children}) {
              return <h2 style={{color:'#f472b6',marginTop:28}}>{children}</h2>;
            },
            strong({children}) {
              return <strong style={{color:'#facc15'}}>{children}</strong>;
            }
          }}
        >
          {editorial.editorial}
        </ReactMarkdown>
      ) : (
        <div>No editorial content available.</div>
      )}
      {editorial.hints && editorial.hints.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ color: '#f472b6' }}>Hints</h2>
          <ul>
            {editorial.hints.map((hint, i) => (
              <li key={i} style={{ color: '#f3f4f6', marginBottom: 6 }}>{hint}</li>
            ))}
          </ul>
        </div>
      )}
      <div style={{ marginTop: 32 }}>
        <Link to={`/challenges/${slug}`} style={{ color: '#a5b4fc' }}>Back to Challenge</Link>
      </div>
    </div>
  );
};

export default ChallengeEditorial;
