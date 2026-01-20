import { useEffect, useRef } from 'react';

function useKeyControls(controlsRef, map) {
    useEffect(() => {
        const handleKeydown = (e) => {
            const key = e.key
            if (!(key in map)) return
            controlsRef.current[map[key]] = true
        };

        const handleKeyup = (e) => {
            const key = e.key
            if (!(key in map)) return
            controlsRef.current[map[key]] = false
        };

        window.addEventListener('keydown', handleKeydown);
        window.addEventListener('keyup', handleKeyup);

        return () => {
            window.removeEventListener('keydown', handleKeydown)
            window.removeEventListener('keyup', handleKeyup)
        };
    }, [controlsRef, map]);
};

const keyControlMap = {
  ' ': 'brake',
  ArrowDown: 'backward',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'forward',
  a: 'left',
  d: 'right',
  r: 'reset',
  s: 'backward',
  w: 'forward',
};

export function useControls() {
    const controls = useRef({
        backward: false,
        brake: false,
        forward: false,
        left: false,
        reset: false,
        right: false,
    });

    useKeyControls(controls, keyControlMap);

    return controls;
};