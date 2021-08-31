class Tooltip {
  static instance;
  element;
  isInitialized = false;

  onPointerOver = (event) => {
    let currentElement = event.target.closest('[data-tooltip]');
    let currentElementText;

    if (!(currentElement && currentElement.dataset.tooltip)) {
      return;
    }
    currentElementText = currentElement.dataset.tooltip;

    this.render(currentElementText);
  }

  onPointerOut = () => {
    this.remove();
    document.removeEventListener('mousemove', this.moveTooltip);
  }

  moveTooltip = (event) => {
    let shift = 20;

    this.element.style.top = event.offsetY + shift + 'px';
    this.element.style.left = event.offsetX + shift + 'px';
  }

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initialize() {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  render(text) {
    const element = document.createElement('div');

    element.innerHTML = `<div class="tooltip">${text}</div>`;

    this.element = element.firstElementChild;

    document.querySelector('body').append(this.element);
    document.addEventListener('mousemove', this.moveTooltip);
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  destroy() {
    this.remove();
    this.isInitialized = false;
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);
  }
}

export default Tooltip;
