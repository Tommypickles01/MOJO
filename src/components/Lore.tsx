import { motion } from "motion/react";

export default function Lore({ onBack }: { onBack: () => void }) {
  // Using githack to ensure correct MIME types and compatibility
  const loreImageUrl = "https://raw.githack.com/Tommypickles01/MOJO/main/lore.png";

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 bg-black"
    >
      <img 
        src={loreImageUrl} 
        alt="Mojo Lore" 
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        className="w-full h-full object-contain"
      />
      
      {/* Back Button Overlay */}
      <div className="absolute inset-0 z-50 flex items-end justify-center pb-20 pointer-events-none">
        <button 
          onClick={onBack}
          className="liquid-glass rounded-full px-12 py-4 text-base text-white hover:scale-[1.03] transition-transform cursor-pointer pointer-events-auto shadow-2xl backdrop-blur-md border border-white/20"
        >
          Back to Home
        </button>
      </div>
    </motion.section>
  );
}

