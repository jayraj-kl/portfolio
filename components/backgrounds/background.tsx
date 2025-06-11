import Aurora from "./Aurora";
import MagnetLines from "./Magnet";
import Particles from "./Particles";

export function AuroraBackground() {
  return (
    <div className="w-full h-full">
      <Aurora
        colorStops={["#928DAB", "#007485", "#D5CABD"]}
        blend={0.5}
        amplitude={0.5}
        speed={1}
      />
    </div>
  );
}

export function MagnetLinesBackground() {
  return (
    <>
      <div className="flex justify-center w-full">
        <div className="flex items-center justify-center w-full h-full">
          <div className="border-2 border-black dark:border-white rounded-lg p-4 shadow-md backdrop-blur-sm bg-white/5 dark:bg-black/5">
            <MagnetLines
              rows={9}
              columns={9}
              containerSize="45vmin"
              lineColor="#928DAB"
              lineWidth="0.4vmin"
              lineHeight="5vmin"
              baseAngle={0}
              style={{ margin: "0" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export function ParticlesBackground() {
  return (
    <>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles
          particleColors={["#928DAB", "#007485", "#D5CABD"]}
          particleCount={700}
          particleSpread={10}
          speed={0.05}
          particleBaseSize={200}
          moveParticlesOnHover={true}
          alphaParticles={false}
          sizeRandomness={0.5}
          disableRotation={false}
        />
      </div>
    </>
  );
}
