"use client";

import { X } from "lucide-react";
import { useRef } from "react";

const VIDEO_URL =
  "https://res.cloudinary.com/dbglon4f7/video/upload/q_auto,f_auto/v1774013848/ReqRes_demo_g9yhnt.mp4";

interface VideoDemoProps {
  open: boolean;
  onClose: () => void;
}

export default function VideoDemo({ open, onClose }: VideoDemoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="ReqRes preview video"
      className="
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/60 backdrop-blur-md
      "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative w-full max-w-4xl
          rounded-2xl overflow-hidden
          shadow-2xl ring-1 ring-white/10
          bg-black
        "
      >
        <button
          onClick={onClose}
          aria-label="Close preview"
          className="
            absolute top-3 right-3 z-10
            flex items-center justify-center
            w-8 h-8 rounded-full
            bg-white/10 hover:bg-white/20
            text-white transition-colors duration-150
          "
        >
          <X className="size-4" />
        </button>
        <video
          ref={videoRef}
          src={VIDEO_URL}
          controls
          autoPlay
          playsInline
          preload="none"
          className="w-full aspect-video block"
        />
      </div>
    </div>
  );
}
