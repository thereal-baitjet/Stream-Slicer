import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

interface VideoPlayerProps {
  src: string;
  seekTime: number | null;
  className?: string;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({ src, seekTime, className }, ref) => {
  const innerRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(ref, () => innerRef.current as HTMLVideoElement);

  useEffect(() => {
    if (innerRef.current && seekTime !== null) {
      innerRef.current.currentTime = seekTime;
      innerRef.current.play().catch(e => console.log("Auto-play prevented by browser policy", e));
    }
  }, [seekTime]);

  return (
    <div className={`relative overflow-hidden rounded-lg bg-black border border-zinc-800 shadow-xl ${className}`}>
      <video
        ref={innerRef}
        src={src}
        controls
        crossOrigin="anonymous"
        className="w-full h-full object-contain max-h-[60vh]"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;