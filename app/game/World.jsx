import SkillsZone from './zones/SkillsZone';
import ProjectsZone from './zones/ProjectsZone';
import ExperienceZone from './zones/ExperienceZone';

export default function World() {
    return (
        <>
        {/* Ground */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -50]}>
                <planeGeometry args={[50, 200]} />
                
                <meshStandardMaterial color="darkslategray" />
            </mesh>

            <SkillsZone />

            <ProjectsZone />
            
            <ExperienceZone />
        </>
    );
};