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
    voltage:           'Voltage',
    pressure:          'Pressure',
    temperature:       'Temperature',
    humidity:          'Humidity',
    last_update:       'Last update',
    sensor_to_surface:        'Sensor to surface',
    sensor_desc_voltage:      'Sensor voltage',
    sensor_desc_pressure:     'Pressure reading',
    sensor_desc_temperature:  'Temperature reading',
    sensor_desc_humidity:     'Humidity reading',
    // editor field labels
    editor_entity_level:       'Level entity (0–100 %)',
    editor_entity_volume:      'Volume entity (L)',
    editor_extra_sensor_type:  'Third sensor type',
    editor_entity_distance:    'Third sensor entity',
    editor_tank_capacity:      'Tank capacity (L)',
    editor_title:              'Card title',
  },
  da: {
    title:             'Vandtank',
    subtitle:          'Niveaumåler',
    level:             'Niveau',
    volume:            'Volumen',
    distance:          'Afstand',
    voltage:           'Spænding',
    pressure:          'Tryk',
    temperature:       'Temperatur',
    humidity:          'Fugtighed',
    last_update:       'Sidst opdateret',
    sensor_to_surface:        'Sensor til overflade',
    sensor_desc_voltage:      'Sensor spænding',
    sensor_desc_pressure:     'Trykaflæsning',
    sensor_desc_temperature:  'Temperaturaflæsning',
    sensor_desc_humidity:     'Fugtighedsaflæsning',
    // editor field labels
    editor_entity_level:       'Niveau entitet (0–100 %)',
    editor_entity_volume:      'Volumen entitet (L)',
    editor_extra_sensor_type:  'Tredje sensor type',
    editor_entity_distance:    'Tredje sensor entitet',
    editor_tank_capacity:      'Tankkapacitet (L)',
    editor_title:              'Korttitel',
  },
};

const DEFAULTS = {
  entity_level:      'sensor.water_tank_monitor_water_tank_level',
  entity_volume:     'sensor.water_tank_monitor_water_tank_volume',
  entity_distance:   null,
  extra_sensor_type: 'distance',
  tank_capacity:     null,
};

