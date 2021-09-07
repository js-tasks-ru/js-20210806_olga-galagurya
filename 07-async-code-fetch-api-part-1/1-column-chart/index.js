import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  data;
  element;
  subElements;

  constructor(options = {}) {
    this.url = options.url ? options.url : '';
    this.range = options.range ? options.range : {from: '', to: ''};
    this.label = options.label;
    this.link = options.link;
    this.value = options.value || 0;
    this.formatHeading = options.formatHeading;
    this.render();

    const { from, to } = options.range ?? {};
    this.update(from, to);
  }

  render() {
    const element = document.createElement('div');
    const viewAll = this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';

    element.innerHTML = `
      <div class="column-chart column-chart_loading" style="--chart-height: 50">
      <div class="column-chart__title">${this.label}${viewAll}</div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
          ${this.value}
        </div>
        <div data-element="body" class="column-chart__chart">
          ${this.renderColumns()}
        </div>
      </div>
    </div>
    `;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }

  renderColumns() {
    const dataValue = this.data ? Object.values(this.data) : [];
    const max = Math.max(...dataValue);
    const scale = this.chartHeight / max;
    const columnChart = [];

    for (let item of dataValue) {
      let percent = (item / max * 100).toFixed(0) + '%';
      let val = String(Math.floor(item * scale));

      columnChart.push(`<div style="--value: ${val};" data-tooltip="${percent}"></div>`);
    }
    return columnChart.join('');
  }

  async update(from, to) {
    let url = new URL(this.url, BACKEND_URL);

    url.searchParams.set('from', from && from.toISOString());
    url.searchParams.set('to', to && to.toISOString());

    this.element.classList.add('column-chart_loading');
    this.data = await fetchJson(url);

    if (this.data) {
      this.element.classList.remove('column-chart_loading');
      const dataValue = Object.values(this.data).reduce(function(sum, current) {
        return sum + current;
      }, 0);

      this.subElements.header.innerHTML = this.formatHeading ? this.formatHeading(dataValue) : dataValue;
      this.subElements.body.innerHTML = this.renderColumns();
    }
    return this.data;
  }

  getSubElements() {
    const elements = [...this.element.querySelectorAll('[data-element]')];
    return elements.reduce((obj, item) => {
      obj[item.dataset.element] = item;
      return obj;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
