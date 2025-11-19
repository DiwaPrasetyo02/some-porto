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

  // Enhanced markdown parser
  const parseMarkdown = (content) => {
    const lines = content.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeBlockContent = [];
    let codeBlockLanguage = '';
    let inList = false;
    let listItems = [];

    const processInlineMarkdown = (text) => {
      // Bold: **text** or __text__
      text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');

      // Italic: *text* or _text_
      text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
      text = text.replace(/_(.+?)_/g, '<em>$1</em>');

      // Inline code: `code`
      text = text.replace(/`(.+?)`/g, '<code>$1</code>');

      // Links: [text](url)
      text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

      return text;
    };

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`}>
            {listItems.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: processInlineMarkdown(item) }} />
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // End of code block
          elements.push(
            <pre key={`code-${elements.length}`} className="code-block">
              <code className={codeBlockLanguage ? `language-${codeBlockLanguage}` : ''}>
                {codeBlockContent.join('\n')}
              </code>
            </pre>
          );
          codeBlockContent = [];
          codeBlockLanguage = '';
          inCodeBlock = false;
        } else {
          // Start of code block
          flushList();
          codeBlockLanguage = line.trim().substring(3).trim();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Skip empty lines (but preserve in code blocks)
      if (line.trim() === '') {
        flushList();
        return;
      }

      // Headings
      if (line.startsWith('#### ')) {
        flushList();
        elements.push(<h5 key={`h5-${index}`}>{line.substring(5)}</h5>);
        return;
      }
      if (line.startsWith('### ')) {
        flushList();
        elements.push(<h4 key={`h4-${index}`}>{line.substring(4)}</h4>);
        return;
      }
      if (line.startsWith('## ')) {
        flushList();
        elements.push(<h3 key={`h3-${index}`}>{line.substring(3)}</h3>);
        return;
      }
      if (line.startsWith('# ')) {
        flushList();
        elements.push(<h2 key={`h2-${index}`}>{line.substring(2)}</h2>);
        return;
      }

      // Lists (unordered)
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        inList = true;
        listItems.push(line.trim().substring(2));
        return;
      }

      // Lists (ordered)
      const orderedListMatch = line.trim().match(/^(\d+)\.\s+(.+)$/);
      if (orderedListMatch) {
        if (!inList || listItems.length === 0) {
          flushList();
          inList = 'ordered';
          listItems = [];
        }
        listItems.push(orderedListMatch[2]);
        return;
      }

      // Blockquote
      if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={`quote-${index}`}>
            <p dangerouslySetInnerHTML={{ __html: processInlineMarkdown(line.substring(2)) }} />
          </blockquote>
        );
        return;
      }

      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***') {
        flushList();
        elements.push(<hr key={`hr-${index}`} />);
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: processInlineMarkdown(line) }} />
      );
    });

    // Flush any remaining list items
    flushList();

    return elements;
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
            {parseMarkdown(blog.content)}
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
