import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCalendar, FaEye, FaUser } from 'react-icons/fa';
import { getBlogBySlug } from '../services/api';
import Navbar from '../components/Navbar';
import './BlogDetail.css';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBlog();
  }, [slug]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      const response = await getBlogBySlug(slug);
      setBlog(response.data);
    } catch (error) {
      console.error('Error loading blog:', error);
      setError(error.response?.status === 404 ? 'Blog post not found' : 'Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="blog-detail-page">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading blog post...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !blog) {
    return (
      <>
        <Navbar />
        <div className="blog-detail-page">
          <div className="error-container">
            <h1>404</h1>
            <p>{error || 'Blog post not found'}</p>
            <Link to="/blog" className="btn-back">
              <FaArrowLeft /> Back to Blog
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="blog-detail-page">
        <motion.article
          className="blog-detail-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/blog" className="back-link">
            <FaArrowLeft /> Back to Blog
          </Link>

          {blog.featured_image && (
            <div className="blog-featured-image">
              <img src={blog.featured_image} alt={blog.title} />
            </div>
          )}

          <header className="blog-header">
            <h1>{blog.title}</h1>

            <div className="blog-meta">
              {blog.author && (
                <span className="meta-item">
                  <FaUser /> {blog.author}
                </span>
              )}
              <span className="meta-item">
                <FaCalendar /> {formatDate(blog.published_at || blog.created_at)}
              </span>
              <span className="meta-item">
                <FaEye /> {blog.views} views
              </span>
            </div>

            {blog.tags && (
              <div className="blog-tags">
                {blog.tags.split(',').map((tag, i) => (
                  <span key={i} className="blog-tag">{tag.trim()}</span>
                ))}
              </div>
            )}
          </header>

          {blog.excerpt && (
            <div className="blog-excerpt">
              <p>{blog.excerpt}</p>
            </div>
          )}

          <div className="blog-content">
            {blog.content.split('\n').map((paragraph, index) => {
              // Skip empty paragraphs
              if (paragraph.trim() === '') return null;

              // Check if paragraph is a heading (starts with #)
              if (paragraph.startsWith('# ')) {
                return <h2 key={index}>{paragraph.substring(2)}</h2>;
              }
              if (paragraph.startsWith('## ')) {
                return <h3 key={index}>{paragraph.substring(3)}</h3>;
              }
              if (paragraph.startsWith('### ')) {
                return <h4 key={index}>{paragraph.substring(4)}</h4>;
              }

              // Check if paragraph is a list item
              if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                return (
                  <ul key={index}>
                    <li>{paragraph.substring(2)}</li>
                  </ul>
                );
              }

              // Check if paragraph is a code block (starts with ```)
              if (paragraph.startsWith('```')) {
                return (
                  <pre key={index}>
                    <code>{paragraph.substring(3)}</code>
                  </pre>
                );
              }

              // Regular paragraph
              return <p key={index}>{paragraph}</p>;
            })}
          </div>

          <footer className="blog-footer">
            <div className="blog-footer-meta">
              <p>Published on {formatDate(blog.published_at || blog.created_at)}</p>
              {blog.updated_at && new Date(blog.updated_at) > new Date(blog.created_at) && (
                <p>Last updated: {formatDate(blog.updated_at)}</p>
              )}
            </div>
            <Link to="/blog" className="btn-back-footer">
              <FaArrowLeft /> Back to All Posts
            </Link>
          </footer>
        </motion.article>
      </div>
    </>
  );
};

export default BlogDetail;
