import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  HangmanSoloCategory,
  HangmanSoloDifficulty,
  HangmanSoloStep,
  HangmanSoloGameState,
  HangmanSoloStats
} from '../../../types/hangmanSolo';
import {
  getRandomSoloWord,
  getDifficultyMaxMistakes,
  calculateHangmanSoloScore
} from '../../../data/hangmanSoloData';
import {
  getHangmanSoloStats,
  recordHangmanSoloGame
} from '../../../utils/hangmanSoloStorage';
import { HangmanSoloCategorySelect } from './HangmanSoloCategorySelect';
import { HangmanSoloDifficultySelect } from './HangmanSoloDifficultySelect';
import { HangmanSoloGameView } from './HangmanSoloGameView';
import { HangmanSoloResultsView } from './HangmanSoloResultsView';
import { sound } from '../../../utils/audio';

interface HangmanSoloContainerProps {
  onBackToHangmanHome: () => void;
}

export const HangmanSoloContainer: React.FC<HangmanSoloContainerProps> = ({
  onBackToHangmanHome
}) => {
  const [step, setStep] = useState<HangmanSoloStep>('category_select');
  const [selectedCategory, setSelectedCategory] = useState<HangmanSoloCategory>('Animals');
  const [selectedDifficulty, setSelectedDifficulty] = useState<HangmanSoloDifficulty>('medium');
  const [stats, setStats] = useState<HangmanSoloStats>(() => getHangmanSoloStats());
  const [gameState, setGameState] = useState<HangmanSoloGameState | null>(null);
  const [usedWords, setUsedWords] = useState<string[]>([]);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize a new round
  const startNewGame = useCallback(
    (cat: HangmanSoloCategory, diff: HangmanSoloDifficulty, prevWord?: string) => {
      setUsedWords((prevUsed) => {
        const { word, resolvedCategory, hint } = getRandomSoloWord(cat, diff, prevWord, prevUsed);
        const maxMistakes = getDifficultyMaxMistakes(diff);

        const initialGuessed = new Set<string>();
        // Non-letters (spaces, hyphens) are automatically revealed
        for (const ch of word) {
          if (!/^[A-Z]$/.test(ch)) {
            initialGuessed.add(ch);
          }
        }

        const newGameState: HangmanSoloGameState = {
          category: cat,
          resolvedCategory,
          difficulty: diff,
          word,
          hint,
          guessedLetters: initialGuessed,
          mistakes: 0,
          maxMistakes,
          remainingAttempts: maxMistakes,
          status: 'playing',
          score: 0,
          startTime: Date.now(),
          elapsedSeconds: 0
        };

        setGameState(newGameState);
        setStep('playing');
        return [...prevUsed, word];
      });
    },
    []
  );

  // Timer tick effect
  useEffect(() => {
    if (step === 'playing' && gameState && gameState.status === 'playing') {
      timerRef.current = setInterval(() => {
        setGameState((prev) => {
          if (!prev || prev.status !== 'playing') return prev;
          return {
            ...prev,
            elapsedSeconds: prev.elapsedSeconds + 1
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [step, gameState?.status]);

  // Handle letter guess
  const handleGuessLetter = useCallback(
    (letter: string) => {
      if (!gameState || gameState.status !== 'playing') return;
      if (gameState.guessedLetters.has(letter)) return;

      const nextGuessed = new Set(gameState.guessedLetters);
      nextGuessed.add(letter);

      const isLetterInWord = gameState.word.includes(letter);
      let nextMistakes = gameState.mistakes;
      let nextRemaining = gameState.remainingAttempts;

      if (isLetterInWord) {
        sound.correct();
      } else {
        sound.wrong();
        nextMistakes += 1;
        nextRemaining = Math.max(0, gameState.maxMistakes - nextMistakes);
      }

      // Check win condition: all alphabetic characters in word are guessed
      const isWon = gameState.word
        .split('')
        .every((ch) => !/^[A-Z]$/.test(ch) || nextGuessed.has(ch));

      const isLost = !isWon && nextMistakes >= gameState.maxMistakes;

      // Count unique correct letter guesses
      const uniqueCorrectLetters = Array.from(nextGuessed).filter(
        (ch: string) => /^[A-Z]$/.test(ch) && gameState.word.includes(ch)
      ).length;

      if (isWon || isLost) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const durationSeconds = Math.max(1, gameState.elapsedSeconds);
        const streakForCalc = isWon ? stats.currentStreak + 1 : 0;

        const breakdown = calculateHangmanSoloScore({
          won: isWon,
          difficulty: gameState.difficulty,
          uniqueCorrectLetters,
          remainingAttempts: nextRemaining,
          mistakes: nextMistakes,
          durationSeconds,
          streak: stats.currentStreak
        });

        if (isWon) {
          sound.win();
        } else {
          sound.gameOver();
        }

        const updatedStats = recordHangmanSoloGame({
          won: isWon,
          score: breakdown.finalScore,
          durationSeconds,
          category: gameState.resolvedCategory,
          totalGuesses: nextGuessed.size,
          correctGuesses: uniqueCorrectLetters
        });

        setStats(updatedStats);

        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            guessedLetters: nextGuessed,
            mistakes: nextMistakes,
            remainingAttempts: nextRemaining,
            status: isWon ? 'won' : 'lost',
            score: breakdown.finalScore,
            scoreBreakdown: breakdown
          };
        });

        // Transition to results screen after brief animation delay
        setTimeout(() => {
          setStep('results');
        }, 600);
      } else {
        // Intermediate live score update
        const tempScore = calculateHangmanSoloScore({
          won: false,
          difficulty: gameState.difficulty,
          uniqueCorrectLetters,
          remainingAttempts: nextRemaining,
          mistakes: nextMistakes,
          durationSeconds: gameState.elapsedSeconds,
          streak: stats.currentStreak
        }).finalScore;

        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            guessedLetters: nextGuessed,
            mistakes: nextMistakes,
            remainingAttempts: nextRemaining,
            score: tempScore
          };
        });
      }
    },
    [gameState, stats.currentStreak]
  );

  // Give Up handler
  const handleGiveUp = useCallback(() => {
    if (!gameState || gameState.status !== 'playing') return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    sound.gameOver();

    const uniqueCorrectLetters = Array.from(gameState.guessedLetters).filter(
      (ch: string) => /^[A-Z]$/.test(ch) && gameState.word.includes(ch)
    ).length;

    const breakdown = calculateHangmanSoloScore({
      won: false,
      difficulty: gameState.difficulty,
      uniqueCorrectLetters,
      remainingAttempts: 0,
      mistakes: gameState.maxMistakes,
      durationSeconds: gameState.elapsedSeconds,
      streak: stats.currentStreak
    });

    const updatedStats = recordHangmanSoloGame({
      won: false,
      score: breakdown.finalScore,
      durationSeconds: Math.max(1, gameState.elapsedSeconds),
      category: gameState.resolvedCategory,
      totalGuesses: gameState.guessedLetters.size,
      correctGuesses: uniqueCorrectLetters
    });

    setStats(updatedStats);

    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        mistakes: prev.maxMistakes,
        remainingAttempts: 0,
        status: 'lost',
        score: breakdown.finalScore,
        scoreBreakdown: breakdown
      };
    });

    setStep('results');
  }, [gameState, stats.currentStreak]);

  // Restart current word
  const handleRestartCurrentWord = useCallback(() => {
    if (!gameState) return;

    const initialGuessed = new Set<string>();
    for (const ch of gameState.word) {
      if (!/^[A-Z]$/.test(ch)) {
        initialGuessed.add(ch);
      }
    }

    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        guessedLetters: initialGuessed,
        mistakes: 0,
        remainingAttempts: prev.maxMistakes,
        status: 'playing',
        score: 0,
        startTime: Date.now(),
        elapsedSeconds: 0,
        scoreBreakdown: undefined
      };
    });
  }, [gameState]);

  // View routing
  switch (step) {
    case 'category_select':
      return (
        <HangmanSoloCategorySelect
          stats={stats}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setStep('difficulty_select');
          }}
          onBackToHome={onBackToHangmanHome}
        />
      );

    case 'difficulty_select':
      return (
        <HangmanSoloDifficultySelect
          category={selectedCategory}
          onSelectDifficulty={(diff) => {
            setSelectedDifficulty(diff);
            startNewGame(selectedCategory, diff);
          }}
          onBackToCategories={() => setStep('category_select')}
        />
      );

    case 'playing':
      if (!gameState) return null;
      return (
        <HangmanSoloGameView
          gameState={gameState}
          streak={stats.currentStreak}
          onGuessLetter={handleGuessLetter}
          onGiveUp={handleGiveUp}
          onRestartCurrentWord={handleRestartCurrentWord}
          onBackToHome={onBackToHangmanHome}
        />
      );

    case 'results':
      if (!gameState) return null;
      return (
        <HangmanSoloResultsView
          gameState={gameState}
          stats={stats}
          onPlayAgain={() => startNewGame(selectedCategory, selectedDifficulty, gameState.word)}
          onChangeCategory={() => setStep('category_select')}
          onChangeDifficulty={() => setStep('difficulty_select')}
          onBackToHome={onBackToHangmanHome}
        />
      );
  }
};
