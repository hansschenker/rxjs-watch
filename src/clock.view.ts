import { Observable, Subscription } from "rxjs";
import { ClockState } from "./clock.model";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const CENTER_X = 100;
const CENTER_Y = 100;
const clockConfig = {
  width: 200,
  height: 200,
  radius: 90,
  secondsHandColor: "#f00",
  secondsHandWidth: 2,
  minutesHandColor: "#000",
  minutesHandWidth: 4,
  hoursHandColor: "#000",
  hoursHandWidth: 6,
  progressColor: "#00f",
  progressWidth: 4,
};

function createSvgElement(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.setAttribute("width", clockConfig.width.toString());
  svg.setAttribute("height", clockConfig.height.toString());
  svg.style.backgroundColor = "#eee";
  svg.style.margin = "50px";
  svg.style.borderRadius = "50%";
  svg.style.boxShadow = "1px 2px 3px #bbb";
  svg.id = "display-svg";
  return svg;
}

function createBackgroundCircle(): SVGCircleElement {
  const bg = document.createElementNS(SVG_NAMESPACE, "circle");
  bg.setAttribute("r", clockConfig.radius.toString());
  bg.setAttribute("cx", CENTER_X.toString());
  bg.setAttribute("cy", CENTER_Y.toString());
  bg.setAttribute("fill", "#fff");
  bg.setAttribute("stroke", "#bbb");
  bg.setAttribute("stroke-width", "4");
  return bg;
}

function createProgressCircle(): SVGCircleElement {
  const progressCircle = document.createElementNS(SVG_NAMESPACE, "circle");
  progressCircle.setAttribute("r", clockConfig.radius.toString());
  progressCircle.setAttribute("cx", CENTER_X.toString());
  progressCircle.setAttribute("cy", CENTER_Y.toString());
  progressCircle.setAttribute("fill", "none");
  progressCircle.setAttribute("stroke", clockConfig.progressColor);
  progressCircle.setAttribute(
    "stroke-width",
    clockConfig.progressWidth.toString()
  );
  progressCircle.setAttribute(
    "stroke-dasharray",
    `${2 * Math.PI * clockConfig.radius}`
  );
  progressCircle.setAttribute(
    "stroke-dashoffset",
    `${2 * Math.PI * clockConfig.radius}`
  );
  progressCircle.setAttribute(
    "transform",
    `rotate(-90, ${CENTER_X}, ${CENTER_Y})`
  ); // Rotate to start at 12 o'clock
  return progressCircle;
}

function createSecondsHand(): SVGLineElement {
  const secondsLine = document.createElementNS(SVG_NAMESPACE, "line");
  secondsLine.id = "seconds";
  secondsLine.setAttribute("x1", CENTER_X.toString());
  secondsLine.setAttribute("y1", CENTER_Y.toString());
  secondsLine.setAttribute("x2", CENTER_X.toString());
  secondsLine.setAttribute("y2", (CENTER_Y - clockConfig.radius).toString());
  secondsLine.setAttribute("stroke", clockConfig.secondsHandColor);
  secondsLine.setAttribute(
    "stroke-width",
    clockConfig.secondsHandWidth.toString()
  );
  return secondsLine;
}

function createMinutesHand(): SVGLineElement {
  const minutesLine = document.createElementNS(SVG_NAMESPACE, "line");
  minutesLine.id = "minutes";
  minutesLine.setAttribute("x1", CENTER_X.toString());
  minutesLine.setAttribute("y1", CENTER_Y.toString());
  minutesLine.setAttribute("x2", CENTER_X.toString());
  minutesLine.setAttribute(
    "y2",
    (CENTER_Y - clockConfig.radius * 0.8).toString()
  );
  minutesLine.setAttribute("stroke", clockConfig.minutesHandColor);
  minutesLine.setAttribute(
    "stroke-width",
    clockConfig.minutesHandWidth.toString()
  );
  return minutesLine;
}

