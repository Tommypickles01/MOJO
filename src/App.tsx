/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Lore from "./components/Lore";
import Game from "./components/Game";

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [currentPage, setCurrentPage] = useState<"home" | "lore" | "game">("home");

  const introVideoUrl = "/enter.mp4"; 
  const loreImageUrl = "/lore.png";

  useEffect(() => {
    // Preload Image
    const img = new Image();
    img.src = loreImageUrl;
  }, []);

  // Using the direct download link for the Dropbox video
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnter = () => {
    setIsPlayingIntro(true);
    setVideoError(false);
  };

  useEffect(() => {
    if (isPlayingIntro && videoRef.current) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [isPlayingIntro]);

  const handleVideoEnd = () => {
    setIsPlayingIntro(false);
    setHasEntered(true);
  };

  const handleVideoError = () => {
    console.error("Video failed to load. Check the URL or direct file path.");
    setVideoError(true);
  };

  if (isPlayingIntro) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        {!videoError ? (
          <video
            ref={videoRef}
            src={introVideoUrl}
            playsInline
            controls
            className="w-full h-full object-contain overflow-hidden"
            onEnded={handleVideoEnd}
            onError={handleVideoError}
          />
        ) : (
          <div className="text-center px-6">
            <p className="text-white/70 mb-4">The video couldn't be loaded from the external source (Dropbox/Google Drive).</p>
            <button 
              onClick={handleVideoEnd}
              className="px-8 py-3 bg-white text-black rounded-full font-medium"
            >
              Continue to Site
            </button>
          </div>
        )}
        <button 
          onClick={handleVideoEnd}
          className="absolute top-6 right-6 sm:top-8 sm:right-8 text-white/50 hover:text-white text-xs sm:text-sm uppercase tracking-widest z-[110] bg-black/20 backdrop-blur-sm p-2 rounded-lg"
        >
          Skip / Close
        </button>
      </div>
    );
  }


  return (
    <>
      <main className="relative min-h-screen bg-background overflow-x-hidden">
        <div className="absolute top-0 left-0 w-full z-50">
          <Navbar
            hasEntered={hasEntered}
            onNavigate={(page) => setCurrentPage(page)}
            currentPage={currentPage}
          />
        </div>
        {currentPage === "home" && <Hero hasEntered={hasEntered} onEnter={handleEnter} />}
      </main>
      {currentPage === "lore" && <Lore onBack={() => setCurrentPage("home")} />}
      {currentPage === "game" && <Game onBack={() => setCurrentPage("home")} />}
    </>
  );
}


