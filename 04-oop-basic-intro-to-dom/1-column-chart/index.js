export default class ColumnChart {
  chartHeight = 50;

  constructor(options = {}) {
    this.data = options.data ?? [];
    this.label = options.label;
    this.value = options.value;
    this.link = options.link;
    this.formatHeading = options.formatHeading;

    this.render();
  }

  render() {
    const element = document.createElement('div');
    const viewAll = this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
    const isEmpty = !this.data.length ? 'column-chart_loading' : '';

    element.innerHTML = `
      <div class="column-chart ${isEmpty}" style="--chart-height: 50">
      <div class="column-chart__title">${this.label}${viewAll}</div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
          ${this.formatValue(this.value)}
        </div>
        <div data-element="body" class="column-chart__chart">
          ${this.renderColumns()}
        </div>
      </div>
    </div>
    `;

    this.element = element.firstElementChild;
  }

  formatValue(value) {
    return this.formatHeading ? this.formatHeading(value) : value;
  }

  renderColumns() {
    const max = Math.max(...this.data);
    const scale = this.chartHeight / max;
    const columnChart = [];

    for (let item of this.data) {
      let percent = (item / max * 100).toFixed(0) + '%';
      let val = String(Math.floor(item * scale));

      columnChart.push(`<div style="--value: ${val};" data-tooltip="${percent}"></div>`);
    }
    return columnChart.join('');
  }

  update(data) {
    this.data = data;
    const bodyElement = this.element.querySelector('[data-element="body"]');

    bodyElement.innerHTML = this.renderColumns();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

}
