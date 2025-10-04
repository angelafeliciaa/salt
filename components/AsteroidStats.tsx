interface AsteroidStatsProps {
    name?: string;
    absolute_magnitude?: number;
    estimated_diameter_min?: number;
    estimated_diameter_max?: number;
    is_potentially_hazardous_asteroid?: boolean;
    close_approach_data?: {
      close_approach_date?: string;
      relative_velocity?: {
        kilometers_per_hour?: number;
      };
      miss_distance?: {
        kilometers?: number;
      };
      orbiting_body?: string;
    };
  }
  
  const AsteroidStats = (props: AsteroidStatsProps) => {
    return (
      <div
        className="fixed right-4 top-[66px] z-30 pointer-events-none max-w-[92vw] w-[420px] md:w-[460px] lg:w-[480px] rounded-[14px] border border-white/10 bg-transparent shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-lg p-4 text-[12px]"
        style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}
      >
        <aside className="">
          <h1 className="m-0 mb-2 text-[14px] tracking-[0.3px] opacity-90 font-semibold">
            Asteroid Stats
          </h1>
          <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2">
            <div className="opacity-80">Name</div>
            <div className="font-bold">{props.name ?? "—"}</div>
            <div className="opacity-80">Abs. Magnitude</div>
            <div className="font-bold">{props.absolute_magnitude ?? "—"}</div>
            <div className="opacity-80">Diameter (km)</div>
            <div className="font-bold">
              {props.estimated_diameter_min ?? "—"} –{" "}
              {props.estimated_diameter_max ?? "—"}
            </div>
            <div className="opacity-80">Hazardous</div>
            <div className="font-bold">
              {props.is_potentially_hazardous_asteroid == null
                ? "—"
                : props.is_potentially_hazardous_asteroid
                ? "Yes"
                : "No"}
            </div>
            <div className="opacity-80">Close Approach</div>
            <div className="font-bold">
              {props.close_approach_data?.close_approach_date ?? "—"}
            </div>
            <div className="opacity-80">Velocity (km/h)</div>
            <div className="font-bold">
              {props.close_approach_data?.relative_velocity
                ?.kilometers_per_hour ?? "—"}
            </div>
            <div className="opacity-80">Miss Distance (km)</div>
            <div className="font-bold">
              {props.close_approach_data?.miss_distance?.kilometers ?? "—"}
            </div>
            <div className="opacity-80">Orbiting Body</div>
            <div className="font-bold">
              {props.close_approach_data?.orbiting_body ?? "—"}
            </div>
          </div>
        </aside>
      </div>
    );
  };
  
  export default AsteroidStats;