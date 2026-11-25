"use client";

import { useEffect } from "react";
import { initClimate } from "./engine";

export function ClimateMap() {
  useEffect(() => initClimate(), []);

  return (
    <section className="climate" aria-label="Climate map">
      <div className="climate__inner">
        <div className="climate__map" id="climateMap">
          <canvas className="climate__canvas" id="climateCanvas" />
          <div className="climate__mask" style={{ left: "67.875%", top: "91.87%", width: "20.377%", height: "8.13%" }} />
          <div className="climate__mask" style={{ left: 0, top: "90.89%", width: "22.335%", height: "9.11%" }} />
          <div className="climate__caption"><span id="capTitle">U.S. Average Temperature, May</span> <em id="capYear">· 2026</em></div>
          <div className="legend"><span id="legMin">20°F</span><div className="legend__bar" id="legBar" /><span id="legMax">90°F</span></div>
          <div className="readout" id="readout" />
        </div>
        <p className="climate__credit">Data: NOAA NCEI nClimGrid, monthly average temperature and total precipitation for May. Base map: NOAA Climate.gov.</p>
        <div className="controls">
          <div className="timeline" id="timeline">
            <div className="bubble" id="bubble">2026</div>
            <input className="range" id="year" type="range" min="0" max="100" step="1" defaultValue="0" aria-label="Year" aria-valuetext="2026" />
            <div className="ticks" id="ticks" />
          </div>
          <div className="toggle" role="group" aria-label="Map layer">
            <button type="button" data-mode="temp" aria-pressed="true">Temperature</button>
            <button type="button" data-mode="rain" aria-pressed="false">Rain</button>
          </div>
        </div>
      </div>
    </section>
  );
}
