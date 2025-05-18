import React, { useRef } from "react";
import "./Timeline.css";



const Timeline = ({ currentTime, duration }) => {
  const timelineRef = useRef(null);
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="timeline" ref={timelineRef}>
      {/* Progress bar */}
      <div className="timeline-progress" style={{width: `${progress}%`}} />
      {/* Thumb */}
      <div className="timeline-thumb" style={{left: `calc(${progress}%)`}} />
    </div>
  );
};

export default Timeline;