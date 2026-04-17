export default function Hero({ hasEntered, onEnter }: { hasEntered: boolean, onEnter: () => void }) {
  // Using githack to ensure correct MIME types and range requests for mobile video playback
  const videoUrl = "https://raw.githack.com/Tommypickles01/MOJO/main/15ef619663df052ee2103de4f0d90e7a34da93447680a80054853c8e47c235be.mp4";

  return (
    <section className="relative w-full h-screen overflow-hidden flex flex-col">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Atmospheric Overlay */}
      <div 
        className="absolute inset-0 z-[1]" 
        style={{ 
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.25) 100%)' 
        }}
      />

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40">
        <h1 
          style={{ fontFamily: "'Instrument Serif', serif" }}
          className="text-6xl sm:text-8xl md:text-[140px] leading-[0.85] tracking-[-0.04em] max-w-7xl font-normal text-foreground animate-fade-rise"
        >
          $M<em className="not-italic text-white/70">O</em>J<em className="not-italic text-white/70">O</em>
        </h1>
        
        <p className="text-foreground/90 text-base sm:text-[18px] max-w-[580px] mt-6 mb-12 leading-relaxed animate-fade-rise-delay">
          Matt Furie's first drawing ever that started it all. The genesis moment. Now immortalized on-chain.
        </p>

        {!hasEntered && (
          <button 
            onClick={onEnter}
            className="liquid-glass rounded-full px-16 py-5 text-lg text-foreground mt-8 hover:scale-[1.03] transition-transform cursor-pointer animate-fade-rise-delay-2"
          >
            Enter
          </button>
        )}
      </div>

    </section>
  );
}

