import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  WordLibsSoloMode,
  WordLibsSoloDifficulty,
  WordLibsSoloStep,
  WordLibsSoloPrompt,
  WordLibsSoloStoryTemplate,
  WordLibsSoloGameState,
  WordLibsSoloStats
} from '../../../types/wordLibsSolo';
import {
  getSoloTemplate,
  getPromptsForKeys,
  calculateSoloScore,
  SOLO_TOPICS
} from '../../../data/wordLibsSoloData';
import {
  getSoloStats,
  recordSoloGameCompletion
} from '../../../utils/wordLibsSoloStorage';
import { sound } from '../../../utils/audio';

import { WordLibsSoloModeSelect } from './WordLibsSoloModeSelect';
import { WordLibsSoloTopicSelect } from './WordLibsSoloTopicSelect';
import { WordLibsSoloDifficultySelect } from './WordLibsSoloDifficultySelect';
import { WordLibsSoloAnswerView } from './WordLibsSoloAnswerView';
import { WordLibsSoloStoryReveal } from './WordLibsSoloStoryReveal';
import { WordLibsSoloResultsView } from './WordLibsSoloResultsView';

interface WordLibsSoloContainerProps {
  onBackToHome: () => void;
}

export const WordLibsSoloContainer: React.FC<WordLibsSoloContainerProps> = ({
  onBackToHome
}) => {
  const [step, setStep] = useState<WordLibsSoloStep>('mode_select');
  const [selectedMode, setSelectedMode] = useState<WordLibsSoloMode>('classic');
  const [selectedTopic, setSelectedTopic] = useState<string>('School Chaos');
  const [selectedDifficulty, setSelectedDifficulty] = useState<WordLibsSoloDifficulty>('medium');

  // Solo Game State
  const [gameState, setGameState] = useState<WordLibsSoloGameState | null>(null);
  const [stats, setStats] = useState<WordLibsSoloStats>(getSoloStats());

  // Timer reference for speed mode
  const speedTimerRef = useRef<any>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (speedTimerRef.current) clearInterval(speedTimerRef.current);
    };
  }, []);

  // Mode Selection
  const handleSelectMode = (mode: WordLibsSoloMode) => {
    setSelectedMode(mode);

    if (mode === 'random_chaos') {
      // In Random Chaos, pick a randomized topic and proceed to difficulty
      const randomTopic = SOLO_TOPICS[Math.floor(Math.random() * SOLO_TOPICS.length)].name;
      setSelectedTopic(randomTopic);
      setStep('difficulty_select');
    } else {
      setStep('topic_select');
    }
  };

  // Topic Selection
  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    setStep('difficulty_select');
  };

  // Start Game with chosen configuration
  const handleStartGame = (diff: WordLibsSoloDifficulty) => {
    setSelectedDifficulty(diff);

    const isChaos = selectedMode === 'random_chaos';
    const template = getSoloTemplate({
      mode: selectedMode,
      topic: selectedTopic,
      difficulty: diff
    });

    const prompts = getPromptsForKeys(template.requiredPromptKeys, isChaos);

    // Calculate initial speed timer duration if speed mode
    let initialTimerDuration: number | undefined = undefined;
    if (selectedMode === 'speed') {
      initialTimerDuration = diff === 'easy' ? 45 : diff === 'medium' ? 70 : 95;
    }

    const newGameState: WordLibsSoloGameState = {
      mode: selectedMode,
      topic: selectedTopic,
      difficulty: diff,
      storyTemplate: template,
      prompts,
      currentPromptIndex: 0,
      answers: {},
      startTime: Date.now(),
      score: 0,
      streak: stats.currentStreak,
      completedStoriesCount: 0,
      chaosLevel: 'Mild',
      timeRemaining: initialTimerDuration,
      initialTimerDuration
    };

    setGameState(newGameState);
    setStep('playing');

    // Start Speed Timer if applicable
    if (selectedMode === 'speed' && initialTimerDuration) {
      if (speedTimerRef.current) clearInterval(speedTimerRef.current);
      speedTimerRef.current = setInterval(() => {
        setGameState((prev) => {
          if (!prev || prev.timeRemaining === undefined) return prev;
          if (prev.timeRemaining <= 1) {
            clearInterval(speedTimerRef.current);
            handleTimeExpired();
            return { ...prev, timeRemaining: 0, expiredTimer: true };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }
  };

  // Answer Submission
  const handleSubmitAnswer = (answerText: string) => {
    if (!gameState) return;

    const currentPrompt = gameState.prompts[gameState.currentPromptIndex];
    const updatedAnswers = {
      ...gameState.answers,
      [currentPrompt.key]: answerText
    };

    const nextIndex = gameState.currentPromptIndex + 1;

    if (nextIndex < gameState.prompts.length) {
      // Advance to next prompt
      setGameState({
        ...gameState,
        answers: updatedAnswers,
        currentPromptIndex: nextIndex
      });
    } else {
      // Completed all prompts!
      if (speedTimerRef.current) clearInterval(speedTimerRef.current);

      const endTime = Date.now();
      const durationSeconds = Math.max(1, Math.round((endTime - gameState.startTime) / 1000));

      const scoreCalc = calculateSoloScore({
        mode: gameState.mode,
        difficulty: gameState.difficulty,
        answersCount: Object.keys(updatedAnswers).length,
        totalPrompts: gameState.prompts.length,
        durationSeconds,
        streak: stats.currentStreak + 1,
        answers: updatedAnswers
      });

      // Count words entered
      let wordsCount = 0;
      Object.values(updatedAnswers).forEach((ans) => {
        wordsCount += String(ans).trim().split(/\s+/).length;
      });

      // Persist to local storage
      const updatedStats = recordSoloGameCompletion({
        score: scoreCalc.finalScore,
        promptsCount: Object.keys(updatedAnswers).length,
        wordsEnteredCount: wordsCount,
        durationSeconds,
        topic: gameState.topic,
        storyTitle: gameState.storyTemplate.title,
        isCompletedStory: true
      });
      setStats(updatedStats);

      setGameState({
        ...gameState,
        answers: updatedAnswers,
        endTime,
        score: scoreCalc.finalScore,
        streak: updatedStats.currentStreak,
        chaosLevel: scoreCalc.chaosLevel
      });

      setStep('reveal');
    }
  };

  // Handle timer expiration in Speed mode
  const handleTimeExpired = () => {
    sound.wrong();
    setGameState((prev) => {
      if (!prev) return prev;
      const endTime = Date.now();
      const durationSeconds = Math.max(1, Math.round((endTime - prev.startTime) / 1000));
      const answersCount = Object.keys(prev.answers).length;

      const scoreCalc = calculateSoloScore({
        mode: prev.mode,
        difficulty: prev.difficulty,
        answersCount,
        totalPrompts: prev.prompts.length,
        durationSeconds,
        streak: 0,
        answers: prev.answers
      });

      const updatedStats = recordSoloGameCompletion({
        score: scoreCalc.finalScore,
        promptsCount: answersCount,
        wordsEnteredCount: answersCount,
        durationSeconds,
        topic: prev.topic,
        storyTitle: prev.storyTemplate.title,
        isCompletedStory: false
      });
      setStats(updatedStats);

      return {
        ...prev,
        endTime,
        score: scoreCalc.finalScore,
        streak: 0,
        chaosLevel: scoreCalc.chaosLevel,
        expiredTimer: true
      };
    });

    setStep('results');
  };

  // Replay Handlers
  const handlePlayAgain = () => {
    if (!gameState) return;
    const isChaos = gameState.mode === 'random_chaos';
    const nextTemplate = getSoloTemplate({
      mode: gameState.mode,
      topic: gameState.topic,
      difficulty: gameState.difficulty,
      excludeTemplateId: gameState.storyTemplate.id
    });
    const prompts = getPromptsForKeys(nextTemplate.requiredPromptKeys, isChaos);

    let initialTimerDuration: number | undefined = undefined;
    if (gameState.mode === 'speed') {
      initialTimerDuration =
        gameState.difficulty === 'easy' ? 45 : gameState.difficulty === 'medium' ? 70 : 95;
    }

    setGameState({
      mode: gameState.mode,
      topic: gameState.topic,
      difficulty: gameState.difficulty,
      storyTemplate: nextTemplate,
      prompts,
      currentPromptIndex: 0,
      answers: {},
      startTime: Date.now(),
      score: 0,
      streak: stats.currentStreak,
      completedStoriesCount: (gameState.completedStoriesCount || 0) + 1,
      chaosLevel: 'Mild',
      timeRemaining: initialTimerDuration,
      initialTimerDuration
    });

    setStep('playing');

    if (gameState.mode === 'speed' && initialTimerDuration) {
      if (speedTimerRef.current) clearInterval(speedTimerRef.current);
      speedTimerRef.current = setInterval(() => {
        setGameState((prev) => {
          if (!prev || prev.timeRemaining === undefined) return prev;
          if (prev.timeRemaining <= 1) {
            clearInterval(speedTimerRef.current);
            handleTimeExpired();
            return { ...prev, timeRemaining: 0, expiredTimer: true };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }
  };

  const handleNextEndlessStory = () => {
    // In Endless mode, pick next topic and continue
    const nextTopic = SOLO_TOPICS[Math.floor(Math.random() * SOLO_TOPICS.length)].name;
    setSelectedTopic(nextTopic);
    const nextTemplate = getSoloTemplate({
      mode: 'endless',
      topic: nextTopic,
      difficulty: selectedDifficulty
    });
    const prompts = getPromptsForKeys(nextTemplate.requiredPromptKeys);

    setGameState({
      mode: 'endless',
      topic: nextTopic,
      difficulty: selectedDifficulty,
      storyTemplate: nextTemplate,
      prompts,
      currentPromptIndex: 0,
      answers: {},
      startTime: Date.now(),
      score: 0,
      streak: stats.currentStreak,
      completedStoriesCount: (gameState?.completedStoriesCount || 0) + 1,
      chaosLevel: 'Mild'
    });

    setStep('playing');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* View Switcher */}
      <main className="flex-1 flex flex-col">
        {step === 'mode_select' && (
          <WordLibsSoloModeSelect
            onSelectMode={handleSelectMode}
            onBackToHome={onBackToHome}
            currentStreak={stats.currentStreak}
          />
        )}

        {step === 'topic_select' && (
          <WordLibsSoloTopicSelect
            mode={selectedMode}
            onSelectTopic={handleSelectTopic}
            onBack={() => setStep('mode_select')}
          />
        )}

        {step === 'difficulty_select' && (
          <WordLibsSoloDifficultySelect
            mode={selectedMode}
            topic={selectedTopic}
            onSelectDifficulty={handleStartGame}
            onBack={() => setStep(selectedMode === 'random_chaos' ? 'mode_select' : 'topic_select')}
          />
        )}

        {step === 'playing' && gameState && (
          <WordLibsSoloAnswerView
            mode={gameState.mode}
            topic={gameState.topic}
            difficulty={gameState.difficulty}
            prompts={gameState.prompts}
            currentPromptIndex={gameState.currentPromptIndex}
            answers={gameState.answers}
            timeRemaining={gameState.timeRemaining}
            onSubmitAnswer={handleSubmitAnswer}
          />
        )}

        {step === 'reveal' && gameState && (
          <WordLibsSoloStoryReveal
            storyTemplate={gameState.storyTemplate}
            answers={gameState.answers}
            topic={gameState.topic}
            onProceedToResults={() => setStep('results')}
          />
        )}

        {step === 'results' && gameState && (
          <WordLibsSoloResultsView
            score={gameState.score}
            scoreBreakdown={calculateSoloScore({
              mode: gameState.mode,
              difficulty: gameState.difficulty,
              answersCount: Object.keys(gameState.answers).length,
              totalPrompts: gameState.prompts.length,
              durationSeconds: Math.max(
                1,
                Math.round(((gameState.endTime || Date.now()) - gameState.startTime) / 1000)
              ),
              streak: stats.currentStreak,
              answers: gameState.answers
            })}
            storyTitle={gameState.storyTemplate.title}
            promptsCount={Object.keys(gameState.answers).length}
            durationSeconds={Math.max(
              1,
              Math.round(((gameState.endTime || Date.now()) - gameState.startTime) / 1000)
            )}
            streak={stats.currentStreak}
            mode={gameState.mode}
            topic={gameState.topic}
            stats={stats}
            isExpiredTimer={gameState.expiredTimer}
            onPlayAgain={handlePlayAgain}
            onNewTopic={() => setStep('topic_select')}
            onChangeMode={() => setStep('mode_select')}
            onBackToHome={onBackToHome}
            onNextEndlessStory={gameState.mode === 'endless' ? handleNextEndlessStory : undefined}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-3 text-center text-xs text-slate-500 font-mono">
        Word Libs Solo • Offline-first Narrative Sandbox • No Room Codes Required
      </footer>
    </div>
  );
};
