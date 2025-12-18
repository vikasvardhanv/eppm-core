
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrandLogo } from '../constants';

// --- Game Constants ---
const BOARD_SIZE = 20;
const INITIAL_SNAKE_POSITION = [{ x: 10, y: 10 }];
const INITIAL_FOOD_POSITION = { x: 15, y: 15 };
const GAME_SPEED_MS = 150;

type Position = { x: number; y: number };

const DIRECTIONS: Record<string, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// --- Helper Functions ---
const getRandomPosition = (snake: Position[]): Position => {
  let newPos: Position;
  do {
    newPos = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  } while (snake.some(segment => segment.x === newPos.x && segment.y === newPos.y));
  return newPos;
};

// --- Component ---
export const SnakeGame: React.FC<{ onRestart: () => void }> = ({ onRestart }) => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE_POSITION);
  const [food, setFood] = useState<Position>(INITIAL_FOOD_POSITION);
  const [direction, setDirection] = useState<Position>(DIRECTIONS.RIGHT);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const gameLoopRef = useRef<number | null>(null);
  const directionRef = useRef<Position>(DIRECTIONS.RIGHT);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE_POSITION);
    setFood(getRandomPosition(INITIAL_SNAKE_POSITION));
    setDirection(DIRECTIONS.RIGHT);
    directionRef.current = DIRECTIONS.RIGHT;
    setIsGameOver(false);
    setScore(0);
  }, []);

  const changeDirection = useCallback((newDir: Position) => {
    // Prevent 180-degree turns
    if (
      (newDir.x !== 0 && newDir.x === -directionRef.current.x) ||
      (newDir.y !== 0 && newDir.y === -directionRef.current.y)
    ) {
      return;
    }
    directionRef.current = newDir;
    setDirection(newDir);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp': changeDirection(DIRECTIONS.UP); break;
      case 'ArrowDown': changeDirection(DIRECTIONS.DOWN); break;
      case 'ArrowLeft': changeDirection(DIRECTIONS.LEFT); break;
      case 'ArrowRight': changeDirection(DIRECTIONS.RIGHT); break;
    }
  }, [changeDirection]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const gameTick = useCallback(() => {
    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };
      const currentDir = directionRef.current;

      head.x += currentDir.x;
      head.y += currentDir.y;

      // Wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setIsGameOver(true);
        return prevSnake;
      }

      // Self collision
      if (prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Food collision
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 10);
        setFood(getRandomPosition(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food]);

  useEffect(() => {
    if (!isGameOver) {
      gameLoopRef.current = window.setInterval(gameTick, GAME_SPEED_MS);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isGameOver, gameTick]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-panel rounded-[2.5rem] shadow-2xl border border-white/5 flex flex-col items-center p-6 sm:p-10">
        <header className="w-full flex justify-between items-center mb-8">
           <div className="flex items-center gap-4">
              <BrandLogo className="h-12 w-12" />
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight leading-none">Highshift Arcade</h2>
                <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mt-1.5">Score: {score}</p>
              </div>
           </div>
           <button onClick={onRestart} className="text-xs font-bold text-white/40 hover:text-white transition uppercase tracking-widest">Quit</button>
        </header>

        <div 
          className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden grid shadow-inner" 
          style={{ 
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
            width: 'min(320px, 80vw)',
            height: 'min(320px, 80vw)'
          }}
        >
          {isGameOver && (
             <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-in fade-in duration-300">
                <h3 className="text-4xl font-black text-white tracking-tighter mb-2">GAME OVER</h3>
                <p className="text-sky-400 font-bold uppercase tracking-widest text-sm mb-8">Final: {score}</p>
                <button 
                  onClick={resetGame}
                  className="bg-sky-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20 active:scale-95"
                >
                  REBOOT SESSION
                </button>
             </div>
          )}
          
          {/* Food */}
          <div
            className="bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] rounded-full animate-pulse m-[20%]"
            style={{ gridColumn: food.x + 1, gridRow: food.y + 1 }}
          />

          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className="bg-sky-400 border border-white/10"
              style={{ 
                gridColumn: segment.x + 1, 
                gridRow: segment.y + 1, 
                opacity: 1 - (index * 0.015),
                borderRadius: index === 0 ? '4px' : '2px',
                zIndex: 10
              }}
            />
          ))}
        </div>

        {/* Mobile Controls (D-Pad) */}
        <div className="mt-10 grid grid-cols-3 gap-2 sm:hidden">
          <div />
          <ControlButton icon="↑" onClick={() => changeDirection(DIRECTIONS.UP)} />
          <div />
          <ControlButton icon="←" onClick={() => changeDirection(DIRECTIONS.LEFT)} />
          <ControlButton icon="↓" onClick={() => changeDirection(DIRECTIONS.DOWN)} />
          <ControlButton icon="→" onClick={() => changeDirection(DIRECTIONS.RIGHT)} />
        </div>

        <p className="hidden sm:block text-white/20 text-[10px] font-bold uppercase tracking-[0.3em] mt-8">Use Arrows to Navigate</p>
      </div>
    </div>
  );
};

const ControlButton: React.FC<{ icon: string; onClick: () => void }> = ({ icon, onClick }) => (
  <button 
    onClick={onClick}
    className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center text-white text-2xl font-bold active:bg-sky-500/40 active:scale-90 transition-all border-white/10"
  >
    {icon}
  </button>
);
