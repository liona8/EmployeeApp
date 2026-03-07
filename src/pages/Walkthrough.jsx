import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SkipForward, Play, Pause, Volume2, VolumeX, Check } from "lucide-react";

export default function WalkthroughPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    // Auto-play video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto-play blocked, show play button
        setIsPlaying(false);
      });
    }

    // Show skip button after 5 seconds
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleVideoEnd = () => {
    navigateToDashboard();
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const navigateToDashboard = () => {
    // Mark walkthrough as watched
    sessionStorage.setItem("walkthroughWatched", "true");
    navigate("/");
  };

  const handleSkip = () => {
    navigateToDashboard();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f1117 0%, #1a1d29 50%, #0f1117 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
    }}>
      {/* Background effects */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 50% 0%, rgba(91,124,250,0.15) 0%, transparent 50%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{
        position: "absolute",
        top: 32,
        left: 0,
        right: 0,
        textAlign: "center",
        zIndex: 10,
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 8,
          letterSpacing: "-0.5px",
        }}>
          Welcome to Kueh Employee Portal
        </h1>
        <p style={{
          fontSize: 15,
          color: "rgba(255,255,255,0.6)",
        }}>
          Watch this quick walkthrough to get started
        </p>
      </div>

      {/* Video Container */}
      <div style={{
        width: "100%",
        maxWidth: "1000px",
        aspectRatio: "16/9",
        background: "#000",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)",
        position: "relative",
        marginTop: 40,
      }}>
        <video
          ref={videoRef}
          src="/demo.mov"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnd}
          autoPlay
          playsInline
        />

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.4)",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
          >
            <div style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(91,124,250,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(91,124,250,0.4)",
            }}>
              <Play size={32} fill="white" color="white" />
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 20px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Progress Bar */}
          <div style={{
            flex: 1,
            height: 4,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 2,
            overflow: "hidden",
            cursor: "pointer",
          }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              background: "#5b7cfa",
              borderRadius: 2,
              transition: "width 0.1s linear",
            }} />
          </div>

          {/* Mute Button */}
          <button
            onClick={toggleMute}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Skip / Continue Buttons */}
      <div style={{
        marginTop: 32,
        display: "flex",
        gap: 16,
        zIndex: 10,
      }}>
        {showSkip && (
          <button
            onClick={handleSkip}
            style={{
              padding: "12px 24px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
            }}
          >
            <SkipForward size={16} />
            Skip Walkthrough
          </button>
        )}

        <button
          onClick={navigateToDashboard}
          style={{
            padding: "12px 28px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #5b7cfa, #7c3aed)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 20px rgba(91,124,250,0.4)",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 24px rgba(91,124,250,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(91,124,250,0.4)";
          }}
        >
          <Check size={16} />
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}
