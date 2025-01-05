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
      background: rgba(0, 0, 0, 0.2);
      margin-bottom: 0.5rem;
      border-collapse: separate;
      border-spacing: 0;
    }

    td {
      border: 1px solid #444;
      vertical-align: top;
      padding: 4px 8px;
    }

    /* Key cells */
    td:first-child {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 500;
      color: #9ecbff;
      white-space: nowrap;
      background: rgba(0, 0, 0, 0.2);
    }

    /* Value cells */
    td:last-child {
      font-family: 'Fira Code', 'Consolas', monospace;
      min-width: 150px;
    }

    .string-value {
      color: #a8ff60;
    }

    .number-value {
      color: #ff7b72;
    }

    .date-value {
      color: #d2a8ff;
    }

    .boolean-value {
      color: #ff7b72;
      font-weight: bold;
    }

    .null-value {
      color: #676767;
      font-style: italic;
    }

    /* Nested tables */
    table table {
      margin: 0;
      width: 100%;
      background: transparent;
    }

    /* Hover effects */
    tr:hover > td {
      background: rgba(255, 255, 255, 0.03);
    }
  `;

  constructor() {
    super();
    this.data = null;
    this.fetchSessionData();
    
    // Set up periodic refresh
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
      // Check if string is a date
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
    table.style.marginLeft = `${depth * 16}px`;
    
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
