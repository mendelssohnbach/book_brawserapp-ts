import { EventListener } from './EventListener';

class Application {
  private readonly eventListener = new EventListener();

  start() {
    const eventListener = new EventListener();
    const button = document.getElementById('deleteAllDoneTask');

    if (!button) return;

    eventListener.add('sample', 'click', button, () => alert('clicked'));

    eventListener.remove('sample');

    const createForm = document.getElementById('createForm') as HTMLElement;

    this.eventListener.add('submit-handler', 'submit', createForm, this.handleSubmit);
  }

  private handleSubmit = (e: Event) => {
    e.preventDefault();
    console.log('submitted');
  };
}

window.addEventListener('load', () => {
  const app = new Application();
  app.start();
});
