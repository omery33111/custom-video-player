import React from "react";
import { useDropzone } from "react-dropzone";
import Timeline from "./Timeline";
import TrimBar from "./TrimBar";
import { FaPlay, FaPause, FaVolumeUp } from "react-icons/fa";
import "./VideoPlayer.css";
import { useVideoPlayerLogic } from "../utils/UseVideoPlayerLogic";

const VideoPlayer = () => {
  const { videoRef, volumeSliderRef, videoSrc, isPlaying, setShowVolumeSlider, showVolumeSlider, volume, handleVolumeChange, handleDrop, handleTogglePlay, currentTime, duration, trimStart, trimEnd, setTrimStart, setTrimEnd, handleSeek, formatTime } = useVideoPlayerLogic();

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: handleDrop,
    accept: { "video/*": [] },
    multiple: false,
    maxFiles: 1,
  });

  const dropAreaClass = !videoSrc ? `video-drop-area${isDragActive ? " drag-over" : ""}` : undefined;
  const playerLayoutClass = videoSrc ? "video-player-layout video-player-layout--with-video" : "video-player-layout";

  return (
    <div className="video-player">
      <div className={playerLayoutClass}>
        {/* Video Drop/Preview Area */}
        <div className={dropAreaClass} {...getRootProps()}>
          <input {...getInputProps()} />
          {videoSrc ? (
            <video ref={videoRef} className="video-element" src={videoSrc} />
          ) : (
            <p className="drop-message">
              {isDragActive ? "Drop the video here..." : "Drag and drop a video file here, or click to select one"}
            </p>
          )}
        </div>

        {/* Controls */}
        {videoSrc && (
          <div className="video-controls-container">
            {/* Volume */}
            <div className="volume-control" ref={volumeSliderRef}>
              <FaVolumeUp color="lightgrey" style={{ cursor: "pointer" }} onClick={() => setShowVolumeSlider((v) => !v)} />
                {showVolumeSlider && (
                    <input type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="volume-range"
                            autoFocus
                    />
                )}
            </div>
            {/* Play/Pause */}
            <div onClick={handleTogglePlay} className = "start-pause">
              {isPlaying ? <FaPause color="lightgrey" /> : <FaPlay color="lightgrey" />}
            </div>
            {/* Time */}
            <div className="lightgrey-text">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {fileRejections.length > 0 && (
        <p className="error-message">Only video files are allowed!</p>
      )}

      {/* Timeline */}
      {videoSrc && (
        <Timeline currentTime={currentTime}
                  duration={duration}
                  onSeek={handleSeek}
        />
      )}

      {/* Trim Bar */}
      {videoSrc && (
        <TrimBar duration={duration}
                 trimStart={trimStart}
                 trimEnd={trimEnd}
                 setTrimStart={setTrimStart}
                 setTrimEnd={setTrimEnd}
                 onSeek={handleSeek}
        />
      )}
    </div>
  );
};

export default VideoPlayer;