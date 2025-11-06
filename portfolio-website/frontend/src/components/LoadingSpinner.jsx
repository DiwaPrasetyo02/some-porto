import { motion } from 'framer-motion';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  return (
    <div className={`spinner-container spinner-${size}`}>
      <motion.div
        className={`spinner spinner-${color}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
};

export default LoadingSpinner;
