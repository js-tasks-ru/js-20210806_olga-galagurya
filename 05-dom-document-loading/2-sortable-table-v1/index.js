export default class SortableTable {
  subElements;
  element;

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = Array.isArray(data) ? data : data.data;
    this.render();
    this.subElements = this.getSubElements();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplateContent();

    this.element = element.firstElementChild;
  }

  getTemplateContent() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
            ${this.getTemplateHeader()}
            ${this.getTemplateBody()}
        </div>
      </div>
    `;
  }

  getTemplateHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getTemplateHeaderCells()}
      </div>
    `;
  }

  getTemplateHeaderCells(fieldValue = '', orderValue = '') {
    return this.headerConfig.map((item) => {
      return `
        <div class="sortable-table__cell"
        data-id="${item.id}"
        data-sortable="${item.sortable}"
        data-order="${orderValue}">
          <span>
            ${item.title}
          </span>
          ${this.getTemplateHeaderArrow(fieldValue, item.id)}
        </div>
      `;
    }).join('');

  }

  getTemplateHeaderArrow(fieldValue, id) {
    if (fieldValue !== id) {
      return '';
    }

    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  getTemplateBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTemplateBodyCell(this.data)}
      </div>
    `;
  }

  getTemplateBodyCell(data) {
    return data.map((dataItem) => {
      let content = this.headerConfig.map((headerItem) => {
        return headerItem.template
          ? headerItem.template(dataItem[headerItem.id])
          : `<div class="sortable-table__cell">${dataItem[headerItem.id]}</div>`;
      }).join('');

      return `
        <a href="/products/${dataItem.id}" class="sortable-table__row">
          ${content}
        </a>
      `;
    }).join('');
  }

  getSubElements() {
    const elements = [...this.element.querySelectorAll('[data-element]')];
    return elements.reduce((obj, item) => {
      obj[item.dataset.element] = item;
      return obj;
    }, {});
  }

  sort(fieldValue, orderValue) {
    const data = this.sortData(fieldValue, orderValue);
    this.update(data, fieldValue, orderValue);
  }

  sortData(fieldValue, orderValue) {
    const order = {
      'asc': 1,
      'desc': -1
    };
    const sortData = [...this.data];
    let sortType = this.headerConfig.find((item) => item.id === fieldValue);

    sortData.sort(function (str1, str2) {
      switch (sortType.sortType) {
        case 'string' :
          return str1[fieldValue].localeCompare(str2[fieldValue], ['ru', 'en'], {caseFirst: "upper"}) * order[orderValue];
        case 'number' :
        default:
          return (str1[fieldValue] - str2[fieldValue]) * order[orderValue];
      }
    });

    return sortData;
  }

  update(data, fieldValue, orderValue) {
    this.subElements.body.innerHTML = this.getTemplateBodyCell(data);
    this.subElements.header.innerHTML = this.getTemplateHeaderCells(fieldValue, orderValue);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

