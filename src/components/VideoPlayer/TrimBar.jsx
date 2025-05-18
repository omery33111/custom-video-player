import React, { useRef, useState, useEffect } from "react";
import "./TrimBar.css";
import { formatTime } from "../utils/FormatTime";



const TrimBar = ({ duration, trimStart, trimEnd, setTrimStart, setTrimEnd, onSeek }) => {
  const barRef = useRef(null);
  const [dragging, setDragging] = useState(null); // "start" | "end" | null

  const handleBarClick = (e) => {
    if (e.target.classList.contains('trim-handle')) return;
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const clientX = e.type.startsWith('touch')
      ? e.touches[0].clientX
      : e.clientX;
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percent * duration;
    onSeek?.(newTime);
  };
  
  // Calculate percent positions
  const percentStart = duration ? (trimStart / duration) * 100 : 0;
  const percentEnd = duration ? (trimEnd / duration) * 100 : 100;

  // Handle drag
  const handlePointerDown = (which) => (e) => {
    e.preventDefault();
    setDragging(which);
  };

  const handlePointerMove = (e) => {
    if (!dragging || !barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const clientX = e.type.startsWith("touch")
      ? e.touches[0].clientX
      : e.clientX;
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percent * duration;

    if (dragging === "start") {
      setTrimStart(Math.min(Math.max(0, newTime), trimEnd - 0.1));
    } else if (dragging === "end") {
      setTrimEnd(Math.max(Math.min(duration, newTime), trimStart + 0.1));
    }
  };

  const handlePointerUp = () => setDragging(null);

  // Attach/detach move/up listeners on drag
  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("mouseup", handlePointerUp);
      window.addEventListener("touchmove", handlePointerMove);
      window.addEventListener("touchend", handlePointerUp);
      return () => {
        window.removeEventListener("mousemove", handlePointerMove);
        window.removeEventListener("mouseup", handlePointerUp);
        window.removeEventListener("touchmove", handlePointerMove);
        window.removeEventListener("touchend", handlePointerUp);
      };
    }
  });

  return (
    <div className="trim-bar" ref={barRef} onClick={handleBarClick} onTouchStart={handleBarClick}>
      {/* Highlighted area */}
      <div className="trim-highlight" style={{left: `${percentStart}%`, width: `${percentEnd - percentStart}%`}} />
      
      {/* Start handle */}
      <div className="trim-handle trim-handle-left" style={{left: `calc(${percentStart}% - 23px)`}}
            onMouseDown={handlePointerDown("start")}
            onTouchStart={handlePointerDown("start")}
      />
      {/* End handle */}
      <div className="trim-handle trim-handle-right" style={{left: `calc(${percentEnd}%)`}}
            onMouseDown={handlePointerDown("end")}
            onTouchStart={handlePointerDown("end")}
      />

      {/* Time displays */}
      <span className="trim-time-label trim-time-label--start" style={{left: `${percentStart}%`}}>
        {formatTime(trimStart)}
      </span>
      <span className="trim-time-label trim-time-label--end" style={{left: `calc(${percentEnd}%)`}}>
        {formatTime(trimEnd)}
      </span>
    </div>
  );
};

export default TrimBar;