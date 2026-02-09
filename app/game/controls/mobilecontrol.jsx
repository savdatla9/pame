import { useEffect } from 'react'

export default function MobileJoystick({ controls }) {
    useEffect(() => {
        let startX = 0;
        let startY = 0;

        const onTouchStart = (e) => {
            const t = e.touches[0]
            startX = t.clientX
            startY = t.clientY
        };

        const onTouchMove = (e) => {
            const t = e.touches[0]
            const dx = t.clientX - startX
            const dy = t.clientY - startY

            controls.current.forward = dy < -20
            controls.current.backward = dy > 20
            controls.current.left = dx < -20
            controls.current.right = dx > 20
        };

        const onTouchEnd = () => {
            controls.current.forward = false
            controls.current.backward = false
            controls.current.left = false
            controls.current.right = false
        };

        window.addEventListener('touchstart', onTouchStart);
        window.addEventListener('touchmove', onTouchMove);
        window.addEventListener('touchend', onTouchEnd);

        return () => {
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [controls]);

    return null
};