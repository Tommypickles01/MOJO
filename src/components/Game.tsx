import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Float, PerspectiveCamera, Clone } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";
import { X, RotateCcw, Trophy, Timer } from "lucide-react";

interface GameProps {
  onBack: () => void;
}

interface GameObject {
  id: number;
  position: [number, number, number];
  type: "banana" | "hazard";
  speed: number;
}

function Hazard() {
  const fuseRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (fuseRef.current) {
      fuseRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 15) * 0.1);
    }
  });

  return (
    <group scale={[0.8, 0.8, 0.8]}>
      {/* Bomb Body */}
      <mesh castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.05} metalness={0.95} />
      </mesh>
      {/* Fuse Cap */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.3, 16]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Wick */}
      <mesh position={[0.05, 1.2, 0.1]} rotation={[0.4, 0, 0.2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
        <meshStandardMaterial color="#4d3319" />
      </mesh>
      {/* Spark/Fuse Glow */}
      <group ref={fuseRef} position={[0.2, 1.45, 0.2]}>
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ff4400" emissiveIntensity={12} toneMapped={false} />
        </mesh>
        <pointLight intensity={40} color="#ff4400" distance={6} />
      </group>
    </group>
  );
}

// Assets Paths
const ASSETS = {
  MOJO: "/mouse_optimized.glb",
  BANANA: "/banana_-_photorealistic_fruit_asset.glb",
  GARDEN: "/garden_optimized.glb"
};

function Banana({ position, onCollect }: { position: [number, number, number], onCollect: () => void }) {
  const { scene } = useGLTF(ASSETS.BANANA);
  const ref = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (ref.current) {
        ref.current.rotation.y += delta * 2;
        ref.current.position.y -= 0.05; // Falling speed
        
        // Z-axis check for collection happens in parent to access player pos
    }
  });

  return (
    <primitive 
      ref={ref} 
      object={scene.clone()} 
      position={position} 
      scale={[0.5, 0.5, 0.5]} 
    />
  );
}

function Mojo({ position, score }: { position: [number, number, number], score: number }) {
  const { scene } = useGLTF(ASSETS.MOJO);
  const ref = useRef<THREE.Group>(null);
  const [isExcited, setIsExcited] = useState(false);
  const lastScore = useRef(score);

  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      scene.position.x += (scene.position.x - center.x);
      scene.position.y += (scene.position.y - center.y);
      scene.position.z += (scene.position.z - center.z);
    }
  }, [scene]);

  // Engagement effect: Mojo gets excited every 5th banana
  useEffect(() => {
    if (score > lastScore.current) {
      if (score % 5 === 0 && score > 0) {
        setIsExcited(true);
        const timer = setTimeout(() => setIsExcited(false), 800);
        return () => clearTimeout(timer);
      }
    }
    lastScore.current = score;
  }, [score]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.lerp(new THREE.Vector3(...position), 0.1);
      
      // Happy jump/shake when excited (every 5th banana)
      if (isExcited) {
        ref.current.position.y += Math.sin(state.clock.elapsedTime * 30) * 0.2 + 0.5;
        ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 40) * 0.2;
      }

      // Base idle animation
      ref.current.rotation.y = -Math.PI / 2 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      ref.current.rotation.x = 0.2; 
    }
  });

  return (
    <primitive 
      ref={ref} 
      object={scene} 
      scale={[2.0, 2.0, 2.0]} 
    />
  );
}

function Garden() {
  const { scene } = useGLTF(ASSETS.GARDEN);
  return (
    <primitive 
      object={scene} 
      position={[0, -5, -20]} 
      scale={[35, 35, 35]} 
      rotation={[0, Math.PI, 0]} 
    />
  );
}

