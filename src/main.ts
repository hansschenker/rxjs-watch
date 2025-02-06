import { clockModel$ } from "./clock.model";
import { createClockComponent } from "./clock.view";

const clockComponent = createClockComponent("clock-container", clockModel$);
clockComponent.mount();
