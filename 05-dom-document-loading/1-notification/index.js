export default class NotificationMessage {
  /**
   * @type {?NotificationMessage}
   */
  static current = null;

  element;
  timerId = null;

  constructor(title = '', {duration = 1, type = ''} = {}) {
    this.title = title;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.title}
          </div>
        </div>
      </div>
    `;

    this.element = element.firstElementChild;
  }

  show(wrapper) {
    if (NotificationMessage.current) {
      NotificationMessage.current.remove();
    }

    NotificationMessage.current = this;
    if (!wrapper) {
      wrapper = document.querySelector('body');
    }

    wrapper.append(this.element);

    this.timerId = setTimeout(() => this.remove(), this.duration);

  }

  remove() {
    this.element.remove();
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }

  destroy() {
    this.remove();
  }
}
