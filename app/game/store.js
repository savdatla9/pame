import { create } from 'zustand';

export const useGameStore = create(
    (set) => ({
        score: 0,

        skills: [],
        
        addScore: (v) => set((s) => ({ score: s.score + v })),
        
        addSkill: (skill) =>
            set((s) => ({
            skills: s.skills.includes(skill)
                ? s.skills
                : [...s.skills, skill],
            })
        ),
    })
);