function GameScene({ 
    gameState, 
    onScore, 
    onGameOver, 
    playerPosition,
    score
}: { 
    gameState: string, 
    onScore: () => void, 
    onGameOver: () => void,
    playerPosition: [number, number, number],
    score: number
}) {
  const [items, setItems] = useState<GameObject[]>([]);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const lastSpawn = useRef(0);
  const lastShakeScore = useRef(0);
  const sceneRef = useRef<THREE.Group>(null);
  const { scene: bananaScene } = useGLTF(ASSETS.BANANA);

  // Screen shake logic for every 20th banana
  useEffect(() => {
    if (score > 0 && score % 20 === 0 && score !== lastShakeScore.current) {
        setShakeIntensity(1.5);
        lastShakeScore.current = score;
    }
  }, [score]);

  // Aggressive yellow color injection
  useEffect(() => {
    bananaScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.color.set("#ffd300"); // Vibrant Sunflower Yellow
        mat.emissive.set("#ffb300"); // Warm golden glow
        mat.emissiveIntensity = 0.5;
        mat.metalness = 0;
        mat.roughness = 0.6;
      }
    });
  }, [bananaScene]);

  useFrame((state, delta) => {
    if (gameState !== "playing") return;

    // Decay screen shake
    if (shakeIntensity > 0) {
        setShakeIntensity(prev => Math.max(0, prev - delta * 3));
    }

    if (sceneRef.current && shakeIntensity > 0) {
        sceneRef.current.position.x = (Math.random() - 0.5) * shakeIntensity;
        sceneRef.current.position.y = (Math.random() - 0.5) * shakeIntensity;
    } else if (sceneRef.current) {
        sceneRef.current.position.set(0, 0, 0);
    }

    if (state.clock.elapsedTime - lastSpawn.current > 1.25) {
      const type = Math.random() > 0.3 ? "banana" : "hazard";
      setItems(prev => [...prev, {
        id: Math.random(),
        position: [Math.random() * 16 - 8, 12, -2],
        type,
        speed: 5 + Math.random() * 4
      }]);
      lastSpawn.current = state.clock.elapsedTime;
    }

    setItems(prev => {
        const next = [];
        for (const item of prev) {
            const newY = item.position[1] - (item.speed * delta);
            
            const dx = item.position[0] - playerPosition[0];
            const dy = newY - playerPosition[1];
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Slightly tighter collision for the bombs
            const colDist = item.type === "hazard" ? 1.4 : 1.2;

            if (dist < colDist) {
                if (item.type === "banana") {
                    onScore();
                    continue;
                } else {
                    onGameOver();
                }
            }

            if (newY > -10) {
                next.push({ ...item, position: [item.position[0], newY, item.position[2]] });
            }
        }
        return next;
    });
  });

  return (
    <>
      <color attach="background" args={["#a9d6e5"]} />
      <fog attach="fog" args={["#a9d6e5", 20, 100]} />
      
      <group ref={sceneRef}>
        <Garden />
        <Mojo position={playerPosition} score={score} />

        {items.map(item => (
          <group key={item.id} position={item.position} rotation={[0, item.id * 10, 0]}>
            <Float speed={4} rotationIntensity={item.type === "banana" ? 2 : 0.5}>
               {item.type === "banana" ? (
                  <>
                    <Clone 
                      object={bananaScene} 
                      scale={[2.5, 2.5, 2.5]} 
                    />
                    <pointLight intensity={40} color="#ffea00" distance={6} />
                  </>
               ) : (
                  <Hazard />
               )}
            </Float>
          </group>
        ))}
      </group>

      <Environment preset="forest" />
      <ambientLight intensity={1} />
      <directionalLight position={[10, 20, 10]} intensity={3} color="#fffcf2" castShadow />
      <pointLight position={[0, 10, 5]} intensity={2} color="#ffffff" />
    </>
  );
}

