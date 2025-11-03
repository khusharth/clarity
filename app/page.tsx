"use client";
import Matrix from "./components/Matrix";
import ConfettiOverlay from "./components/Confetti";
import Toasts from "./components/Toasts";
import FloatingCtas from "./components/FloatingCtas";

export default function Home() {
  return (
    <>
      <Matrix />
      <FloatingCtas />

      <ConfettiOverlay />
      <Toasts />
    </>
  );
}
