import { useRef, useState, useCallback, useEffect } from "react";
import { formatTime } from "./FormatTime";



export const useVideoPlayerLogic = () => {
  // === Refs ===
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const volumeSliderRef = useRef(null);

  // === States ===
  const [videoSrc, setVideoSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Trim state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // Drop video
  const handleDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoSrc(url);

    // Reset all relevant states
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setTrimStart(0);
    setTrimEnd(0);
    clearInterval(timerRef.current);
  }, []);

  // Play/Pause logic (plays only trimmed section)
  const handleTogglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      clearInterval(timerRef.current);
    } else {
      // Always start inside trim
      if (video.currentTime < trimStart || video.currentTime >= trimEnd) {
        video.currentTime = trimStart;
        setCurrentTime(trimStart);
      }
      video.play();
      timerRef.current = setInterval(() => setCurrentTime(video.currentTime), 100);
    }
    setIsPlaying((prev) => !prev);
  }, [isPlaying, trimStart, trimEnd]);

  // Update duration/trimEnd on video metadata load
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    setTrimEnd(video.duration);
  }, []);

  // Volume logic
  const handleVolumeChange = useCallback((e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
  }, []);

  // Show/hide volume slider on outside click
  useEffect(() => {
    if (!showVolumeSlider) return;
    const handleOutsideClick = (event) => {
      if (
        volumeSliderRef.current &&
        !volumeSliderRef.current.contains(event.target)
      ) {
        setShowVolumeSlider(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, [showVolumeSlider]);

  // Attach/detach metadata event
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      if (video) video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      clearInterval(timerRef.current);
    };
  }, [videoSrc, handleLoadedMetadata]);

  // Sync volume prop with video element
  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);

  // Main logic: Restrict playback to trim range
  useEffect(() => {
    const video = videoRef.current;
    if (!isPlaying || !video) return;
    if (currentTime >= trimEnd) {
      video.pause();
      setIsPlaying(false);
      video.currentTime = trimStart;
      setCurrentTime(trimStart);
    }
    if (currentTime < trimStart) {
      video.currentTime = trimStart;
      setCurrentTime(trimStart);
    }
  }, [currentTime, isPlaying, trimStart, trimEnd]);

  // Prevent seeking outside trim range
  useEffect(() => {
    if (!videoRef.current) return;
    if (currentTime < trimStart) {
      videoRef.current.currentTime = trimStart;
      setCurrentTime(trimStart);
    }
  }, [trimStart]);
  useEffect(() => {
    if (!videoRef.current) return;
    if (currentTime > trimEnd) {
      videoRef.current.currentTime = trimStart;
      setCurrentTime(trimStart);
    }
  }, [trimEnd]);

  // Seek within trim only
  const handleSeek = (seekTime) => {
    const newTime = Math.max(trimStart, Math.min(seekTime, trimEnd));
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return {
    videoRef,
    timerRef,
    volumeSliderRef,
    videoSrc,
    setVideoSrc,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    setVolume,
    showVolumeSlider,
    setShowVolumeSlider,
    trimStart,
    setTrimStart,
    trimEnd,
    setTrimEnd,
    handleDrop,
    handleTogglePlay,
    handleLoadedMetadata,
    handleVolumeChange,
    handleSeek,
    formatTime};
};