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

/* ---- UI Editor ---- */

const EDITOR_SCHEMA = [
  {
    name:     'entity_level',
    required: true,
    selector: { entity: { domain: 'sensor' } },
  },
  {
    name:     'entity_volume',
    required: true,
    selector: { entity: { domain: 'sensor' } },
  },
  {
    name:     'entity_distance',
    required: true,
    selector: { entity: { domain: 'sensor' } },
  },
  {
    name:     'tank_capacity',
    required: false,
    selector: { number: { min: 0, max: 99999, step: 1, mode: 'box', unit_of_measurement: 'L' } },
  },
  {
    name:     'title',
    required: false,
    selector: { text: {} },
  },
];

const EDITOR_LABELS = {
  entity_level:    'Level entity (0–100 %)',
  entity_volume:   'Volume entity (L)',
  entity_distance: 'Distance entity (m, sensor to surface)',
  tank_capacity:   'Tank capacity (L)',
  title:           'Card title',
};

class WaterTankCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass   = null;
    this._form   = null;
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass) return;

    if (!this._form) {
      this.shadowRoot.innerHTML = '<ha-form></ha-form>';
      this._form = this.shadowRoot.querySelector('ha-form');
      this._form.addEventListener('value-changed', e => {
        this.dispatchEvent(new CustomEvent('config-changed', {
          detail: { config: e.detail.value },
          bubbles: true,
          composed: true,
        }));
      });
    }

    this._form.hass         = this._hass;
    this._form.data         = this._config;
    this._form.schema       = EDITOR_SCHEMA;
    this._form.computeLabel = s => EDITOR_LABELS[s.name] ?? s.name;
  }
}

