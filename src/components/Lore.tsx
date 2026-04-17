import { motion } from "motion/react";

export default function Lore({ onBack }: { onBack: () => void }) {
  const loreImageUrl = "https://www.dropbox.com/scl/fi/x1tcaqqlug4148ijicq2n/gemini-3.1-flash-image-preview-nano-banana-2-_a_i_want_this_image_bu-1.png?rlkey=n8go0csm92cbxv2vu8may6o5t&st=1zzc8em1&dl=1";

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
        className="w-full h-full object-cover"
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

