import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements;
  subCategorySelected;
  categoryOption;
  productData;
  productDataEmpty = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0
  }

  onSave = (event) => {
    event.preventDefault();

    this.save();
  }

  uploadImage = () => {
    const inputFile = document.createElement('input');

    inputFile.type = 'file';
    inputFile.accept = 'image/*';

    inputFile.addEventListener('change', async () => {

      const [file] = inputFile.files;
      const {uploadImage, imageList} = this.subElements;

      if (file) {
        const newForm = new FormData();

        newForm.append('image', file);
        uploadImage.classList.add('is-loading')
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: newForm,
          referrer: ''
        });

        imageList.insertAdjacentHTML('beforeend', this.getImageItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        inputFile.remove();
      }
    });

    inputFile.click();
  }

  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const categoryPromise = this.getCategoryOption();
    const productPromise = this.productId ? this.getProductData() : [this.productDataEmpty];

    const [categoryOption, productData] = await Promise.all([categoryPromise, productPromise]);

    [this.productData] = productData;
    this.subCategorySelected = await this.productData.subcategory;
    this.categoryOption = categoryOption;

    this.renderTemplate();

    this.initEvent();

    return this.element;
  }

  renderTemplate() {
    const element = document.createElement('div');

    element.innerHTML = this.templateContent;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();
  }

  get templateContent() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required=""
                type="text"
                name="title"
                class="form-control"
                placeholder="Название товара"
                value='${this.productData.title}'
                id="title"
              >
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" data-element="productDescription"
                      placeholder="Описание товара" id="description">${this.productData.description}</textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
              <ul class="sortable-list" data-element="imageList">
                ${this.getImageList()}
              </ul>
            </div>
            <button type="button" name="uploadImage" class="button-primary-outline" data-element="uploadImage">
                <span>Загрузить</span>
            </button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory" id="subcategory">
              ${this.getCategoryListOption(this.categoryOption)}
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input
                required=""
                type="number"
                name="price"
                class="form-control"
                placeholder="100"
                value="${this.productData.price}"
                id="price"
              >
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input
                required=""
                type="number"
                name="discount"
                class="form-control"
                placeholder="0"
                value="${this.productData.discount}"
                id="discount"
              >
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input
              required=""
              type="number"
              class="form-control"
              name="quantity"
              placeholder="1"
              value="${this.productData.quantity}"
              id="quantity"
            >
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" id="status">
              <option value="1" ${this.productData.status? 'selected' : ''}>Активен</option>
              <option value="0" ${!this.productData.status ? 'selected' : ''}>Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ?  'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product)
      });
      this.dispatchEvent(result.id);
    } catch (e) {
      console.error('error', e);
    }
  }

  getFormData() {
    const { productForm, imageList} = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.productDataEmpty).filter(item => !excludedFields.includes(item));
    const getValue = field => productForm.querySelector(`[name=${field}]`).value;
    const values = {};

    for (const field of fields) {
      const value = getValue(field);

      values[field] = formatToNumber.includes(field)
        ? parseInt(value)
        : value;
    }

    const imagesHTMLCollection = imageList.querySelectorAll('.sortable-table__cell-img');

    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return values;
  }

  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  async getProductData() {
    let url = new URL('/api/rest/products', BACKEND_URL);

    url.searchParams.set('id', this.productId);

    return await fetchJson(url);
  }

  async getCategoryOption() {
    let url = new URL('/api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    return await fetchJson(url);
  }

  getCategoryListOption(dataOption) {
    const listCategory = dataOption.map((itemCategory) => {
      return itemCategory.subcategories.map((subCategory) => {
        let selected = this.productData.subcategory === subCategory.id ? 'selected': '';

        return `
          <option value="${subCategory.id}" ${selected}>
              ${itemCategory.title} > ${subCategory.title}
          </option>
        `;
      }).join('');
    });

    return listCategory;
  }

  getImageList() {
    if (!this.productData.images) {
      return;
    }
    let listImage = this.productData.images.map((item) => {
      return this.getImageItem(item.url, item.source);
    }).join('');

    return listImage;
  }

  getImageItem(url, source) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${url}">
          <input type="hidden" name="source" value="${source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${url}">
          <span>${source}</span>
          </span>
          <button type="button" data-element="delete-element">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>
    `;
  }

  getSubElements() {
    const elements = [...this.element.querySelectorAll('[data-element]')];
    return elements.reduce((obj, item) => {
      obj[item.dataset.element] = item;
      return obj;
    }, {});
  }

  initEvent() {
    this.subElements.uploadImage.addEventListener('click', this.uploadImage);
    this.subElements.productForm.addEventListener('submit', this.onSave);

    this.subElements.imageList.addEventListener('click', (event) => {
      let currentElement = event.target.closest('[data-delete-handle]');

      if (currentElement) {
        currentElement.closest('.sortable-list__item').remove();
      }
    });

  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = null;
  }
}
