/**
 * Water Tank Card — Visual Dashboard Edition
 * Entities: level (%), volume (L), distance (m)
 * Light/dark theme aware. HA Section grid compatible.
 */

const TRANSLATIONS = {
  en: {
    title:             'Water Tank',
    subtitle:          'Level Monitor',
    level:             'Level',
    volume:            'Volume',
    distance:          'Distance',
    last_update:       'Last update',
    sensor_to_surface: 'Sensor to surface',
  },
  da: {
    title:             'Vandtank',
    subtitle:          'Niveaumåler',
    level:             'Niveau',
    volume:            'Volumen',
    distance:          'Afstand',
    last_update:       'Sidst opdateret',
    sensor_to_surface: 'Sensor til overflade',
  },
};

const DEFAULTS = {
  entity_level:    'sensor.water_tank_monitor_water_tank_level',
  entity_volume:   'sensor.water_tank_monitor_water_tank_volume',
  entity_distance: 'sensor.water_tank_monitor_water_tank_distance',
  tank_capacity:   null,
};

const STYLES = `
  :host { display: block; height: 100%; }

  ha-card {
    height: 100%;
    min-height: 260px;
    padding: 0;
    overflow: hidden;
    display: flex;
    box-sizing: border-box;
  }

  /* -- Layout -- */
  .layout {
    display: flex;
    width: 100%;
    align-items: stretch;
  }

  /* -- Tank side -- */
  .tank-side {
    flex: 0 0 44%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 2px 20px 16px;
    box-sizing: border-box;
  }

  .tank-outer {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 300px;
    width: 100%;
    max-width: 150px;
  }

  /* Cap on top of tank */
  .tank-cap {
    width: 46%;
    height: 14px;
    background: linear-gradient(to bottom, #2e4560, #1a2e42);
    border-radius: 5px 5px 0 0;
    flex-shrink: 0;
    position: relative;
    margin-bottom: -2px;
    z-index: 2;
    box-shadow: 0 -2px 4px rgba(0,0,0,0.5);
  }
  .tank-cap::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 55%;
    height: 4px;
    background: rgba(255,255,255,0.07);
    border-radius: 2px;
  }

  /* Tank body + markers side by side */
  .tank-and-markers {
    flex: 1;
    display: flex;
    width: 100%;
    min-height: 0;
  }

  /* Column that owns cap + body so cap % is relative to body width */
  .tank-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 0;
  }

  .tank-body {
    flex: 1;
    width: 100%;
    border-radius: 12px;
    border: 3px solid #1e3148;
    background: #09182a;
    position: relative;
    overflow: hidden;
    box-shadow:
      inset 0 4px 16px rgba(0,0,0,0.6),
      inset 3px 0 8px rgba(0,0,0,0.3),
      inset -3px 0 8px rgba(0,0,0,0.3);
  }

  /* Light theme overrides for tank */
  @media (prefers-color-scheme: light) {
    .tank-body { background: #cfe0f5; border-color: #7eb8e8; }
    .tank-cap  { background: linear-gradient(to bottom, #7eb8e8, #5a9fd4); }
    .tank-cap::after { background: rgba(255,255,255,0.25); }
  }

  /* Water fill */
  .water-fill {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 0%;
    background: linear-gradient(to top, #0d47a1 0%, #1976d2 55%, #2196f3 100%);
    transition: height 1.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: height;
  }

  /* Wave at water surface */
  .wave-wrap {
    position: absolute;
    top: -18px; left: 0; right: 0;
    height: 20px;
    pointer-events: none;
  }
  .wave-track {
    display: flex;
    width: 200%;
    height: 100%;
    animation: wave-move 3.5s linear infinite;
    will-change: transform;
  }
  @keyframes wave-move {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .wave-svg { flex: 0 0 50%; height: 100%; }

  /* Subtle sheen inside water */
  .water-sheen {
    position: absolute;
    top: 0; left: 8%; right: 35%;
    height: 55%;
    background: linear-gradient(160deg, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 0 0 60% 40%;
    pointer-events: none;
  }

  /* Rising bubbles */
  .bubble {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.22);
    animation: bubble-float linear infinite;
    pointer-events: none;
  }
  @keyframes bubble-float {
    0%   { transform: translateY(0)      scale(1);   opacity: 0;   }
    8%   { opacity: 0.65; }
    85%  { opacity: 0.4; }
    100% { transform: translateY(-240px) scale(0.7); opacity: 0;   }
  }

  /* Horizontal guide lines */
  .grid-line {
    position: absolute;
    left: 0; right: 0;
    height: 1px;
    background: rgba(255,255,255,0.1);
    pointer-events: none;
    z-index: 1;
  }

  /* Percentage + volume text overlay */
  .tank-text {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 3;
  }
  .t-pct {
    font-size: clamp(28px, 6vw, 42px);
    font-weight: 800;
    color: #ffffff;
    line-height: 1;
    letter-spacing: -0.02em;
    text-shadow: 0 2px 10px rgba(0,0,0,0.6);
  }
  .t-vol {
    font-size: clamp(10px, 2vw, 13px);
    color: rgba(255,255,255,0.65);
    margin-top: 5px;
    text-shadow: 0 1px 6px rgba(0,0,0,0.5);
    letter-spacing: 0.01em;
  }

  /* Markers column (right of tank body) */
  .markers-col {
    width: 42px;
    flex-shrink: 0;
    position: relative;
    padding-left: 14px;
    box-sizing: border-box;
  }
  .marker {
    position: absolute;
    left: 14px; right: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    transform: translateY(-50%);
  }
  .m-tick {
    width: 5px; height: 1px;
    background: var(--secondary-text-color, rgba(140,150,160,0.5));
    flex-shrink: 0;
  }
  .m-lbl {
    font-size: 9px;
    color: var(--secondary-text-color, rgba(140,150,160,0.7));
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  /* Animated level indicator dot */
  .level-indicator {
    position: absolute;
    left: 0;
    display: flex;
    align-items: center;
    transform: translateY(-50%);
    transition: top 1.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: top;
    z-index: 2;
  }
  .l-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #42a5f5;
    box-shadow: 0 0 8px rgba(66,165,245,0.9), 0 0 2px rgba(66,165,245,1);
    flex-shrink: 0;
  }
  .l-line {
    width: 8px; height: 1px;
    background: rgba(66,165,245,0.45);
  }

  /* -- Stats side -- */
  .stats-side {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 14px 14px 12px 8px;
    gap: 7px;
    min-width: 0;
    box-sizing: border-box;
  }

  .s-header {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-shrink: 0;
  }
  .s-drop {
    font-size: 22px;
    line-height: 1;
    filter: drop-shadow(0 0 6px rgba(30,136,229,0.6));
  }
  .s-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--primary-text-color);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1.15;
  }
  .s-subtitle {
    font-size: 10px;
    color: var(--secondary-text-color);
    line-height: 1.2;
  }

  .divider {
    height: 1px;
    background: var(--divider-color, rgba(120,120,120,0.2));
    flex-shrink: 0;
  }

  /* Individual stat card */
  .stat-card {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 10px;
    background: var(--secondary-background-color, rgba(120,120,120,0.06));
    min-height: 0;
    overflow: hidden;
  }
  .c-icon {
    width: 38px; height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .c-icon ha-icon { --mdc-icon-size: 20px; color: white; }
  .c-icon.blue {
    background: radial-gradient(circle at 38% 32%, #64b5f6, #1565c0);
    box-shadow: 0 3px 10px rgba(21,101,192,0.45);
  }
  .c-icon.teal {
    background: radial-gradient(circle at 38% 32%, #4dd0e1, #006064);
    box-shadow: 0 3px 10px rgba(0,96,100,0.45);
  }
  .c-icon.orange {
    background: radial-gradient(circle at 38% 32%, #ffb74d, #bf360c);
    box-shadow: 0 3px 10px rgba(191,54,12,0.45);
  }

  .c-info { flex: 1; min-width: 0; }
  .c-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
    margin-bottom: 2px;
  }
  .c-value {
    font-size: 22px;
    font-weight: 700;
    color: var(--primary-text-color);
    line-height: 1.1;
    letter-spacing: -0.01em;
  }
  .c-sub {
    font-size: 10px;
    color: var(--secondary-text-color);
    margin-top: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Footer */
  .footer {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
  }
  .footer ha-icon {
    --mdc-icon-size: 13px;
    color: var(--secondary-text-color);
    opacity: 0.6;
  }
  .footer-txt {
    font-size: 10px;
    color: var(--secondary-text-color);
    opacity: 0.6;
  }
`;

