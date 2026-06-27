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
