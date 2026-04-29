export default function Hero({ hasEntered, onEnter }: { hasEntered: boolean, onEnter: () => void }) {
  const videoUrl = "/hero_bg.mp4";

  return (
    <section className="relative w-full h-[100dvh] overflow-hidden flex flex-col">
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
        className="absolute inset-0 z-[1] bg-black/50" 
        style={{ 
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.85) 100%), radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.5) 100%)' 
        }}
      />

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40">
        <h1 
          style={{ 
            fontFamily: "'Instrument Serif', serif",
            textShadow: '0 8px 24px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.5)'
          }}
          className="text-6xl sm:text-8xl md:text-[140px] leading-[0.85] tracking-[-0.04em] max-w-7xl font-normal text-white animate-fade-rise"
        >
          $M<em className="not-italic text-white">O</em>J<em className="not-italic text-white">O</em>
        </h1>
        
        <p 
          style={{ textShadow: '0 2px 8px rgba(0,0,0,1)' }}
          className="text-white text-base sm:text-[18px] max-w-[580px] mt-6 mb-12 leading-relaxed animate-fade-rise-delay font-semibold drop-shadow-2xl"
        >
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

      {/* Legal Disclaimer — pinned to bottom of hero */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-5 sm:px-10 pb-5 sm:pb-6">
        <p
          className="text-white/60 text-[9px] sm:text-[12px] max-w-[640px] mx-auto leading-[1.5] sm:leading-[1.6] text-center"
          style={{ textShadow: '0 1px 6px rgba(0,0,0,1)' }}
        >
          $MOJO is a decentralized community memecoin paying homage to Mojo, an early character drawn by artist Matt Furie. This project is not affiliated with, endorsed by, sponsored by, or connected to Matt Furie or any related rights-holder. $MOJO has no central team, no foundation, and no commercial relationship with any trademarked entity. The token is intended for cultural and community participation purposes only and does not represent equity, investment contracts, or any utility beyond memetic expression.
        </p>
      </div>

    </section>
  );
}

