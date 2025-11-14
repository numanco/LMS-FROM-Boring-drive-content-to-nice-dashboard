import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { COURSES } from './constants';
import { Course, Lesson, Resource } from './types';
import Sidebar from './components/Sidebar';
import LessonViewer from './components/LessonViewer';
import CourseGrid from './components/CourseGrid';
import DashboardHeader from './components/DashboardHeader';

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
  return items;
};

const App: React.FC = () => {
  const [selectedClassroom, setSelectedClassroom] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | Resource | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Load progress from localStorage on initial render
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('classroomProgress');
      if (savedProgress) {
        setCompletedLessons(new Set(JSON.parse(savedProgress)));
      }
    } catch (error) {
      console.error("Failed to load progress from localStorage", error);
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('classroomProgress', JSON.stringify(Array.from(completedLessons)));
    } catch (error) {
      console.error("Failed to save progress to localStorage", error);
    }
  }, [completedLessons]);

  const allCourseItems = useMemo(() => {
    if (!selectedCourse) return [];
    return getAllLessonsAndResources(selectedCourse);
  }, [selectedCourse]);

  const completedCount = useMemo(() => {
    if (!selectedCourse) return 0;
    return allCourseItems.filter(item => completedLessons.has(item.id)).length;
  }, [completedLessons, allCourseItems, selectedCourse]);

  const toggleLessonComplete = useCallback((itemId: string) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const handleNextLesson = useCallback(() => {
    if (!activeLesson || !selectedCourse) return;
    
    const currentIndex = allCourseItems.findIndex(item => item.id === activeLesson.id);
    if (currentIndex > -1 && currentIndex < allCourseItems.length - 1) {
      const nextLesson = allCourseItems[currentIndex + 1];
      setActiveLesson(nextLesson);
    }
  }, [activeLesson, selectedCourse, allCourseItems]);


  const handleSelectTopLevelCourse = (course: Course) => {
    if (course.subCourses && course.subCourses.length > 0) {
      setSelectedClassroom(course);
      setSelectedCourse(null);
    } else {
      setSelectedClassroom(null);
      setSelectedCourse(course);
    }
    setActiveLesson(null);
  };

  const handleSelectSubCourse = (course: Course) => {
    setSelectedCourse(course);
    setActiveLesson(null);
  };

  const handleBackToHome = () => {
    setSelectedClassroom(null);
    setSelectedCourse(null);
    setActiveLesson(null);
  };
  
  const handleBackToClassroom = () => {
    setSelectedCourse(null);
    setActiveLesson(null);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  if (selectedCourse) {
    const onBack = selectedClassroom ? handleBackToClassroom : handleBackToHome;
    const backButtonText = selectedClassroom ? `Back to ${selectedClassroom.title}` : "All Courses";

    return (
      <div className="dashboard-layout">
        <Sidebar
          course={selectedCourse}
          activeLesson={activeLesson}
          completedLessons={completedLessons}
          onLessonClick={setActiveLesson}
          onBack={onBack}
          backButtonText={backButtonText}
          isVisible={isSidebarVisible}
          onToggle={toggleSidebar}
        />
        <div className="main-content-wrapper">
          <DashboardHeader 
            courseTitle={selectedCourse.title}
            completedCount={completedCount}
            totalCount={allCourseItems.length}
          />
          <main className="main-content">
            <LessonViewer 
              lesson={activeLesson} 
              isCompleted={activeLesson ? completedLessons.has(activeLesson.id) : false}
              onToggleComplete={() => activeLesson && toggleLessonComplete(activeLesson.id)}
              onNextLesson={handleNextLesson}
            />
          </main>
        </div>
      </div>
    );
  }

  if (selectedClassroom) {
    return (
      <CourseGrid
        courses={selectedClassroom.subCourses || []}
        onCourseClick={handleSelectSubCourse}
        title={selectedClassroom.title}
        subtitle={`Welcome to the ${selectedClassroom.title} classroom. Select a course to begin.`}
        onBack={handleBackToHome}
      />
    );
  }

  return (
    <CourseGrid
      courses={COURSES}
      onCourseClick={handleSelectTopLevelCourse}
      title="All Courses"
      subtitle="Select a course to begin your learning journey."
    />
  );
};

export default App;