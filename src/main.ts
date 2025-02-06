import { clockModel$, createClockComponent } from "./watch";

  const clockComponent = createClockComponent("clock-container", clockModel$);
  clockComponent.mount();
  