customElements.define('water-tank-card-editor', WaterTankCardEditor);

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

  static getConfigElement() { return document.createElement('water-tank-card-editor'); }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0ZXItdGFuay1jYXJkLmpzIiwic291cmNlcyI6WyIuLi9zcmMvd2F0ZXItdGFuay1jYXJkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogV2F0ZXIgVGFuayBDYXJkIOKAlCBWaXN1YWwgRGFzaGJvYXJkIEVkaXRpb25cbiAqIEVudGl0aWVzOiBsZXZlbCAoJSksIHZvbHVtZSAoTCksIGRpc3RhbmNlIChtKVxuICogTGlnaHQvZGFyayB0aGVtZSBhd2FyZS4gSEEgU2VjdGlvbiBncmlkIGNvbXBhdGlibGUuXG4gKi9cblxuY29uc3QgVFJBTlNMQVRJT05TID0ge1xuICBlbjoge1xuICAgIHRpdGxlOiAgICAgICAgICAgICAnV2F0ZXIgVGFuaycsXG4gICAgc3VidGl0bGU6ICAgICAgICAgICdMZXZlbCBNb25pdG9yJyxcbiAgICBsZXZlbDogICAgICAgICAgICAgJ0xldmVsJyxcbiAgICB2b2x1bWU6ICAgICAgICAgICAgJ1ZvbHVtZScsXG4gICAgZGlzdGFuY2U6ICAgICAgICAgICdEaXN0YW5jZScsXG4gICAgbGFzdF91cGRhdGU6ICAgICAgICdMYXN0IHVwZGF0ZScsXG4gICAgc2Vuc29yX3RvX3N1cmZhY2U6ICdTZW5zb3IgdG8gc3VyZmFjZScsXG4gIH0sXG4gIGRhOiB7XG4gICAgdGl0bGU6ICAgICAgICAgICAgICdWYW5kdGFuaycsXG4gICAgc3VidGl0bGU6ICAgICAgICAgICdOaXZlYXVtw6VsZXInLFxuICAgIGxldmVsOiAgICAgICAgICAgICAnTml2ZWF1JyxcbiAgICB2b2x1bWU6ICAgICAgICAgICAgJ1ZvbHVtZW4nLFxuICAgIGRpc3RhbmNlOiAgICAgICAgICAnQWZzdGFuZCcsXG4gICAgbGFzdF91cGRhdGU6ICAgICAgICdTaWRzdCBvcGRhdGVyZXQnLFxuICAgIHNlbnNvcl90b19zdXJmYWNlOiAnU2Vuc29yIHRpbCBvdmVyZmxhZGUnLFxuICB9LFxufTtcblxuY29uc3QgREVGQVVMVFMgPSB7XG4gIGVudGl0eV9sZXZlbDogICAgJ3NlbnNvci53YXRlcl90YW5rX21vbml0b3Jfd2F0ZXJfdGFua19sZXZlbCcsXG4gIGVudGl0eV92b2x1bWU6ICAgJ3NlbnNvci53YXRlcl90YW5rX21vbml0b3Jfd2F0ZXJfdGFua192b2x1bWUnLFxuICBlbnRpdHlfZGlzdGFuY2U6ICdzZW5zb3Iud2F0ZXJfdGFua19tb25pdG9yX3dhdGVyX3RhbmtfZGlzdGFuY2UnLFxuICB0YW5rX2NhcGFjaXR5OiAgIG51bGwsXG59O1xuXG5jb25zdCBTVFlMRVMgPSBgXG4gIDpob3N0IHsgZGlzcGxheTogYmxvY2s7IGhlaWdodDogMTAwJTsgfVxuXG4gIGhhLWNhcmQge1xuICAgIGhlaWdodDogMTAwJTtcbiAgICBtaW4taGVpZ2h0OiAyNjBweDtcbiAgICBwYWRkaW5nOiAwO1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICB9XG5cbiAgLyogLS0gTGF5b3V0IC0tICovXG4gIC5sYXlvdXQge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgYWxpZ24taXRlbXM6IHN0cmV0Y2g7XG4gIH1cblxuICAvKiAtLSBUYW5rIHNpZGUgLS0gKi9cbiAgLnRhbmstc2lkZSB7XG4gICAgZmxleDogMCAwIDQ0JTtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgcGFkZGluZzogMjBweCAycHggMjBweCAxNnB4O1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIH1cblxuICAudGFuay1vdXRlciB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGhlaWdodDogMTAwJTtcbiAgICBtYXgtaGVpZ2h0OiAzMDBweDtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBtYXgtd2lkdGg6IDE1MHB4O1xuICB9XG5cbiAgLyogQ2FwIG9uIHRvcCBvZiB0YW5rICovXG4gIC50YW5rLWNhcCB7XG4gICAgd2lkdGg6IDQ2JTtcbiAgICBoZWlnaHQ6IDE0cHg7XG4gICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRvIGJvdHRvbSwgIzJlNDU2MCwgIzFhMmU0Mik7XG4gICAgYm9yZGVyLXJhZGl1czogNXB4IDVweCAwIDA7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIG1hcmdpbi1ib3R0b206IC0ycHg7XG4gICAgei1pbmRleDogMjtcbiAgICBib3gtc2hhZG93OiAwIC0ycHggNHB4IHJnYmEoMCwwLDAsMC41KTtcbiAgfVxuICAudGFuay1jYXA6OmFmdGVyIHtcbiAgICBjb250ZW50OiAnJztcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiA0cHg7XG4gICAgbGVmdDogNTAlO1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTAlKTtcbiAgICB3aWR0aDogNTUlO1xuICAgIGhlaWdodDogNHB4O1xuICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LDI1NSwyNTUsMC4wNyk7XG4gICAgYm9yZGVyLXJhZGl1czogMnB4O1xuICB9XG5cbiAgLyogVGFuayBib2R5ICsgbWFya2VycyBzaWRlIGJ5IHNpZGUgKi9cbiAgLnRhbmstYW5kLW1hcmtlcnMge1xuICAgIGZsZXg6IDE7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBtaW4taGVpZ2h0OiAwO1xuICB9XG5cbiAgLyogQ29sdW1uIHRoYXQgb3ducyBjYXAgKyBib2R5IHNvIGNhcCAlIGlzIHJlbGF0aXZlIHRvIGJvZHkgd2lkdGggKi9cbiAgLnRhbmstY29sdW1uIHtcbiAgICBmbGV4OiAxO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIG1pbi1oZWlnaHQ6IDA7XG4gIH1cblxuICAudGFuay1ib2R5IHtcbiAgICBmbGV4OiAxO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGJvcmRlci1yYWRpdXM6IDEycHg7XG4gICAgYm9yZGVyOiAzcHggc29saWQgIzFlMzE0ODtcbiAgICBiYWNrZ3JvdW5kOiAjMDkxODJhO1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIGJveC1zaGFkb3c6XG4gICAgICBpbnNldCAwIDRweCAxNnB4IHJnYmEoMCwwLDAsMC42KSxcbiAgICAgIGluc2V0IDNweCAwIDhweCByZ2JhKDAsMCwwLDAuMyksXG4gICAgICBpbnNldCAtM3B4IDAgOHB4IHJnYmEoMCwwLDAsMC4zKTtcbiAgfVxuXG4gIC8qIExpZ2h0IHRoZW1lIG92ZXJyaWRlcyBmb3IgdGFuayAqL1xuICBAbWVkaWEgKHByZWZlcnMtY29sb3Itc2NoZW1lOiBsaWdodCkge1xuICAgIC50YW5rLWJvZHkgeyBiYWNrZ3JvdW5kOiAjY2ZlMGY1OyBib3JkZXItY29sb3I6ICM3ZWI4ZTg7IH1cbiAgICAudGFuay1jYXAgIHsgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRvIGJvdHRvbSwgIzdlYjhlOCwgIzVhOWZkNCk7IH1cbiAgICAudGFuay1jYXA6OmFmdGVyIHsgYmFja2dyb3VuZDogcmdiYSgyNTUsMjU1LDI1NSwwLjI1KTsgfVxuICB9XG5cbiAgLyogV2F0ZXIgZmlsbCAqL1xuICAud2F0ZXItZmlsbCB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGJvdHRvbTogMDsgbGVmdDogMDsgcmlnaHQ6IDA7XG4gICAgaGVpZ2h0OiAwJTtcbiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG8gdG9wLCAjMGQ0N2ExIDAlLCAjMTk3NmQyIDU1JSwgIzIxOTZmMyAxMDAlKTtcbiAgICB0cmFuc2l0aW9uOiBoZWlnaHQgMS40cyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICAgIHdpbGwtY2hhbmdlOiBoZWlnaHQ7XG4gIH1cblxuICAvKiBXYXZlIGF0IHdhdGVyIHN1cmZhY2UgKi9cbiAgLndhdmUtd3JhcCB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogLTE4cHg7IGxlZnQ6IDA7IHJpZ2h0OiAwO1xuICAgIGhlaWdodDogMjBweDtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgfVxuICAud2F2ZS10cmFjayB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICB3aWR0aDogMjAwJTtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gICAgYW5pbWF0aW9uOiB3YXZlLW1vdmUgMy41cyBsaW5lYXIgaW5maW5pdGU7XG4gICAgd2lsbC1jaGFuZ2U6IHRyYW5zZm9ybTtcbiAgfVxuICBAa2V5ZnJhbWVzIHdhdmUtbW92ZSB7XG4gICAgZnJvbSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTsgfVxuICAgIHRvICAgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7IH1cbiAgfVxuICAud2F2ZS1zdmcgeyBmbGV4OiAwIDAgNTAlOyBoZWlnaHQ6IDEwMCU7IH1cblxuICAvKiBTdWJ0bGUgc2hlZW4gaW5zaWRlIHdhdGVyICovXG4gIC53YXRlci1zaGVlbiB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMDsgbGVmdDogOCU7IHJpZ2h0OiAzNSU7XG4gICAgaGVpZ2h0OiA1NSU7XG4gICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE2MGRlZywgcmdiYSgyNTUsMjU1LDI1NSwwLjEpIDAlLCB0cmFuc3BhcmVudCA3MCUpO1xuICAgIGJvcmRlci1yYWRpdXM6IDAgMCA2MCUgNDAlO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICB9XG5cbiAgLyogUmlzaW5nIGJ1YmJsZXMgKi9cbiAgLmJ1YmJsZSB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwyNTUsMjU1LDAuMTUpO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4yMik7XG4gICAgYW5pbWF0aW9uOiBidWJibGUtZmxvYXQgbGluZWFyIGluZmluaXRlO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICB9XG4gIEBrZXlmcmFtZXMgYnViYmxlLWZsb2F0IHtcbiAgICAwJSAgIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApICAgICAgc2NhbGUoMSk7ICAgb3BhY2l0eTogMDsgICB9XG4gICAgOCUgICB7IG9wYWNpdHk6IDAuNjU7IH1cbiAgICA4NSUgIHsgb3BhY2l0eTogMC40OyB9XG4gICAgMTAwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMjQwcHgpIHNjYWxlKDAuNyk7IG9wYWNpdHk6IDA7ICAgfVxuICB9XG5cbiAgLyogSG9yaXpvbnRhbCBndWlkZSBsaW5lcyAqL1xuICAuZ3JpZC1saW5lIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgbGVmdDogMDsgcmlnaHQ6IDA7XG4gICAgaGVpZ2h0OiAxcHg7XG4gICAgYmFja2dyb3VuZDogcmdiYSgyNTUsMjU1LDI1NSwwLjEpO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICAgIHotaW5kZXg6IDE7XG4gIH1cblxuICAvKiBQZXJjZW50YWdlICsgdm9sdW1lIHRleHQgb3ZlcmxheSAqL1xuICAudGFuay10ZXh0IHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgaW5zZXQ6IDA7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgei1pbmRleDogMztcbiAgfVxuICAudC1wY3Qge1xuICAgIGZvbnQtc2l6ZTogY2xhbXAoMjhweCwgNnZ3LCA0MnB4KTtcbiAgICBmb250LXdlaWdodDogODAwO1xuICAgIGNvbG9yOiAjZmZmZmZmO1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIGxldHRlci1zcGFjaW5nOiAtMC4wMmVtO1xuICAgIHRleHQtc2hhZG93OiAwIDJweCAxMHB4IHJnYmEoMCwwLDAsMC42KTtcbiAgfVxuICAudC12b2wge1xuICAgIGZvbnQtc2l6ZTogY2xhbXAoMTBweCwgMnZ3LCAxM3B4KTtcbiAgICBjb2xvcjogcmdiYSgyNTUsMjU1LDI1NSwwLjY1KTtcbiAgICBtYXJnaW4tdG9wOiA1cHg7XG4gICAgdGV4dC1zaGFkb3c6IDAgMXB4IDZweCByZ2JhKDAsMCwwLDAuNSk7XG4gICAgbGV0dGVyLXNwYWNpbmc6IDAuMDFlbTtcbiAgfVxuXG4gIC8qIE1hcmtlcnMgY29sdW1uIChyaWdodCBvZiB0YW5rIGJvZHkpICovXG4gIC5tYXJrZXJzLWNvbCB7XG4gICAgd2lkdGg6IDQycHg7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIHBhZGRpbmctbGVmdDogMTRweDtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICB9XG4gIC5tYXJrZXIge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBsZWZ0OiAxNHB4OyByaWdodDogMDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiA0cHg7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01MCUpO1xuICB9XG4gIC5tLXRpY2sge1xuICAgIHdpZHRoOiA1cHg7IGhlaWdodDogMXB4O1xuICAgIGJhY2tncm91bmQ6IHZhcigtLXNlY29uZGFyeS10ZXh0LWNvbG9yLCByZ2JhKDE0MCwxNTAsMTYwLDAuNSkpO1xuICAgIGZsZXgtc2hyaW5rOiAwO1xuICB9XG4gIC5tLWxibCB7XG4gICAgZm9udC1zaXplOiA5cHg7XG4gICAgY29sb3I6IHZhcigtLXNlY29uZGFyeS10ZXh0LWNvbG9yLCByZ2JhKDE0MCwxNTAsMTYwLDAuNykpO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgZm9udC12YXJpYW50LW51bWVyaWM6IHRhYnVsYXItbnVtcztcbiAgfVxuXG4gIC8qIEFuaW1hdGVkIGxldmVsIGluZGljYXRvciBkb3QgKi9cbiAgLmxldmVsLWluZGljYXRvciB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGxlZnQ6IDA7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTAlKTtcbiAgICB0cmFuc2l0aW9uOiB0b3AgMS40cyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICAgIHdpbGwtY2hhbmdlOiB0b3A7XG4gICAgei1pbmRleDogMjtcbiAgfVxuICAubC1kb3Qge1xuICAgIHdpZHRoOiAxMHB4OyBoZWlnaHQ6IDEwcHg7XG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgIGJhY2tncm91bmQ6ICM0MmE1ZjU7XG4gICAgYm94LXNoYWRvdzogMCAwIDhweCByZ2JhKDY2LDE2NSwyNDUsMC45KSwgMCAwIDJweCByZ2JhKDY2LDE2NSwyNDUsMSk7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gIH1cbiAgLmwtbGluZSB7XG4gICAgd2lkdGg6IDhweDsgaGVpZ2h0OiAxcHg7XG4gICAgYmFja2dyb3VuZDogcmdiYSg2NiwxNjUsMjQ1LDAuNDUpO1xuICB9XG5cbiAgLyogLS0gU3RhdHMgc2lkZSAtLSAqL1xuICAuc3RhdHMtc2lkZSB7XG4gICAgZmxleDogMTtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgcGFkZGluZzogMTRweCAxNHB4IDEycHggOHB4O1xuICAgIGdhcDogN3B4O1xuICAgIG1pbi13aWR0aDogMDtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICB9XG5cbiAgLnMtaGVhZGVyIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiA5cHg7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gIH1cbiAgLnMtZHJvcCB7XG4gICAgZm9udC1zaXplOiAyMnB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIGZpbHRlcjogZHJvcC1zaGFkb3coMCAwIDZweCByZ2JhKDMwLDEzNiwyMjksMC42KSk7XG4gIH1cbiAgLnMtdGl0bGUge1xuICAgIGZvbnQtc2l6ZTogMTVweDtcbiAgICBmb250LXdlaWdodDogNzAwO1xuICAgIGNvbG9yOiB2YXIoLS1wcmltYXJ5LXRleHQtY29sb3IpO1xuICAgIGxldHRlci1zcGFjaW5nOiAwLjA2ZW07XG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICBsaW5lLWhlaWdodDogMS4xNTtcbiAgfVxuICAucy1zdWJ0aXRsZSB7XG4gICAgZm9udC1zaXplOiAxMHB4O1xuICAgIGNvbG9yOiB2YXIoLS1zZWNvbmRhcnktdGV4dC1jb2xvcik7XG4gICAgbGluZS1oZWlnaHQ6IDEuMjtcbiAgfVxuXG4gIC5kaXZpZGVyIHtcbiAgICBoZWlnaHQ6IDFweDtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1kaXZpZGVyLWNvbG9yLCByZ2JhKDEyMCwxMjAsMTIwLDAuMikpO1xuICAgIGZsZXgtc2hyaW5rOiAwO1xuICB9XG5cbiAgLyogSW5kaXZpZHVhbCBzdGF0IGNhcmQgKi9cbiAgLnN0YXQtY2FyZCB7XG4gICAgZmxleDogMTtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiAxMHB4O1xuICAgIHBhZGRpbmc6IDhweCAxMHB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tc2Vjb25kYXJ5LWJhY2tncm91bmQtY29sb3IsIHJnYmEoMTIwLDEyMCwxMjAsMC4wNikpO1xuICAgIG1pbi1oZWlnaHQ6IDA7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgfVxuICAuYy1pY29uIHtcbiAgICB3aWR0aDogMzhweDsgaGVpZ2h0OiAzOHB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gIH1cbiAgLmMtaWNvbiBoYS1pY29uIHsgLS1tZGMtaWNvbi1zaXplOiAyMHB4OyBjb2xvcjogd2hpdGU7IH1cbiAgLmMtaWNvbi5ibHVlIHtcbiAgICBiYWNrZ3JvdW5kOiByYWRpYWwtZ3JhZGllbnQoY2lyY2xlIGF0IDM4JSAzMiUsICM2NGI1ZjYsICMxNTY1YzApO1xuICAgIGJveC1zaGFkb3c6IDAgM3B4IDEwcHggcmdiYSgyMSwxMDEsMTkyLDAuNDUpO1xuICB9XG4gIC5jLWljb24udGVhbCB7XG4gICAgYmFja2dyb3VuZDogcmFkaWFsLWdyYWRpZW50KGNpcmNsZSBhdCAzOCUgMzIlLCAjNGRkMGUxLCAjMDA2MDY0KTtcbiAgICBib3gtc2hhZG93OiAwIDNweCAxMHB4IHJnYmEoMCw5NiwxMDAsMC40NSk7XG4gIH1cbiAgLmMtaWNvbi5vcmFuZ2Uge1xuICAgIGJhY2tncm91bmQ6IHJhZGlhbC1ncmFkaWVudChjaXJjbGUgYXQgMzglIDMyJSwgI2ZmYjc0ZCwgI2JmMzYwYyk7XG4gICAgYm94LXNoYWRvdzogMCAzcHggMTBweCByZ2JhKDE5MSw1NCwxMiwwLjQ1KTtcbiAgfVxuXG4gIC5jLWluZm8geyBmbGV4OiAxOyBtaW4td2lkdGg6IDA7IH1cbiAgLmMtbGFiZWwge1xuICAgIGZvbnQtc2l6ZTogOXB4O1xuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgbGV0dGVyLXNwYWNpbmc6IDAuMWVtO1xuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgY29sb3I6IHZhcigtLXNlY29uZGFyeS10ZXh0LWNvbG9yKTtcbiAgICBtYXJnaW4tYm90dG9tOiAycHg7XG4gIH1cbiAgLmMtdmFsdWUge1xuICAgIGZvbnQtc2l6ZTogMjJweDtcbiAgICBmb250LXdlaWdodDogNzAwO1xuICAgIGNvbG9yOiB2YXIoLS1wcmltYXJ5LXRleHQtY29sb3IpO1xuICAgIGxpbmUtaGVpZ2h0OiAxLjE7XG4gICAgbGV0dGVyLXNwYWNpbmc6IC0wLjAxZW07XG4gIH1cbiAgLmMtc3ViIHtcbiAgICBmb250LXNpemU6IDEwcHg7XG4gICAgY29sb3I6IHZhcigtLXNlY29uZGFyeS10ZXh0LWNvbG9yKTtcbiAgICBtYXJnaW4tdG9wOiAxcHg7XG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICB9XG5cbiAgLyogRm9vdGVyICovXG4gIC5mb290ZXIge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBnYXA6IDVweDtcbiAgICBmbGV4LXNocmluazogMDtcbiAgfVxuICAuZm9vdGVyIGhhLWljb24ge1xuICAgIC0tbWRjLWljb24tc2l6ZTogMTNweDtcbiAgICBjb2xvcjogdmFyKC0tc2Vjb25kYXJ5LXRleHQtY29sb3IpO1xuICAgIG9wYWNpdHk6IDAuNjtcbiAgfVxuICAuZm9vdGVyLXR4dCB7XG4gICAgZm9udC1zaXplOiAxMHB4O1xuICAgIGNvbG9yOiB2YXIoLS1zZWNvbmRhcnktdGV4dC1jb2xvcik7XG4gICAgb3BhY2l0eTogMC42O1xuICB9XG5gO1xuXG5jb25zdCBXQVZFX0QgPVxuICAnTTAsMTAgQzMzLDIgNjcsMTggMTAwLDEwIEMxMzMsMiAxNjcsMTggMjAwLDEwICcgK1xuICAnQzIzMywyIDI2NywxOCAzMDAsMTAgQzMzMywyIDM2NywxOCA0MDAsMTAgTDQwMCwyMCBMMCwyMCBaJztcblxuLyogLS0tLSBVSSBFZGl0b3IgLS0tLSAqL1xuXG5jb25zdCBFRElUT1JfU0NIRU1BID0gW1xuICB7XG4gICAgbmFtZTogICAgICdlbnRpdHlfbGV2ZWwnLFxuICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIHNlbGVjdG9yOiB7IGVudGl0eTogeyBkb21haW46ICdzZW5zb3InIH0gfSxcbiAgfSxcbiAge1xuICAgIG5hbWU6ICAgICAnZW50aXR5X3ZvbHVtZScsXG4gICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgc2VsZWN0b3I6IHsgZW50aXR5OiB7IGRvbWFpbjogJ3NlbnNvcicgfSB9LFxuICB9LFxuICB7XG4gICAgbmFtZTogICAgICdlbnRpdHlfZGlzdGFuY2UnLFxuICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIHNlbGVjdG9yOiB7IGVudGl0eTogeyBkb21haW46ICdzZW5zb3InIH0gfSxcbiAgfSxcbiAge1xuICAgIG5hbWU6ICAgICAndGFua19jYXBhY2l0eScsXG4gICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgIHNlbGVjdG9yOiB7IG51bWJlcjogeyBtaW46IDAsIG1heDogOTk5OTksIHN0ZXA6IDEsIG1vZGU6ICdib3gnLCB1bml0X29mX21lYXN1cmVtZW50OiAnTCcgfSB9LFxuICB9LFxuICB7XG4gICAgbmFtZTogICAgICd0aXRsZScsXG4gICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgIHNlbGVjdG9yOiB7IHRleHQ6IHt9IH0sXG4gIH0sXG5dO1xuXG5jb25zdCBFRElUT1JfTEFCRUxTID0ge1xuICBlbnRpdHlfbGV2ZWw6ICAgICdMZXZlbCBlbnRpdHkgKDDigJMxMDAgJSknLFxuICBlbnRpdHlfdm9sdW1lOiAgICdWb2x1bWUgZW50aXR5IChMKScsXG4gIGVudGl0eV9kaXN0YW5jZTogJ0Rpc3RhbmNlIGVudGl0eSAobSwgc2Vuc29yIHRvIHN1cmZhY2UpJyxcbiAgdGFua19jYXBhY2l0eTogICAnVGFuayBjYXBhY2l0eSAoTCknLFxuICB0aXRsZTogICAgICAgICAgICdDYXJkIHRpdGxlJyxcbn07XG5cbmNsYXNzIFdhdGVyVGFua0NhcmRFZGl0b3IgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5hdHRhY2hTaGFkb3coeyBtb2RlOiAnb3BlbicgfSk7XG4gICAgdGhpcy5fY29uZmlnID0ge307XG4gICAgdGhpcy5faGFzcyAgID0gbnVsbDtcbiAgICB0aGlzLl9mb3JtICAgPSBudWxsO1xuICB9XG5cbiAgc2V0Q29uZmlnKGNvbmZpZykge1xuICAgIHRoaXMuX2NvbmZpZyA9IHsgLi4uY29uZmlnIH07XG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gIH1cblxuICBzZXQgaGFzcyhoYXNzKSB7XG4gICAgdGhpcy5faGFzcyA9IGhhc3M7XG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gIH1cblxuICBfcmVuZGVyKCkge1xuICAgIGlmICghdGhpcy5faGFzcykgcmV0dXJuO1xuXG4gICAgaWYgKCF0aGlzLl9mb3JtKSB7XG4gICAgICB0aGlzLnNoYWRvd1Jvb3QuaW5uZXJIVE1MID0gJzxoYS1mb3JtPjwvaGEtZm9ybT4nO1xuICAgICAgdGhpcy5fZm9ybSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdoYS1mb3JtJyk7XG4gICAgICB0aGlzLl9mb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3ZhbHVlLWNoYW5nZWQnLCBlID0+IHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnY29uZmlnLWNoYW5nZWQnLCB7XG4gICAgICAgICAgZGV0YWlsOiB7IGNvbmZpZzogZS5kZXRhaWwudmFsdWUgfSxcbiAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgICB9KSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9mb3JtLmhhc3MgICAgICAgICA9IHRoaXMuX2hhc3M7XG4gICAgdGhpcy5fZm9ybS5kYXRhICAgICAgICAgPSB0aGlzLl9jb25maWc7XG4gICAgdGhpcy5fZm9ybS5zY2hlbWEgICAgICAgPSBFRElUT1JfU0NIRU1BO1xuICAgIHRoaXMuX2Zvcm0uY29tcHV0ZUxhYmVsID0gcyA9PiBFRElUT1JfTEFCRUxTW3MubmFtZV0gPz8gcy5uYW1lO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnd2F0ZXItdGFuay1jYXJkLWVkaXRvcicsIFdhdGVyVGFua0NhcmRFZGl0b3IpO1xuXG5jbGFzcyBXYXRlclRhbmtDYXJkIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pO1xuICAgIHRoaXMuX2NvbmZpZyA9IG51bGw7XG4gICAgdGhpcy5faGFzcyAgID0gbnVsbDtcbiAgICB0aGlzLl9idWlsdCAgPSBmYWxzZTtcbiAgfVxuXG4gIC8qIC0tIEhBIENhcmQgQVBJIC0tICovXG5cbiAgc2V0Q29uZmlnKGNvbmZpZykge1xuICAgIGlmICghY29uZmlnKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29uZmlndXJhdGlvbicpO1xuICAgIHRoaXMuX2NvbmZpZyA9IHsgLi4uREVGQVVMVFMsIC4uLmNvbmZpZyB9O1xuICAgIHRoaXMuX2J1aWx0ICA9IGZhbHNlO1xuICAgIHRoaXMuX2J1aWxkRE9NKCk7XG4gICAgaWYgKHRoaXMuX2hhc3MpIHRoaXMuX3VwZGF0ZSgpO1xuICB9XG5cbiAgc2V0IGhhc3MoaGFzcykge1xuICAgIHRoaXMuX2hhc3MgPSBoYXNzO1xuICAgIGlmICghdGhpcy5fYnVpbHQpIHRoaXMuX2J1aWxkRE9NKCk7XG4gICAgdGhpcy5fdXBkYXRlKCk7XG4gIH1cblxuICBnZXRMYXlvdXRPcHRpb25zKCkge1xuICAgIHJldHVybiB7XG4gICAgICBncmlkX2NvbHVtbnM6ICAgICA0LFxuICAgICAgZ3JpZF9yb3dzOiAgICAgICAgJ2F1dG8nLFxuICAgICAgZ3JpZF9taW5fY29sdW1uczogMixcbiAgICAgIGdyaWRfbWluX3Jvd3M6ICAgIDIsXG4gICAgICBncmlkX21heF9jb2x1bW5zOiA2LFxuICAgIH07XG4gIH1cblxuICBnZXRDYXJkU2l6ZSgpIHsgcmV0dXJuIDQ7IH1cblxuICBzdGF0aWMgZ2V0Q29uZmlnRWxlbWVudCgpIHsgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3dhdGVyLXRhbmstY2FyZC1lZGl0b3InKTsgfVxuXG4gIHN0YXRpYyBnZXRTdHViQ29uZmlnKCkgeyByZXR1cm4geyAuLi5ERUZBVUxUUyB9OyB9XG5cbiAgLyogLS0gaTE4biAtLSAqL1xuXG4gIF90KGtleSkge1xuICAgIGNvbnN0IGxhbmcgPSB0aGlzLl9oYXNzPy5sYW5ndWFnZSB8fCAnZW4nO1xuICAgIHJldHVybiAoVFJBTlNMQVRJT05TW2xhbmddID8/IFRSQU5TTEFUSU9OUy5lbilba2V5XSA/PyBUUkFOU0xBVElPTlMuZW5ba2V5XSA/PyBrZXk7XG4gIH1cblxuICAvKiAtLSBET00gLS0gKi9cblxuICBfYnVpbGRET00oKSB7XG4gICAgaWYgKCF0aGlzLl9jb25maWcpIHJldHVybjtcblxuICAgIGNvbnN0IHdhdmVTVkcgPSBgXG4gICAgICA8c3ZnIGNsYXNzPVwid2F2ZS1zdmdcIiB2aWV3Qm94PVwiMCAwIDQwMCAyMFwiIHByZXNlcnZlQXNwZWN0UmF0aW89XCJub25lXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuICAgICAgICA8cGF0aCBkPVwiJHtXQVZFX0R9XCIgZmlsbD1cInJnYmEoMzMsMTUwLDI0MywwLjU1KVwiLz5cbiAgICAgIDwvc3ZnPmA7XG5cbiAgICB0aGlzLnNoYWRvd1Jvb3QuaW5uZXJIVE1MID0gYFxuICAgICAgPHN0eWxlPiR7U1RZTEVTfTwvc3R5bGU+XG4gICAgICA8aGEtY2FyZD5cbiAgICAgICAgPGRpdiBjbGFzcz1cImxheW91dFwiPlxuXG4gICAgICAgICAgPCEtLSBUYW5rIC0tPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YW5rLXNpZGVcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YW5rLW91dGVyXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YW5rLWFuZC1tYXJrZXJzXCI+XG5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFuay1jb2x1bW5cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFuay1jYXBcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFuay1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2F0ZXItZmlsbFwiIGlkPVwid2F0ZXItZmlsbFwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2F2ZS13cmFwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndhdmUtdHJhY2tcIj4ke3dhdmVTVkd9JHt3YXZlU1ZHfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndhdGVyLXNoZWVuXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidWJibGVcIiBzdHlsZT1cIndpZHRoOjhweDtoZWlnaHQ6OHB4O2xlZnQ6MTglO2JvdHRvbTo4JTthbmltYXRpb24tZHVyYXRpb246NC4yczthbmltYXRpb24tZGVsYXk6MC4zc1wiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnViYmxlXCIgc3R5bGU9XCJ3aWR0aDo1cHg7aGVpZ2h0OjVweDtsZWZ0OjQyJTtib3R0b206MjUlO2FuaW1hdGlvbi1kdXJhdGlvbjo1LjhzO2FuaW1hdGlvbi1kZWxheToxLjhzXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidWJibGVcIiBzdHlsZT1cIndpZHRoOjdweDtoZWlnaHQ6N3B4O2xlZnQ6NjMlO2JvdHRvbToxMiU7YW5pbWF0aW9uLWR1cmF0aW9uOjMuNnM7YW5pbWF0aW9uLWRlbGF5OjAuOXNcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1YmJsZVwiIHN0eWxlPVwid2lkdGg6NHB4O2hlaWdodDo0cHg7bGVmdDoyOCU7Ym90dG9tOjQ1JTthbmltYXRpb24tZHVyYXRpb246Ni41czthbmltYXRpb24tZGVsYXk6Mi41c1wiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnViYmxlXCIgc3R5bGU9XCJ3aWR0aDo2cHg7aGVpZ2h0OjZweDtsZWZ0Ojc4JTtib3R0b206MTglO2FuaW1hdGlvbi1kdXJhdGlvbjo0LjhzO2FuaW1hdGlvbi1kZWxheTozLjNzXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmlkLWxpbmVcIiBzdHlsZT1cInRvcDoyNSVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmlkLWxpbmVcIiBzdHlsZT1cInRvcDo1MCVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmlkLWxpbmVcIiBzdHlsZT1cInRvcDo3NSVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YW5rLXRleHRcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInQtcGN0XCIgaWQ9XCJ0LXBjdFwiPuKAlDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidC12b2xcIiBpZD1cInQtdm9sXCI+4oCUPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj48IS0tIC90YW5rLWNvbHVtbiAtLT5cblxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXJrZXJzLWNvbFwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxldmVsLWluZGljYXRvclwiIGlkPVwibGV2ZWwtaW5kaWNhdG9yXCIgc3R5bGU9XCJ0b3A6NTAlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsLWRvdFwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibC1saW5lXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXJrZXJcIiBzdHlsZT1cInRvcDowJVwiPiAgPGRpdiBjbGFzcz1cIm0tdGlja1wiPjwvZGl2PjxzcGFuIGNsYXNzPVwibS1sYmxcIj4xMDAlPC9zcGFuPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1hcmtlclwiIHN0eWxlPVwidG9wOjI1JVwiPiA8ZGl2IGNsYXNzPVwibS10aWNrXCI+PC9kaXY+PHNwYW4gY2xhc3M9XCJtLWxibFwiPjc1JTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXJrZXJcIiBzdHlsZT1cInRvcDo1MCVcIj4gPGRpdiBjbGFzcz1cIm0tdGlja1wiPjwvZGl2PjxzcGFuIGNsYXNzPVwibS1sYmxcIj41MCU8L3NwYW4+PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWFya2VyXCIgc3R5bGU9XCJ0b3A6NzUlXCI+IDxkaXYgY2xhc3M9XCJtLXRpY2tcIj48L2Rpdj48c3BhbiBjbGFzcz1cIm0tbGJsXCI+MjUlPC9zcGFuPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1hcmtlclwiIHN0eWxlPVwidG9wOjEwMCVcIj48ZGl2IGNsYXNzPVwibS10aWNrXCI+PC9kaXY+PHNwYW4gY2xhc3M9XCJtLWxibFwiPjAlPC9zcGFuPjwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8IS0tIFN0YXRzIC0tPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0cy1zaWRlXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicy1oZWFkZXJcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInMtZHJvcFwiPvCfkqc8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicy10aXRsZVwiICAgIGlkPVwicy10aXRsZVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzLXN1YnRpdGxlXCIgaWQ9XCJzLXN1YnRpdGxlXCI+PC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGl2aWRlclwiPjwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdC1jYXJkXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLWljb24gYmx1ZVwiPjxoYS1pY29uIGljb249XCJtZGk6d2F2ZXNcIj48L2hhLWljb24+PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLWluZm9cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1sYWJlbFwiIGlkPVwibGJsLWxldmVsXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdmFsdWVcIiBpZD1cInZhbC1sZXZlbFwiPuKAlDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXN1YlwiICAgaWQ9XCJzdWItbGV2ZWxcIj48L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXQtY2FyZFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1pY29uIHRlYWxcIj48aGEtaWNvbiBpY29uPVwibWRpOndhdGVyXCI+PC9oYS1pY29uPjwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1pbmZvXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtbGFiZWxcIiBpZD1cImxibC12b2x1bWVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy12YWx1ZVwiIGlkPVwidmFsLXZvbHVtZVwiPuKAlDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXN1YlwiICAgaWQ9XCJzdWItdm9sdW1lXCI+PC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0LWNhcmRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtaWNvbiBvcmFuZ2VcIj48aGEtaWNvbiBpY29uPVwibWRpOnJ1bGVyXCI+PC9oYS1pY29uPjwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1pbmZvXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtbGFiZWxcIiBpZD1cImxibC1kaXN0YW5jZVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXZhbHVlXCIgaWQ9XCJ2YWwtZGlzdGFuY2VcIj7igJQ8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1zdWJcIiAgIGlkPVwic3ViLWRpc3RhbmNlXCI+PC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb290ZXJcIj5cbiAgICAgICAgICAgICAgPGhhLWljb24gaWNvbj1cIm1kaTppbmZvcm1hdGlvbi1vdXRsaW5lXCI+PC9oYS1pY29uPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvb3Rlci10eHRcIiBpZD1cImZvb3Rlci10aW1lXCI+PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2hhLWNhcmQ+XG4gICAgYDtcblxuICAgIHRoaXMuX2J1aWx0ID0gdHJ1ZTtcbiAgfVxuXG4gIC8qIC0tIFN0YXRlIHVwZGF0ZXMgLS0gKi9cblxuICBfdXBkYXRlKCkge1xuICAgIGlmICghdGhpcy5fYnVpbHQgfHwgIXRoaXMuX2hhc3MgfHwgIXRoaXMuX2NvbmZpZykgcmV0dXJuO1xuXG4gICAgY29uc3QgbGV2ZWxOdW0gID0gdGhpcy5fbnVtKHRoaXMuX2NvbmZpZy5lbnRpdHlfbGV2ZWwpO1xuICAgIGNvbnN0IHZvbHVtZU51bSA9IHRoaXMuX251bSh0aGlzLl9jb25maWcuZW50aXR5X3ZvbHVtZSk7XG4gICAgY29uc3QgZGlzdE51bSAgID0gdGhpcy5fbnVtKHRoaXMuX2NvbmZpZy5lbnRpdHlfZGlzdGFuY2UpO1xuICAgIGNvbnN0IHBjdCAgICAgICA9IGlzTmFOKGxldmVsTnVtKSA/IDAgOiBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIGxldmVsTnVtKSk7XG4gICAgY29uc3QgJCAgICAgICAgID0gaWQgPT4gdGhpcy5zaGFkb3dSb290LmdldEVsZW1lbnRCeUlkKGlkKTtcblxuICAgIC8vIEhlYWRlciB0ZXh0XG4gICAgJCgncy10aXRsZScpLnRleHRDb250ZW50ICAgID0gdGhpcy5fY29uZmlnLnRpdGxlID8/IHRoaXMuX3QoJ3RpdGxlJyk7XG4gICAgJCgncy1zdWJ0aXRsZScpLnRleHRDb250ZW50ID0gdGhpcy5fdCgnc3VidGl0bGUnKTtcblxuICAgIC8vIFN0YXQgbGFiZWxzXG4gICAgJCgnbGJsLWxldmVsJykudGV4dENvbnRlbnQgICAgPSB0aGlzLl90KCdsZXZlbCcpLnRvVXBwZXJDYXNlKCk7XG4gICAgJCgnbGJsLXZvbHVtZScpLnRleHRDb250ZW50ICAgPSB0aGlzLl90KCd2b2x1bWUnKS50b1VwcGVyQ2FzZSgpO1xuICAgICQoJ2xibC1kaXN0YW5jZScpLnRleHRDb250ZW50ID0gdGhpcy5fdCgnZGlzdGFuY2UnKS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgLy8gV2F0ZXIgZmlsbCBoZWlnaHQgKyBjb2xvdXJcbiAgICBjb25zdCBmaWxsID0gJCgnd2F0ZXItZmlsbCcpO1xuICAgIGlmIChmaWxsKSB7XG4gICAgICBmaWxsLnN0eWxlLmhlaWdodCA9IGAke3BjdH0lYDtcbiAgICAgIGlmIChwY3QgPD0gMTUpXG4gICAgICAgIGZpbGwuc3R5bGUuYmFja2dyb3VuZCA9ICdsaW5lYXItZ3JhZGllbnQodG8gdG9wLCNiNzFjMWMgMCUsI2VmNTM1MCA2MCUsI2U1NzM3MyAxMDAlKSc7XG4gICAgICBlbHNlIGlmIChwY3QgPD0gMzApXG4gICAgICAgIGZpbGwuc3R5bGUuYmFja2dyb3VuZCA9ICdsaW5lYXItZ3JhZGllbnQodG8gdG9wLCNlNjUxMDAgMCUsI2ZiOGMwMCA2MCUsI2ZmYTcyNiAxMDAlKSc7XG4gICAgICBlbHNlXG4gICAgICAgIGZpbGwuc3R5bGUuYmFja2dyb3VuZCA9ICdsaW5lYXItZ3JhZGllbnQodG8gdG9wLCMwZDQ3YTEgMCUsIzE5NzZkMiA1NSUsIzIxOTZmMyAxMDAlKSc7XG4gICAgfVxuXG4gICAgLy8gTGV2ZWwgaW5kaWNhdG9yIGRvdCAodG9wICUgPSAxMDAgLSBsZXZlbClcbiAgICBjb25zdCBkb3QgPSAkKCdsZXZlbC1pbmRpY2F0b3InKTtcbiAgICBpZiAoZG90KSBkb3Quc3R5bGUudG9wID0gYCR7MTAwIC0gcGN0fSVgO1xuXG4gICAgLy8gVGFuayBjZW50cmUgdGV4dFxuICAgICQoJ3QtcGN0JykudGV4dENvbnRlbnQgPSBpc05hTihsZXZlbE51bSkgPyAn4oCUJyA6IGAke01hdGgucm91bmQobGV2ZWxOdW0pfSVgO1xuICAgICQoJ3Qtdm9sJykudGV4dENvbnRlbnQgPSB0aGlzLl9mbXRWb2wodm9sdW1lTnVtKTtcblxuICAgIC8vIExldmVsIHN0YXQgY2FyZFxuICAgICQoJ3ZhbC1sZXZlbCcpLnRleHRDb250ZW50ID0gaXNOYU4obGV2ZWxOdW0pID8gJ+KAlCcgOiBgJHtNYXRoLnJvdW5kKGxldmVsTnVtKX0lYDtcbiAgICAkKCdzdWItbGV2ZWwnKS50ZXh0Q29udGVudCA9IHRoaXMuX2ZtdFZvbCh2b2x1bWVOdW0pO1xuXG4gICAgLy8gVm9sdW1lIHN0YXQgY2FyZFxuICAgIGNvbnN0IHZvbFN0YXRlID0gdGhpcy5faGFzcy5zdGF0ZXNbdGhpcy5fY29uZmlnLmVudGl0eV92b2x1bWVdO1xuICAgIGNvbnN0IHZvbFVuaXQgID0gdm9sU3RhdGU/LmF0dHJpYnV0ZXM/LnVuaXRfb2ZfbWVhc3VyZW1lbnQgPz8gJ0wnO1xuICAgICQoJ3ZhbC12b2x1bWUnKS50ZXh0Q29udGVudCA9IGlzTmFOKHZvbHVtZU51bSkgPyAn4oCUJyA6IE1hdGgucm91bmQodm9sdW1lTnVtKS50b0xvY2FsZVN0cmluZygpO1xuICAgICQoJ3N1Yi12b2x1bWUnKS50ZXh0Q29udGVudCA9IHZvbFVuaXQ7XG5cbiAgICAvLyBEaXN0YW5jZSBzdGF0IGNhcmRcbiAgICBjb25zdCBkaXN0U3RhdGUgPSB0aGlzLl9oYXNzLnN0YXRlc1t0aGlzLl9jb25maWcuZW50aXR5X2Rpc3RhbmNlXTtcbiAgICBjb25zdCBkaXN0VW5pdCAgPSBkaXN0U3RhdGU/LmF0dHJpYnV0ZXM/LnVuaXRfb2ZfbWVhc3VyZW1lbnQgPz8gJ20nO1xuICAgICQoJ3ZhbC1kaXN0YW5jZScpLnRleHRDb250ZW50ID0gaXNOYU4oZGlzdE51bSkgPyAn4oCUJyA6IGRpc3ROdW0udG9GaXhlZCgyKTtcbiAgICAkKCdzdWItZGlzdGFuY2UnKS50ZXh0Q29udGVudCA9IGAke3RoaXMuX3QoJ3NlbnNvcl90b19zdXJmYWNlJyl9IMK3ICR7ZGlzdFVuaXR9YDtcblxuICAgIC8vIEZvb3RlciB0aW1lc3RhbXBcbiAgICBjb25zdCBsdmxTdGF0ZSA9IHRoaXMuX2hhc3Muc3RhdGVzW3RoaXMuX2NvbmZpZy5lbnRpdHlfbGV2ZWxdO1xuICAgIGlmIChsdmxTdGF0ZT8ubGFzdF91cGRhdGVkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkICAgPSBuZXcgRGF0ZShsdmxTdGF0ZS5sYXN0X3VwZGF0ZWQpO1xuICAgICAgICBjb25zdCBmbXQgPSBkLnRvTG9jYWxlVGltZVN0cmluZyh0aGlzLl9oYXNzLmxhbmd1YWdlIHx8ICdlbicsIHtcbiAgICAgICAgICBob3VyOiAnMi1kaWdpdCcsIG1pbnV0ZTogJzItZGlnaXQnLCBzZWNvbmQ6ICcyLWRpZ2l0JyxcbiAgICAgICAgfSk7XG4gICAgICAgICQoJ2Zvb3Rlci10aW1lJykudGV4dENvbnRlbnQgPSBgJHt0aGlzLl90KCdsYXN0X3VwZGF0ZScpfTogJHtmbXR9YDtcbiAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgJCgnZm9vdGVyLXRpbWUnKS50ZXh0Q29udGVudCA9IGAke3RoaXMuX3QoJ2xhc3RfdXBkYXRlJyl9OiDigJRgO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9mbXRWb2wodm9sdW1lTnVtKSB7XG4gICAgaWYgKGlzTmFOKHZvbHVtZU51bSkpIHJldHVybiAnJztcbiAgICBjb25zdCBjYXAgPSB0aGlzLl9jb25maWcudGFua19jYXBhY2l0eTtcbiAgICBjb25zdCB2ICAgPSBNYXRoLnJvdW5kKHZvbHVtZU51bSkudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICByZXR1cm4gY2FwID8gYCR7dn0gLyAke01hdGgucm91bmQoY2FwKS50b0xvY2FsZVN0cmluZygpfSBMYCA6IGAke3Z9IExgO1xuICB9XG5cbiAgX251bShlbnRpdHlJZCkge1xuICAgIGNvbnN0IHMgPSB0aGlzLl9oYXNzPy5zdGF0ZXNbZW50aXR5SWRdO1xuICAgIHJldHVybiBzID8gcGFyc2VGbG9hdChzLnN0YXRlKSA6IE5hTjtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ3dhdGVyLXRhbmstY2FyZCcsIFdhdGVyVGFua0NhcmQpO1xuXG53aW5kb3cuY3VzdG9tQ2FyZHMgPSB3aW5kb3cuY3VzdG9tQ2FyZHMgfHwgW107XG53aW5kb3cuY3VzdG9tQ2FyZHMucHVzaCh7XG4gIHR5cGU6ICAgICAgICAgICAgICd3YXRlci10YW5rLWNhcmQnLFxuICBuYW1lOiAgICAgICAgICAgICAnV2F0ZXIgVGFuayBDYXJkJyxcbiAgZGVzY3JpcHRpb246ICAgICAgJ1Zpc3VhbCB3YXRlciB0YW5rIGRhc2hib2FyZCDigJQgbGV2ZWwsIHZvbHVtZSBhbmQgZGlzdGFuY2UuJyxcbiAgcHJldmlldzogICAgICAgICAgdHJ1ZSxcbiAgZG9jdW1lbnRhdGlvblVSTDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9iamFybmUtcmlpcy9oYS13YXRlcnRhbmtjYXJkJyxcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTSxZQUFZLEdBQUc7QUFDckIsRUFBRSxFQUFFLEVBQUU7QUFDTixJQUFJLEtBQUssY0FBYyxZQUFZO0FBQ25DLElBQUksUUFBUSxXQUFXLGVBQWU7QUFDdEMsSUFBSSxLQUFLLGNBQWMsT0FBTztBQUM5QixJQUFJLE1BQU0sYUFBYSxRQUFRO0FBQy9CLElBQUksUUFBUSxXQUFXLFVBQVU7QUFDakMsSUFBSSxXQUFXLFFBQVEsYUFBYTtBQUNwQyxJQUFJLGlCQUFpQixFQUFFLG1CQUFtQjtBQUMxQyxHQUFHO0FBQ0gsRUFBRSxFQUFFLEVBQUU7QUFDTixJQUFJLEtBQUssY0FBYyxVQUFVO0FBQ2pDLElBQUksUUFBUSxXQUFXLGFBQWE7QUFDcEMsSUFBSSxLQUFLLGNBQWMsUUFBUTtBQUMvQixJQUFJLE1BQU0sYUFBYSxTQUFTO0FBQ2hDLElBQUksUUFBUSxXQUFXLFNBQVM7QUFDaEMsSUFBSSxXQUFXLFFBQVEsaUJBQWlCO0FBQ3hDLElBQUksaUJBQWlCLEVBQUUsc0JBQXNCO0FBQzdDLEdBQUc7QUFDSCxDQUFDOztBQUVELE1BQU0sUUFBUSxHQUFHO0FBQ2pCLEVBQUUsWUFBWSxLQUFLLDRDQUE0QztBQUMvRCxFQUFFLGFBQWEsSUFBSSw2Q0FBNkM7QUFDaEUsRUFBRSxlQUFlLEVBQUUsK0NBQStDO0FBQ2xFLEVBQUUsYUFBYSxJQUFJLElBQUk7QUFDdkIsQ0FBQzs7QUFFRCxNQUFNLE1BQU0sR0FBRztBQUNmOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQsTUFBTSxNQUFNO0FBQ1osRUFBRSxnREFBZ0Q7QUFDbEQsRUFBRSwyREFBMkQ7O0FBRTdEOztBQUVBLE1BQU0sYUFBYSxHQUFHO0FBQ3RCLEVBQUU7QUFDRixJQUFJLElBQUksTUFBTSxjQUFjO0FB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
