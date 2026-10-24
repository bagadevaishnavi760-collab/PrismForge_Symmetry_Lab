(() => {
  'use strict';

  const app = window.prismForgeStudio;
  if (!app) {
    throw new Error('PrismForge drawing controls did not initialize.');
  }

  const state = app.state;
  const $ = (tag, attributes = {}, text = '') => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') element.className = value;
      else if (key === 'checked' || key === 'hidden' || key === 'disabled') element[key] = value;
      else element.setAttribute(key, value);
    });
    if (text) element.textContent = text;
    return element;
  };
  const action = (parent, label, callback, primary = false) => {
    const button = $('button', { type: 'button', className: `btn${primary ? ' primary' : ''}` }, label);
    button.addEventListener('click', callback);
    parent.appendChild(button);
    return button;
  };
  const studioSection = (title, id) => {
    const section = $('section', { className: 'section studio-extra', id });
    section.appendChild($('div', { className: 'stitle' }, title));
    return section;
  };
  const field = (parent, labelText, control, id) => {
    const wrapper = $('div', { className: 'studio-field' });
    const label = $('label', { for: id, className: 'label' }, labelText);
    control.id = id;
    wrapper.append(label, control);
    parent.appendChild(wrapper);
    return control;
  };
  const colorInput = (parent, label, id, value) => {
    const input = $('input', { type: 'color', value });
    return field(parent, label, input, id);
  };
  const rangeInput = (parent, label, id, min, max, value, outputText) => {
    const wrapper = $('div', { className: 'studio-field' });
    const labelEl = $('label', { for: id, className: 'label' }, label);
    const output = $('output', { className: 'value', id: `${id}Value` }, outputText(value));
    const input = $('input', { type: 'range', min, max, value, id });
    input.addEventListener('input', () => {
      output.value = outputText(Number(input.value));
      output.textContent = outputText(Number(input.value));
    });
    wrapper.append(labelEl, output, input);
    parent.appendChild(wrapper);
    return input;
  };
  const selectInput = (parent, label, id, options, value) => {
    const select = $('select', { className: 'studio-select' });
    options.forEach(([optionValue, optionLabel]) => {
      select.appendChild($('option', { value: optionValue }, optionLabel));
    });
    select.value = value;
    return field(parent, label, select, id);
  };
  const announce = (message) => app.toast(message);
  const paletteColors = {
    Calm: ['#e8cdb7', '#bd9cbd', '#817aab', '#9eb6a5', '#f3e9d2'],
    Ocean: ['#a8dadc', '#457b9d', '#1d3557', '#78c6d0', '#f1faee'],
    Sunset: ['#ff6b6b', '#ff9f68', '#ffd166', '#c44569', '#6d597a'],
    Forest: ['#cad2c5', '#a3b18a', '#588157', '#3a5a40', '#dad7cd'],
    Pastel: ['#ffc8dd', '#cdb4db', '#bde0fe', '#caffbf', '#fdffb6'],
    Neon: ['#ff00a8', '#39ff14', '#00e5ff', '#faff00', '#8c00ff']
  };

  state.kaleidoscope = state.kaleidoscope !== false;
  state.brushStyle = state.brushStyle || 'normal';
  state.glowIntensity = Number(state.glowIntensity) || 14;
  state.trailLength = Number(state.trailLength) || 18;
  state.book = state.book && Array.isArray(state.book.regions) ? state.book : {
    active: false,
    name: '',
    regions: []
  };
  const baseMakeRing = app.makeRing;
  app.makeRing = (properties = {}) => {
    const bounded = { ...properties };
    if (Number.isFinite(bounded.size)) bounded.size = Math.min(36, bounded.size);
    return baseMakeRing(bounded);
  };
  const baseDrawRing = app.drawRing;
  app.drawRing = (target, layer) => {
    const halfCanvas = Math.min(app.width, app.height) / 2;
    const margin = layer.size * 1.55 + layer.spacing / 2 + 3;
    const safeRadius = Math.max(0, halfCanvas - margin);
    const boundedLayer = {
      ...layer,
      radius: Math.min(layer.radius, Math.floor(safeRadius / halfCanvas * 100))
    };
    baseDrawRing(target, boundedLayer);
  };

  const stylesheet = document.createElement('style');
  stylesheet.textContent = `
    .studio-tabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;position:sticky;top:-16px;z-index:4;margin:-16px -16px 12px;padding:10px 8px;background:#141923f5;border-bottom:1px solid var(--line)}
    .studio-tabs .btn{padding:8px 3px;font-size:10px}
    .studio-tabs .btn[aria-selected="true"]{background:#30284e;border-color:#a99aff}
    .studio-tab-panel[hidden]{display:none}
    .studio-field{margin:9px 0}
    .studio-field>label{display:block;margin-bottom:5px}
    .studio-field input[type=range]{display:block}
    .studio-field output{float:right}
    .studio-field .studio-select{margin:0}
    .studio-extra .btn{margin:3px 3px 3px 0}
    .studio-extra .studio-select{width:100%}
    .studio-actions{display:flex;gap:5px;flex-wrap:wrap;margin:8px 0}
    .studio-actions .btn{flex:1 1 auto}
    .gallery-list{display:grid;gap:10px;margin-top:10px}
    .gallery-card{background:#101620;border:1px solid #ffffff16;border-radius:12px;padding:9px}
    .gallery-card img{display:block;width:100%;aspect-ratio:4/3;object-fit:contain;background:#08090d;border-radius:8px}
    .gallery-meta{display:grid;gap:5px;margin:8px 0;color:#dce2ee;font-size:11px}
    .gallery-meta input{width:100%;min-width:0;background:#0b1019;color:#fff;border:1px solid var(--line);border-radius:7px;padding:7px}
    .gallery-empty{font-size:11px;line-height:1.55;color:var(--muted)}
    .gallery-preview{max-width:min(90vw,900px);max-height:90vh;padding:16px;border:1px solid #ffffff22;border-radius:14px;background:#111722;color:var(--text)}
    .gallery-preview::backdrop{background:#000b}
    .gallery-preview img{display:block;max-width:100%;max-height:68vh;margin:12px auto;object-fit:contain;background:#08090d}
    .gallery-preview button{margin-top:8px}
    .book-palette{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}
    .book-swatch{width:30px;height:30px;border:2px solid #ffffff66;border-radius:50%;cursor:pointer}
    .book-swatch[aria-pressed="true"]{outline:2px solid #fff;outline-offset:2px}
    .book-template-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:12px 0}
    .book-template-card{min-width:0;padding:6px;border:1px solid var(--line);border-radius:11px;background:#101620;color:var(--text);cursor:pointer;text-align:left}
    .book-template-card[aria-pressed="true"]{border-color:#a99aff;box-shadow:0 0 0 1px #a99aff66}
    .book-template-card canvas{display:block;width:100%;height:auto;aspect-ratio:1;background:#f6f2e9;border-radius:7px;touch-action:auto}
    .book-template-card span{display:block;padding:6px 3px 2px;font-size:10px;font-weight:700}
    .studio-status{min-height:18px;margin:8px 0;color:#9edccd;font-size:11px}
    .studio-stroke-effects{display:grid;grid-template-columns:1fr 1fr;gap:4px}
    @media(max-width:760px){.studio-tabs{top:-16px}.studio-tabs .btn{font-size:9px}.gallery-preview{width:calc(100vw - 24px)}.app header{padding:0 10px}.app header .brand{flex:1;min-width:0}.app header .brand>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.app header .actions{flex:0 0 auto;flex-wrap:nowrap;gap:4px}.app header .actions>#undo,.app header .actions>#redo,.app header .actions>#clear,.app header .actions>#export{display:none}}
  `;
  document.head.appendChild(stylesheet);

  const aside = document.querySelector('.app aside');
  if (!aside) throw new Error('PrismForge controls sidebar was not found.');
  const existingSections = Array.from(aside.children).filter((child) => child.classList.contains('section'));
  const tabs = [
    ['draw', 'Draw'],
    ['kaleidoscope', 'Kaleidoscope'],
    ['colouring', 'Colouring Book'],
    ['gallery', 'My Gallery'],
    ['generate', 'Generate']
  ];
  const tabNav = $('div', { className: 'studio-tabs', role: 'tablist', 'aria-label': 'Mandala studio tools' });
  const panels = new Map();
  const panelShell = $('div', { className: 'studio-panel-shell' });
  let activeTabKey = 'draw';
  tabs.forEach(([key, label], index) => {
    const tab = $('button', {
      type: 'button',
      role: 'tab',
      className: 'btn',
      id: `studio-tab-${key}`,
      'aria-controls': `studio-panel-${key}`,
      'aria-selected': String(index === 0),
      tabindex: index === 0 ? '0' : '-1'
    }, label);
    tabNav.appendChild(tab);
    const panel = $('div', {
      role: 'tabpanel',
      className: 'studio-tab-panel',
      id: `studio-panel-${key}`,
      'aria-labelledby': tab.id,
      hidden: index !== 0
    });
    panels.set(key, panel);
    panelShell.appendChild(panel);
    tab.addEventListener('click', () => activateTab(key));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const current = tabs.findIndex(([candidate]) => candidate === key);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
        (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      activateTab(tabs[next][0]);
      tabNav.children[next].focus();
    });
  });
  const activateTab = (key) => {
    activeTabKey = key;
    if (key === 'colouring') {
      if (!state.book.name) selectBookTemplate(bookTemplate.value);
      else {
        state.book.active = true;
        if (coloringModeButton) coloringModeButton.textContent = 'Pause colouring mode';
        updateBookTemplateSelection(state.book.template || 'floral');
        app.render();
      }
    }
    tabs.forEach(([candidate]) => {
      const tab = tabNav.querySelector(`#studio-tab-${candidate}`);
      const panel = panels.get(candidate);
      const active = candidate === key;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
    });
  };
  aside.prepend(panelShell);
  aside.prepend(tabNav);

  const sectionCategory = (section) => {
    const title = section.querySelector('.stitle')?.textContent.trim().toUpperCase() || '';
    if (title.includes('SYMMETRY')) return 'kaleidoscope';
    if (['BRUSH & COLOUR', 'DRAWING MODES', 'CANVAS', 'SAVE & EXPORT'].includes(title)) return 'draw';
    if (['MANDALA GENERATOR', 'QUICK PRESETS', 'RING LAYERS'].includes(title)) return 'generate';
    return null;
  };
  existingSections.forEach((section) => {
    const category = sectionCategory(section);
    if (category) panels.get(category).appendChild(section);
    else panelShell.after(section);
  });

  const effectSection = studioSection('LIVE STROKE EFFECTS', 'stroke-effects');
  const effectGrid = $('div', { className: 'studio-stroke-effects' });
  const styleSelect = selectInput(effectSection, 'Brush style', 'brushStyle', [
    ['normal', 'Normal'], ['glow', 'Glow'], ['neon', 'Neon'], ['trail', 'Light Trail']
  ], state.brushStyle);
  const glowInput = rangeInput(effectSection, 'Glow intensity', 'glowIntensity', 0, 40, state.glowIntensity, (v) => `${v}`);
  const trailInput = rangeInput(effectSection, 'Trail length', 'trailLength', 4, 60, state.trailLength, (v) => `${v} px`);
  const kaleidoRow = $('label', { className: 'check-row', for: 'kaleidoscopeEnabled' });
  const kaleidoToggle = $('input', { type: 'checkbox', id: 'kaleidoscopeEnabled', checked: state.kaleidoscope });
  kaleidoRow.append(kaleidoToggle, document.createTextNode('Kaleidoscope mode'));
  effectSection.insertBefore(kaleidoRow, effectSection.children[1]);
  effectSection.append(effectGrid);
  const effectStatus = $('p', { className: 'note' }, 'Effect styles are stored per stroke. Reset the active brush or clear effects from existing strokes without removing their paths.');
  effectSection.appendChild(effectStatus);
  panels.get('kaleidoscope').appendChild(effectSection);
  const updateEffectControls = () => {
    state.brushStyle = styleSelect.value;
    state.glowIntensity = Number(glowInput.value);
    state.trailLength = Number(trailInput.value);
    glowInput.disabled = state.brushStyle === 'normal';
    trailInput.disabled = state.brushStyle !== 'trail';
    kaleidoToggle.checked = state.kaleidoscope;
    const pill = document.getElementById('symPill');
    if (pill) pill.textContent = state.kaleidoscope ? `${state.sectors}-FOLD SYMMETRY` : 'FREE DRAW';
    app.render();
  };
  [styleSelect, glowInput, trailInput].forEach((element) => element.addEventListener('input', updateEffectControls));
  kaleidoToggle.addEventListener('change', () => {
    app.pushHistory();
    app.scene.forEach((item) => {
      if (item.type === 'stroke' && item.kaleidoscope === undefined) {
        item.kaleidoscope = state.kaleidoscope;
        item.sectors = state.sectors;
        item.mirror = state.mirror;
        item.rotation = state.rotation;
      }
    });
    state.kaleidoscope = kaleidoToggle.checked;
    updateEffectControls();
  });
  action(effectGrid, 'Reset active brush', () => {
    app.pushHistory();
    state.brushStyle = 'normal';
    state.glowIntensity = 14;
    state.trailLength = 18;
    styleSelect.value = state.brushStyle;
    glowInput.value = state.glowIntensity;
    trailInput.value = state.trailLength;
    glowInput.previousElementSibling.textContent = '14';
    trailInput.previousElementSibling.textContent = '18 px';
    updateEffectControls();
    announce('Brush effects reset; existing strokes were kept.');
  });
  action(effectGrid, 'Clear effects from artwork', () => {
    const styledStrokes = app.scene.filter((item) => item.type === 'stroke' && item.style && item.style !== 'normal');
    if (!styledStrokes.length) return announce('There are no brush effects to clear.');
    app.pushHistory();
    styledStrokes.forEach((item) => { item.style = 'normal'; });
    app.render();
    announce('Effects cleared from existing strokes; their paths were kept.');
  });
  updateEffectControls();

  const baseDrawStroke = app.drawStroke;
  const transformPoint = (point, sector, reflected) => {
    const sectors = state.sectors;
    const mirror = state.mirror;
    const x = (reflected && mirror ? -1 : 1) * (point.x - app.width / 2);
    const y = point.y - app.height / 2;
    const angle = state.kaleidoscope
      ? state.rotation * Math.PI / 180 + Math.PI * 2 * sector / sectors
      : 0;
    return {
      x: app.width / 2 + x * Math.cos(angle) - y * Math.sin(angle),
      y: app.height / 2 + x * Math.sin(angle) + y * Math.cos(angle)
    };
  };
  const paintTrail = (target, item) => {
    const count = state.kaleidoscope ? state.sectors : 1;
    const reflections = state.kaleidoscope && state.mirror ? [false, true] : [false];
    let start = item.points.length - 1;
    let distance = 0;
    const trailLength = item.trailLength || state.trailLength;
    while (start > 0 && distance < trailLength) {
      const current = item.points[start];
      const previous = item.points[start - 1];
      distance += Math.hypot(current.x - previous.x, current.y - previous.y);
      start -= 1;
    }
    const tail = item.points.slice(start);
    baseDrawStroke(target, { ...item, opacity: item.opacity * 0.24, style: 'normal' });
    for (let sector = 0; sector < count; sector += 1) {
      for (const reflected of reflections) {
        const points = tail.map((point) => transformPoint(point, sector, reflected));
        for (let index = 1; index < points.length; index += 1) {
          target.save();
          target.globalAlpha = item.opacity * (0.25 + 0.75 * index / (points.length - 1));
          target.strokeStyle = item.color;
          target.lineWidth = item.size;
          target.lineCap = 'round';
          target.lineJoin = 'round';
          target.shadowColor = item.color;
          target.shadowBlur = (item.glow || state.glowIntensity) * 1.2;
          target.beginPath();
          target.moveTo(points[index - 1].x, points[index - 1].y);
          target.lineTo(points[index].x, points[index].y);
          target.stroke();
          target.restore();
        }
      }
    }
  };
  app.drawStroke = (target, item) => {
    const originalSectors = state.sectors;
    const originalMirror = state.mirror;
    const originalRotation = state.rotation;
    const originalKaleidoscope = state.kaleidoscope;
    state.kaleidoscope = item.kaleidoscope === undefined ? state.kaleidoscope : item.kaleidoscope;
    state.sectors = item.sectors || state.sectors;
    state.mirror = item.mirror === undefined ? state.mirror : item.mirror;
    state.rotation = Number.isFinite(item.rotation) ? item.rotation : state.rotation;
    if (!state.kaleidoscope) {
      state.sectors = 1;
      state.mirror = false;
      state.rotation = 0;
    }
    const style = item.style || 'normal';
    target.save();
    try {
      if (style === 'glow' || style === 'neon') {
        target.shadowColor = item.erase ? state.background : item.color;
        target.shadowBlur = (item.glow ?? state.glowIntensity) * (style === 'neon' ? 2.2 : 1.4);
      }
      if (item.erase || style !== 'trail') baseDrawStroke(target, item);
      if (!item.erase && style === 'trail') paintTrail(target, item);
    } finally {
      target.restore();
      state.sectors = originalSectors;
      state.mirror = originalMirror;
      state.rotation = originalRotation;
      state.kaleidoscope = originalKaleidoscope;
    }
  };
  const originalRenderer = app.renderScene;
  app.renderScene = (target, scale, guides) => {
    originalRenderer(target, scale, guides && state.kaleidoscope && !(activeTabKey === 'colouring' && state.book.active));
    renderColouringBook(target, scale);
  };
  app.pos = (event) => {
    const rect = app.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * app.width / rect.width,
      y: (event.clientY - rect.top) * app.height / rect.height
    };
  };
  if ('ResizeObserver' in window) {
    const canvasObserver = new ResizeObserver(() => app.resize());
    canvasObserver.observe(app.canvas);
  }
  const pointerStart = new WeakMap();
  let latestPointerDown = null;
  app.canvas.addEventListener('pointerdown', (event) => {
    if (activeTabKey === 'colouring' && state.book.active) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const rect = app.canvas.getBoundingClientRect();
      const point = {
        x: (event.clientX - rect.left) * app.width / rect.width,
        y: (event.clientY - rect.top) * app.height / rect.height
      };
      fillRegion(point);
      return;
    }
    if (['draw', 'polygon', 'spiral', 'fractal'].includes(state.mode)) {
      pointerStart.set(event, { sceneLength: app.scene.length });
      latestPointerDown = event;
    }
  }, true);
  const applyBrushStyleToLastStroke = () => {
    const start = pointerStart.get(latestPointerDown);
    if (start && app.scene.length > start.sceneLength) {
      const stroke = app.scene[app.scene.length - 1];
      if (stroke?.type === 'stroke') {
        stroke.style = state.brushStyle;
        stroke.glow = state.glowIntensity;
        stroke.trailLength = state.trailLength;
        stroke.kaleidoscope = state.kaleidoscope;
        stroke.sectors = state.sectors;
        stroke.mirror = state.mirror;
        stroke.rotation = state.rotation;
        app.render();
      }
    }
  };
  window.addEventListener('pointerup', applyBrushStyleToLastStroke);
  window.addEventListener('pointercancel', applyBrushStyleToLastStroke);

  const bookSection = studioSection('COLOURING BOOK', 'colouring-book-tools');
  const bookTemplate = selectInput(bookSection, 'Outline template', 'bookTemplate', [
    ['floral', 'Floral Mandala'], ['lotus', 'Lotus Mandala'], ['star', 'Geometric Star Mandala'], ['wheel', 'Petal Wheel Mandala']
  ], 'floral');
  const bookColor = colorInput(bookSection, 'Fill colour', 'bookColor', state.color);
  const bookBackground = colorInput(bookSection, 'Background colour', 'bookBackground', state.bookBackground || '#f6f2e9');
  state.bookBackground = bookBackground.value;
  const bookTemplates = [
    ['floral', 'Floral Mandala'], ['lotus', 'Lotus Mandala'],
    ['star', 'Geometric Star Mandala'], ['wheel', 'Petal Wheel Mandala']
  ];
  const bookNames = Object.fromEntries(bookTemplates);
  const bookTemplateGrid = $('div', { className: 'book-template-grid', role: 'group', 'aria-label': 'Mandala outline templates' });
  const bookTemplateCards = new Map();
  bookTemplates.forEach(([template, title]) => {
    const card = $('button', {
      type: 'button',
      className: 'book-template-card',
      'aria-label': `Select ${title}`,
      'aria-pressed': 'false'
    });
    const preview = $('canvas', { width: '240', height: '240', 'aria-hidden': 'true' });
    card.append(preview, $('span', {}, title));
    card.addEventListener('click', () => selectBookTemplate(template));
    bookTemplateGrid.appendChild(card);
    bookTemplateCards.set(template, { card, preview });
  });
  bookSection.appendChild(bookTemplateGrid);
  const bookPalette = $('div', { className: 'book-palette', role: 'group', 'aria-label': 'Colouring palette' });
  ['#f4a7bb', '#ffd166', '#8bd3c7', '#a78bfa', '#6ab7ff', '#f2eee4'].forEach((color, index) => {
    const swatch = $('button', {
      type: 'button',
      className: 'book-swatch',
      style: `background:${color}`,
      title: `Choose colouring colour ${index + 1}`,
      'aria-label': `Choose colouring colour ${index + 1}`,
      'aria-pressed': String(index === 0)
    });
    swatch.addEventListener('click', () => {
      bookColor.value = color;
      bookColor.dispatchEvent(new Event('input', { bubbles: true }));
      bookPalette.querySelectorAll('button').forEach((button) => button.setAttribute('aria-pressed', String(button === swatch)));
    });
    bookPalette.appendChild(swatch);
  });
  bookSection.appendChild(bookPalette);
  const bookActions = $('div', { className: 'studio-actions' });
  const bookStatus = $('p', { className: 'studio-status', role: 'status', 'aria-live': 'polite' });
  const bookUndo = action(bookActions, 'Undo', () => {
    app.undo();
    updateBookTemplateSelection(state.book?.template || 'floral');
    bookColor.value = state.color;
    bookBackground.value = state.bookBackground || '#f6f2e9';
    syncBookHistoryControls();
    app.render();
  });
  const bookRedo = action(bookActions, 'Redo', () => {
    app.redo();
    updateBookTemplateSelection(state.book?.template || 'floral');
    bookColor.value = state.color;
    bookBackground.value = state.bookBackground || '#f6f2e9';
    syncBookHistoryControls();
    app.render();
  });
  const syncBookHistoryControls = () => {
    bookUndo.disabled = document.getElementById('undo2').disabled;
    bookRedo.disabled = document.getElementById('redo2').disabled;
  };
  bookSection.append(bookActions, bookStatus, $('p', { className: 'note' }, 'Choose a rendered template, then click an enclosed petal, ring segment, or centre to colour it.'));
  panels.get('colouring').appendChild(bookSection);
  let removeBookColour = false;
  const pointInPolygon = (point, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
      const a = polygon[i], b = polygon[j];
      const crosses = (a.y > point.y) !== (b.y > point.y) &&
        point.x < (b.x - a.x) * (point.y - a.y) / ((b.y - a.y) || Number.EPSILON) + a.x;
      if (crosses) inside = !inside;
    }
    return inside;
  };
  const bookSpecs = {
    floral: { sectors: 12, bands: [0.15, 0.27, 0.41, 0.56, 0.72, 0.91], petals: [[0.27, 0.53, 0.09], [0.57, 0.85, 0.08]] },
    lotus: { sectors: 10, bands: [0.15, 0.27, 0.43, 0.61, 0.79, 0.93], petals: [[0.23, 0.5, 0.1], [0.48, 0.76, 0.095], [0.72, 0.91, 0.075]], offset: Math.PI / 10 },
    star: { sectors: 8, bands: [0.16, 0.29, 0.44, 0.62, 0.82, 0.94], petals: [[0.29, 0.59, 0.095], [0.61, 0.87, 0.075]], star: true },
    wheel: { sectors: 16, bands: [0.13, 0.24, 0.37, 0.52, 0.68, 0.85, 0.94], petals: [[0.25, 0.49, 0.055], [0.5, 0.73, 0.05], [0.72, 0.9, 0.04]], offset: Math.PI / 16 }
  };
  const circleRegion = (radius, samples = 48) => Array.from({ length: samples }, (_, index) => {
    const angle = 2 * Math.PI * index / samples;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  });
  const sectorRegion = (inner, outer, start, end, samples = 5) => {
    const points = [];
    for (let index = 0; index <= samples; index += 1) {
      const angle = start + (end - start) * index / samples;
      points.push({ x: Math.cos(angle) * outer, y: Math.sin(angle) * outer });
    }
    for (let index = samples; index >= 0; index -= 1) {
      const angle = start + (end - start) * index / samples;
      points.push({ x: Math.cos(angle) * inner, y: Math.sin(angle) * inner });
    }
    return points;
  };
  const petalRegion = (inner, outer, angle, halfWidth) => {
    const points = [];
    const pointOnPetal = (progress, side) => {
      const radius = inner + (outer - inner) * progress;
      const width = halfWidth * Math.sin(Math.PI * progress) * side;
      return {
        x: radius * Math.cos(angle) - width * Math.sin(angle),
        y: radius * Math.sin(angle) + width * Math.cos(angle)
      };
    };
    for (let index = 0; index <= 12; index += 1) points.push(pointOnPetal(index / 12, 1));
    for (let index = 12; index >= 0; index -= 1) points.push(pointOnPetal(index / 12, -1));
    return points;
  };
  const starRegion = (inner, outer, angle, points = 8) => Array.from({ length: points * 2 }, (_, index) => {
    const theta = angle + Math.PI * index / points;
    const radius = index % 2 ? inner : outer;
    return { x: Math.cos(theta) * radius, y: Math.sin(theta) * radius };
  });
  const makeBookRegions = (template) => {
    const spec = bookSpecs[template] || bookSpecs.floral;
    const regions = [];
    for (let band = 0; band < spec.bands.length - 1; band += 1) {
      const inner = spec.bands[band];
      const outer = spec.bands[band + 1];
      const offset = band % 2 ? Math.PI / spec.sectors : 0;
      for (let index = 0; index < spec.sectors; index += 1) {
        const start = 2 * Math.PI * index / spec.sectors + offset;
        const end = 2 * Math.PI * (index + 1) / spec.sectors + offset;
        regions.push({ points: sectorRegion(inner, outer, start, end), color: null });
      }
    }
    spec.petals.forEach(([inner, outer, width], layer) => {
      const offset = (spec.offset || 0) * (layer % 2 ? -1 : 1);
      for (let index = 0; index < spec.sectors; index += 1) {
        const angle = 2 * Math.PI * index / spec.sectors + offset;
        regions.push({ points: petalRegion(inner, outer, angle, width), color: null });
      }
    });
    if (spec.star) {
      for (let index = 0; index < spec.sectors; index += 1) {
        regions.push({
          points: starRegion(0.34, 0.52, 2 * Math.PI * index / spec.sectors - Math.PI / 2, 4),
          color: null
        });
      }
    }
    regions.push({ points: circleRegion(spec.bands[0]), color: null });
    return regions;
  };
  function renderBookArtwork(target, scale, book, width, height, background = state.background, paintBackground = false) {
    if (!book?.name || !Array.isArray(book.regions)) return;
    target.save();
    target.setTransform(scale, 0, 0, scale, 0, 0);
    const unit = Math.min(width, height) / 2;
    if (paintBackground) {
      target.fillStyle = background;
      target.fillRect(0, 0, width, height);
    }
    const toCanvas = (point) => ({ x: width / 2 + point.x * unit, y: height / 2 + point.y * unit });
    const paths = [];
    book.regions.forEach((region) => {
      const points = region.points.map(toCanvas);
      target.beginPath();
      target.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((point) => target.lineTo(point.x, point.y));
      target.closePath();
      target.fillStyle = region.color || background;
      target.fill();
      paths.push(points);
    });
    target.strokeStyle = '#28263a';
    target.lineWidth = 1.45 / scale;
    target.lineJoin = 'round';
    target.lineCap = 'round';
    paths.forEach((points) => {
      target.beginPath();
      target.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((point) => target.lineTo(point.x, point.y));
      target.closePath();
      target.stroke();
    });
    const spec = bookSpecs[book.template] || bookSpecs.floral;
    target.lineWidth = 1.3 / scale;
    spec.bands.slice(1, -1).forEach((radius) => {
      target.beginPath();
      target.arc(width / 2, height / 2, unit * radius, 0, 2 * Math.PI);
      target.stroke();
    });
    target.restore();
  }
  function renderColouringBook(target, scale) {
    renderBookArtwork(target, scale, state.book, app.width, app.height);
  }
  const updateBookTemplateSelection = (template) => {
    bookTemplate.value = template;
    bookTemplateCards.forEach(({ card }, key) => card.setAttribute('aria-pressed', String(key === template)));
  };
  const selectBookTemplate = (template) => {
    app.pushHistory();
    state.book = { active: true, name: bookNames[template], template, regions: makeBookRegions(template) };
    state.background = bookBackground.value;
    state.bookBackground = bookBackground.value;
    if (coloringModeButton) coloringModeButton.textContent = 'Pause colouring mode';
    removeBookColour = false;
    eraserButton.setAttribute('aria-pressed', 'false');
    eraserButton.textContent = 'Remove colour: off';
    updateBookTemplateSelection(template);
    app.render();
    bookStatus.textContent = `${bookNames[template]} is ready. Click any enclosed region to colour it.`;
    syncBookHistoryControls();
  };
  bookTemplates.forEach(([template]) => {
    const { preview } = bookTemplateCards.get(template);
    renderBookArtwork(preview.getContext('2d'), 1, {
      name: bookNames[template],
      template,
      regions: makeBookRegions(template)
    }, preview.width, preview.height, '#f6f2e9', true);
  });
  const fillRegion = (point) => {
    if (!state.book.name) {
      bookStatus.textContent = 'Create a template before colouring.';
      return;
    }
    const unit = Math.min(app.width, app.height) / 2;
    const normalized = { x: (point.x - app.width / 2) / unit, y: (point.y - app.height / 2) / unit };
    const region = [...state.book.regions].reverse().find((candidate) => pointInPolygon(normalized, candidate.points));
    if (!region) {
      bookStatus.textContent = 'Click inside an outlined petal or the centre.';
      return;
    }
    app.pushHistory();
    region.color = removeBookColour ? null : bookColor.value;
    if (region.color) region.color = region.color.toLowerCase();
    app.render();
    syncBookHistoryControls();
    bookStatus.textContent = removeBookColour ? 'Region colour removed.' : 'Region coloured.';
  };
  action(bookActions, 'Load selected template', () => selectBookTemplate(bookTemplate.value), true);
  action(bookActions, 'Reset colours', () => {
    if (!state.book.name) return announce('Create a colouring template first.');
    app.pushHistory();
    state.book.regions.forEach((region) => { region.color = null; });
    app.render();
    syncBookHistoryControls();
    bookStatus.textContent = 'All region colours were reset.';
  });
  const eraserButton = action(bookActions, 'Remove colour: off', () => {
    removeBookColour = !removeBookColour;
    eraserButton.textContent = `Remove colour: ${removeBookColour ? 'on' : 'off'}`;
    eraserButton.setAttribute('aria-pressed', String(removeBookColour));
  });
  eraserButton.setAttribute('aria-pressed', 'false');
  let coloringModeButton;
  coloringModeButton = action(bookActions, 'Toggle colouring mode', (event) => {
    app.pushHistory();
    state.book.active = !state.book.active;
    event.currentTarget.textContent = state.book.active ? 'Pause colouring mode' : 'Resume colouring mode';
    app.render();
    syncBookHistoryControls();
    bookStatus.textContent = state.book.active ? 'Click an outlined region to colour it.' : 'Colouring paused; template and fills are kept.';
  });
  bookBackground.addEventListener('input', () => {
    app.pushHistory();
    state.bookBackground = bookBackground.value;
    state.background = bookBackground.value;
    const existingBackground = document.getElementById('backgroundColor');
    if (existingBackground) existingBackground.value = state.background;
    app.render();
    syncBookHistoryControls();
  });
  bookColor.addEventListener('input', () => {
    state.color = bookColor.value;
    const mainColor = document.getElementById('color');
    if (mainColor) mainColor.value = state.color;
    bookPalette.querySelectorAll('button').forEach((button) => button.setAttribute('aria-pressed', 'false'));
  });

  const gallerySection = studioSection('MY GALLERY', 'my-gallery-tools');
  const galleryActions = $('div', { className: 'studio-actions' });
  const galleryStatus = $('p', { className: 'studio-status', role: 'status', 'aria-live': 'polite' });
  const galleryList = $('div', { className: 'gallery-list', 'aria-live': 'polite' });
  const galleryBackupInput = $('input', { type: 'file', accept: 'application/json,.json', hidden: true, id: 'galleryBackupInput' });
  gallerySection.append(
    $('p', { className: 'note' }, 'Saved locally in this browser only. Gallery contents are not synced to the cloud.'),
    galleryActions,
    galleryStatus,
    galleryList,
    galleryBackupInput
  );
  panels.get('gallery').appendChild(gallerySection);
  const galleryKey = 'prismforge-gallery-v1';
  const loadGallery = () => {
    try {
      const serialized = localStorage.getItem(galleryKey);
      const entries = serialized ? JSON.parse(serialized) : [];
      if (!Array.isArray(entries)) throw new Error('Gallery storage has an invalid format.');
      return entries;
    } catch (error) {
      announce(`Gallery could not be read: ${error.message}`);
      return [];
    }
  };
  const saveGallery = (entries) => {
    try {
      localStorage.setItem(galleryKey, JSON.stringify(entries));
      return true;
    } catch (error) {
      const message = error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
        ? 'Browser storage is full. Export a JSON backup or delete older gallery items.'
        : `Gallery could not be saved: ${error.message}`;
      galleryStatus.textContent = message;
      announce(message);
      return false;
    }
  };
  const thumbnailFor = (project) => {
    const current = app.documentData();
    try {
      app.restoreData(project);
      const factor = Math.min(1, 300 / app.width, 220 / app.height);
      const thumbnail = document.createElement('canvas');
      thumbnail.width = Math.max(1, Math.round(app.width * factor));
      thumbnail.height = Math.max(1, Math.round(app.height * factor));
      app.renderScene(thumbnail.getContext('2d'), factor, false);
      return thumbnail.toDataURL('image/jpeg', 0.75);
    } finally {
      app.restoreData(current);
    }
  };
  const downloadJson = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = $('a', { href: url, download: filename });
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const projectHasArt = () => app.scene.length > 0 || state.book?.name;
  const currentProject = () => {
    if (!projectHasArt()) throw new Error('Create a drawing or colouring page before saving to My Gallery.');
    return app.documentData();
  };
  const validateProject = (project) => {
    app.validateDocument(project);
    if (project.settings.book !== undefined) {
      const book = project.settings.book;
      if (!book || typeof book.active !== 'boolean' || typeof book.name !== 'string' ||
          !Array.isArray(book.regions) || book.regions.length > 256 ||
          book.regions.some((region) => !region || !Array.isArray(region.points) ||
            region.points.length < 3 || region.points.length > 100 ||
            region.points.some((point) => !point || !Number.isFinite(point.x) || !Number.isFinite(point.y) ||
              Math.abs(point.x) > 1.2 || Math.abs(point.y) > 1.2) ||
            (region.color !== null && !/^#[0-9a-f]{6}$/i.test(region.color)))) {
        throw new Error('The project has invalid colouring-book regions.');
      }
    }
  };
  const renderGallery = () => {
    galleryList.replaceChildren();
    const entries = loadGallery();
    if (!entries.length) {
      galleryList.appendChild($('p', { className: 'gallery-empty' }, 'Your gallery is empty. Save a drawing or coloured template to keep it on this device.'));
      return;
    }
    entries.forEach((entry) => {
      const card = $('article', { className: 'gallery-card' });
      const image = $('img', { src: entry.thumbnail, alt: `Preview of ${entry.title}` });
      image.addEventListener('click', () => previewArtwork(entry));
      const metadata = $('div', { className: 'gallery-meta' });
      const title = $('input', { type: 'text', value: entry.title, maxlength: '80', 'aria-label': `Artwork title, saved ${new Date(entry.createdAt).toLocaleDateString()}` });
      title.addEventListener('change', () => {
        const latest = loadGallery();
        const record = latest.find((item) => item.id === entry.id);
        if (!record) return;
        record.title = title.value.trim() || 'Untitled Mandala';
        if (saveGallery(latest)) {
          galleryStatus.textContent = 'Artwork title updated.';
          renderGallery();
        }
      });
      metadata.append(title, $('time', { datetime: entry.createdAt }, `Created ${new Date(entry.createdAt).toLocaleDateString()}`));
      const controls = $('div', { className: 'studio-actions' });
      action(controls, 'Preview', () => previewArtwork(entry));
      action(controls, 'Open', () => openArtwork(entry));
      action(controls, 'PNG', () => exportArtwork(entry));
      action(controls, 'Duplicate', () => duplicateArtwork(entry));
      action(controls, 'JSON', () => downloadJson({ format: 'prismforge-gallery-artwork', version: 1, project: entry.project }, `${safeFilename(entry.title)}.json`));
      action(controls, 'Delete', () => deleteArtwork(entry), false).classList.add('danger');
      card.append(image, metadata, controls);
      galleryList.appendChild(card);
    });
  };
  const safeFilename = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mandala';
  const previewDialog = $('dialog', { className: 'gallery-preview', 'aria-label': 'Artwork preview' });
  const previewHeading = $('h2', {}, 'Artwork preview');
  const previewImage = $('img', { alt: '' });
  const previewClose = action(previewDialog, 'Close preview', () => previewDialog.close());
  previewDialog.append(previewHeading, previewImage, previewClose);
  document.body.appendChild(previewDialog);
  const previewArtwork = (entry) => {
    previewHeading.textContent = entry.title;
    previewImage.src = entry.thumbnail;
    previewImage.alt = `Preview of ${entry.title}`;
    if (!previewDialog.open) previewDialog.showModal();
  };
  const openArtwork = (entry) => {
    try {
      validateProject(entry.project);
      app.restoreData(entry.project);
      bookTemplate.value = state.book?.template ||
        (state.book?.name === 'Lotus' || state.book?.name === 'Lotus Mandala' ? 'lotus' :
          state.book?.name === 'Geometric Star' || state.book?.name === 'Geometric Star Mandala' ? 'star' :
            state.book?.name === 'Petal Wheel' || state.book?.name === 'Petal Wheel Mandala' ? 'wheel' : 'floral');
      updateBookTemplateSelection(bookTemplate.value);
      bookStatus.textContent = state.book?.name ? `${state.book.name} reopened from My Gallery.` : '';
      announce(`Opened “${entry.title}” from My Gallery.`);
    } catch (error) {
      announce(`Artwork could not be opened: ${error.message}`);
    }
  };
  const exportArtwork = (entry) => {
    const current = app.documentData();
    try {
      validateProject(entry.project);
      app.restoreData(entry.project);
      app.exportPng();
    } catch (error) {
      announce(`Artwork could not be exported: ${error.message}`);
    } finally {
      app.restoreData(current);
    }
  };
  const duplicateArtwork = (entry) => {
    try {
      const project = JSON.parse(JSON.stringify(entry.project));
      const entries = loadGallery();
      const copy = {
        ...entry,
        id: crypto.randomUUID ? crypto.randomUUID() : `art-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: `${entry.title} copy`,
        createdAt: new Date().toISOString(),
        project,
        thumbnail: thumbnailFor(project)
      };
      entries.unshift(copy);
      if (saveGallery(entries)) {
        galleryStatus.textContent = 'Artwork duplicated.';
        renderGallery();
      }
    } catch (error) {
      announce(`Artwork could not be duplicated: ${error.message}`);
    }
  };
  const deleteArtwork = (entry) => {
    if (!confirm(`Delete “${entry.title}” from this browser's gallery? This cannot be undone.`)) return;
    const entries = loadGallery().filter((item) => item.id !== entry.id);
    if (saveGallery(entries)) {
      galleryStatus.textContent = 'Artwork deleted from this device.';
      renderGallery();
    }
  };
  action(galleryActions, 'Save current artwork', () => {
    try {
      const project = currentProject();
      const entries = loadGallery();
      const entry = {
        id: crypto.randomUUID ? crypto.randomUUID() : `art-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: `Mandala ${entries.length + 1}`,
        createdAt: new Date().toISOString(),
        project,
        thumbnail: thumbnailFor(project)
      };
      entries.unshift(entry);
      if (saveGallery(entries)) {
        galleryStatus.textContent = 'Artwork saved locally in My Gallery.';
        renderGallery();
      }
    } catch (error) {
      galleryStatus.textContent = error.message;
      announce(error.message);
    }
  }, true);
  action(galleryActions, 'Export gallery JSON', () => {
    downloadJson({ format: 'prismforge-gallery', version: 1, artworks: loadGallery() }, 'prismforge-gallery.json');
    galleryStatus.textContent = 'Gallery JSON backup downloaded.';
  });
  action(galleryActions, 'Import JSON backup', () => galleryBackupInput.click());
  galleryBackupInput.addEventListener('change', () => {
    const file = galleryBackupInput.files[0];
    galleryBackupInput.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      galleryStatus.textContent = 'The selected backup exceeds the 10 MB import limit.';
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => { galleryStatus.textContent = 'The selected backup could not be read.'; };
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const projects = data.format === 'prismforge-gallery' && data.version === 1
          ? data.artworks.map((entry) => entry.project)
          : data.format === 'prismforge-gallery-artwork' && data.version === 1 ? [data.project] : [];
        if (!projects.length || projects.length > 100) throw new Error('The backup has an unsupported or empty gallery format.');
        const existing = loadGallery();
        const imported = projects.map((project, index) => {
          validateProject(project);
          return {
            id: `import-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
            title: `Imported mandala ${index + 1}`,
            createdAt: new Date().toISOString(),
            project,
            thumbnail: thumbnailFor(project)
          };
        });
        if (saveGallery([...imported, ...existing])) {
          galleryStatus.textContent = `Imported ${imported.length} artwork${imported.length === 1 ? '' : 's'} into this browser.`;
          renderGallery();
        }
      } catch (error) {
        galleryStatus.textContent = `Backup was not imported: ${error.message}`;
      }
    };
    reader.readAsText(file);
  });
  renderGallery();

  const generateSection = panels.get('generate');
  const complexityInput = document.getElementById('complexity');
  const complexityOutput = document.getElementById('complexityVal');
  if (complexityInput && complexityOutput) {
    complexityInput.max = '10';
    if (Number(complexityInput.value) > 10) complexityInput.value = '10';
    const originalComplexityListener = complexityInput.oninput;
    complexityInput.addEventListener('input', () => {
      complexityOutput.value = complexityInput.value;
      complexityOutput.textContent = complexityInput.value;
    });
    if (originalComplexityListener) complexityInput.addEventListener('input', originalComplexityListener);
  }
  const baseBuildLayers = app.buildLayers;
  app.buildLayers = (count, petals, complexity, shapes) => {
    const level = Math.max(1, Math.min(10, Number(complexity) || 1));
    const ringCount = Math.min(12, count + Math.floor((level - 1) / 2));
    const petalCount = Math.min(72, petals + (level - 1) * 2);
    const layers = baseBuildLayers(ringCount, petalCount, level, shapes);
    const halfCanvas = Math.min(app.width, app.height) / 2;
    const safeSize = Math.max(3, Math.min(18, halfCanvas * 0.08));
    layers.forEach((layer) => {
      layer.size = Math.min(layer.size, safeSize);
      const margin = layer.size * 1.55 + layer.spacing / 2 + 3;
      const maximumRadius = Math.max(1, Math.floor((halfCanvas - margin) / halfCanvas * 100));
      layer.radius = Math.min(layer.radius, maximumRadius);
    });
    const accents = Math.floor((level - 1) / 3);
    const colors = paletteColors[state.palette] || paletteColors.Calm;
    for (let index = 0; index < accents; index += 1) {
      layers.push(app.makeRing({
        name: `Detail ${index + 1}`,
        radius: Math.min(76, 72 + index * 2),
        spacing: 0,
        rotation: state.generatorRotation,
        shape: index % 2 ? 'star' : 'dot',
        size: Math.max(3, Math.min(10, Math.min(app.width, app.height) * 0.025)),
        count: Math.min(72, petalCount * (index % 2 ? 1 : 2)),
        fill: true,
        color: colors[index % colors.length]
      }));
    }
    return layers;
  };
  const beforeGenerate = (run) => {
    if (app.scene.length && !confirm('Replace generated rings with a new design? Existing hand-drawn strokes and colouring-book artwork will be kept.')) return;
    run();
  };
  const baseGenerate = app.generate;
  app.generate = () => beforeGenerate(baseGenerate);
  document.getElementById('generate').onclick = () => app.generate();
  document.querySelectorAll('[data-preset]').forEach((button) => {
    const presetName = button.dataset.preset;
    button.onclick = () => beforeGenerate(() => app.applyPreset(presetName));
  });
  const randomizeButton = action(generateSection, 'Randomize', () => {
    const ring = document.getElementById('ringCount');
    const petals = document.getElementById('petalCount');
    const complexity = document.getElementById('complexity');
    const rotation = document.getElementById('generatorRotation');
    ring.value = String(3 + Math.floor(Math.random() * 7));
    petals.value = String(6 + Math.floor(Math.random() * 25));
    complexity.value = String(1 + Math.floor(Math.random() * 10));
    rotation.value = String(Math.floor(Math.random() * 360));
    [ring, petals, complexity, rotation].forEach((input) => input.dispatchEvent(new Event('input', { bubbles: true })));
    beforeGenerate(() => app.generate());
  });
  randomizeButton.title = 'Choose random generation settings, then create a balanced design';
  action(generateSection, 'Reset settings', () => {
    const defaults = { ringCount: 6, petalCount: 12, complexity: 3, generatorRotation: 0 };
    Object.entries(defaults).forEach(([id, value]) => {
      const input = document.getElementById(id);
      input.value = String(value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    announce('Generator settings reset. Current artwork was kept.');
  });

  const baseValidator = app.validateDocument;
  app.validateDocument = (documentData) => {
    const settings = documentData?.settings;
    if (settings?.kaleidoscope !== undefined && typeof settings.kaleidoscope !== 'boolean') {
      throw new Error('The project contains an invalid kaleidoscope setting.');
    }
    if (settings?.brushStyle !== undefined && !['normal', 'glow', 'neon', 'trail'].includes(settings.brushStyle)) {
      throw new Error('The project contains an invalid brush style.');
    }
    if (settings?.glowIntensity !== undefined && (!Number.isFinite(settings.glowIntensity) || settings.glowIntensity < 0 || settings.glowIntensity > 40)) {
      throw new Error('The project contains an invalid glow setting.');
    }
    if (settings?.trailLength !== undefined && (!Number.isFinite(settings.trailLength) || settings.trailLength < 4 || settings.trailLength > 60)) {
      throw new Error('The project contains an invalid trail setting.');
    }
    if (settings && Number.isFinite(settings.complexity) && settings.complexity > 5 && settings.complexity <= 10) {
      const compatible = JSON.parse(JSON.stringify(documentData));
      compatible.settings.complexity = 5;
      baseValidator(compatible);
      if (settings.book !== undefined) validateBookData(settings.book);
    } else {
      baseValidator(documentData);
      if (settings?.book !== undefined) validateBookData(settings.book);
    }
    let pointCount = 0;
    documentData.scene.forEach((item) => {
      if (item.type !== 'stroke') return;
      pointCount += item.points.length;
      if (pointCount > 1000000) throw new Error('This project contains too many drawing points to open safely.');
      if (item.style !== undefined && !['normal', 'glow', 'neon', 'trail'].includes(item.style)) {
        throw new Error('The project contains an invalid stroke effect.');
      }
      if (item.glow !== undefined && (!Number.isFinite(item.glow) || item.glow < 0 || item.glow > 40)) {
        throw new Error('The project contains an invalid stroke glow.');
      }
      if (item.trailLength !== undefined && (!Number.isFinite(item.trailLength) || item.trailLength < 4 || item.trailLength > 60)) {
        throw new Error('The project contains an invalid stroke trail.');
      }
      if (item.kaleidoscope !== undefined && typeof item.kaleidoscope !== 'boolean') {
        throw new Error('The project contains an invalid stroke symmetry mode.');
      }
      if (item.sectors !== undefined && ![4, 6, 8, 12, 16, 24, 36].includes(item.sectors)) {
        throw new Error('The project contains an invalid stroke sector count.');
      }
      if (item.mirror !== undefined && typeof item.mirror !== 'boolean') {
        throw new Error('The project contains an invalid stroke reflection setting.');
      }
      if (item.rotation !== undefined && (!Number.isFinite(item.rotation) || item.rotation < 0 || item.rotation > 359)) {
        throw new Error('The project contains an invalid stroke rotation.');
      }
    });
  };
  function validateBookData(book) {
    if (!book || typeof book.active !== 'boolean' ||
        !['', 'Floral Mandala', 'Lotus', 'Lotus Mandala', 'Geometric Star', 'Geometric Star Mandala', 'Petal Wheel', 'Petal Wheel Mandala'].includes(book.name) ||
        (book.template !== undefined && !['floral', 'lotus', 'star', 'wheel'].includes(book.template)) ||
        !Array.isArray(book.regions) || book.regions.length > 256 ||
        book.regions.some((region) => !region || !Array.isArray(region.points) ||
          region.points.length < 3 || region.points.length > 100 ||
          region.points.some((point) => !point || !Number.isFinite(point.x) || !Number.isFinite(point.y) ||
            Math.abs(point.x) > 1.2 || Math.abs(point.y) > 1.2) ||
          (region.color !== null && !/^#[0-9a-f]{6}$/i.test(region.color)))) {
      throw new Error('The project has invalid colouring-book regions.');
    }
  }
  const baseRestore = app.restoreData;
  app.restoreData = (project) => {
    if (!project?.settings) throw new Error('The selected project has no drawing settings.');
    const settings = { ...project.settings };
    if (settings.book === undefined) settings.book = { active: false, name: '', regions: [] };
    if (settings.kaleidoscope === undefined) settings.kaleidoscope = true;
    if (!['normal', 'glow', 'neon', 'trail'].includes(settings.brushStyle)) settings.brushStyle = 'normal';
    if (!Number.isFinite(settings.glowIntensity)) settings.glowIntensity = 14;
    if (!Number.isFinite(settings.trailLength)) settings.trailLength = 18;
    if (!settings.bookBackground) settings.bookBackground = settings.background || '#f6f2e9';
    baseRestore({ ...project, settings });
    styleSelect.value = state.brushStyle;
    glowInput.value = state.glowIntensity;
    trailInput.value = state.trailLength;
    bookColor.value = state.color;
    bookBackground.value = state.bookBackground;
    updateEffectControls();
    updateBookTemplateSelection(state.book?.template || 'floral');
  };

  const oldColorInput = document.getElementById('color');
  bookColor.value = oldColorInput.value;
  oldColorInput.addEventListener('input', () => { bookColor.value = oldColorInput.value; });
  document.getElementById('backgroundColor').addEventListener('change', () => {
    bookBackground.value = document.getElementById('backgroundColor').value;
  });
  const bookButton = document.getElementById('mobile');
  if (bookButton) bookButton.setAttribute('aria-label', 'Open drawing controls');
})();
