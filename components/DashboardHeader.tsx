import React from 'react';

interface DashboardHeaderProps {
  courseTitle: string;
  completedCount: number;
  totalCount: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ courseTitle, completedCount, totalCount }) => {
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <header className="dashboard-header">
      <div className="progress-info">
        <h2>{courseTitle}</h2>
        <span>{completedCount} / {totalCount} Lessons Completed</span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
      </div>
    </header>
  );
};

export default DashboardHeader;