import React from 'react';
import { Course, Lesson, Resource } from '../types';

interface CourseGridProps {
  courses: Course[];
  onCourseClick: (course: Course, index?: number) => void;
  title: string;
  subtitle: string;
  onBack?: () => void;
  completedLessons?: Set<string>;
  unlockedCourseIndex?: number;
}

const getAllLessonsAndResources = (course: Course): (Lesson | Resource)[] => {
    let items: (Lesson | Resource)[] = [];
    if (course.modules) {
        for (const module of course.modules) {
            if (module.lessons) {
                items = items.concat(module.lessons);
            }
        }
    }
    if (course.resources) {
        items = items.concat(course.resources);
    }
    if (course.subCourses) {
        for (const subCourse of course.subCourses) {
            items = items.concat(getAllLessonsAndResources(subCourse));
        }
    }
    return items;
};

const CourseGrid: React.FC<CourseGridProps> = ({ courses, onCourseClick, title, subtitle, onBack, completedLessons, unlockedCourseIndex }) => {
  const showProgress = completedLessons && unlockedCourseIndex !== undefined;

  return (
    <div className="home-container">
      <header className="home-header">
        {onBack && (
          <button className="grid-back-button" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Learn with Raftaar
          </button>
        )}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      <div className="course-grid">
        {courses.map((course, index) => {
          let progressPercentage = 0;
          
          if (showProgress) {
            const allItems = getAllLessonsAndResources(course);
            const totalCount = allItems.length;
            const completedCount = allItems.filter(item => completedLessons!.has(item.id)).length;
            progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
          }
          
          return (
            <div 
              key={course.id} 
              className="course-card"
              onClick={() => onCourseClick(course, index)}
              onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') onCourseClick(course, index)}}
              role="button"
              tabIndex={0}
              title={course.title}
            >
              <img src={course.thumbnailUrl} alt={course.title} className="course-card-thumbnail" />
              <div className="course-card-body">
                <h3 className="course-card-title">{course.title}</h3>
                <p className="course-card-author">{course.author}</p>
                {showProgress && !onBack && (
                  <div className="course-card-progress-container">
                    <div className="course-card-progress-info">
                      <span>Progress</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="course-card-progress-bar-bg">
                      <div className="course-card-progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseGrid;