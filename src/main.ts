import { clockModel$ } from "./clockModel";
import { createClockComponent } from "./watch";

  const clockComponent = createClockComponent("clock-container", clockModel$);
  clockComponent.mount();
  