export default function Game({ onBack }: GameProps) {
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, -1, -2]);

  useEffect(() => {
    const saved = localStorage.getItem("mojo_quest_3d_highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Input Handling: Use window listener for better reliability
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (gameState !== "playing") return;
      const xPos = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const xMapped = (xPos / window.innerWidth) * 16 - 8;
      setPlayerPosition([xMapped, -1, -2]);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove, { passive: false });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, [gameState]);

  const startGame = () => {
    setScore(0);
    setGameState("playing");
    setPlayerPosition([0, -1, -2]);
  };

  const endGame = () => {
    setGameState("gameover");
  };

  useEffect(() => {
    if (gameState === "gameover" && score > highScore) {
      setHighScore(score);
      localStorage.setItem("mojo_quest_3d_highscore", score.toString());
    }
  }, [gameState, score, highScore]);

  return (
    <div 
        className="fixed inset-0 z-50 bg-[#a9d6e5] flex flex-col items-center justify-center overflow-hidden touch-none"
    >
      {/* 3D Scene */}
      <Suspense fallback={<div className="text-white font-mono animate-pulse">INITIATING MOJO REALM...</div>}>
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />
          <GameScene 
            gameState={gameState} 
            onScore={() => setScore(s => s + 1)} 
            onGameOver={endGame}
            playerPosition={playerPosition}
            score={score}
          />
        </Canvas>
      </Suspense>

      {/* HUD & Overlays */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center select-none pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
            <Timer className="w-3 h-3 text-white/40" />
            <span className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-bold">Bananas Collected</span>
        </div>
        <span className="text-6xl font-normal text-white tracking-widest" style={{ fontFamily: "'Instrument Serif', serif" }}>
            {score.toString().padStart(2, '0')}
        </span>
      </div>

      <button 
        onClick={onBack}
        className="absolute top-8 right-8 z-20 p-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
      >
        <X size={20} />
      </button>

      <AnimatePresence>
        {gameState === "start" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm text-center px-6"
          >
            <div className="max-w-xl w-full">
                <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                    className="text-7xl md:text-9xl text-white mb-4 uppercase italic tracking-tighter"
                >
                    Mojo Quest
                </motion.h2>
                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/60 mb-12 text-lg font-light tracking-wide leading-relaxed"
                >
                    Navigate the garden of abundance. <br/>
                    Collect the photorealistic yield. Avoid extinction.
                </motion.p>
                <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    onClick={startGame}
                    className="liquid-glass rounded-full px-24 py-6 text-xl text-white hover:scale-105 transition-transform cursor-pointer font-medium tracking-widest"
                >
                    INITIATE HARVEST
                </motion.button>
            </div>
          </motion.div>
        )}

        {gameState === "gameover" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl text-center px-6"
          >
            <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-16 max-w-lg w-full relative overflow-hidden backdrop-blur-2xl">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                
                <h2 
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                    className="text-6xl text-white mb-2 uppercase italic tracking-tight"
                >
                    Session Over
                </h2>
                
                <div className="flex gap-4 my-12">
                    <div className="flex-1 bg-white/[0.03] rounded-3xl p-8 border border-white/5">
                        <span className="text-white/30 uppercase tracking-[0.2em] text-[10px] font-black block mb-2">Yield</span>
                        <span className="text-5xl text-white font-serif">{score}</span>
                    </div>
                    <div className="flex-1 bg-white/[0.03] rounded-3xl p-8 border border-white/5">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Trophy size={12} className="text-white/40" />
                            <span className="text-white/30 uppercase tracking-[0.2em] text-[10px] font-black">Record</span>
                        </div>
                        <span className="text-5xl text-white font-serif">{highScore}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={startGame}
                        className="w-full bg-white text-black rounded-full py-6 text-lg font-bold hover:bg-white/90 transition-all hover:scale-[1.02] cursor-pointer tracking-widest"
                    >
                        RETRY SESSION
                    </button>
                    <button 
                        onClick={onBack}
                        className="w-full text-white/30 hover:text-white transition-colors py-4 text-xs uppercase tracking-[0.3em] font-black cursor-pointer"
                    >
                        EXIT TO HUB
                    </button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
