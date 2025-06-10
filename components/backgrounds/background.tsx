import Aurora from "./Aurora";
import MagnetLines from "./Magnet";

export function AuroraBackground() {
  return (
    <>
      {/* Aurora Background - positioned behind everything */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Aurora
          colorStops={["#928DAB", "#007485", "#D5CABD"]}
          blend={0.5}
          amplitude={0.5}
          speed={1}
        />
      </div>
    </>
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
              lineWidth="0.8vmin"
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
