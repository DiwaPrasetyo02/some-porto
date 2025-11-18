import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getBlogs } from '../services/api';
import Navbar from '../components/Navbar';
import './BlogList.css';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const response = await getBlogs();
      setBlogs(response.data);
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <>
      <Navbar />
      <div className="blog-list-page">
        <motion.section
          className="blog-header-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Blog</h1>
          <p>Thoughts, tutorials, and insights about web development and technology</p>
        </motion.section>

        <section className="blog-list-section">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading posts...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="empty-state">
              <p>No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="blog-grid">
              {blogs.map((blog, index) => (
                <motion.article
                  key={blog.id}
                  className="blog-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Link to={`/blog/${blog.slug}`} className="blog-card-link">
                    {blog.featured_image && (
                      <div className="blog-card-image">
                        <img src={blog.featured_image} alt={blog.title} loading="lazy" />
                      </div>
                    )}
                    <div className="blog-card-content">
                      <div className="blog-card-meta">
                        <span className="blog-date">{formatDate(blog.created_at)}</span>
                        {blog.views > 0 && (
                          <span className="blog-views">{blog.views} views</span>
                        )}
                      </div>
                      <h2>{blog.title}</h2>
                      {blog.excerpt && <p className="blog-excerpt">{blog.excerpt}</p>}
                      {blog.tags && (
                        <div className="blog-tags">
                          {blog.tags.split(',').map((tag, i) => (
                            <span key={i} className="blog-tag">{tag.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default BlogList;
