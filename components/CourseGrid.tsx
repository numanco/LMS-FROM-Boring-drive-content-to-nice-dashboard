import React from 'react';
import { Course } from '../types';

interface CourseGridProps {
  courses: Course[];
  onCourseClick: (course: Course) => void;
  title: string;
  subtitle: string;
  onBack?: () => void;
}

const CourseGrid: React.FC<CourseGridProps> = ({ courses, onCourseClick, title, subtitle, onBack }) => {
  return (
    <div className="home-container">
      <header className="home-header">
        {onBack && (
          <button className="grid-back-button" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to All Courses
          </button>
        )}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      <div className="course-grid">
        {courses.map(course => (
          <div 
            key={course.id} 
            className="course-card" 
            onClick={() => onCourseClick(course)}
            onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') onCourseClick(course)}}
            role="button"
            tabIndex={0}
          >
            <img src={course.thumbnailUrl} alt={course.title} className="course-card-thumbnail" />
            <div className="course-card-body">
              <h3 className="course-card-title">{course.title}</h3>
              <p className="course-card-author">{course.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseGrid;