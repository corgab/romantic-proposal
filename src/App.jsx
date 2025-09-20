import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

function App() {
  // Application state management
  const [phase, setPhase] = useState('intro'); // intro | story | question | result
  const [typedText, setTypedText] = useState('');
  const [storyIndex, setStoryIndex] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState('');

  // DOM element references
  const noBtnRef = useRef(null);
  const yesBtnRef = useRef(null);
  const containerRef = useRef(null);
  const heartsIntervalRef = useRef(null);

  // Story text sequences
  const texts = [
    'Da quando ti ho conosciuta...',
    'I momenti con te sono unici...',
    'E ora vorrei chiederti una cosa...',
  ];

  // TYPEWRITER EFFECT FOR INTRO PHASE
  useEffect(() => {
    if (phase !== 'intro') return;

    const introText = 'Ho una domanda molto speciale per te...';
    let currentIndex = 0;
    setTypedText('');

    // Typewriter interval
    const typeInterval = setInterval(() => {
      currentIndex++;
      setTypedText(introText.slice(0, currentIndex));

      // Clear interval when text is fully typed
      if (currentIndex >= introText.length) {
        clearInterval(typeInterval);
        // Transition to story phase after a delay
        setTimeout(() => setPhase('story'), 1200);
      }
    }, 40);

    // Cleanup function to clear interval on unmount
    return () => clearInterval(typeInterval);
  }, [phase]);

  // STORY PHASE ANIMATION
  useEffect(() => {
    if (phase !== 'story') return;

    let currentLineIndex = 0;
    setStoryIndex(0);

    // Function to display story lines sequentially
    function showNextLine() {
      // Animate story line appearance
      gsap.fromTo(
        '.story-line',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );

      currentLineIndex++;

      // Update current line index
      if (currentLineIndex <= texts.length) {
        setStoryIndex(currentLineIndex - 1);

        // Schedule next line or transition to question phase
        setTimeout(() => {
          if (currentLineIndex < texts.length) {
            showNextLine();
          } else {
            setTimeout(() => setPhase('question'), 1600);
          }
        }, 2200);
      }
    }

    // Start story sequence
    showNextLine();
  }, [phase]);

  // QUESTION PHASE ANIMATION
  useEffect(() => {
    if (phase !== 'question') return;

    // Animate question title appearance
    gsap.fromTo(
      '.question-title',
      { scale: 0.6, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.7)' }
    );

    // Animate button appearance
    gsap.fromTo(
      [yesBtnRef.current, noBtnRef.current],
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0 }
    );
  }, [phase]);

  // HANDLE YES BUTTON CLICK
  function handleYes() {
    setAccepted(true);
    setMessage('Sapevo che avresti detto di sì! 💕');

    // Create initial burst of floating hearts
    for (let i = 0; i < 100; i++) {
      createFloatingHeart();
    }

    // Continue creating hearts at intervals
    let heartCount = 0;
    heartsIntervalRef.current = setInterval(() => {
      createFloatingHeart();
      heartCount++;

      // Stop after creating 50 additional hearts
      if (heartCount > 50) clearInterval(heartsIntervalRef.current);
    }, 200);
  }

  useEffect(() => {
    if (accepted) {
      gsap.fromTo(
        '.result-text',
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: 'elastic.out(1,0.5)' }
      );
    }
  }, [accepted]);

  // NO BUTTON ESCAPE BEHAVIOR
  useEffect(() => {
    const btnNo = noBtnRef.current;
    const btnYes = yesBtnRef.current;
    if (!btnNo || !btnYes) return;

    // Function to move No button away from cursor
    function moveAway(e) {
      const yesRect = btnYes.getBoundingClientRect();
      const noRect = btnNo.getBoundingClientRect();

      // Don't move if cursor is over Yes button
      if (
        e.clientX >= yesRect.left &&
        e.clientX <= yesRect.right &&
        e.clientY >= yesRect.top &&
        e.clientY <= yesRect.bottom
      )
        return;

      // Calculate distance from cursor to No button center
      const dx = e.clientX - (noRect.left + noRect.width / 2);
      const dy = e.clientY - (noRect.top + noRect.height / 2);
      const dist = Math.hypot(dx, dy);

      // Move button if cursor is too close
      if (dist < 120) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const maxX = containerRect.width - noRect.width;
        const maxY = containerRect.height - noRect.height;

        // Calculate new random position
        const newX = Math.random() * maxX;
        const newY = Math.random() * maxY;

        // Calculate offset for animation
        const offsetX = newX - (noRect.left - containerRect.left);
        const offsetY = newY - (noRect.top - containerRect.top);

        // Animate button to new position
        gsap.to(btnNo, {
          x: `+=${offsetX}`,
          y: `+=${offsetY}`,
          rotation: (Math.random() - 0.5) * 15,
          duration: 0.15,
          ease: 'power3.out',
        });
      }
    }

    // Add mousemove event listener
    window.addEventListener('mousemove', moveAway);

    // Cleanup function to remove event listener
    return () => window.removeEventListener('mousemove', moveAway);
  }, [phase]);

  // CREATE FLOATING HEART ANIMATION
  function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.className =
      'floating-heart absolute text-2xl pointer-events-none z-50';
    heart.innerHTML = '❤️';
    containerRef.current.appendChild(heart);

    // Random starting position (bottom of screen)
    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight + 20;

    // Random size
    const size = 20 + Math.random() * 30;
    heart.style.fontSize = `${size}px`;

    // Random color from pink/red palette
    const colors = ['#ff5252', '#ff4081', '#f50057', '#c2185b', '#e91e63'];
    heart.style.color = colors[Math.floor(Math.random() * colors.length)];

    // Set initial position and properties
    gsap.set(heart, {
      x,
      y,
      scale: 0.8 + Math.random() * 0.7,
      rotation: (Math.random() - 0.5) * 40,
    });

    // Animate heart floating upward
    gsap.to(heart, {
      y: -100,
      x: x + (Math.random() - 0.5) * 300,
      rotation: (Math.random() - 0.5) * 60,
      duration: 3 + Math.random() * 4,
      ease: 'sine.out',
      opacity: 0,
      onComplete: () => {
        // Remove heart from DOM after animation completes
        if (heart.parentNode) {
          heart.parentNode.removeChild(heart);
        }
      },
    });
  }

  // CLEANUP INTERVALS ON COMPONENT UNMOUNT
  useEffect(() => {
    return () => {
      if (heartsIntervalRef.current) {
        clearInterval(heartsIntervalRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className='relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-gradient-to-b from-pink-50 to-pink-100 font-[Poppins] antialiased'
    >
      {/* INTRO PHASE */}
      {phase === 'intro' && (
        <div className='text-center px-6'>
          <h2 className='text-2xl text-pink-800'>{typedText}</h2>
        </div>
      )}

      {/* STORY PHASE */}
      {phase === 'story' && (
        <div className='text-center px-6'>
          <h2 className='story-line text-3xl text-pink-900'>
            {texts[storyIndex]}
          </h2>
        </div>
      )}

      {/* QUESTION PHASE */}
      {phase === 'question' && (
        <div className='text-center px-6'>
          <h1 className='question-title text-4xl font-bold text-pink-700 mb-8'>
            Vuoi essere la mia ragazza? ❤️
          </h1>
          <div className='flex gap-6 justify-center'>
            <button
              ref={yesBtnRef}
              className='yes-btn px-6 py-3 rounded-xl text-white text-lg bg-gradient-to-r from-pink-500 to-pink-600 shadow-lg hover:scale-105 transition'
              onClick={handleYes}
            >
              Sí 💖
            </button>
            <button
              ref={noBtnRef}
              className='no-btn px-6 py-3 rounded-xl text-white text-lg bg-gray-800 shadow-lg cursor-pointer'
            >
              No 😅
            </button>
          </div>
        </div>
      )}

      {/* RESULT PHASE */}
      {accepted && (
        <>
          <div className='text-center px-6'>
            <h2 className='result-text text-3xl text-pink-800 font-semibold'>
              {message}
            </h2>
          </div>
          <div
            className='absolute top-0 right-0'
            id='heart-spam'
          ></div>
        </>
      )}
    </div>
  );
}

export default App;
