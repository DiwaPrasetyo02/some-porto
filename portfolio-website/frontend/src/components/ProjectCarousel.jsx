import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import './ProjectCarousel.css';

const ProjectCarousel = ({ projects }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const currentProject = projects[currentIndex];

  return (
    <>
      <div className="carousel-container">
        <button className="carousel-btn carousel-btn-prev" onClick={prevSlide}>
          <FaChevronLeft />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="carousel-slide"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <div className="project-carousel-card">
              {currentProject.image && (
                <div className="project-carousel-image">
                  <img
                    src={currentProject.image}
                    alt={currentProject.title}
                    loading="lazy"
                  />
                </div>
              )}
              <div className="project-carousel-content">
                <h3>{currentProject.title}</h3>
                <p>{currentProject.short_description || currentProject.description}</p>
                <div className="project-carousel-actions">
                  {currentProject.github_url && (
                    <a href={currentProject.github_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                      <FaGithub /> GitHub
                    </a>
                  )}
                  {currentProject.live_url && (
                    <a href={currentProject.live_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                      Live Demo
                    </a>
                  )}
                  <button className="btn-primary" onClick={() => setSelectedProject(currentProject)}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button className="carousel-btn carousel-btn-next" onClick={nextSlide}>
          <FaChevronRight />
        </button>

        <div className="carousel-indicators">
          {projects.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedProject(null)}>
                <FaTimes />
              </button>

              {selectedProject.image && (
                <img src={selectedProject.image} alt={selectedProject.title} className="modal-image" />
              )}

              <div className="modal-body">
                <h2>{selectedProject.title}</h2>
                <p className="modal-description">{selectedProject.description}</p>

                {selectedProject.technologies && (
                  <div className="modal-technologies">
                    <h4>Technologies Used:</h4>
                    <div className="tech-tags">
                      {selectedProject.technologies.split(',').map((tech, i) => (
                        <span key={i} className="tech-tag">{tech.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="modal-links">
                  {selectedProject.github_url && (
                    <a href={selectedProject.github_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                      <FaGithub /> View on GitHub
                    </a>
                  )}
                  {selectedProject.live_url && (
                    <a href={selectedProject.live_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                      Visit Live Site
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectCarousel;