const WAVE_D =
  'M0,10 C33,2 67,18 100,10 C133,2 167,18 200,10 ' +
  'C233,2 267,18 300,10 C333,2 367,18 400,10 L400,20 L0,20 Z';

class WaterTankCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = null;
    this._hass   = null;
    this._built  = false;
  }

  /* -- HA Card API -- */

  setConfig(config) {
    if (!config) throw new Error('Invalid configuration');
    this._config = { ...DEFAULTS, ...config };
    this._built  = false;
    this._buildDOM();
    if (this._hass) this._update();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) this._buildDOM();
    this._update();
  }

  getLayoutOptions() {
    return {
      grid_columns:     4,
      grid_rows:        'auto',
      grid_min_columns: 2,
      grid_min_rows:    2,
      grid_max_columns: 6,
    };
  }

  getCardSize() { return 4; }

  static getStubConfig() { return { ...DEFAULTS }; }

  /* -- i18n -- */

  _t(key) {
    const lang = this._hass?.language || 'en';
    return (TRANSLATIONS[lang] ?? TRANSLATIONS.en)[key] ?? TRANSLATIONS.en[key] ?? key;
  }

  /* -- DOM -- */

  _buildDOM() {
    if (!this._config) return;

    const waveSVG = `
      <svg class="wave-svg" viewBox="0 0 400 20" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="${WAVE_D}" fill="rgba(33,150,243,0.55)"/>
      </svg>`;

    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <ha-card>
        <div class="layout">

          <!-- Tank -->
          <div class="tank-side">
            <div class="tank-outer">
              <div class="tank-and-markers">

                <div class="tank-column">
                <div class="tank-cap"></div>
                <div class="tank-body">
                  <div class="water-fill" id="water-fill">
                    <div class="wave-wrap">
                      <div class="wave-track">${waveSVG}${waveSVG}</div>
                    </div>
                    <div class="water-sheen"></div>
                    <div class="bubble" style="width:8px;height:8px;left:18%;bottom:8%;animation-duration:4.2s;animation-delay:0.3s"></div>
                    <div class="bubble" style="width:5px;height:5px;left:42%;bottom:25%;animation-duration:5.8s;animation-delay:1.8s"></div>
                    <div class="bubble" style="width:7px;height:7px;left:63%;bottom:12%;animation-duration:3.6s;animation-delay:0.9s"></div>
                    <div class="bubble" style="width:4px;height:4px;left:28%;bottom:45%;animation-duration:6.5s;animation-delay:2.5s"></div>
                    <div class="bubble" style="width:6px;height:6px;left:78%;bottom:18%;animation-duration:4.8s;animation-delay:3.3s"></div>
                  </div>
                  <div class="grid-line" style="top:25%"></div>
                  <div class="grid-line" style="top:50%"></div>
                  <div class="grid-line" style="top:75%"></div>
                  <div class="tank-text">
                    <div class="t-pct" id="t-pct">—</div>
                    <div class="t-vol" id="t-vol">—</div>
                  </div>
                </div>
                </div><!-- /tank-column -->

                <div class="markers-col">
                  <div class="level-indicator" id="level-indicator" style="top:50%">
                    <div class="l-dot"></div>
                    <div class="l-line"></div>
                  </div>
                  <div class="marker" style="top:0%">  <div class="m-tick"></div><span class="m-lbl">100%</span></div>
                  <div class="marker" style="top:25%"> <div class="m-tick"></div><span class="m-lbl">75%</span></div>
                  <div class="marker" style="top:50%"> <div class="m-tick"></div><span class="m-lbl">50%</span></div>
                  <div class="marker" style="top:75%"> <div class="m-tick"></div><span class="m-lbl">25%</span></div>
                  <div class="marker" style="top:100%"><div class="m-tick"></div><span class="m-lbl">0%</span></div>
                </div>

              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="stats-side">
            <div class="s-header">
              <div class="s-drop">💧</div>
              <div>
                <div class="s-title"    id="s-title"></div>
                <div class="s-subtitle" id="s-subtitle"></div>
              </div>
            </div>
            <div class="divider"></div>

            <div class="stat-card">
              <div class="c-icon blue"><ha-icon icon="mdi:waves"></ha-icon></div>
              <div class="c-info">
                <div class="c-label" id="lbl-level"></div>
                <div class="c-value" id="val-level">—</div>
                <div class="c-sub"   id="sub-level"></div>
              </div>
            </div>

            <div class="stat-card">
              <div class="c-icon teal"><ha-icon icon="mdi:water"></ha-icon></div>
              <div class="c-info">
                <div class="c-label" id="lbl-volume"></div>
                <div class="c-value" id="val-volume">—</div>
                <div class="c-sub"   id="sub-volume"></div>
              </div>
            </div>

            <div class="stat-card">
              <div class="c-icon orange"><ha-icon icon="mdi:ruler"></ha-icon></div>
              <div class="c-info">
                <div class="c-label" id="lbl-distance"></div>
                <div class="c-value" id="val-distance">—</div>
                <div class="c-sub"   id="sub-distance"></div>
              </div>
            </div>

            <div class="footer">
              <ha-icon icon="mdi:information-outline"></ha-icon>
              <span class="footer-txt" id="footer-time"></span>
            </div>
          </div>

        </div>
      </ha-card>
    `;

    this._built = true;
  }

  /* -- State updates -- */

  _update() {
    if (!this._built || !this._hass || !this._config) return;

    const levelNum  = this._num(this._config.entity_level);
    const volumeNum = this._num(this._config.entity_volume);
    const distNum   = this._num(this._config.entity_distance);
    const pct       = isNaN(levelNum) ? 0 : Math.max(0, Math.min(100, levelNum));
    const $         = id => this.shadowRoot.getElementById(id);

    // Header text
    $('s-title').textContent    = this._config.title ?? this._t('title');
    $('s-subtitle').textContent = this._t('subtitle');

    // Stat labels
    $('lbl-level').textContent    = this._t('level').toUpperCase();
    $('lbl-volume').textContent   = this._t('volume').toUpperCase();
    $('lbl-distance').textContent = this._t('distance').toUpperCase();

    // Water fill height + colour
    const fill = $('water-fill');
    if (fill) {
      fill.style.height = `${pct}%`;
      if (pct <= 15)
        fill.style.background = 'linear-gradient(to top,#b71c1c 0%,#ef5350 60%,#e57373 100%)';
      else if (pct <= 30)
        fill.style.background = 'linear-gradient(to top,#e65100 0%,#fb8c00 60%,#ffa726 100%)';
      else
        fill.style.background = 'linear-gradient(to top,#0d47a1 0%,#1976d2 55%,#2196f3 100%)';
    }

    // Level indicator dot (top % = 100 - level)
    const dot = $('level-indicator');
    if (dot) dot.style.top = `${100 - pct}%`;

    // Tank centre text
    $('t-pct').textContent = isNaN(levelNum) ? '—' : `${Math.round(levelNum)}%`;
    $('t-vol').textContent = this._fmtVol(volumeNum);

    // Level stat card
    $('val-level').textContent = isNaN(levelNum) ? '—' : `${Math.round(levelNum)}%`;
    $('sub-level').textContent = this._fmtVol(volumeNum);

    // Volume stat card
    const volState = this._hass.states[this._config.entity_volume];
    const volUnit  = volState?.attributes?.unit_of_measurement ?? 'L';
    $('val-volume').textContent = isNaN(volumeNum) ? '—' : Math.round(volumeNum).toLocaleString();
    $('sub-volume').textContent = volUnit;

    // Distance stat card
    const distState = this._hass.states[this._config.entity_distance];
    const distUnit  = distState?.attributes?.unit_of_measurement ?? 'm';
    $('val-distance').textContent = isNaN(distNum) ? '—' : distNum.toFixed(2);
    $('sub-distance').textContent = `${this._t('sensor_to_surface')} · ${distUnit}`;

    // Footer timestamp
    const lvlState = this._hass.states[this._config.entity_level];
    if (lvlState?.last_updated) {
      try {
        const d   = new Date(lvlState.last_updated);
        const fmt = d.toLocaleTimeString(this._hass.language || 'en', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        $('footer-time').textContent = `${this._t('last_update')}: ${fmt}`;
      } catch (_) {
        $('footer-time').textContent = `${this._t('last_update')}: —`;
      }
    }
  }

  _fmtVol(volumeNum) {
    if (isNaN(volumeNum)) return '';
    const cap = this._config.tank_capacity;
    const v   = Math.round(volumeNum).toLocaleString();
    return cap ? `${v} / ${Math.round(cap).toLocaleString()} L` : `${v} L`;
  }

  _num(entityId) {
    const s = this._hass?.states[entityId];
    return s ? parseFloat(s.state) : NaN;
  }
}

customElements.define('water-tank-card', WaterTankCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:             'water-tank-card',
  name:             'Water Tank Card',
  description:      'Visual water tank dashboard — level, volume and distance.',
  preview:          true,
  documentationURL: 'https://github.com/bjarne-riis/ha-watertankcard',
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0ZXItdGFuay1jYXJkLmpzIiwic291cmNlcyI6WyIuLi9zcmMvd2F0ZXItdGFuay1jYXJkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogV2F0ZXIgVGFuayBDYXJkIOKAlCBWaXN1YWwgRGFzaGJvYXJkIEVkaXRpb25cbiAqIEVudGl0aWVzOiBsZXZlbCAoJSksIHZvbHVtZSAoTCksIGRpc3RhbmNlIChtKVxuICogTGlnaHQvZGFyayB0aGVtZSBhd2FyZS4gSEEgU2VjdGlvbiBncmlkIGNvbXBhdGlibGUuXG4gKi9cblxuY29uc3QgVFJBTlNMQVRJT05TID0ge1xuICBlbjoge1xuICAgIHRpdGxlOiAgICAgICAgICAgICAnV2F0ZXIgVGFuaycsXG4gICAgc3VidGl0bGU6ICAgICAgICAgICdMZXZlbCBNb25pdG9yJyxcbiAgICBsZXZlbDogICAgICAgICAgICAgJ0xldmVsJyxcbiAgICB2b2x1bWU6ICAgICAgICAgICAgJ1ZvbHVtZScsXG4gICAgZGlzdGFuY2U6ICAgICAgICAgICdEaXN0YW5jZScsXG4gICAgbGFzdF91cGRhdGU6ICAgICAgICdMYXN0IHVwZGF0ZScsXG4gICAgc2Vuc29yX3RvX3N1cmZhY2U6ICdTZW5zb3IgdG8gc3VyZmFjZScsXG4gIH0sXG4gIGRhOiB7XG4gICAgdGl0bGU6ICAgICAgICAgICAgICdWYW5kdGFuaycsXG4gICAgc3VidGl0bGU6ICAgICAgICAgICdOaXZlYXVtw6VsZXInLFxuICAgIGxldmVsOiAgICAgICAgICAgICAnTml2ZWF1JyxcbiAgICB2b2x1bWU6ICAgICAgICAgICAgJ1ZvbHVtZW4nLFxuICAgIGRpc3RhbmNlOiAgICAgICAgICAnQWZzdGFuZCcsXG4gICAgbGFzdF91cGRhdGU6ICAgICAgICdTaWRzdCBvcGRhdGVyZXQnLFxuICAgIHNlbnNvcl90b19zdXJmYWNlOiAnU2Vuc29yIHRpbCBvdmVyZmxhZGUnLFxuICB9LFxufTtcblxuY29uc3QgREVGQVVMVFMgPSB7XG4gIGVudGl0eV9sZXZlbDogICAgJ3NlbnNvci53YXRlcl90YW5rX21vbml0b3Jfd2F0ZXJfdGFua19sZXZlbCcsXG4gIGVudGl0eV92b2x1bWU6ICAgJ3NlbnNvci53YXRlcl90YW5rX21vbml0b3Jfd2F0ZXJfdGFua192b2x1bWUnLFxuICBlbnRpdHlfZGlzdGFuY2U6ICdzZW5zb3Iud2F0ZXJfdGFua19tb25pdG9yX3dhdGVyX3RhbmtfZGlzdGFuY2UnLFxuICB0YW5rX2NhcGFjaXR5OiAgIG51bGwsXG59O1xuXG5jb25zdCBTVFlMRVMgPSBgXG4gIDpob3N0IHsgZGlzcGxheTogYmxvY2s7IGhlaWdodDogMTAwJTsgfVxuXG4gIGhhLWNhcmQge1xuICAgIGhlaWdodDogMTAwJTtcbiAgICBtaW4taGVpZ2h0OiAyNjBweDtcbiAgICBwYWRkaW5nOiAwO1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICB9XG5cbiAgLyogLS0gTGF5b3V0IC0tICovXG4gIC5sYXlvdXQge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgYWxpZ24taXRlbXM6IHN0cmV0Y2g7XG4gIH1cblxuICAvKiAtLSBUYW5rIHNpZGUgLS0gKi9cbiAgLnRhbmstc2lkZSB7XG4gICAgZmxleDogMCAwIDQ0JTtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgcGFkZGluZzogMjBweCAycHggMjBweCAxNnB4O1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIH1cblxuICAudGFuay1vdXRlciB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGhlaWdodDogMTAwJTtcbiAgICBtYXgtaGVpZ2h0OiAzMDBweDtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBtYXgtd2lkdGg6IDE1MHB4O1xuICB9XG5cbiAgLyogQ2FwIG9uIHRvcCBvZiB0YW5rICovXG4gIC50YW5rLWNhcCB7XG4gICAgd2lkdGg6IDQ2JTtcbiAgICBoZWlnaHQ6IDE0cHg7XG4gICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRvIGJvdHRvbSwgIzJlNDU2MCwgIzFhMmU0Mik7XG4gICAgYm9yZGVyLXJhZGl1czogNXB4IDVweCAwIDA7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIG1hcmdpbi1ib3R0b206IC0ycHg7XG4gICAgei1pbmRleDogMjtcbiAgICBib3gtc2hhZG93OiAwIC0ycHggNHB4IHJnYmEoMCwwLDAsMC41KTtcbiAgfVxuICAudGFuay1jYXA6OmFmdGVyIHtcbiAgICBjb250ZW50OiAnJztcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiA0cHg7XG4gICAgbGVmdDogNTAlO1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTAlKTtcbiAgICB3aWR0aDogNTUlO1xuICAgIGhlaWdodDogNHB4O1xuICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LDI1NSwyNTUsMC4wNyk7XG4gICAgYm9yZGVyLXJhZGl1czogMnB4O1xuICB9XG5cbiAgLyogVGFuayBib2R5ICsgbWFya2VycyBzaWRlIGJ5IHNpZGUgKi9cbiAgLnRhbmstYW5kLW1hcmtlcnMge1xuICAgIGZsZXg6IDE7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBtaW4taGVpZ2h0OiAwO1xuICB9XG5cbiAgLyogQ29sdW1uIHRoYXQgb3ducyBjYXAgKyBib2R5IHNvIGNhcCAlIGlzIHJlbGF0aXZlIHRvIGJvZHkgd2lkdGggKi9cbiAgLnRhbmstY29sdW1uIHtcbiAgICBmbGV4OiAxO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIG1pbi1oZWlnaHQ6IDA7XG4gIH1cblxuICAudGFuay1ib2R5IHtcbiAgICBmbGV4OiAxO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGJvcmRlci1yYWRpdXM6IDEycHg7XG4gICAgYm9yZGVyOiAzcHggc29saWQgIzFlMzE0ODtcbiAgICBiYWNrZ3JvdW5kOiAjMDkxODJhO1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIGJveC1zaGFkb3c6XG4gICAgICBpbnNldCAwIDRweCAxNnB4IHJnYmEoMCwwLDAsMC42KSxcbiAgICAgIGluc2V0IDNweCAwIDhweCByZ2JhKDAsMCwwLDAuMyksXG4gICAgICBpbnNldCAtM3B4IDAgOHB4IHJnYmEoMCwwLDAsMC4zKTtcbiAgfVxuXG4gIC8qIExpZ2h0IHRoZW1lIG92ZXJyaWRlcyBmb3IgdGFuayAqL1xuICBAbWVkaWEgKHByZWZlcnMtY29sb3Itc2NoZW1lOiBsaWdodCkge1xuICAgIC50YW5rLWJvZHkgeyBiYWNrZ3JvdW5kOiAjY2ZlMGY1OyBib3JkZXItY29sb3I6ICM3ZWI4ZTg7IH1cbiAgICAudGFuay1jYXAgIHsgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRvIGJvdHRvbSwgIzdlYjhlOCwgIzVhOWZkNCk7IH1cbiAgICAudGFuay1jYXA6OmFmdGVyIHsgYmFja2dyb3VuZDogcmdiYSgyNTUsMjU1LDI1NSwwLjI1KTsgfVxuICB9XG5cbiAgLyogV2F0ZXIgZmlsbCAqL1xuICAud2F0ZXItZmlsbCB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGJvdHRvbTogMDsgbGVmdDogMDsgcmlnaHQ6IDA7XG4gICAgaGVpZ2h0OiAwJTtcbiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG8gdG9wLCAjMGQ0N2ExIDAlLCAjMTk3NmQyIDU1JSwgIzIxOTZmMyAxMDAlKTtcbiAgICB0cmFuc2l0aW9uOiBoZWlnaHQgMS40cyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICAgIHdpbGwtY2hhbmdlOiBoZWlnaHQ7XG4gIH1cblxuICAvKiBXYXZlIGF0IHdhdGVyIHN1cmZhY2UgKi9cbiAgLndhdmUtd3JhcCB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogLTE4cHg7IGxlZnQ6IDA7IHJpZ2h0OiAwO1xuICAgIGhlaWdodDogMjBweDtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgfVxuICAud2F2ZS10cmFjayB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICB3aWR0aDogMjAwJTtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gICAgYW5pbWF0aW9uOiB3YXZlLW1vdmUgMy41cyBsaW5lYXIgaW5maW5pdGU7XG4gICAgd2lsbC1jaGFuZ2U6IHRyYW5zZm9ybTtcbiAgfVxuICBAa2V5ZnJhbWVzIHdhdmUtbW92ZSB7XG4gICAgZnJvbSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTsgfVxuICAgIHRvICAgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7IH1cbiAgfVxuICAud2F2ZS1zdmcgeyBmbGV4OiAwIDAgNTAlOyBoZWlnaHQ6IDEwMCU7IH1cblxuICAvKiBTdWJ0bGUgc2hlZW4gaW5zaWRlIHdhdGVyICovXG4gIC53YXRlci1zaGVlbiB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMDsgbGVmdDogOCU7IHJpZ2h0OiAzNSU7XG4gICAgaGVpZ2h0OiA1NSU7XG4gICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE2MGRlZywgcmdiYSgyNTUsMjU1LDI1NSwwLjEpIDAlLCB0cmFuc3BhcmVudCA3MCUpO1xuICAgIGJvcmRlci1yYWRpdXM6IDAgMCA2MCUgNDAlO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICB9XG5cbiAgLyogUmlzaW5nIGJ1YmJsZXMgKi9cbiAgLmJ1YmJsZSB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwyNTUsMjU1LDAuMTUpO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4yMik7XG4gICAgYW5pbWF0aW9uOiBidWJibGUtZmxvYXQgbGluZWFyIGluZmluaXRlO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICB9XG4gIEBrZXlmcmFtZXMgYnViYmxlLWZsb2F0IHtcbiAgICAwJSAgIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApICAgICAgc2NhbGUoMSk7ICAgb3BhY2l0eTogMDsgICB9XG4gICAgOCUgICB7IG9wYWNpdHk6IDAuNjU7IH1cbiAgICA4NSUgIHsgb3BhY2l0eTogMC40OyB9XG4gICAgMTAwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMjQwcHgpIHNjYWxlKDAuNyk7IG9wYWNpdHk6IDA7ICAgfVxuICB9XG5cbiAgLyogSG9yaXpvbnRhbCBndWlkZSBsaW5lcyAqL1xuICAuZ3JpZC1saW5lIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgbGVmdDogMDsgcmlnaHQ6IDA7XG4gICAgaGVpZ2h0OiAxcHg7XG4gICAgYmFja2dyb3VuZDogcmdiYSgyNTUsMjU1LDI1NSwwLjEpO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICAgIHotaW5kZXg6IDE7XG4gIH1cblxuICAvKiBQZXJjZW50YWdlICsgdm9sdW1lIHRleHQgb3ZlcmxheSAqL1xuICAudGFuay10ZXh0IHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgaW5zZXQ6IDA7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgei1pbmRleDogMztcbiAgfVxuICAudC1wY3Qge1xuICAgIGZvbnQtc2l6ZTogY2xhbXAoMjhweCwgNnZ3LCA0MnB4KTtcbiAgICBmb250LXdlaWdodDogODAwO1xuICAgIGNvbG9yOiAjZmZmZmZmO1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIGxldHRlci1zcGFjaW5nOiAtMC4wMmVtO1xuICAgIHRleHQtc2hhZG93OiAwIDJweCAxMHB4IHJnYmEoMCwwLDAsMC42KTtcbiAgfVxuICAudC12b2wge1xuICAgIGZvbnQtc2l6ZTogY2xhbXAoMTBweCwgMnZ3LCAxM3B4KTtcbiAgICBjb2xvcjogcmdiYSgyNTUsMjU1LDI1NSwwLjY1KTtcbiAgICBtYXJnaW4tdG9wOiA1cHg7XG4gICAgdGV4dC1zaGFkb3c6IDAgMXB4IDZweCByZ2JhKDAsMCwwLDAuNSk7XG4gICAgbGV0dGVyLXNwYWNpbmc6IDAuMDFlbTtcbiAgfVxuXG4gIC8qIE1hcmtlcnMgY29sdW1uIChyaWdodCBvZiB0YW5rIGJvZHkpICovXG4gIC5tYXJrZXJzLWNvbCB7XG4gICAgd2lkdGg6IDQycHg7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIHBhZGRpbmctbGVmdDogMTRweDtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICB9XG4gIC5tYXJrZXIge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBsZWZ0OiAxNHB4OyByaWdodDogMDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiA0cHg7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01MCUpO1xuICB9XG4gIC5tLXRpY2sge1xuICAgIHdpZHRoOiA1cHg7IGhlaWdodDogMXB4O1xuICAgIGJhY2tncm91bmQ6IHZhcigtLXNlY29uZGFyeS10ZXh0LWNvbG9yLCByZ2JhKDE0MCwxNTAsMTYwLDAuNSkpO1xuICAgIGZsZXgtc2hyaW5rOiAwO1xuICB9XG4gIC5tLWxibCB7XG4gICAgZm9udC1zaXplOiA5cHg7XG4gICAgY29sb3I6IHZhcigtLXNlY29uZGFyeS10ZXh0LWNvbG9yLCByZ2JhKDE0MCwxNTAsMTYwLDAuNykpO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgZm9udC12YXJpYW50LW51bWVyaWM6IHRhYnVsYXItbnVtcztcbiAgfVxuXG4gIC8qIEFuaW1hdGVkIGxldmVsIGluZGljYXRvciBkb3QgKi9cbiAgLmxldmVsLWluZGljYXRvciB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGxlZnQ6IDA7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTAlKTtcbiAgICB0cmFuc2l0aW9uOiB0b3AgMS40cyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICAgIHdpbGwtY2hhbmdlOiB0b3A7XG4gICAgei1pbmRleDogMjtcbiAgfVxuICAubC1kb3Qge1xuICAgIHdpZHRoOiAxMHB4OyBoZWlnaHQ6IDEwcHg7XG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgIGJhY2tncm91bmQ6ICM0MmE1ZjU7XG4gICAgYm94LXNoYWRvdzogMCAwIDhweCByZ2JhKDY2LDE2NSwyNDUsMC45KSwgMCAwIDJweCByZ2JhKDY2LDE2NSwyNDUsMSk7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gIH1cbiAgLmwtbGluZSB7XG4gICAgd2lkdGg6IDhweDsgaGVpZ2h0OiAxcHg7XG4gICAgYmFja2dyb3VuZDogcmdiYSg2NiwxNjUsMjQ1LDAuNDUpO1xuICB9XG5cbiAgLyogLS0gU3RhdHMgc2lkZSAtLSAqL1xuICAuc3RhdHMtc2lkZSB7XG4gICAgZmxleDogMTtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgcGFkZGluZzogMTRweCAxNHB4IDEycHggOHB4O1xuICAgIGdhcDogN3B4O1xuICAgIG1pbi13aWR0aDogMDtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICB9XG5cbiAgLnMtaGVhZGVyIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiA5cHg7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gIH1cbiAgLnMtZHJvcCB7XG4gICAgZm9udC1zaXplOiAyMnB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIGZpbHRlcjogZHJvcC1zaGFkb3coMCAwIDZweCByZ2JhKDMwLDEzNiwyMjksMC42KSk7XG4gIH1cbiAgLnMtdGl0bGUge1xuICAgIGZvbnQtc2l6ZTogMTVweDtcbiAgICBmb250LXdlaWdodDogNzAwO1xuICAgIGNvbG9yOiB2YXIoLS1wcmltYXJ5LXRleHQtY29sb3IpO1xuICAgIGxldHRlci1zcGFjaW5nOiAwLjA2ZW07XG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICBsaW5lLWhlaWdodDogMS4xNTtcbiAgfVxuICAucy1zdWJ0aXRsZSB7XG4gICAgZm9udC1zaXplOiAxMHB4O1xuICAgIGNvbG9yOiB2YXIoLS1zZWNvbmRhcnktdGV4dC1jb2xvcik7XG4gICAgbGluZS1oZWlnaHQ6IDEuMjtcbiAgfVxuXG4gIC5kaXZpZGVyIHtcbiAgICBoZWlnaHQ6IDFweDtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1kaXZpZGVyLWNvbG9yLCByZ2JhKDEyMCwxMjAsMTIwLDAuMikpO1xuICAgIGZsZXgtc2hyaW5rOiAwO1xuICB9XG5cbiAgLyogSW5kaXZpZHVhbCBzdGF0IGNhcmQgKi9cbiAgLnN0YXQtY2FyZCB7XG4gICAgZmxleDogMTtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiAxMHB4O1xuICAgIHBhZGRpbmc6IDhweCAxMHB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tc2Vjb25kYXJ5LWJhY2tncm91bmQtY29sb3IsIHJnYmEoMTIwLDEyMCwxMjAsMC4wNikpO1xuICAgIG1pbi1oZWlnaHQ6IDA7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgfVxuICAuYy1pY29uIHtcbiAgICB3aWR0aDogMzhweDsgaGVpZ2h0OiAzOHB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gIH1cbiAgLmMtaWNvbiBoYS1pY29uIHsgLS1tZGMtaWNvbi1zaXplOiAyMHB4OyBjb2xvcjogd2hpdGU7IH1cbiAgLmMtaWNvbi5ibHVlIHtcbiAgICBiYWNrZ3JvdW5kOiByYWRpYWwtZ3JhZGllbnQoY2lyY2xlIGF0IDM4JSAzMiUsICM2NGI1ZjYsICMxNTY1YzApO1xuICAgIGJveC1zaGFkb3c6IDAgM3B4IDEwcHggcmdiYSgyMSwxMDEsMTkyLDAuNDUpO1xuICB9XG4gIC5jLWljb24udGVhbCB7XG4gICAgYmFja2dyb3VuZDogcmFkaWFsLWdyYWRpZW50KGNpcmNsZSBhdCAzOCUgMzIlLCAjNGRkMGUxLCAjMDA2MDY0KTtcbiAgICBib3gtc2hhZG93OiAwIDNweCAxMHB4IHJnYmEoMCw5NiwxMDAsMC40NSk7XG4gIH1cbiAgLmMtaWNvbi5vcmFuZ2Uge1xuICAgIGJhY2tncm91bmQ6IHJhZGlhbC1ncmFkaWVudChjaXJjbGUgYXQgMzglIDMyJSwgI2ZmYjc0ZCwgI2JmMzYwYyk7XG4gICAgYm94LXNoYWRvdzogMCAzcHggMTBweCByZ2JhKDE5MSw1NCwxMiwwLjQ1KTtcbiAgfVxuXG4gIC5jLWluZm8geyBmbGV4OiAxOyBtaW4td2lkdGg6IDA7IH1cbiAgLmMtbGFiZWwge1xuICAgIGZvbnQtc2l6ZTogOXB4O1xuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgbGV0dGVyLXNwYWNpbmc6IDAuMWVtO1xuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgY29sb3I6IHZhcigtLXNlY29uZGFyeS10ZXh0LWNvbG9yKTtcbiAgICBtYXJnaW4tYm90dG9tOiAycHg7XG4gIH1cbiAgLmMtdmFsdWUge1xuICAgIGZvbnQtc2l6ZTogMjJweDtcbiAgICBmb250LXdlaWdodDogNzAwO1xuICAgIGNvbG9yOiB2YXIoLS1wcmltYXJ5LXRleHQtY29sb3IpO1xuICAgIGxpbmUtaGVpZ2h0OiAxLjE7XG4gICAgbGV0dGVyLXNwYWNpbmc6IC0wLjAxZW07XG4gIH1cbiAgLmMtc3ViIHtcbiAgICBmb250LXNpemU6IDEwcHg7XG4gICAgY29sb3I6IHZhcigtLXNlY29uZGFyeS10ZXh0LWNvbG9yKTtcbiAgICBtYXJnaW4tdG9wOiAxcHg7XG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICB9XG5cbiAgLyogRm9vdGVyICovXG4gIC5mb290ZXIge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBnYXA6IDVweDtcbiAgICBmbGV4LXNocmluazogMDtcbiAgfVxuICAuZm9vdGVyIGhhLWljb24ge1xuICAgIC0tbWRjLWljb24tc2l6ZTogMTNweDtcbiAgICBjb2xvcjogdmFyKC0tc2Vjb25kYXJ5LXRleHQtY29sb3IpO1xuICAgIG9wYWNpdHk6IDAuNjtcbiAgfVxuICAuZm9vdGVyLXR4dCB7XG4gICAgZm9udC1zaXplOiAxMHB4O1xuICAgIGNvbG9yOiB2YXIoLS1zZWNvbmRhcnktdGV4dC1jb2xvcik7XG4gICAgb3BhY2l0eTogMC42O1xuICB9XG5gO1xuXG5jb25zdCBXQVZFX0QgPVxuICAnTTAsMTAgQzMzLDIgNjcsMTggMTAwLDEwIEMxMzMsMiAxNjcsMTggMjAwLDEwICcgK1xuICAnQzIzMywyIDI2NywxOCAzMDAsMTAgQzMzMywyIDM2NywxOCA0MDAsMTAgTDQwMCwyMCBMMCwyMCBaJztcblxuY2xhc3MgV2F0ZXJUYW5rQ2FyZCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KTtcbiAgICB0aGlzLl9jb25maWcgPSBudWxsO1xuICAgIHRoaXMuX2hhc3MgICA9IG51bGw7XG4gICAgdGhpcy5fYnVpbHQgID0gZmFsc2U7XG4gIH1cblxuICAvKiAtLSBIQSBDYXJkIEFQSSAtLSAqL1xuXG4gIHNldENvbmZpZyhjb25maWcpIHtcbiAgICBpZiAoIWNvbmZpZykgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvbmZpZ3VyYXRpb24nKTtcbiAgICB0aGlzLl9jb25maWcgPSB7IC4uLkRFRkFVTFRTLCAuLi5jb25maWcgfTtcbiAgICB0aGlzLl9idWlsdCAgPSBmYWxzZTtcbiAgICB0aGlzLl9idWlsZERPTSgpO1xuICAgIGlmICh0aGlzLl9oYXNzKSB0aGlzLl91cGRhdGUoKTtcbiAgfVxuXG4gIHNldCBoYXNzKGhhc3MpIHtcbiAgICB0aGlzLl9oYXNzID0gaGFzcztcbiAgICBpZiAoIXRoaXMuX2J1aWx0KSB0aGlzLl9idWlsZERPTSgpO1xuICAgIHRoaXMuX3VwZGF0ZSgpO1xuICB9XG5cbiAgZ2V0TGF5b3V0T3B0aW9ucygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZ3JpZF9jb2x1bW5zOiAgICAgNCxcbiAgICAgIGdyaWRfcm93czogICAgICAgICdhdXRvJyxcbiAgICAgIGdyaWRfbWluX2NvbHVtbnM6IDIsXG4gICAgICBncmlkX21pbl9yb3dzOiAgICAyLFxuICAgICAgZ3JpZF9tYXhfY29sdW1uczogNixcbiAgICB9O1xuICB9XG5cbiAgZ2V0Q2FyZFNpemUoKSB7IHJldHVybiA0OyB9XG5cbiAgc3RhdGljIGdldFN0dWJDb25maWcoKSB7IHJldHVybiB7IC4uLkRFRkFVTFRTIH07IH1cblxuICAvKiAtLSBpMThuIC0tICovXG5cbiAgX3Qoa2V5KSB7XG4gICAgY29uc3QgbGFuZyA9IHRoaXMuX2hhc3M/Lmxhbmd1YWdlIHx8ICdlbic7XG4gICAgcmV0dXJuIChUUkFOU0xBVElPTlNbbGFuZ10gPz8gVFJBTlNMQVRJT05TLmVuKVtrZXldID8/IFRSQU5TTEFUSU9OUy5lbltrZXldID8/IGtleTtcbiAgfVxuXG4gIC8qIC0tIERPTSAtLSAqL1xuXG4gIF9idWlsZERPTSgpIHtcbiAgICBpZiAoIXRoaXMuX2NvbmZpZykgcmV0dXJuO1xuXG4gICAgY29uc3Qgd2F2ZVNWRyA9IGBcbiAgICAgIDxzdmcgY2xhc3M9XCJ3YXZlLXN2Z1wiIHZpZXdCb3g9XCIwIDAgNDAwIDIwXCIgcHJlc2VydmVBc3BlY3RSYXRpbz1cIm5vbmVcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG4gICAgICAgIDxwYXRoIGQ9XCIke1dBVkVfRH1cIiBmaWxsPVwicmdiYSgzMywxNTAsMjQzLDAuNTUpXCIvPlxuICAgICAgPC9zdmc+YDtcblxuICAgIHRoaXMuc2hhZG93Um9vdC5pbm5lckhUTUwgPSBgXG4gICAgICA8c3R5bGU+JHtTVFlMRVN9PC9zdHlsZT5cbiAgICAgIDxoYS1jYXJkPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibGF5b3V0XCI+XG5cbiAgICAgICAgICA8IS0tIFRhbmsgLS0+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRhbmstc2lkZVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhbmstb3V0ZXJcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhbmstYW5kLW1hcmtlcnNcIj5cblxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YW5rLWNvbHVtblwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YW5rLWNhcFwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YW5rLWJvZHlcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3YXRlci1maWxsXCIgaWQ9XCJ3YXRlci1maWxsXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3YXZlLXdyYXBcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2F2ZS10cmFja1wiPiR7d2F2ZVNWR30ke3dhdmVTVkd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2F0ZXItc2hlZW5cIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1YmJsZVwiIHN0eWxlPVwid2lkdGg6OHB4O2hlaWdodDo4cHg7bGVmdDoxOCU7Ym90dG9tOjglO2FuaW1hdGlvbi1kdXJhdGlvbjo0LjJzO2FuaW1hdGlvbi1kZWxheTowLjNzXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidWJibGVcIiBzdHlsZT1cIndpZHRoOjVweDtoZWlnaHQ6NXB4O2xlZnQ6NDIlO2JvdHRvbToyNSU7YW5pbWF0aW9uLWR1cmF0aW9uOjUuOHM7YW5pbWF0aW9uLWRlbGF5OjEuOHNcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1YmJsZVwiIHN0eWxlPVwid2lkdGg6N3B4O2hlaWdodDo3cHg7bGVmdDo2MyU7Ym90dG9tOjEyJTthbmltYXRpb24tZHVyYXRpb246My42czthbmltYXRpb24tZGVsYXk6MC45c1wiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnViYmxlXCIgc3R5bGU9XCJ3aWR0aDo0cHg7aGVpZ2h0OjRweDtsZWZ0OjI4JTtib3R0b206NDUlO2FuaW1hdGlvbi1kdXJhdGlvbjo2LjVzO2FuaW1hdGlvbi1kZWxheToyLjVzXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidWJibGVcIiBzdHlsZT1cIndpZHRoOjZweDtoZWlnaHQ6NnB4O2xlZnQ6NzglO2JvdHRvbToxOCU7YW5pbWF0aW9uLWR1cmF0aW9uOjQuOHM7YW5pbWF0aW9uLWRlbGF5OjMuM3NcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQtbGluZVwiIHN0eWxlPVwidG9wOjI1JVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQtbGluZVwiIHN0eWxlPVwidG9wOjUwJVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQtbGluZVwiIHN0eWxlPVwidG9wOjc1JVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhbmstdGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidC1wY3RcIiBpZD1cInQtcGN0XCI+4oCUPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0LXZvbFwiIGlkPVwidC12b2xcIj7igJQ8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PjwhLS0gL3RhbmstY29sdW1uIC0tPlxuXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1hcmtlcnMtY29sXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibGV2ZWwtaW5kaWNhdG9yXCIgaWQ9XCJsZXZlbC1pbmRpY2F0b3JcIiBzdHlsZT1cInRvcDo1MCVcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImwtZG90XCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsLWxpbmVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1hcmtlclwiIHN0eWxlPVwidG9wOjAlXCI+ICA8ZGl2IGNsYXNzPVwibS10aWNrXCI+PC9kaXY+PHNwYW4gY2xhc3M9XCJtLWxibFwiPjEwMCU8L3NwYW4+PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWFya2VyXCIgc3R5bGU9XCJ0b3A6MjUlXCI+IDxkaXYgY2xhc3M9XCJtLXRpY2tcIj48L2Rpdj48c3BhbiBjbGFzcz1cIm0tbGJsXCI+NzUlPC9zcGFuPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1hcmtlclwiIHN0eWxlPVwidG9wOjUwJVwiPiA8ZGl2IGNsYXNzPVwibS10aWNrXCI+PC9kaXY+PHNwYW4gY2xhc3M9XCJtLWxibFwiPjUwJTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXJrZXJcIiBzdHlsZT1cInRvcDo3NSVcIj4gPGRpdiBjbGFzcz1cIm0tdGlja1wiPjwvZGl2PjxzcGFuIGNsYXNzPVwibS1sYmxcIj4yNSU8L3NwYW4+PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWFya2VyXCIgc3R5bGU9XCJ0b3A6MTAwJVwiPjxkaXYgY2xhc3M9XCJtLXRpY2tcIj48L2Rpdj48c3BhbiBjbGFzcz1cIm0tbGJsXCI+MCU8L3NwYW4+PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDwhLS0gU3RhdHMgLS0+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzLXNpZGVcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzLWhlYWRlclwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicy1kcm9wXCI+8J+SpzwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzLXRpdGxlXCIgICAgaWQ9XCJzLXRpdGxlXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInMtc3VidGl0bGVcIiBpZD1cInMtc3VidGl0bGVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXZpZGVyXCI+PC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0LWNhcmRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtaWNvbiBibHVlXCI+PGhhLWljb24gaWNvbj1cIm1kaTp3YXZlc1wiPjwvaGEtaWNvbj48L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtaW5mb1wiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLWxhYmVsXCIgaWQ9XCJsYmwtbGV2ZWxcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy12YWx1ZVwiIGlkPVwidmFsLWxldmVsXCI+4oCUPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtc3ViXCIgICBpZD1cInN1Yi1sZXZlbFwiPjwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdC1jYXJkXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLWljb24gdGVhbFwiPjxoYS1pY29uIGljb249XCJtZGk6d2F0ZXJcIj48L2hhLWljb24+PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLWluZm9cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1sYWJlbFwiIGlkPVwibGJsLXZvbHVtZVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXZhbHVlXCIgaWQ9XCJ2YWwtdm9sdW1lXCI+4oCUPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtc3ViXCIgICBpZD1cInN1Yi12b2x1bWVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXQtY2FyZFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1pY29uIG9yYW5nZVwiPjxoYS1pY29uIGljb249XCJtZGk6cnVsZXJcIj48L2hhLWljb24+PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLWluZm9cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1sYWJlbFwiIGlkPVwibGJsLWRpc3RhbmNlXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdmFsdWVcIiBpZD1cInZhbC1kaXN0YW5jZVwiPuKAlDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXN1YlwiICAgaWQ9XCJzdWItZGlzdGFuY2VcIj48L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZvb3RlclwiPlxuICAgICAgICAgICAgICA8aGEtaWNvbiBpY29uPVwibWRpOmluZm9ybWF0aW9uLW91dGxpbmVcIj48L2hhLWljb24+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9vdGVyLXR4dFwiIGlkPVwiZm9vdGVyLXRpbWVcIj48L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvaGEtY2FyZD5cbiAgICBgO1xuXG4gICAgdGhpcy5fYnVpbHQgPSB0cnVlO1xuICB9XG5cbiAgLyogLS0gU3RhdGUgdXBkYXRlcyAtLSAqL1xuXG4gIF91cGRhdGUoKSB7XG4gICAgaWYgKCF0aGlzLl9idWlsdCB8fCAhdGhpcy5faGFzcyB8fCAhdGhpcy5fY29uZmlnKSByZXR1cm47XG5cbiAgICBjb25zdCBsZXZlbE51bSAgPSB0aGlzLl9udW0odGhpcy5fY29uZmlnLmVudGl0eV9sZXZlbCk7XG4gICAgY29uc3Qgdm9sdW1lTnVtID0gdGhpcy5fbnVtKHRoaXMuX2NvbmZpZy5lbnRpdHlfdm9sdW1lKTtcbiAgICBjb25zdCBkaXN0TnVtICAgPSB0aGlzLl9udW0odGhpcy5fY29uZmlnLmVudGl0eV9kaXN0YW5jZSk7XG4gICAgY29uc3QgcGN0ICAgICAgID0gaXNOYU4obGV2ZWxOdW0pID8gMCA6IE1hdGgubWF4KDAsIE1hdGgubWluKDEwMCwgbGV2ZWxOdW0pKTtcbiAgICBjb25zdCAkICAgICAgICAgPSBpZCA9PiB0aGlzLnNoYWRvd1Jvb3QuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuXG4gICAgLy8gSGVhZGVyIHRleHRcbiAgICAkKCdzLXRpdGxlJykudGV4dENvbnRlbnQgICAgPSB0aGlzLl9jb25maWcudGl0bGUgPz8gdGhpcy5fdCgndGl0bGUnKTtcbiAgICAkKCdzLXN1YnRpdGxlJykudGV4dENvbnRlbnQgPSB0aGlzLl90KCdzdWJ0aXRsZScpO1xuXG4gICAgLy8gU3RhdCBsYWJlbHNcbiAgICAkKCdsYmwtbGV2ZWwnKS50ZXh0Q29udGVudCAgICA9IHRoaXMuX3QoJ2xldmVsJykudG9VcHBlckNhc2UoKTtcbiAgICAkKCdsYmwtdm9sdW1lJykudGV4dENvbnRlbnQgICA9IHRoaXMuX3QoJ3ZvbHVtZScpLnRvVXBwZXJDYXNlKCk7XG4gICAgJCgnbGJsLWRpc3RhbmNlJykudGV4dENvbnRlbnQgPSB0aGlzLl90KCdkaXN0YW5jZScpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAvLyBXYXRlciBmaWxsIGhlaWdodCArIGNvbG91clxuICAgIGNvbnN0IGZpbGwgPSAkKCd3YXRlci1maWxsJyk7XG4gICAgaWYgKGZpbGwpIHtcbiAgICAgIGZpbGwuc3R5bGUuaGVpZ2h0ID0gYCR7cGN0fSVgO1xuICAgICAgaWYgKHBjdCA8PSAxNSlcbiAgICAgICAgZmlsbC5zdHlsZS5iYWNrZ3JvdW5kID0gJ2xpbmVhci1ncmFkaWVudCh0byB0b3AsI2I3MWMxYyAwJSwjZWY1MzUwIDYwJSwjZTU3MzczIDEwMCUpJztcbiAgICAgIGVsc2UgaWYgKHBjdCA8PSAzMClcbiAgICAgICAgZmlsbC5zdHlsZS5iYWNrZ3JvdW5kID0gJ2xpbmVhci1ncmFkaWVudCh0byB0b3AsI2U2NTEwMCAwJSwjZmI4YzAwIDYwJSwjZmZhNzI2IDEwMCUpJztcbiAgICAgIGVsc2VcbiAgICAgICAgZmlsbC5zdHlsZS5iYWNrZ3JvdW5kID0gJ2xpbmVhci1ncmFkaWVudCh0byB0b3AsIzBkNDdhMSAwJSwjMTk3NmQyIDU1JSwjMjE5NmYzIDEwMCUpJztcbiAgICB9XG5cbiAgICAvLyBMZXZlbCBpbmRpY2F0b3IgZG90ICh0b3AgJSA9IDEwMCAtIGxldmVsKVxuICAgIGNvbnN0IGRvdCA9ICQoJ2xldmVsLWluZGljYXRvcicpO1xuICAgIGlmIChkb3QpIGRvdC5zdHlsZS50b3AgPSBgJHsxMDAgLSBwY3R9JWA7XG5cbiAgICAvLyBUYW5rIGNlbnRyZSB0ZXh0XG4gICAgJCgndC1wY3QnKS50ZXh0Q29udGVudCA9IGlzTmFOKGxldmVsTnVtKSA/ICfigJQnIDogYCR7TWF0aC5yb3VuZChsZXZlbE51bSl9JWA7XG4gICAgJCgndC12b2wnKS50ZXh0Q29udGVudCA9IHRoaXMuX2ZtdFZvbCh2b2x1bWVOdW0pO1xuXG4gICAgLy8gTGV2ZWwgc3RhdCBjYXJkXG4gICAgJCgndmFsLWxldmVsJykudGV4dENvbnRlbnQgPSBpc05hTihsZXZlbE51bSkgPyAn4oCUJyA6IGAke01hdGgucm91bmQobGV2ZWxOdW0pfSVgO1xuICAgICQoJ3N1Yi1sZXZlbCcpLnRleHRDb250ZW50ID0gdGhpcy5fZm10Vm9sKHZvbHVtZU51bSk7XG5cbiAgICAvLyBWb2x1bWUgc3RhdCBjYXJkXG4gICAgY29uc3Qgdm9sU3RhdGUgPSB0aGlzLl9oYXNzLnN0YXRlc1t0aGlzLl9jb25maWcuZW50aXR5X3ZvbHVtZV07XG4gICAgY29uc3Qgdm9sVW5pdCAgPSB2b2xTdGF0ZT8uYXR0cmlidXRlcz8udW5pdF9vZl9tZWFzdXJlbWVudCA/PyAnTCc7XG4gICAgJCgndmFsLXZvbHVtZScpLnRleHRDb250ZW50ID0gaXNOYU4odm9sdW1lTnVtKSA/ICfigJQnIDogTWF0aC5yb3VuZCh2b2x1bWVOdW0pLnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgJCgnc3ViLXZvbHVtZScpLnRleHRDb250ZW50ID0gdm9sVW5pdDtcblxuICAgIC8vIERpc3RhbmNlIHN0YXQgY2FyZFxuICAgIGNvbnN0IGRpc3RTdGF0ZSA9IHRoaXMuX2hhc3Muc3RhdGVzW3RoaXMuX2NvbmZpZy5lbnRpdHlfZGlzdGFuY2VdO1xuICAgIGNvbnN0IGRpc3RVbml0ICA9IGRpc3RTdGF0ZT8uYXR0cmlidXRlcz8udW5pdF9vZl9tZWFzdXJlbWVudCA/PyAnbSc7XG4gICAgJCgndmFsLWRpc3RhbmNlJykudGV4dENvbnRlbnQgPSBpc05hTihkaXN0TnVtKSA/ICfigJQnIDogZGlzdE51bS50b0ZpeGVkKDIpO1xuICAgICQoJ3N1Yi1kaXN0YW5jZScpLnRleHRDb250ZW50ID0gYCR7dGhpcy5fdCgnc2Vuc29yX3RvX3N1cmZhY2UnKX0gwrcgJHtkaXN0VW5pdH1gO1xuXG4gICAgLy8gRm9vdGVyIHRpbWVzdGFtcFxuICAgIGNvbnN0IGx2bFN0YXRlID0gdGhpcy5faGFzcy5zdGF0ZXNbdGhpcy5fY29uZmlnLmVudGl0eV9sZXZlbF07XG4gICAgaWYgKGx2bFN0YXRlPy5sYXN0X3VwZGF0ZWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGQgICA9IG5ldyBEYXRlKGx2bFN0YXRlLmxhc3RfdXBkYXRlZCk7XG4gICAgICAgIGNvbnN0IGZtdCA9IGQudG9Mb2NhbGVUaW1lU3RyaW5nKHRoaXMuX2hhc3MubGFuZ3VhZ2UgfHwgJ2VuJywge1xuICAgICAgICAgIGhvdXI6ICcyLWRpZ2l0JywgbWludXRlOiAnMi1kaWdpdCcsIHNlY29uZDogJzItZGlnaXQnLFxuICAgICAgICB9KTtcbiAgICAgICAgJCgnZm9vdGVyLXRpbWUnKS50ZXh0Q29udGVudCA9IGAke3RoaXMuX3QoJ2xhc3RfdXBkYXRlJyl9OiAke2ZtdH1gO1xuICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAkKCdmb290ZXItdGltZScpLnRleHRDb250ZW50ID0gYCR7dGhpcy5fdCgnbGFzdF91cGRhdGUnKX06IOKAlGA7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2ZtdFZvbCh2b2x1bWVOdW0pIHtcbiAgICBpZiAoaXNOYU4odm9sdW1lTnVtKSkgcmV0dXJuICcnO1xuICAgIGNvbnN0IGNhcCA9IHRoaXMuX2NvbmZpZy50YW5rX2NhcGFjaXR5O1xuICAgIGNvbnN0IHYgICA9IE1hdGgucm91bmQodm9sdW1lTnVtKS50b0xvY2FsZVN0cmluZygpO1xuICAgIHJldHVybiBjYXAgPyBgJHt2fSAvICR7TWF0aC5yb3VuZChjYXApLnRvTG9jYWxlU3RyaW5nKCl9IExgIDogYCR7dn0gTGA7XG4gIH1cblxuICBfbnVtKGVudGl0eUlkKSB7XG4gICAgY29uc3QgcyA9IHRoaXMuX2hhc3M/LnN0YXRlc1tlbnRpdHlJZF07XG4gICAgcmV0dXJuIHMgPyBwYXJzZUZsb2F0KHMuc3RhdGUpIDogTmFOO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnd2F0ZXItdGFuay1jYXJkJywgV2F0ZXJUYW5rQ2FyZCk7XG5cbndpbmRvdy5jdXN0b21DYXJkcyA9IHdpbmRvdy5jdXN0b21DYXJkcyB8fCBbXTtcbndpbmRvdy5jdXN0b21DYXJkcy5wdXNoKHtcbiAgdHlwZTogICAgICAgICAgICAgJ3dhdGVyLXRhbmstY2FyZCcsXG4gIG5hbWU6ICAgICAgICAgICAgICdXYXRlciBUYW5rIENhcmQnLFxuICBkZXNjcmlwdGlvbjogICAgICAnVmlzdWFsIHdhdGVyIHRhbmsgZGFzaGJvYXJkIOKAlCBsZXZlbCwgdm9sdW1lIGFuZCBkaXN0YW5jZS4nLFxuICBwcmV2aWV3OiAgICAgICAgICB0cnVlLFxuICBkb2N1bWVudGF0aW9uVVJMOiAnaHR0cHM6Ly9naXRodWIuY29tL2JqYXJuZS1yaWlzL2hhLXdhdGVydGFua2NhcmQnLFxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNLFlBQVksR0FBRztBQUNyQixFQUFFLEVBQUUsRUFBRTtBQUNOLElBQUksS0FBSyxjQUFjLFlBQVk7QUFDbkMsSUFBSSxRQUFRLFdBQVcsZUFBZTtBQUN0QyxJQUFJLEtBQUssY0FBYyxPQUFPO0FBQzlCLElBQUksTUFBTSxhQUFhLFFBQVE7QUFDL0IsSUFBSSxRQUFRLFdBQVcsVUFBVTtBQUNqQyxJQUFJLFdBQVcsUUFBUSxhQUFhO0FBQ3BDLElBQUksaUJBQWlCLEVBQUUsbUJBQW1CO0FBQzFDLEdBQUc7QUFDSCxFQUFFLEVBQUUsRUFBRTtBQUNOLElBQUksS0FBSyxjQUFjLFVBQVU7QUFDakMsSUFBSSxRQUFRLFdBQVcsYUFBYTtBQUNwQyxJQUFJLEtBQUssY0FBYyxRQUFRO0FBQy9CLElBQUksTUFBTSxhQUFhLFNBQVM7QUFDaEMsSUFBSSxRQUFRLFdBQVcsU0FBUztBQUNoQyxJQUFJLFdBQVcsUUFBUSxpQkFBaUI7QUFDeEMsSUFBSSxpQkFBaUIsRUFBRSxzQkFBc0I7QUFDN0MsR0FBRztBQUNILENBQUM7O0FBRUQsTUFBTSxRQUFRLEdBQUc7QUFDakIsRUFBRSxZQUFZLEtBQUssNENBQTRDO0FBQy9ELEVBQUUsYUFBYSxJQUFJLDZDQUE2QztBQUNoRSxFQUFFLGVBQWUsRUFBRSwrQ0FBK0M7QUFDbEUsRUFBRSxhQUFhLElBQUksSUFBSTtBQUN2QixDQUFDOztBQUVELE1BQU0sTUFBTSxHQUFHO0FBQ2Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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
