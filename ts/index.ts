class Application {
  start() {
    const button = document.getElementById('deleteAndDoneTask');

    if (!button) {
      console.log(button);
    }
  }
}

window.addEventListener('load', () => {
  const app = new Application();
  app.start();
});
