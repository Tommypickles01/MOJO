export default function Hero({ hasEntered, onEnter }: { hasEntered: boolean, onEnter: () => void }) {
  const videoUrl = "https://dnznrvs05pmza.cloudfront.net/seedance_2/cgt-20260417182431-wgx86/animate_this__IMG_2_no_random_artifacts_or_cut_scenes__static_shot__loop__no_random_things_in_the_ba.mp4?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiY2FiN2M2M2M1OTA5MWJkZiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc3NjU0ODY2OH0.rQOWGb-OLHiD25SjPkIp2RqLmkJHPti2je0NOPyl0UI";

  return (
    <section className="relative w-full h-screen overflow-hidden flex flex-col">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
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

