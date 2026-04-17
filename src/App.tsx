/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Lore from "./components/Lore";

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [currentPage, setCurrentPage] = useState<"home" | "lore">("home");

  // Assets to preload
  const introVideoUrl = "https://www.dropbox.com/scl/fi/pbh5tqy7bi8pxua7zzoq3/0417.mp4?rlkey=mkgubexxwvkdhvpvcfkjx17tj&st=jzq3wsdy&dl=1"; 
  const loreImageUrl = "https://www.dropbox.com/scl/fi/x1tcaqqlug4148ijicq2n/gemini-3.1-flash-image-preview-nano-banana-2-_a_i_want_this_image_bu-1.png?rlkey=n8go0csm92cbxv2vu8may6o5t&st=1zzc8em1&dl=1";

  useEffect(() => {
    // Preload Image
    const img = new Image();
    img.src = loreImageUrl;

    // Preload Video (via hidden link tag in head for modern browsers)
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = introVideoUrl;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Using the direct download link for the Dropbox video
  const [videoError, setVideoError] = useState(false);

  const handleEnter = () => {
    setIsPlayingIntro(true);
    setVideoError(false);
  };

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
            autoPlay
            playsInline
            controls
            className="w-full h-full object-contain overflow-hidden"
            onEnded={handleVideoEnd}
            onError={handleVideoError}
          >
            <source src={introVideoUrl} type="video/mp4" />
          </video>
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
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar 
          hasEntered={hasEntered} 
          onNavigate={(page) => setCurrentPage(page)} 
          currentPage={currentPage}
        />
      </div>
      
      {currentPage === "home" ? (
        <Hero hasEntered={hasEntered} onEnter={handleEnter} />
      ) : (
        <Lore onBack={() => setCurrentPage("home")} />
      )}
    </main>
  );
}


