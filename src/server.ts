import { App } from "@/app";

(() => {
  const app = new App();
  try {
    app.listen();
  } catch (error: any) {
    logging.error(error.message);
  }
})();