function createHoursHand(): SVGLineElement {
  const hoursLine = document.createElementNS(SVG_NAMESPACE, "line");
  hoursLine.id = "hours";
  hoursLine.setAttribute("x1", CENTER_X.toString());
  hoursLine.setAttribute("y1", CENTER_Y.toString());
  hoursLine.setAttribute("x2", CENTER_X.toString());
  hoursLine.setAttribute(
    "y2",
    (CENTER_Y - clockConfig.radius * 0.5).toString()
  );
  hoursLine.setAttribute("stroke", clockConfig.hoursHandColor);
  hoursLine.setAttribute("stroke-width", clockConfig.hoursHandWidth.toString());
  return hoursLine;
}

function createCenterPin(): SVGCircleElement {
  const pin = document.createElementNS(SVG_NAMESPACE, "circle");
  pin.setAttribute("r", "5");
  pin.setAttribute("cx", CENTER_X.toString());
  pin.setAttribute("cy", CENTER_Y.toString());
  pin.setAttribute("fill", "#333");
  return pin;
}

export function createClockComponent(
  parentId: string,
  model$: Observable<ClockState>
): { mount: () => void; unmount: () => void } {
  const container = document.createElement("div");
  container.className = "clock-component";

  // Create SVG element.
  const svg = createSvgElement();
  container.appendChild(svg);

  // Background circle.
  const bg = createBackgroundCircle();
  svg.appendChild(bg);

  // Progress circle.
  const progressCircle = createProgressCircle();
  svg.appendChild(progressCircle);

  // Seconds hand.
  const secondsLine = createSecondsHand();
  svg.appendChild(secondsLine);

  // Minutes hand.
  const minutesLine = createMinutesHand();
  svg.appendChild(minutesLine);

  // Hours hand.
  const hoursLine = createHoursHand();
  svg.appendChild(hoursLine);

  // Center pin.
  const pin = createCenterPin();
  svg.appendChild(pin);

  // Subscribe to MVU model observable.
  const subscription: Subscription = model$.subscribe((model) =>
    view(model, {
      seconds: secondsLine,
      minutes: minutesLine,
      hours: hoursLine,
      progress: progressCircle,
    })
  );

  return {
    mount: () => {
      const parent = document.getElementById(parentId);
      if (!parent)
        throw new Error(`Parent element with id "${parentId}" not found.`);
      parent.appendChild(container);
    },
    unmount: () => {
      subscription.unsubscribe();
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    },
  };
}

function calculateSecondsAngle(seconds: number): number {
  // Converts seconds to a fraction of a minute and then to degrees (360°).
  return (seconds / 60) * 360;
}

function calculateMinutesAngle(minutes: number, seconds: number): number {
  // Convert minutes to a fraction of an hour and then to degrees.
  // Adjust by adding a small increment based on the current second.
  return (minutes / 60) * 360 + (seconds / 60) * 6;
}

function calculateHoursAngle(hours: number, minutes: number): number {
  // For a 12-hour clock, convert the hour into a fraction of 12 hours.
  const adjustedHours = hours % 12;
  // Convert hours to degrees and add an adjustment based on minutes.
  return (adjustedHours / 12) * 360 + (minutes / 60) * 30;
}

function view(
  model: ClockState,
  elements: {
    seconds: SVGLineElement;
    minutes: SVGLineElement;
    hours: SVGLineElement;
    progress: SVGCircleElement;
  }
) {
  const { seconds, minutes, hours, progress } = elements;

  // Calculate angles for each hand.
  const secondsAngle = calculateSecondsAngle(model.seconds);
  const minutesAngle = calculateMinutesAngle(model.minutes, model.seconds);
  const hoursAngle = calculateHoursAngle(model.hours, model.minutes);

  // Update the rotation of each hand.
  seconds.setAttribute(
    "transform",
    `rotate(${secondsAngle}, ${CENTER_X}, ${CENTER_Y})`
  );
  minutes.setAttribute(
    "transform",
    `rotate(${minutesAngle}, ${CENTER_X}, ${CENTER_Y})`
  );
  hours.setAttribute(
    "transform",
    `rotate(${hoursAngle}, ${CENTER_X}, ${CENTER_Y})`
  );

  // Update the progress circle.
  const progressOffset =
    (1 - model.seconds / 60) * (2 * Math.PI * clockConfig.radius);
  progress.setAttribute("stroke-dashoffset", progressOffset.toString());
}