const EXTRA_SENSOR_TYPES = {
  distance:    { icon: 'mdi:ruler',          descKey: 'sensor_to_surface',       format: v => v.toFixed(2) },
  voltage:     { icon: 'mdi:lightning-bolt', descKey: 'sensor_desc_voltage',     format: v => v.toFixed(2) },
  pressure:    { icon: 'mdi:gauge',          descKey: 'sensor_desc_pressure',    format: v => v.toFixed(1) },
  temperature: { icon: 'mdi:thermometer',   descKey: 'sensor_desc_temperature', format: v => v.toFixed(1) },
  humidity:    { icon: 'mdi:water-percent', descKey: 'sensor_desc_humidity',    format: v => v.toFixed(1) },
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
    name:     'extra_sensor_type',
    required: false,
    selector: {
      select: {
        options: [
          { value: 'distance',    label: 'Distance' },
          { value: 'voltage',     label: 'Voltage' },
          { value: 'pressure',    label: 'Pressure' },
          { value: 'temperature', label: 'Temperature' },
          { value: 'humidity',    label: 'Humidity' },
        ],
      },
    },
  },
  {
    name:     'entity_distance',
    required: false,
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

function editorLabel(lang, name) {
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.en;
  return t[`editor_${name}`] ?? TRANSLATIONS.en[`editor_${name}`] ?? name;
}

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

    const lang = this._hass.language;

    this._form.hass         = this._hass;
    this._form.schema       = EDITOR_SCHEMA;
    this._form.data         = this._config;
    this._form.computeLabel = s => editorLabel(lang, s.name);
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

            <div class="stat-card" id="stat-extra">
              <div class="c-icon orange"><ha-icon id="icon-extra" icon="mdi:ruler"></ha-icon></div>
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
    const pct       = isNaN(levelNum) ? 0 : Math.max(0, Math.min(100, levelNum));
    const $         = id => this.shadowRoot.getElementById(id);

    // Header text
    $('s-title').textContent    = this._config.title ?? this._t('title');
    $('s-subtitle').textContent = this._t('subtitle');

    // Stat labels
    $('lbl-level').textContent  = this._t('level').toUpperCase();
    $('lbl-volume').textContent = this._t('volume').toUpperCase();

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

    // Extra stat card (3rd widget — shown only when an entity is configured)
    const extraEntity = this._config.entity_distance;
    const extraCard   = $('stat-extra');
    if (!extraEntity) {
      if (extraCard) extraCard.style.display = 'none';
    } else {
      if (extraCard) extraCard.style.display = '';
      const extraType  = this._config.extra_sensor_type || 'distance';
      const typeCfg    = EXTRA_SENSOR_TYPES[extraType] || EXTRA_SENSOR_TYPES.distance;
      const extraState = this._hass.states[extraEntity];
      const extraNum   = this._num(extraEntity);
      const extraUnit  = extraState?.attributes?.unit_of_measurement ?? '';

      const iconEl = $('icon-extra');
      if (iconEl) iconEl.setAttribute('icon', typeCfg.icon);

      $('lbl-distance').textContent = this._t(extraType).toUpperCase();
      $('val-distance').textContent = isNaN(extraNum) ? '—' : typeCfg.format(extraNum);
      $('sub-distance').textContent = `${this._t(typeCfg.descKey)} · ${extraUnit}`;
    }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0ZXItdGFuay1jYXJkLmpzIiwic291cmNlcyI6WyIuLi9zcmMvd2F0ZXItdGFuay1jYXJkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogV2F0ZXIgVGFuayBDYXJkIOKAlCBWaXN1YWwgRGFzaGJvYXJkIEVkaXRpb25cbiAqIEVudGl0aWVzOiBsZXZlbCAoJSksIHZvbHVtZSAoTCksIGRpc3RhbmNlIChtKVxuICogTGlnaHQvZGFyayB0aGVtZSBhd2FyZS4gSEEgU2VjdGlvbiBncmlkIGNvbXBhdGlibGUuXG4gKi9cblxuY29uc3QgVFJBTlNMQVRJT05TID0ge1xuICBlbjoge1xuICAgIHRpdGxlOiAgICAgICAgICAgICAnV2F0ZXIgVGFuaycsXG4gICAgc3VidGl0bGU6ICAgICAgICAgICdMZXZlbCBNb25pdG9yJyxcbiAgICBsZXZlbDogICAgICAgICAgICAgJ0xldmVsJyxcbiAgICB2b2x1bWU6ICAgICAgICAgICAgJ1ZvbHVtZScsXG4gICAgZGlzdGFuY2U6ICAgICAgICAgICdEaXN0YW5jZScsXG4gICAgdm9sdGFnZTogICAgICAgICAgICdWb2x0YWdlJyxcbiAgICBwcmVzc3VyZTogICAgICAgICAgJ1ByZXNzdXJlJyxcbiAgICB0ZW1wZXJhdHVyZTogICAgICAgJ1RlbXBlcmF0dXJlJyxcbiAgICBodW1pZGl0eTogICAgICAgICAgJ0h1bWlkaXR5JyxcbiAgICBsYXN0X3VwZGF0ZTogICAgICAgJ0xhc3QgdXBkYXRlJyxcbiAgICBzZW5zb3JfdG9fc3VyZmFjZTogICAgICAgICdTZW5zb3IgdG8gc3VyZmFjZScsXG4gICAgc2Vuc29yX2Rlc2Nfdm9sdGFnZTogICAgICAnU2Vuc29yIHZvbHRhZ2UnLFxuICAgIHNlbnNvcl9kZXNjX3ByZXNzdXJlOiAgICAgJ1ByZXNzdXJlIHJlYWRpbmcnLFxuICAgIHNlbnNvcl9kZXNjX3RlbXBlcmF0dXJlOiAgJ1RlbXBlcmF0dXJlIHJlYWRpbmcnLFxuICAgIHNlbnNvcl9kZXNjX2h1bWlkaXR5OiAgICAgJ0h1bWlkaXR5IHJlYWRpbmcnLFxuICAgIC8vIGVkaXRvciBmaWVsZCBsYWJlbHNcbiAgICBlZGl0b3JfZW50aXR5X2xldmVsOiAgICAgICAnTGV2ZWwgZW50aXR5ICgw4oCTMTAwICUpJyxcbiAgICBlZGl0b3JfZW50aXR5X3ZvbHVtZTogICAgICAnVm9sdW1lIGVudGl0eSAoTCknLFxuICAgIGVkaXRvcl9leHRyYV9zZW5zb3JfdHlwZTogICdUaGlyZCBzZW5zb3IgdHlwZScsXG4gICAgZWRpdG9yX2VudGl0eV9kaXN0YW5jZTogICAgJ1RoaXJkIHNlbnNvciBlbnRpdHknLFxuICAgIGVkaXRvcl90YW5rX2NhcGFjaXR5OiAgICAgICdUYW5rIGNhcGFjaXR5IChMKScsXG4gICAgZWRpdG9yX3RpdGxlOiAgICAgICAgICAgICAgJ0NhcmQgdGl0bGUnLFxuICB9LFxuICBkYToge1xuICAgIHRpdGxlOiAgICAgICAgICAgICAnVmFuZHRhbmsnLFxuICAgIHN1YnRpdGxlOiAgICAgICAgICAnTml2ZWF1bcOlbGVyJyxcbiAgICBsZXZlbDogICAgICAgICAgICAgJ05pdmVhdScsXG4gICAgdm9sdW1lOiAgICAgICAgICAgICdWb2x1bWVuJyxcbiAgICBkaXN0YW5jZTogICAgICAgICAgJ0Fmc3RhbmQnLFxuICAgIHZvbHRhZ2U6ICAgICAgICAgICAnU3DDpm5kaW5nJyxcbiAgICBwcmVzc3VyZTogICAgICAgICAgJ1RyeWsnLFxuICAgIHRlbXBlcmF0dXJlOiAgICAgICAnVGVtcGVyYXR1cicsXG4gICAgaHVtaWRpdHk6ICAgICAgICAgICdGdWd0aWdoZWQnLFxuICAgIGxhc3RfdXBkYXRlOiAgICAgICAnU2lkc3Qgb3BkYXRlcmV0JyxcbiAgICBzZW5zb3JfdG9fc3VyZmFjZTogICAgICAgICdTZW5zb3IgdGlsIG92ZXJmbGFkZScsXG4gICAgc2Vuc29yX2Rlc2Nfdm9sdGFnZTogICAgICAnU2Vuc29yIHNww6ZuZGluZycsXG4gICAgc2Vuc29yX2Rlc2NfcHJlc3N1cmU6ICAgICAnVHJ5a2FmbMOmc25pbmcnLFxuICAgIHNlbnNvcl9kZXNjX3RlbXBlcmF0dXJlOiAgJ1RlbXBlcmF0dXJhZmzDpnNuaW5nJyxcbiAgICBzZW5zb3JfZGVzY19odW1pZGl0eTogICAgICdGdWd0aWdoZWRzYWZsw6ZzbmluZycsXG4gICAgLy8gZWRpdG9yIGZpZWxkIGxhYmVsc1xuICAgIGVkaXRvcl9lbnRpdHlfbGV2ZWw6ICAgICAgICdOaXZlYXUgZW50aXRldCAoMOKAkzEwMCAlKScsXG4gICAgZWRpdG9yX2VudGl0eV92b2x1bWU6ICAgICAgJ1ZvbHVtZW4gZW50aXRldCAoTCknLFxuICAgIGVkaXRvcl9leHRyYV9zZW5zb3JfdHlwZTogICdUcmVkamUgc2Vuc29yIHR5cGUnLFxuICAgIGVkaXRvcl9lbnRpdHlfZGlzdGFuY2U6ICAgICdUcmVkamUgc2Vuc29yIGVudGl0ZXQnLFxuICAgIGVkaXRvcl90YW5rX2NhcGFjaXR5OiAgICAgICdUYW5ra2FwYWNpdGV0IChMKScsXG4gICAgZWRpdG9yX3RpdGxlOiAgICAgICAgICAgICAgJ0tvcnR0aXRlbCcsXG4gIH0sXG59O1xuXG5jb25zdCBERUZBVUxUUyA9IHtcbiAgZW50aXR5X2xldmVsOiAgICAgICdzZW5zb3Iud2F0ZXJfdGFua19tb25pdG9yX3dhdGVyX3RhbmtfbGV2ZWwnLFxuICBlbnRpdHlfdm9sdW1lOiAgICAgJ3NlbnNvci53YXRlcl90YW5rX21vbml0b3Jfd2F0ZXJfdGFua192b2x1bWUnLFxuICBlbnRpdHlfZGlzdGFuY2U6ICAgbnVsbCxcbiAgZXh0cmFfc2Vuc29yX3R5cGU6ICdkaXN0YW5jZScsXG4gIHRhbmtfY2FwYWNpdHk6ICAgICBudWxsLFxufTtcblxuY29uc3QgRVhUUkFfU0VOU09SX1RZUEVTID0ge1xuICBkaXN0YW5jZTogICAgeyBpY29uOiAnbWRpOnJ1bGVyJywgICAgICAgICAgZGVzY0tleTogJ3NlbnNvcl90b19zdXJmYWNlJywgICAgICAgZm9ybWF0OiB2ID0+IHYudG9GaXhlZCgyKSB9LFxuICB2b2x0YWdlOiAgICAgeyBpY29uOiAnbWRpOmxpZ2h0bmluZy1ib2x0JywgZGVzY0tleTogJ3NlbnNvcl9kZXNjX3ZvbHRhZ2UnLCAgICAgZm9ybWF0OiB2ID0+IHYudG9GaXhlZCgyKSB9LFxuICBwcmVzc3VyZTogICAgeyBpY29uOiAnbWRpOmdhdWdlJywgICAgICAgICAgZGVzY0tleTogJ3NlbnNvcl9kZXNjX3ByZXNzdXJlJywgICAgZm9ybWF0OiB2ID0+IHYudG9GaXhlZCgxKSB9LFxuICB0ZW1wZXJhdHVyZTogeyBpY29uOiAnbWRpOnRoZXJtb21ldGVyJywgICBkZXNjS2V5OiAnc2Vuc29yX2Rlc2NfdGVtcGVyYXR1cmUnLCBmb3JtYXQ6IHYgPT4gdi50b0ZpeGVkKDEpIH0sXG4gIGh1bWlkaXR5OiAgICB7IGljb246ICdtZGk6d2F0ZXItcGVyY2VudCcsIGRlc2NLZXk6ICdzZW5zb3JfZGVzY19odW1pZGl0eScsICAgIGZvcm1hdDogdiA9PiB2LnRvRml4ZWQoMSkgfSxcbn07XG5cbmNvbnN0IFNUWUxFUyA9IGBcbiAgOmhvc3QgeyBkaXNwbGF5OiBibG9jazsgaGVpZ2h0OiAxMDAlOyB9XG5cbiAgaGEtY2FyZCB7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIG1pbi1oZWlnaHQ6IDI2MHB4O1xuICAgIHBhZGRpbmc6IDA7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIH1cblxuICAvKiAtLSBMYXlvdXQgLS0gKi9cbiAgLmxheW91dCB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBhbGlnbi1pdGVtczogc3RyZXRjaDtcbiAgfVxuXG4gIC8qIC0tIFRhbmsgc2lkZSAtLSAqL1xuICAudGFuay1zaWRlIHtcbiAgICBmbGV4OiAwIDAgNDQlO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBwYWRkaW5nOiAyMHB4IDJweCAyMHB4IDE2cHg7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgfVxuXG4gIC50YW5rLW91dGVyIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIG1heC1oZWlnaHQ6IDMwMHB4O1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIG1heC13aWR0aDogMTUwcHg7XG4gIH1cblxuICAvKiBDYXAgb24gdG9wIG9mIHRhbmsgKi9cbiAgLnRhbmstY2FwIHtcbiAgICB3aWR0aDogNDYlO1xuICAgIGhlaWdodDogMTRweDtcbiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tLCAjMmU0NTYwLCAjMWEyZTQyKTtcbiAgICBib3JkZXItcmFkaXVzOiA1cHggNXB4IDAgMDtcbiAgICBmbGV4LXNocmluazogMDtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgbWFyZ2luLWJvdHRvbTogLTJweDtcbiAgICB6LWluZGV4OiAyO1xuICAgIGJveC1zaGFkb3c6IDAgLTJweCA0cHggcmdiYSgwLDAsMCwwLjUpO1xuICB9XG4gIC50YW5rLWNhcDo6YWZ0ZXIge1xuICAgIGNvbnRlbnQ6ICcnO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICB0b3A6IDRweDtcbiAgICBsZWZ0OiA1MCU7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpO1xuICAgIHdpZHRoOiA1NSU7XG4gICAgaGVpZ2h0OiA0cHg7XG4gICAgYmFja2dyb3VuZDogcmdiYSgyNTUsMjU1LDI1NSwwLjA3KTtcbiAgICBib3JkZXItcmFkaXVzOiAycHg7XG4gIH1cblxuICAvKiBUYW5rIGJvZHkgKyBtYXJrZXJzIHNpZGUgYnkgc2lkZSAqL1xuICAudGFuay1hbmQtbWFya2VycyB7XG4gICAgZmxleDogMTtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIG1pbi1oZWlnaHQ6IDA7XG4gIH1cblxuICAvKiBDb2x1bW4gdGhhdCBvd25zIGNhcCArIGJvZHkgc28gY2FwICUgaXMgcmVsYXRpdmUgdG8gYm9keSB3aWR0aCAqL1xuICAudGFuay1jb2x1bW4ge1xuICAgIGZsZXg6IDE7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgbWluLWhlaWdodDogMDtcbiAgfVxuXG4gIC50YW5rLWJvZHkge1xuICAgIGZsZXg6IDE7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgYm9yZGVyLXJhZGl1czogMTJweDtcbiAgICBib3JkZXI6IDNweCBzb2xpZCAjMWUzMTQ4O1xuICAgIGJhY2tncm91bmQ6ICMwOTE4MmE7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgYm94LXNoYWRvdzpcbiAgICAgIGluc2V0IDAgNHB4IDE2cHggcmdiYSgwLDAsMCwwLjYpLFxuICAgICAgaW5zZXQgM3B4IDAgOHB4IHJnYmEoMCwwLDAsMC4zKSxcbiAgICAgIGluc2V0IC0zcHggMCA4cHggcmdiYSgwLDAsMCwwLjMpO1xuICB9XG5cbiAgLyogTGlnaHQgdGhlbWUgb3ZlcnJpZGVzIGZvciB0YW5rICovXG4gIEBtZWRpYSAocHJlZmVycy1jb2xvci1zY2hlbWU6IGxpZ2h0KSB7XG4gICAgLnRhbmstYm9keSB7IGJhY2tncm91bmQ6ICNjZmUwZjU7IGJvcmRlci1jb2xvcjogIzdlYjhlODsgfVxuICAgIC50YW5rLWNhcCAgeyBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tLCAjN2ViOGU4LCAjNWE5ZmQ0KTsgfVxuICAgIC50YW5rLWNhcDo6YWZ0ZXIgeyBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwyNTUsMjU1LDAuMjUpOyB9XG4gIH1cblxuICAvKiBXYXRlciBmaWxsICovXG4gIC53YXRlci1maWxsIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgYm90dG9tOiAwOyBsZWZ0OiAwOyByaWdodDogMDtcbiAgICBoZWlnaHQ6IDAlO1xuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCh0byB0b3AsICMwZDQ3YTEgMCUsICMxOTc2ZDIgNTUlLCAjMjE5NmYzIDEwMCUpO1xuICAgIHRyYW5zaXRpb246IGhlaWdodCAxLjRzIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSk7XG4gICAgd2lsbC1jaGFuZ2U6IGhlaWdodDtcbiAgfVxuXG4gIC8qIFdhdmUgYXQgd2F0ZXIgc3VyZmFjZSAqL1xuICAud2F2ZS13cmFwIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiAtMThweDsgbGVmdDogMDsgcmlnaHQ6IDA7XG4gICAgaGVpZ2h0OiAyMHB4O1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICB9XG4gIC53YXZlLXRyYWNrIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIHdpZHRoOiAyMDAlO1xuICAgIGhlaWdodDogMTAwJTtcbiAgICBhbmltYXRpb246IHdhdmUtbW92ZSAzLjVzIGxpbmVhciBpbmZpbml0ZTtcbiAgICB3aWxsLWNoYW5nZTogdHJhbnNmb3JtO1xuICB9XG4gIEBrZXlmcmFtZXMgd2F2ZS1tb3ZlIHtcbiAgICBmcm9tIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApOyB9XG4gICAgdG8gICB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTAlKTsgfVxuICB9XG4gIC53YXZlLXN2ZyB7IGZsZXg6IDAgMCA1MCU7IGhlaWdodDogMTAwJTsgfVxuXG4gIC8qIFN1YnRsZSBzaGVlbiBpbnNpZGUgd2F0ZXIgKi9cbiAgLndhdGVyLXNoZWVuIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiAwOyBsZWZ0OiA4JTsgcmlnaHQ6IDM1JTtcbiAgICBoZWlnaHQ6IDU1JTtcbiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTYwZGVnLCByZ2JhKDI1NSwyNTUsMjU1LDAuMSkgMCUsIHRyYW5zcGFyZW50IDcwJSk7XG4gICAgYm9yZGVyLXJhZGl1czogMCAwIDYwJSA0MCU7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIH1cblxuICAvKiBSaXNpbmcgYnViYmxlcyAqL1xuICAuYnViYmxlIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LDI1NSwyNTUsMC4xNSk7XG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwwLjIyKTtcbiAgICBhbmltYXRpb246IGJ1YmJsZS1mbG9hdCBsaW5lYXIgaW5maW5pdGU7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIH1cbiAgQGtleWZyYW1lcyBidWJibGUtZmxvYXQge1xuICAgIDAlICAgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCkgICAgICBzY2FsZSgxKTsgICBvcGFjaXR5OiAwOyAgIH1cbiAgICA4JSAgIHsgb3BhY2l0eTogMC42NTsgfVxuICAgIDg1JSAgeyBvcGFjaXR5OiAwLjQ7IH1cbiAgICAxMDAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0yNDBweCkgc2NhbGUoMC43KTsgb3BhY2l0eTogMDsgICB9XG4gIH1cblxuICAvKiBIb3Jpem9udGFsIGd1aWRlIGxpbmVzICovXG4gIC5ncmlkLWxpbmUge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBsZWZ0OiAwOyByaWdodDogMDtcbiAgICBoZWlnaHQ6IDFweDtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwyNTUsMjU1LDAuMSk7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgei1pbmRleDogMTtcbiAgfVxuXG4gIC8qIFBlcmNlbnRhZ2UgKyB2b2x1bWUgdGV4dCBvdmVybGF5ICovXG4gIC50YW5rLXRleHQge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBpbnNldDogMDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgICB6LWluZGV4OiAzO1xuICB9XG4gIC50LXBjdCB7XG4gICAgZm9udC1zaXplOiBjbGFtcCgyOHB4LCA2dncsIDQycHgpO1xuICAgIGZvbnQtd2VpZ2h0OiA4MDA7XG4gICAgY29sb3I6ICNmZmZmZmY7XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgbGV0dGVyLXNwYWNpbmc6IC0wLjAyZW07XG4gICAgdGV4dC1zaGFkb3c6IDAgMnB4IDEwcHggcmdiYSgwLDAsMCwwLjYpO1xuICB9XG4gIC50LXZvbCB7XG4gICAgZm9udC1zaXplOiBjbGFtcCgxMHB4LCAydncsIDEzcHgpO1xuICAgIGNvbG9yOiByZ2JhKDI1NSwyNTUsMjU1LDAuNjUpO1xuICAgIG1hcmdpbi10b3A6IDVweDtcbiAgICB0ZXh0LXNoYWRvdzogMCAxcHggNnB4IHJnYmEoMCwwLDAsMC41KTtcbiAgICBsZXR0ZXItc3BhY2luZzogMC4wMWVtO1xuICB9XG5cbiAgLyogTWFya2VycyBjb2x1bW4gKHJpZ2h0IG9mIHRhbmsgYm9keSkgKi9cbiAgLm1hcmtlcnMtY29sIHtcbiAgICB3aWR0aDogNDJweDtcbiAgICBmbGV4LXNocmluazogMDtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgcGFkZGluZy1sZWZ0OiAxNHB4O1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIH1cbiAgLm1hcmtlciB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGxlZnQ6IDE0cHg7IHJpZ2h0OiAwO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBnYXA6IDRweDtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUwJSk7XG4gIH1cbiAgLm0tdGljayB7XG4gICAgd2lkdGg6IDVweDsgaGVpZ2h0OiAxcHg7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tc2Vjb25kYXJ5LXRleHQtY29sb3IsIHJnYmEoMTQwLDE1MCwxNjAsMC41KSk7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gIH1cbiAgLm0tbGJsIHtcbiAgICBmb250LXNpemU6IDlweDtcbiAgICBjb2xvcjogdmFyKC0tc2Vjb25kYXJ5LXRleHQtY29sb3IsIHJnYmEoMTQwLDE1MCwxNjAsMC43KSk7XG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICBmb250LXZhcmlhbnQtbnVtZXJpYzogdGFidWxhci1udW1zO1xuICB9XG5cbiAgLyogQW5pbWF0ZWQgbGV2ZWwgaW5kaWNhdG9yIGRvdCAqL1xuICAubGV2ZWwtaW5kaWNhdG9yIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgbGVmdDogMDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01MCUpO1xuICAgIHRyYW5zaXRpb246IHRvcCAxLjRzIGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSk7XG4gICAgd2lsbC1jaGFuZ2U6IHRvcDtcbiAgICB6LWluZGV4OiAyO1xuICB9XG4gIC5sLWRvdCB7XG4gICAgd2lkdGg6IDEwcHg7IGhlaWdodDogMTBweDtcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgYmFja2dyb3VuZDogIzQyYTVmNTtcbiAgICBib3gtc2hhZG93OiAwIDAgOHB4IHJnYmEoNjYsMTY1LDI0NSwwLjkpLCAwIDAgMnB4IHJnYmEoNjYsMTY1LDI0NSwxKTtcbiAgICBmbGV4LXNocmluazogMDtcbiAgfVxuICAubC1saW5lIHtcbiAgICB3aWR0aDogOHB4OyBoZWlnaHQ6IDFweDtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDY2LDE2NSwyNDUsMC40NSk7XG4gIH1cblxuICAvKiAtLSBTdGF0cyBzaWRlIC0tICovXG4gIC5zdGF0cy1zaWRlIHtcbiAgICBmbGV4OiAxO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBwYWRkaW5nOiAxNHB4IDE0cHggMTJweCA4cHg7XG4gICAgZ2FwOiA3cHg7XG4gICAgbWluLXdpZHRoOiAwO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIH1cblxuICAucy1oZWFkZXIge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBnYXA6IDlweDtcbiAgICBmbGV4LXNocmluazogMDtcbiAgfVxuICAucy1kcm9wIHtcbiAgICBmb250LXNpemU6IDIycHg7XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgZmlsdGVyOiBkcm9wLXNoYWRvdygwIDAgNnB4IHJnYmEoMzAsMTM2LDIyOSwwLjYpKTtcbiAgfVxuICAucy10aXRsZSB7XG4gICAgZm9udC1zaXplOiAxNXB4O1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgY29sb3I6IHZhcigtLXByaW1hcnktdGV4dC1jb2xvcik7XG4gICAgbGV0dGVyLXNwYWNpbmc6IDAuMDZlbTtcbiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuICAgIGxpbmUtaGVpZ2h0OiAxLjE1O1xuICB9XG4gIC5zLXN1YnRpdGxlIHtcbiAgICBmb250LXNpemU6IDEwcHg7XG4gICAgY29sb3I6IHZhcigtLXNlY29uZGFyeS10ZXh0LWNvbG9yKTtcbiAgICBsaW5lLWhlaWdodDogMS4yO1xuICB9XG5cbiAgLmRpdmlkZXIge1xuICAgIGhlaWdodDogMXB4O1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWRpdmlkZXItY29sb3IsIHJnYmEoMTIwLDEyMCwxMjAsMC4yKSk7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gIH1cblxuICAvKiBJbmRpdmlkdWFsIHN0YXQgY2FyZCAqL1xuICAuc3RhdC1jYXJkIHtcbiAgICBmbGV4OiAxO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBnYXA6IDEwcHg7XG4gICAgcGFkZGluZzogOHB4IDEwcHg7XG4gICAgYm9yZGVyLXJhZGl1czogMTBweDtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zZWNvbmRhcnktYmFja2dyb3VuZC1jb2xvciwgcmdiYSgxMjAsMTIwLDEyMCwwLjA2KSk7XG4gICAgbWluLWhlaWdodDogMDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICB9XG4gIC5jLWljb24ge1xuICAgIHdpZHRoOiAzOHB4OyBoZWlnaHQ6IDM4cHg7XG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBmbGV4LXNocmluazogMDtcbiAgfVxuICAuYy1pY29uIGhhLWljb24geyAtLW1kYy1pY29uLXNpemU6IDIwcHg7IGNvbG9yOiB3aGl0ZTsgfVxuICAuYy1pY29uLmJsdWUge1xuICAgIGJhY2tncm91bmQ6IHJhZGlhbC1ncmFkaWVudChjaXJjbGUgYXQgMzglIDMyJSwgIzY0YjVmNiwgIzE1NjVjMCk7XG4gICAgYm94LXNoYWRvdzogMCAzcHggMTBweCByZ2JhKDIxLDEwMSwxOTIsMC40NSk7XG4gIH1cbiAgLmMtaWNvbi50ZWFsIHtcbiAgICBiYWNrZ3JvdW5kOiByYWRpYWwtZ3JhZGllbnQoY2lyY2xlIGF0IDM4JSAzMiUsICM0ZGQwZTEsICMwMDYwNjQpO1xuICAgIGJveC1zaGFkb3c6IDAgM3B4IDEwcHggcmdiYSgwLDk2LDEwMCwwLjQ1KTtcbiAgfVxuICAuYy1pY29uLm9yYW5nZSB7XG4gICAgYmFja2dyb3VuZDogcmFkaWFsLWdyYWRpZW50KGNpcmNsZSBhdCAzOCUgMzIlLCAjZmZiNzRkLCAjYmYzNjBjKTtcbiAgICBib3gtc2hhZG93OiAwIDNweCAxMHB4IHJnYmEoMTkxLDU0LDEyLDAuNDUpO1xuICB9XG5cbiAgLmMtaW5mbyB7IGZsZXg6IDE7IG1pbi13aWR0aDogMDsgfVxuICAuYy1sYWJlbCB7XG4gICAgZm9udC1zaXplOiA5cHg7XG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICBsZXR0ZXItc3BhY2luZzogMC4xZW07XG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICBjb2xvcjogdmFyKC0tc2Vjb25kYXJ5LXRleHQtY29sb3IpO1xuICAgIG1hcmdpbi1ib3R0b206IDJweDtcbiAgfVxuICAuYy12YWx1ZSB7XG4gICAgZm9udC1zaXplOiAyMnB4O1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgY29sb3I6IHZhcigtLXByaW1hcnktdGV4dC1jb2xvcik7XG4gICAgbGluZS1oZWlnaHQ6IDEuMTtcbiAgICBsZXR0ZXItc3BhY2luZzogLTAuMDFlbTtcbiAgfVxuICAuYy1zdWIge1xuICAgIGZvbnQtc2l6ZTogMTBweDtcbiAgICBjb2xvcjogdmFyKC0tc2Vjb25kYXJ5LXRleHQtY29sb3IpO1xuICAgIG1hcmdpbi10b3A6IDFweDtcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gIH1cblxuICAvKiBGb290ZXIgKi9cbiAgLmZvb3RlciB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGdhcDogNXB4O1xuICAgIGZsZXgtc2hyaW5rOiAwO1xuICB9XG4gIC5mb290ZXIgaGEtaWNvbiB7XG4gICAgLS1tZGMtaWNvbi1zaXplOiAxM3B4O1xuICAgIGNvbG9yOiB2YXIoLS1zZWNvbmRhcnktdGV4dC1jb2xvcik7XG4gICAgb3BhY2l0eTogMC42O1xuICB9XG4gIC5mb290ZXItdHh0IHtcbiAgICBmb250LXNpemU6IDEwcHg7XG4gICAgY29sb3I6IHZhcigtLXNlY29uZGFyeS10ZXh0LWNvbG9yKTtcbiAgICBvcGFjaXR5OiAwLjY7XG4gIH1cbmA7XG5cbmNvbnN0IFdBVkVfRCA9XG4gICdNMCwxMCBDMzMsMiA2NywxOCAxMDAsMTAgQzEzMywyIDE2NywxOCAyMDAsMTAgJyArXG4gICdDMjMzLDIgMjY3LDE4IDMwMCwxMCBDMzMzLDIgMzY3LDE4IDQwMCwxMCBMNDAwLDIwIEwwLDIwIFonO1xuXG4vKiAtLS0tIFVJIEVkaXRvciAtLS0tICovXG5cbmNvbnN0IEVESVRPUl9TQ0hFTUEgPSBbXG4gIHtcbiAgICBuYW1lOiAgICAgJ2VudGl0eV9sZXZlbCcsXG4gICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgc2VsZWN0b3I6IHsgZW50aXR5OiB7IGRvbWFpbjogJ3NlbnNvcicgfSB9LFxuICB9LFxuICB7XG4gICAgbmFtZTogICAgICdlbnRpdHlfdm9sdW1lJyxcbiAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICBzZWxlY3RvcjogeyBlbnRpdHk6IHsgZG9tYWluOiAnc2Vuc29yJyB9IH0sXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAgICAgJ2V4dHJhX3NlbnNvcl90eXBlJyxcbiAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgc2VsZWN0b3I6IHtcbiAgICAgIHNlbGVjdDoge1xuICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgeyB2YWx1ZTogJ2Rpc3RhbmNlJywgICAgbGFiZWw6ICdEaXN0YW5jZScgfSxcbiAgICAgICAgICB7IHZhbHVlOiAndm9sdGFnZScsICAgICBsYWJlbDogJ1ZvbHRhZ2UnIH0sXG4gICAgICAgICAgeyB2YWx1ZTogJ3ByZXNzdXJlJywgICAgbGFiZWw6ICdQcmVzc3VyZScgfSxcbiAgICAgICAgICB7IHZhbHVlOiAndGVtcGVyYXR1cmUnLCBsYWJlbDogJ1RlbXBlcmF0dXJlJyB9LFxuICAgICAgICAgIHsgdmFsdWU6ICdodW1pZGl0eScsICAgIGxhYmVsOiAnSHVtaWRpdHknIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAgICAgJ2VudGl0eV9kaXN0YW5jZScsXG4gICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgIHNlbGVjdG9yOiB7IGVudGl0eTogeyBkb21haW46ICdzZW5zb3InIH0gfSxcbiAgfSxcbiAge1xuICAgIG5hbWU6ICAgICAndGFua19jYXBhY2l0eScsXG4gICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgIHNlbGVjdG9yOiB7IG51bWJlcjogeyBtaW46IDAsIG1heDogOTk5OTksIHN0ZXA6IDEsIG1vZGU6ICdib3gnLCB1bml0X29mX21lYXN1cmVtZW50OiAnTCcgfSB9LFxuICB9LFxuICB7XG4gICAgbmFtZTogICAgICd0aXRsZScsXG4gICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgIHNlbGVjdG9yOiB7IHRleHQ6IHt9IH0sXG4gIH0sXG5dO1xuXG5mdW5jdGlvbiBlZGl0b3JMYWJlbChsYW5nLCBuYW1lKSB7XG4gIGNvbnN0IHQgPSBUUkFOU0xBVElPTlNbbGFuZ10gPz8gVFJBTlNMQVRJT05TLmVuO1xuICByZXR1cm4gdFtgZWRpdG9yXyR7bmFtZX1gXSA/PyBUUkFOU0xBVElPTlMuZW5bYGVkaXRvcl8ke25hbWV9YF0gPz8gbmFtZTtcbn1cblxuY2xhc3MgV2F0ZXJUYW5rQ2FyZEVkaXRvciBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KTtcbiAgICB0aGlzLl9jb25maWcgPSB7fTtcbiAgICB0aGlzLl9oYXNzICAgPSBudWxsO1xuICAgIHRoaXMuX2Zvcm0gICA9IG51bGw7XG4gIH1cblxuICBzZXRDb25maWcoY29uZmlnKSB7XG4gICAgdGhpcy5fY29uZmlnID0geyAuLi5jb25maWcgfTtcbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIHNldCBoYXNzKGhhc3MpIHtcbiAgICB0aGlzLl9oYXNzID0gaGFzcztcbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIF9yZW5kZXIoKSB7XG4gICAgaWYgKCF0aGlzLl9oYXNzKSByZXR1cm47XG5cbiAgICBpZiAoIXRoaXMuX2Zvcm0pIHtcbiAgICAgIHRoaXMuc2hhZG93Um9vdC5pbm5lckhUTUwgPSAnPGhhLWZvcm0+PC9oYS1mb3JtPic7XG4gICAgICB0aGlzLl9mb3JtID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2hhLWZvcm0nKTtcbiAgICAgIHRoaXMuX2Zvcm0uYWRkRXZlbnRMaXN0ZW5lcigndmFsdWUtY2hhbmdlZCcsIGUgPT4ge1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdjb25maWctY2hhbmdlZCcsIHtcbiAgICAgICAgICBkZXRhaWw6IHsgY29uZmlnOiBlLmRldGFpbC52YWx1ZSB9LFxuICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgIH0pKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGxhbmcgPSB0aGlzLl9oYXNzLmxhbmd1YWdlO1xuXG4gICAgdGhpcy5fZm9ybS5oYXNzICAgICAgICAgPSB0aGlzLl9oYXNzO1xuICAgIHRoaXMuX2Zvcm0uc2NoZW1hICAgICAgID0gRURJVE9SX1NDSEVNQTtcbiAgICB0aGlzLl9mb3JtLmRhdGEgICAgICAgICA9IHRoaXMuX2NvbmZpZztcbiAgICB0aGlzLl9mb3JtLmNvbXB1dGVMYWJlbCA9IHMgPT4gZWRpdG9yTGFiZWwobGFuZywgcy5uYW1lKTtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ3dhdGVyLXRhbmstY2FyZC1lZGl0b3InLCBXYXRlclRhbmtDYXJkRWRpdG9yKTtcblxuY2xhc3MgV2F0ZXJUYW5rQ2FyZCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KTtcbiAgICB0aGlzLl9jb25maWcgPSBudWxsO1xuICAgIHRoaXMuX2hhc3MgICA9IG51bGw7XG4gICAgdGhpcy5fYnVpbHQgID0gZmFsc2U7XG4gIH1cblxuICAvKiAtLSBIQSBDYXJkIEFQSSAtLSAqL1xuXG4gIHNldENvbmZpZyhjb25maWcpIHtcbiAgICBpZiAoIWNvbmZpZykgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvbmZpZ3VyYXRpb24nKTtcbiAgICB0aGlzLl9jb25maWcgPSB7IC4uLkRFRkFVTFRTLCAuLi5jb25maWcgfTtcbiAgICB0aGlzLl9idWlsdCAgPSBmYWxzZTtcbiAgICB0aGlzLl9idWlsZERPTSgpO1xuICAgIGlmICh0aGlzLl9oYXNzKSB0aGlzLl91cGRhdGUoKTtcbiAgfVxuXG4gIHNldCBoYXNzKGhhc3MpIHtcbiAgICB0aGlzLl9oYXNzID0gaGFzcztcbiAgICBpZiAoIXRoaXMuX2J1aWx0KSB0aGlzLl9idWlsZERPTSgpO1xuICAgIHRoaXMuX3VwZGF0ZSgpO1xuICB9XG5cbiAgZ2V0TGF5b3V0T3B0aW9ucygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZ3JpZF9jb2x1bW5zOiAgICAgNCxcbiAgICAgIGdyaWRfcm93czogICAgICAgICdhdXRvJyxcbiAgICAgIGdyaWRfbWluX2NvbHVtbnM6IDIsXG4gICAgICBncmlkX21pbl9yb3dzOiAgICAyLFxuICAgICAgZ3JpZF9tYXhfY29sdW1uczogNixcbiAgICB9O1xuICB9XG5cbiAgZ2V0Q2FyZFNpemUoKSB7IHJldHVybiA0OyB9XG5cbiAgc3RhdGljIGdldENvbmZpZ0VsZW1lbnQoKSB7IHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd3YXRlci10YW5rLWNhcmQtZWRpdG9yJyk7IH1cblxuICBzdGF0aWMgZ2V0U3R1YkNvbmZpZygpIHsgcmV0dXJuIHsgLi4uREVGQVVMVFMgfTsgfVxuXG4gIC8qIC0tIGkxOG4gLS0gKi9cblxuICBfdChrZXkpIHtcbiAgICBjb25zdCBsYW5nID0gdGhpcy5faGFzcz8ubGFuZ3VhZ2UgfHwgJ2VuJztcbiAgICByZXR1cm4gKFRSQU5TTEFUSU9OU1tsYW5nXSA/PyBUUkFOU0xBVElPTlMuZW4pW2tleV0gPz8gVFJBTlNMQVRJT05TLmVuW2tleV0gPz8ga2V5O1xuICB9XG5cbiAgLyogLS0gRE9NIC0tICovXG5cbiAgX2J1aWxkRE9NKCkge1xuICAgIGlmICghdGhpcy5fY29uZmlnKSByZXR1cm47XG5cbiAgICBjb25zdCB3YXZlU1ZHID0gYFxuICAgICAgPHN2ZyBjbGFzcz1cIndhdmUtc3ZnXCIgdmlld0JveD1cIjAgMCA0MDAgMjBcIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwibm9uZVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbiAgICAgICAgPHBhdGggZD1cIiR7V0FWRV9EfVwiIGZpbGw9XCJyZ2JhKDMzLDE1MCwyNDMsMC41NSlcIi8+XG4gICAgICA8L3N2Zz5gO1xuXG4gICAgdGhpcy5zaGFkb3dSb290LmlubmVySFRNTCA9IGBcbiAgICAgIDxzdHlsZT4ke1NUWUxFU308L3N0eWxlPlxuICAgICAgPGhhLWNhcmQ+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJsYXlvdXRcIj5cblxuICAgICAgICAgIDwhLS0gVGFuayAtLT5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFuay1zaWRlXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFuay1vdXRlclwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFuay1hbmQtbWFya2Vyc1wiPlxuXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhbmstY29sdW1uXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhbmstY2FwXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhbmstYm9keVwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndhdGVyLWZpbGxcIiBpZD1cIndhdGVyLWZpbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndhdmUtd3JhcFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3YXZlLXRyYWNrXCI+JHt3YXZlU1ZHfSR7d2F2ZVNWR308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3YXRlci1zaGVlblwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnViYmxlXCIgc3R5bGU9XCJ3aWR0aDo4cHg7aGVpZ2h0OjhweDtsZWZ0OjE4JTtib3R0b206OCU7YW5pbWF0aW9uLWR1cmF0aW9uOjQuMnM7YW5pbWF0aW9uLWRlbGF5OjAuM3NcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1YmJsZVwiIHN0eWxlPVwid2lkdGg6NXB4O2hlaWdodDo1cHg7bGVmdDo0MiU7Ym90dG9tOjI1JTthbmltYXRpb24tZHVyYXRpb246NS44czthbmltYXRpb24tZGVsYXk6MS44c1wiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnViYmxlXCIgc3R5bGU9XCJ3aWR0aDo3cHg7aGVpZ2h0OjdweDtsZWZ0OjYzJTtib3R0b206MTIlO2FuaW1hdGlvbi1kdXJhdGlvbjozLjZzO2FuaW1hdGlvbi1kZWxheTowLjlzXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidWJibGVcIiBzdHlsZT1cIndpZHRoOjRweDtoZWlnaHQ6NHB4O2xlZnQ6MjglO2JvdHRvbTo0NSU7YW5pbWF0aW9uLWR1cmF0aW9uOjYuNXM7YW5pbWF0aW9uLWRlbGF5OjIuNXNcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1YmJsZVwiIHN0eWxlPVwid2lkdGg6NnB4O2hlaWdodDo2cHg7bGVmdDo3OCU7Ym90dG9tOjE4JTthbmltYXRpb24tZHVyYXRpb246NC44czthbmltYXRpb24tZGVsYXk6My4zc1wiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JpZC1saW5lXCIgc3R5bGU9XCJ0b3A6MjUlXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JpZC1saW5lXCIgc3R5bGU9XCJ0b3A6NTAlXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JpZC1saW5lXCIgc3R5bGU9XCJ0b3A6NzUlXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFuay10ZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0LXBjdFwiIGlkPVwidC1wY3RcIj7igJQ8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInQtdm9sXCIgaWQ9XCJ0LXZvbFwiPuKAlDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+PCEtLSAvdGFuay1jb2x1bW4gLS0+XG5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWFya2Vycy1jb2xcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsZXZlbC1pbmRpY2F0b3JcIiBpZD1cImxldmVsLWluZGljYXRvclwiIHN0eWxlPVwidG9wOjUwJVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibC1kb3RcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImwtbGluZVwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWFya2VyXCIgc3R5bGU9XCJ0b3A6MCVcIj4gIDxkaXYgY2xhc3M9XCJtLXRpY2tcIj48L2Rpdj48c3BhbiBjbGFzcz1cIm0tbGJsXCI+MTAwJTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXJrZXJcIiBzdHlsZT1cInRvcDoyNSVcIj4gPGRpdiBjbGFzcz1cIm0tdGlja1wiPjwvZGl2PjxzcGFuIGNsYXNzPVwibS1sYmxcIj43NSU8L3NwYW4+PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWFya2VyXCIgc3R5bGU9XCJ0b3A6NTAlXCI+IDxkaXYgY2xhc3M9XCJtLXRpY2tcIj48L2Rpdj48c3BhbiBjbGFzcz1cIm0tbGJsXCI+NTAlPC9zcGFuPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1hcmtlclwiIHN0eWxlPVwidG9wOjc1JVwiPiA8ZGl2IGNsYXNzPVwibS10aWNrXCI+PC9kaXY+PHNwYW4gY2xhc3M9XCJtLWxibFwiPjI1JTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtYXJrZXJcIiBzdHlsZT1cInRvcDoxMDAlXCI+PGRpdiBjbGFzcz1cIm0tdGlja1wiPjwvZGl2PjxzcGFuIGNsYXNzPVwibS1sYmxcIj4wJTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPCEtLSBTdGF0cyAtLT5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHMtc2lkZVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInMtaGVhZGVyXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzLWRyb3BcIj7wn5KnPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInMtdGl0bGVcIiAgICBpZD1cInMtdGl0bGVcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicy1zdWJ0aXRsZVwiIGlkPVwicy1zdWJ0aXRsZVwiPjwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRpdmlkZXJcIj48L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXQtY2FyZFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1pY29uIGJsdWVcIj48aGEtaWNvbiBpY29uPVwibWRpOndhdmVzXCI+PC9oYS1pY29uPjwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1pbmZvXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtbGFiZWxcIiBpZD1cImxibC1sZXZlbFwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLXZhbHVlXCIgaWQ9XCJ2YWwtbGV2ZWxcIj7igJQ8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1zdWJcIiAgIGlkPVwic3ViLWxldmVsXCI+PC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0LWNhcmRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtaWNvbiB0ZWFsXCI+PGhhLWljb24gaWNvbj1cIm1kaTp3YXRlclwiPjwvaGEtaWNvbj48L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtaW5mb1wiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLWxhYmVsXCIgaWQ9XCJsYmwtdm9sdW1lXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtdmFsdWVcIiBpZD1cInZhbC12b2x1bWVcIj7igJQ8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy1zdWJcIiAgIGlkPVwic3ViLXZvbHVtZVwiPjwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdC1jYXJkXCIgaWQ9XCJzdGF0LWV4dHJhXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLWljb24gb3JhbmdlXCI+PGhhLWljb24gaWQ9XCJpY29uLWV4dHJhXCIgaWNvbj1cIm1kaTpydWxlclwiPjwvaGEtaWNvbj48L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtaW5mb1wiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjLWxhYmVsXCIgaWQ9XCJsYmwtZGlzdGFuY2VcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYy12YWx1ZVwiIGlkPVwidmFsLWRpc3RhbmNlXCI+4oCUPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImMtc3ViXCIgICBpZD1cInN1Yi1kaXN0YW5jZVwiPjwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9vdGVyXCI+XG4gICAgICAgICAgICAgIDxoYS1pY29uIGljb249XCJtZGk6aW5mb3JtYXRpb24tb3V0bGluZVwiPjwvaGEtaWNvbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb290ZXItdHh0XCIgaWQ9XCJmb290ZXItdGltZVwiPjwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9oYS1jYXJkPlxuICAgIGA7XG5cbiAgICB0aGlzLl9idWlsdCA9IHRydWU7XG4gIH1cblxuICAvKiAtLSBTdGF0ZSB1cGRhdGVzIC0tICovXG5cbiAgX3VwZGF0ZSgpIHtcbiAgICBpZiAoIXRoaXMuX2J1aWx0IHx8ICF0aGlzLl9oYXNzIHx8ICF0aGlzLl9jb25maWcpIHJldHVybjtcblxuICAgIGNvbnN0IGxldmVsTnVtICA9IHRoaXMuX251bSh0aGlzLl9jb25maWcuZW50aXR5X2xldmVsKTtcbiAgICBjb25zdCB2b2x1bWVOdW0gPSB0aGlzLl9udW0odGhpcy5fY29uZmlnLmVudGl0eV92b2x1bWUpO1xuICAgIGNvbnN0IHBjdCAgICAgICA9IGlzTmFOKGxldmVsTnVtKSA/IDAgOiBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIGxldmVsTnVtKSk7XG4gICAgY29uc3QgJCAgICAgICAgID0gaWQgPT4gdGhpcy5zaGFkb3dSb290LmdldEVsZW1lbnRCeUlkKGlkKTtcblxuICAgIC8vIEhlYWRlciB0ZXh0XG4gICAgJCgncy10aXRsZScpLnRleHRDb250ZW50ICAgID0gdGhpcy5fY29uZmlnLnRpdGxlID8/IHRoaXMuX3QoJ3RpdGxlJyk7XG4gICAgJCgncy1zdWJ0aXRsZScpLnRleHRDb250ZW50ID0gdGhpcy5fdCgnc3VidGl0bGUnKTtcblxuICAgIC8vIFN0YXQgbGFiZWxzXG4gICAgJCgnbGJsLWxldmVsJykudGV4dENvbnRlbnQgID0gdGhpcy5fdCgnbGV2ZWwnKS50b1VwcGVyQ2FzZSgpO1xuICAgICQoJ2xibC12b2x1bWUnKS50ZXh0Q29udGVudCA9IHRoaXMuX3QoJ3ZvbHVtZScpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAvLyBXYXRlciBmaWxsIGhlaWdodCArIGNvbG91clxuICAgIGNvbnN0IGZpbGwgPSAkKCd3YXRlci1maWxsJyk7XG4gICAgaWYgKGZpbGwpIHtcbiAgICAgIGZpbGwuc3R5bGUuaGVpZ2h0ID0gYCR7cGN0fSVgO1xuICAgICAgaWYgKHBjdCA8PSAxNSlcbiAgICAgICAgZmlsbC5zdHlsZS5iYWNrZ3JvdW5kID0gJ2xpbmVhci1ncmFkaWVudCh0byB0b3AsI2I3MWMxYyAwJSwjZWY1MzUwIDYwJSwjZTU3MzczIDEwMCUpJztcbiAgICAgIGVsc2UgaWYgKHBjdCA8PSAzMClcbiAgICAgICAgZmlsbC5zdHlsZS5iYWNrZ3JvdW5kID0gJ2xpbmVhci1ncmFkaWVudCh0byB0b3AsI2U2NTEwMCAwJSwjZmI4YzAwIDYwJSwjZmZhNzI2IDEwMCUpJztcbiAgICAgIGVsc2VcbiAgICAgICAgZmlsbC5zdHlsZS5iYWNrZ3JvdW5kID0gJ2xpbmVhci1ncmFkaWVudCh0byB0b3AsIzBkNDdhMSAwJSwjMTk3NmQyIDU1JSwjMjE5NmYzIDEwMCUpJztcbiAgICB9XG5cbiAgICAvLyBMZXZlbCBpbmRpY2F0b3IgZG90ICh0b3AgJSA9IDEwMCAtIGxldmVsKVxuICAgIGNvbnN0IGRvdCA9ICQoJ2xldmVsLWluZGljYXRvcicpO1xuICAgIGlmIChkb3QpIGRvdC5zdHlsZS50b3AgPSBgJHsxMDAgLSBwY3R9JWA7XG5cbiAgICAvLyBUYW5rIGNlbnRyZSB0ZXh0XG4gICAgJCgndC1wY3QnKS50ZXh0Q29udGVudCA9IGlzTmFOKGxldmVsTnVtKSA/ICfigJQnIDogYCR7TWF0aC5yb3VuZChsZXZlbE51bSl9JWA7XG4gICAgJCgndC12b2wnKS50ZXh0Q29udGVudCA9IHRoaXMuX2ZtdFZvbCh2b2x1bWVOdW0pO1xuXG4gICAgLy8gTGV2ZWwgc3RhdCBjYXJkXG4gICAgJCgndmFsLWxldmVsJykudGV4dENvbnRlbnQgPSBpc05hTihsZXZlbE51bSkgPyAn4oCUJyA6IGAke01hdGgucm91bmQobGV2ZWxOdW0pfSVgO1xuICAgICQoJ3N1Yi1sZXZlbCcpLnRleHRDb250ZW50ID0gdGhpcy5fZm10Vm9sKHZvbHVtZU51bSk7XG5cbiAgICAvLyBWb2x1bWUgc3RhdCBjYXJkXG4gICAgY29uc3Qgdm9sU3RhdGUgPSB0aGlzLl9oYXNzLnN0YXRlc1t0aGlzLl9jb25maWcuZW50aXR5X3ZvbHVtZV07XG4gICAgY29uc3Qgdm9sVW5pdCAgPSB2b2xTdGF0ZT8uYXR0cmlidXRlcz8udW5pdF9vZl9tZWFzdXJlbWVudCA/PyAnTCc7XG4gICAgJCgndmFsLXZvbHVtZScpLnRleHRDb250ZW50ID0gaXNOYU4odm9sdW1lTnVtKSA/ICfigJQnIDogTWF0aC5yb3VuZCh2b2x1bWVOdW0pLnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgJCgnc3ViLXZvbHVtZScpLnRleHRDb250ZW50ID0gdm9sVW5pdDtcblxuICAgIC8vIEV4dHJhIHN0YXQgY2FyZCAoM3JkIHdpZGdldCDigJQgc2hvd24gb25seSB3aGVuIGFuIGVudGl0eSBpcyBjb25maWd1cmVkKVxuICAgIGNvbnN0IGV4dHJhRW50aXR5ID0gdGhpcy5fY29uZmlnLmVudGl0eV9kaXN0YW5jZTtcbiAgICBjb25zdCBleHRyYUNhcmQgICA9ICQoJ3N0YXQtZXh0cmEnKTtcbiAgICBpZiAoIWV4dHJhRW50aXR5KSB7XG4gICAgICBpZiAoZXh0cmFDYXJkKSBleHRyYUNhcmQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGV4dHJhQ2FyZCkgZXh0cmFDYXJkLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgIGNvbnN0IGV4dHJhVHlwZSAgPSB0aGlzLl9jb25maWcuZXh0cmFfc2Vuc29yX3R5cGUgfHwgJ2Rpc3RhbmNlJztcbiAgICAgIGNvbnN0IHR5cGVDZmcgICAgPSBFWFRSQV9TRU5TT1JfVFlQRVNbZXh0cmFUeXBlXSB8fCBFWFRSQV9TRU5TT1JfVFlQRVMuZGlzdGFuY2U7XG4gICAgICBjb25zdCBleHRyYVN0YXRlID0gdGhpcy5faGFzcy5zdGF0ZXNbZXh0cmFFbnRpdHldO1xuICAgICAgY29uc3QgZXh0cmFOdW0gICA9IHRoaXMuX251bShleHRyYUVudGl0eSk7XG4gICAgICBjb25zdCBleHRyYVVuaXQgID0gZXh0cmFTdGF0ZT8uYXR0cmlidXRlcz8udW5pdF9vZl9tZWFzdXJlbWVudCA/PyAnJztcblxuICAgICAgY29uc3QgaWNvbkVsID0gJCgnaWNvbi1leHRyYScpO1xuICAgICAgaWYgKGljb25FbCkgaWNvbkVsLnNldEF0dHJpYnV0ZSgnaWNvbicsIHR5cGVDZmcuaWNvbik7XG5cbiAgICAgICQoJ2xibC1kaXN0YW5jZScpLnRleHRDb250ZW50ID0gdGhpcy5fdChleHRyYVR5cGUpLnRvVXBwZXJDYXNlKCk7XG4gICAgICAkKCd2YWwtZGlzdGFuY2UnKS50ZXh0Q29udGVudCA9IGlzTmFOKGV4dHJhTnVtKSA/ICfigJQnIDogdHlwZUNmZy5mb3JtYXQoZXh0cmFOdW0pO1xuICAgICAgJCgnc3ViLWRpc3RhbmNlJykudGV4dENvbnRlbnQgPSBgJHt0aGlzLl90KHR5cGVDZmcuZGVzY0tleSl9IMK3ICR7ZXh0cmFVbml0fWA7XG4gICAgfVxuXG4gICAgLy8gRm9vdGVyIHRpbWVzdGFtcFxuICAgIGNvbnN0IGx2bFN0YXRlID0gdGhpcy5faGFzcy5zdGF0ZXNbdGhpcy5fY29uZmlnLmVudGl0eV9sZXZlbF07XG4gICAgaWYgKGx2bFN0YXRlPy5sYXN0X3VwZGF0ZWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGQgICA9IG5ldyBEYXRlKGx2bFN0YXRlLmxhc3RfdXBkYXRlZCk7XG4gICAgICAgIGNvbnN0IGZtdCA9IGQudG9Mb2NhbGVUaW1lU3RyaW5nKHRoaXMuX2hhc3MubGFuZ3VhZ2UgfHwgJ2VuJywge1xuICAgICAgICAgIGhvdXI6ICcyLWRpZ2l0JywgbWludXRlOiAnMi1kaWdpdCcsIHNlY29uZDogJzItZGlnaXQnLFxuICAgICAgICB9KTtcbiAgICAgICAgJCgnZm9vdGVyLXRpbWUnKS50ZXh0Q29udGVudCA9IGAke3RoaXMuX3QoJ2xhc3RfdXBkYXRlJyl9OiAke2ZtdH1gO1xuICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAkKCdmb290ZXItdGltZScpLnRleHRDb250ZW50ID0gYCR7dGhpcy5fdCgnbGFzdF91cGRhdGUnKX06IOKAlGA7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2ZtdFZvbCh2b2x1bWVOdW0pIHtcbiAgICBpZiAoaXNOYU4odm9sdW1lTnVtKSkgcmV0dXJuICcnO1xuICAgIGNvbnN0IGNhcCA9IHRoaXMuX2NvbmZpZy50YW5rX2NhcGFjaXR5O1xuICAgIGNvbnN0IHYgICA9IE1hdGgucm91bmQodm9sdW1lTnVtKS50b0xvY2FsZVN0cmluZygpO1xuICAgIHJldHVybiBjYXAgPyBgJHt2fSAvICR7TWF0aC5yb3VuZChjYXApLnRvTG9jYWxlU3RyaW5nKCl9IExgIDogYCR7dn0gTGA7XG4gIH1cblxuICBfbnVtKGVudGl0eUlkKSB7XG4gICAgY29uc3QgcyA9IHRoaXMuX2hhc3M/LnN0YXRlc1tlbnRpdHlJZF07XG4gICAgcmV0dXJuIHMgPyBwYXJzZUZsb2F0KHMuc3RhdGUpIDogTmFOO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnd2F0ZXItdGFuay1jYXJkJywgV2F0ZXJUYW5rQ2FyZCk7XG5cbndpbmRvdy5jdXN0b21DYXJkcyA9IHdpbmRvdy5jdXN0b21DYXJkcyB8fCBbXTtcbndpbmRvdy5jdXN0b21DYXJkcy5wdXNoKHtcbiAgdHlwZTogICAgICAgICAgICAgJ3dhdGVyLXRhbmstY2FyZCcsXG4gIG5hbWU6ICAgICAgICAgICAgICdXYXRlciBUYW5rIENhcmQnLFxuICBkZXNjcmlwdGlvbjogICAgICAnVmlzdWFsIHdhdGVyIHRhbmsgZGFzaGJvYXJkIOKAlCBsZXZlbCwgdm9sdW1lIGFuZCBkaXN0YW5jZS4nLFxuICBwcmV2aWV3OiAgICAgICAgICB0cnVlLFxuICBkb2N1bWVudGF0aW9uVVJMOiAnaHR0cHM6Ly9naXRodWIuY29tL2JqYXJuZS1yaWlzL2hhLXdhdGVydGFua2NhcmQnLFxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNLFlBQVksR0FBRztBQUNyQixFQUFFLEVBQUUsRUFBRTtBQUNOLElBQUksS0FBSyxjQUFjLFlBQVk7QUFDbkMsSUFBSSxRQUFRLFdBQVcsZUFBZTtBQUN0QyxJQUFJLEtBQUssY0FBYyxPQUFPO0FBQzlCLElBQUksTUFBTSxhQUFhLFFBQVE7QUFDL0IsSUFBSSxRQUFRLFdBQVcsVUFBVTtBQUNqQyxJQUFJLE9BQU8sWUFBWSxTQUFTO0FBQ2hDLElBQUksUUFBUSxXQUFXLFVBQVU7QUFDakMsSUFBSSxXQUFXLFFBQVEsYUFBYTtBQUNwQyxJQUFJLFFBQVEsV0FBVyxVQUFVO0FBQ2pDLElBQUksV0FBVyxRQUFRLGFBQWE7QUFDcEMsSUFBSSxpQkFBaUIsU0FBUyxtQkFBbUI7QUFDakQsSUFBSSxtQkFBbUIsT0FBTyxnQkFBZ0I7QUFDOUMsSUFBSSxvQkFBb0IsTUFBTSxrQkFBa0I7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QUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQsTUFBTSxNQUFNO0FBQ1osRUFBRSxnREFBZ0Q7QUFDbEQsRUFBRSwyREFBMkQ7O0FBRTdEOztBQUVBLE1BQU0sYUFBYSxHQUFHO0FBQ3RCLEVBQUU7QUFDRixJQUFJLElBQUksTUFBTSxjQUFjO0FBQzVCLElBQUksUUFBUSxFQUFFLElBQUk7QUFDbEIsSUFB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUksQ0FBQzs7QUFFTCxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSTtBQUN0QixFQUFFOztBQUVGOztBQUVBLEVBQUUsT0FBTyxHQUFHO0FBQ1osSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFOztBQUV0RCxJQUFJLE1BQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7QUFDMUQsSUFBSSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO0FBQzNELElBQUksTUFBTSxHQUFHLFNBQVMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNoRixJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7O0FBRTlEO0FBQ0EsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxJ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
