import { LitElement, html, css } from '/chat/static/js/lit-core.min.js';
import { unsafeHTML } from '/chat/static/js/lit-html/directives/unsafe-html.js';

class SessionHUD extends LitElement {
  static properties = {
    data: { type: Object },
  };

  static styles = css`
    .sesshudtable {
      background: var(--workspace-bg, var(--background-color, #1e1e1e));
      color: var(--workspace-text, var(--text-color, #e0e0e0));
      padding: 1rem;
      overflow-y: scroll;
      height: 35vh;
      padding-top: 0;
    }
    
    table {
      border-collapse: collapse;
      background: rgba(0, 0, 0, 0.2);
    }

    td {
      padding: 4px 8px;
      border: 1px solid #444;
      vertical-align: top;
    }

    /* Key cells */
    td:first-child {
      color: #9ecbff;
      font-family: sans-serif;
    }

    /* Value cells */
    td:last-child {
      font-family: monospace;
    }

    .string-value { color: #a8ff60; }
    .number-value { color: #ff7b72; }
    .date-value { color: #d2a8ff; }
    .boolean-value { color: #ff7b72; }
    .null-value { color: #676767; }
  `;

  constructor() {
    super();
    this.data = null;
    this.fetchSessionData();
    setInterval(() => this.fetchSessionData(), 5000);
  }

  async fetchSessionData() {
    try {
      const response = await fetch(`/session_data/${window.log_id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      this.data = data;
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  }

  formatValue(value) {
    if (value === null) return ['null', 'null-value'];
    if (typeof value === 'string') {
      const dateTest = new Date(value);
      if (!isNaN(dateTest) && value.includes('-')) {
        return [value, 'date-value'];
      }
      return [value, 'string-value'];
    }
    if (typeof value === 'number') return [value.toString(), 'number-value'];
    if (typeof value === 'boolean') return [value.toString(), 'boolean-value'];
    return [String(value), ''];
  }

  jsonToTable(obj, depth = 0) {
    if (obj === null) return 'null';
    if (typeof obj !== 'object') return String(obj);
    
    const table = document.createElement('table');
    
    for (const [key, value] of Object.entries(obj)) {
      const row = table.insertRow();
      const keyCell = row.insertCell();
      const valueCell = row.insertCell();
      
      keyCell.textContent = key;
      
      if (typeof value === 'object' && value !== null) {
        valueCell.appendChild(this.jsonToTable(value, depth + 1));
      } else {
        const [formattedValue, valueClass] = this.formatValue(value);
        valueCell.textContent = formattedValue;
        if (valueClass) {
          valueCell.classList.add(valueClass);
        }
      }
    }
    
    return table;
  }

  render() {
    return html`
      <div class="sesshudtable">
        ${this.data ? 
          unsafeHTML(this.jsonToTable(this.data).outerHTML) :
          'Loading session data...'}
      </div>
    `;
  }
}

customElements.define('session-hud', SessionHUD);
