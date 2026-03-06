import React, { useState, useEffect } from 'react';
import './index.css';

interface SportCalendarProps {
  // 可以添加自定义属性
}

const SportCalendar: React.FC<SportCalendarProps> = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [days, setDays] = useState<(number | null)[]>([]);
  const [stats, setStats] = useState({
    exerciseDays: 3,
    exerciseCount: 3,
    totalDuration: '2时58分',
    averageDuration: '59分'
  });

  // 生成日历数据
  useEffect(() => {
    generateCalendar();
  }, [currentDate]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 获取当月第一天是星期几（0-6，0是周日）
    const firstDay = new Date(year, month, 1).getDay();
    // 调整为周一为第一天（1-7，1是周一）
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    // 获取当月的天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 生成日历数据
    const calendarDays: (number | null)[] = [];
    
    // 添加上月的占位
    for (let i = 0; i < adjustedFirstDay; i++) {
      calendarDays.push(null);
    }
    
    // 添加当月的天数
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }
    
    setDays(calendarDays);
  };

  // 切换到上个月
  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  // 切换到下个月
  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // 检查是否是今天
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // 检查是否有活动
  const hasActivity = (day: number) => {
    // 这里可以根据实际数据判断，暂时硬编码
    const activityDays = [1, 4, 5];
    return activityDays.includes(day);
  };

  // 格式化月份和年份显示
  const getMonthYearString = () => {
    return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;
  };

  return (
    <div>
      {/* 日历部分 */}
      <div className="sport-calendar">
        <div className="calendar-header">
          <button className="month-nav" onClick={handlePrevMonth}>‹</button>
          <div className="month-year">{getMonthYearString()}</div>
          <button className="month-nav" onClick={handleNextMonth}>›</button>
        </div>
        
        <div className="calendar-grid">
          <div className="day-header">一</div>
          <div className="day-header">二</div>
          <div className="day-header">三</div>
          <div className="day-header">四</div>
          <div className="day-header">五</div>
          <div className="day-header">六</div>
          <div className="day-header">日</div>
          
          {days.map((day, index) => (
            <div
              key={index}
              className={`day ${day ? (isToday(day) ? 'today' : hasActivity(day) ? 'has-activity' : '') : ''}`}
            >
              {day}
            </div>
          ))}
        </div>
        
        <div className="calendar-binding">
          <div className="binding-ring"></div>
          <div className="binding-ring"></div>
          <div className="binding-ring"></div>
          <div className="binding-ring"></div>
          <div className="binding-ring"></div>
          <div className="binding-ring"></div>
          <div className="binding-ring"></div>
          <div className="binding-ring"></div>
        </div>
      </div>
      
      {/* 统计部分 */}
      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-label">
            <span className="stat-icon">✅</span>
            运动天数
          </div>
          <div className="stat-value">{stats.exerciseDays}天</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">
            <span className="stat-icon">🏃</span>
            运动次数
          </div>
          <div className="stat-value">{stats.exerciseCount}次</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">
            <span className="stat-icon">⏱️</span>
            运动时长
          </div>
          <div className="stat-value">{stats.totalDuration}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">
            <span className="stat-icon">⚖️</span>
            平均单次运动时长
          </div>
          <div className="stat-value">{stats.averageDuration}</div>
        </div>
      </div>
    </div>
  );
};

export default SportCalendar;