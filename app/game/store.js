import { create } from 'zustand';

export const useGameStore = create(
    (set) => ({
        score: 0,
        skills: [],
        playerPosition: [0, 0, 0],
        playerRotation: { x: 0, y: 0, z: 0, w: 1 },
        
        addScore: (v) => set((s) => ({ score: s.score + v })),
        setPlayerPosition: (pos) => set({ playerPosition: pos }),
        setPlayerRotation: (rot) => set({ playerRotation: rot }),
        
        addSkill: (skill) =>
            set((s) => ({
            skills: s.skills.includes(skill)
                ? s.skills
                : [...s.skills, skill],
            })
        ),
    })
);