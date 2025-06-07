import Aurora from "./Aurora";

export default function Background() {
  return (
    <>
      {/* Aurora Background - positioned behind everything */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Aurora
          colorStops={["#928DAB", "#007485", "#D5CABD"]}
          blend={0.2}
          amplitude={0.3}
          speed={1}
        />
      </div>
    </>
  );
}
