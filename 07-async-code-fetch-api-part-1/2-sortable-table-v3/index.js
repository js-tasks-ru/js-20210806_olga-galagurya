import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  subElements;
  element;
  elementArrow;
  start = 0;
  end = 20;
  step = 20;
  currentOrder;
  currentID;
  isBusy = false;
  allDataLoaded = false;

  constructor(headersConfig, {
    url = '',
    isSortLocally = false,
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headersConfig;
    this.url = url;
    this.isSortLocally = isSortLocally;
    this.data = Array.isArray(data) ? data : data.data;
    this.sorted = sorted;
    this.renderArrow();
    this.render();
  }

  async getData({
    fieldValue,
    orderValue,
    start = this.start,
    end = this.end
  } = {}) {
    let result;
    let url = new URL(this.url, BACKEND_URL);

    url.searchParams.set('_sort', fieldValue);
    url.searchParams.set('_order', orderValue);
    url.searchParams.set('_start', start.toString());
    url.searchParams.set('_end', end.toString());
    result = await fetchJson(url);

    this.data = this.data.concat(result);


    return result;
  }

  async sortOnServer(fieldValue, orderValue) {
    const data = await this.getData({fieldValue, orderValue});
    this.update(data);

    if (fieldValue) {
      const currentElement = this.subElements.header.querySelector('[data-id="' + fieldValue + '"]');

      currentElement.append(this.elementArrow);
      currentElement.setAttribute('data-order', orderValue);
    }

  }

  async infinityScroll () {
    const {
      scrollTop,
      scrollHeight,
      clientHeight
    } = document.documentElement;

    if ((scrollTop + clientHeight >= scrollHeight - 50) && !this.isBusy && !this.allDataLoaded) {
      let data = [];
      this.isBusy = true;
      this.start = this.end;
      this.end += this.step;

      if (this.isSortLocally) {
        data = await this.getData({'fieldValue': this.sorted.id, 'orderValue': this.sorted.order});
      } else {
        data = await this.getData({'fieldValue': this.currentID, 'orderValue': this.currentOrder});
      }

      this.appendCell(data);
      this.isBusy = false;
      if (data.length < this.step) {
        this.allDataLoaded = true;
      }
    }
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplateContent();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();
    await this.sortOnServer(this.sorted.id, this.sorted.order);
    this.onClickSort();

    window.addEventListener('scroll', () => this.infinityScroll());
  }

  renderArrow() {
    const elementArrow = document.createElement('div');

    elementArrow.innerHTML = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;

    this.elementArrow = elementArrow.firstElementChild;
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

  getTemplateHeaderCells() {
    return this.headerConfig.map((item) => {
      return `
        <div class="sortable-table__cell"
        data-id="${item.id}"
        data-sortable="${item.sortable}"
        data-order="${this.sorted.order}">
          <span>
            ${item.title}
          </span>
        </div>
      `;
    }).join('');
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

  onClickSort() {
    this.subElements.header.addEventListener('pointerdown', (event) => {
      let currentElement = event.target.closest('[data-sortable]');

      if (currentElement.dataset.sortable !== "true") {
        return;
      }

      this.currentOrder = currentElement.dataset.order === "asc" ? "desc" : "asc";
      this.currentID = currentElement.dataset.id;

      if (this.isSortLocally) {
        this.sortOnClient(this.currentID, this.currentOrder);
      } else {
        this.start = 0;
        this.end = 20;
        this.allDataLoaded = false;
        this.sortOnServer(this.currentID, this.currentOrder);
      }
    });
  }

  sortOnClient(fieldValue, orderValue) {
    const data = this.sortData(fieldValue, orderValue);
    const currentElement = this.subElements.header.querySelector('[data-id="' + fieldValue + '"]');

    this.update(data);
    currentElement.append(this.elementArrow);
    currentElement.setAttribute('data-order', orderValue);
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

  update(data) {
    this.subElements.body.innerHTML = this.getTemplateBodyCell(data);
  }
  appendCell (data) {
    const elementCell = document.createElement('div');

    elementCell.innerHTML = this.getTemplateBodyCell(data);

    this.subElements.body.append(...elementCell.childNodes);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = null;
    window.removeEventListener('scroll', () => this.infinityScroll());
  }
}
