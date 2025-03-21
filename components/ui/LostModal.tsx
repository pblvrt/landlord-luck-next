"use client";

import { useGameState } from "@/context/GameStateProvider";
import { useAudio } from "@/context/AudioProvider";
import { useEffect, useState } from "react";
import styles from "@/styles/LostModal.module.css";
import Modal from "@/components/ui/Modal";

export default function LostModal() {
  const { state, dispatch } = useGameState();
  const { playSound } = useAudio();
  const [isOpen, setIsOpen] = useState(false);

  // Update modal open state when game is lost
  useEffect(() => {
    setIsOpen(state.lost);
  }, [state.lost]);

  // Play game over sound when lost state becomes true
  useEffect(() => {
    if (state.lost) {
      playSound("gameover");
    }
  }, [state.lost]);

  const handleResetGame = () => {
    dispatch({ type: "RESET_GAME" });
  };

  const handleClose = () => {
    // Optional: you might want to prevent closing without resetting
    // or you could make closing equivalent to resetting
    handleResetGame();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className={styles.lostModal}>
      <div className={styles.modalContent}>
        <p className={styles.modalText}>
          You couldn&apos;t pay the rent of{" "}
          {state.rentSchedule[state.floor].rent} coins.
        </p>
        <p className={styles.modalStats}>
          You reached floor {state.floor + 1} and collected a total of{" "}
          {state.coins} coins.
        </p>
        <button onClick={handleResetGame} className={styles.resetButton}>
          Try Again
        </button>
      </div>
    </Modal>
  );
}
