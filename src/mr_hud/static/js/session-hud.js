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
      font-family: monospace;
    }
    
    table {
      background: rgba(0, 0, 0, 0.2);
      margin-bottom: 0.5rem;
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

  jsonToTable(obj, depth = 0) {
    if (obj === null) return 'null';
    if (typeof obj !== 'object') return String(obj);
    
    const table = document.createElement('table');
    table.style.marginLeft = `${depth * 20}px`;
    table.style.borderCollapse = 'collapse';
    table.style.border = '1px solid #444';
    
    for (const [key, value] of Object.entries(obj)) {
      const row = table.insertRow();
      const keyCell = row.insertCell();
      const valueCell = row.insertCell();
      
      keyCell.style.padding = '4px 8px';
      keyCell.style.borderRight = '1px solid #444';
      keyCell.style.fontWeight = 'bold';
      keyCell.textContent = key;
      
      valueCell.style.padding = '4px 8px';
      if (typeof value === 'object' && value !== null) {
        valueCell.appendChild(this.jsonToTable(value, depth + 1));
      } else {
        valueCell.textContent = String(value);
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
