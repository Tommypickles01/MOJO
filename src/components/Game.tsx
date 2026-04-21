import { useEffect, useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

function Mojo({ targetXRef, score }: { targetXRef: React.MutableRefObject<number>, score: number }) {
  const { scene } = useGLTF(ASSETS.MOJO);
  const ref = useRef<THREE.Group>(null);
  const [isExcited, setIsExcited] = useState(false);
  const lastScore = useRef(score);
  const { viewport } = useThree();

  // Snapshot position for collision
  const currentPos = useRef(new THREE.Vector3(0, -1, -2));

  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      scene.position.x += (scene.position.x - center.x);
      scene.position.y += (scene.position.y - center.y);
      scene.position.z += (scene.position.z - center.z);
    }
  }, [scene]);

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

  useFrame((state, delta) => {
    if (ref.current) {
      // Calculate target world X based on viewport and Ref input
      // targetXRef.current is -0.5 to 0.5
      const targetWorldX = targetXRef.current * viewport.width * 1.2;
      
      // Buttery smooth LERP but very snappy (lerp 15-20)
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetWorldX, delta * 20);
      ref.current.position.y = -1;
      ref.current.position.z = -2;

      // Update position for external reference if needed
      currentPos.current.copy(ref.current.position);
      
      if (isExcited) {
        ref.current.position.y += Math.sin(state.clock.elapsedTime * 30) * 0.2 + 0.5;
        ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 40) * 0.2;
      }

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

function GameItem({ item, targetXRef, viewport, onScore, onGameOver, onRemove, bananaScene }: { 
    item: GameObject, 
    targetXRef: React.MutableRefObject<number>,
    viewport: any,
    onScore: () => void,
    onGameOver: () => void,
    onRemove: (id: number) => void,
    bananaScene: THREE.Group
}) {
    const ref = useRef<THREE.Group>(null);
    const playerXRef = useRef(0);

    useFrame((_state, delta) => {
        if (!ref.current) return;
        ref.current.position.y -= item.speed * delta;
        
        // Calculate player position snap for accurate collision (matches Mojo's snappy movement)
        // We use the same math as Mojo but inside the item loop for accuracy
        const targetWorldX = targetXRef.current * viewport.width * 1.2;
        playerXRef.current = THREE.MathUtils.lerp(playerXRef.current, targetWorldX, delta * 20);

        // Collision Detection
        const dx = ref.current.position.x - playerXRef.current;
        const dy = ref.current.position.y - (-1); // playerY is -1
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const colDist = item.type === "hazard" ? 1.5 : 1.3;
        if (dist < colDist) {
            if (item.type === "banana") {
                onScore();
                onRemove(item.id);
            } else {
                onGameOver();
            }
        }
        
        if (ref.current.position.y < -12) {
            onRemove(item.id);
        }
    });

    return (
        <group ref={ref} position={item.position} rotation={[0, item.id * 10, 0]}>
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
    );
}

function GameScene({ 
    gameState, 
    onScore, 
    onGameOver, 
    score,
    targetXRef
}: { 
    gameState: string, 
    onScore: () => void, 
    onGameOver: () => void,
    score: number,
    targetXRef: React.MutableRefObject<number>
}) {
  const [items, setItems] = useState<GameObject[]>([]);
  const lastSpawn = useRef(0);
  const lastShakeScore = useRef(0);
  const shakeRef = useRef(0);
  const sceneRef = useRef<THREE.Group>(null);
  const mojoRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const { scene: bananaScene } = useGLTF(ASSETS.BANANA);

  // Boundaries calculation
  const spawnWidth = viewport.width * 0.9;
  const playerZ = -2;

  // Screen shake trigger logic
  useEffect(() => {
    if (score > 0 && score % 20 === 0 && score !== lastShakeScore.current) {
        shakeRef.current = 1.2;
        lastShakeScore.current = score;
    }
  }, [score]);

  // Banana styling
  useMemo(() => {
    bananaScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.color.set("#ffd300");
        mat.emissive.set("#ffb300");
        mat.emissiveIntensity = 0.5;
        mat.metalness = 0;
        mat.roughness = 0.6;
      }
    });
  }, [bananaScene]);

  useFrame((state, delta) => {
    if (gameState !== "playing") return;

    // Shake logic (Direct Ref Manipulation = High Perf)
    if (shakeRef.current > 0) {
        shakeRef.current = Math.max(0, shakeRef.current - delta * 2.5);
        if (sceneRef.current) {
            sceneRef.current.position.x = (Math.random() - 0.5) * shakeRef.current;
            sceneRef.current.position.y = (Math.random() - 0.5) * shakeRef.current;
        }
    } else if (sceneRef.current && (sceneRef.current.position.x !== 0 || sceneRef.current.position.y !== 0)) {
        sceneRef.current.position.set(0, 0, 0);
    }

    // Spawn Logic
    if (state.clock.elapsedTime - lastSpawn.current > (isMobile ? 1.6 : 1.1)) {
      const type = Math.random() > 0.35 ? "banana" : "hazard";
      setItems(prev => [...prev, {
        id: Math.random(),
        position: [ (Math.random() - 0.5) * spawnWidth, 12, playerZ ],
        type,
        speed: (isMobile ? 4 : 6) + Math.random() * 4
      }]);
      lastSpawn.current = state.clock.elapsedTime;
    }
  });

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <>
      <color attach="background" args={["#a9d6e5"]} />
      <fog attach="fog" args={["#a9d6e5", 15, 60]} />
      
      <group ref={sceneRef}>
        <Garden />
        <Mojo 
          ref={mojoRef}
          targetXRef={targetXRef} 
          score={score} 
        />

        {items.map(item => (
          <GameItem 
            key={item.id} 
            item={item} 
            targetXRef={targetXRef}
            viewport={viewport}
            onScore={onScore}
            onGameOver={onGameOver}
            onRemove={removeItem}
            bananaScene={bananaScene}
          />
        ))}
      </group>

      {!isMobile && <Environment preset="forest" />}
      <ambientLight intensity={isMobile ? 2.5 : 1.2} />
      <directionalLight position={[10, 20, 10]} intensity={2.5} color="#fffcf2" castShadow={!isMobile} />
      <pointLight position={[0, 10, 5]} intensity={1.5} color="#ffffff" />
    </>
  );
}

const isMobile = typeof window !== "undefined" && window.matchMedia("(hover: none) and (pointer: coarse)").matches;

export default function Game({ onBack }: GameProps) {
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const targetXRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem("mojo_quest_3d_highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Input Handling: Use Ref to avoid laggy React re-renders
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (gameState !== "playing") return;
      if ('touches' in e) e.preventDefault();
      const xPos = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const ratio = (xPos / window.innerWidth) - 0.5;
      targetXRef.current = ratio;
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
    targetXRef.current = 0;
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
        style={{ backgroundColor: '#a9d6e5' }}
    >
      {/* 3D Scene */}
      <Suspense fallback={<div className="text-white font-mono animate-pulse">INITIATING MOJO REALM...</div>}>
        <Canvas
          shadows={!isMobile}
          dpr={isMobile ? 1 : [1, 2]}
          gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
        >
          <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />
          <GameScene 
            gameState={gameState} 
            onScore={() => setScore(s => s + 1)} 
            onGameOver={endGame}
            targetXRef={targetXRef}
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
                    Banana Catch
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-white/40 mb-8 text-sm tracking-widest uppercase"
                >
                    {isMobile ? "Slide finger left & right to move" : "Move mouse left & right to move"}
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
