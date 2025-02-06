import { interval, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

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
};

interface ClockState {
  seconds: number;
  minutes: number;
  hours: number;
}

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

function createSecondsHand(): SVGLineElement {
  const secondsLine = document.createElementNS(SVG_NAMESPACE, "line");
  secondsLine.id = "seconds";
  secondsLine.setAttribute("x1", CENTER_X.toString());
  secondsLine.setAttribute("y1", CENTER_Y.toString());
  secondsLine.setAttribute("x2", CENTER_X.toString());
  secondsLine.setAttribute("y2", (CENTER_Y - clockConfig.radius).toString());
  secondsLine.setAttribute("stroke", clockConfig.secondsHandColor);
  secondsLine.setAttribute("stroke-width", clockConfig.secondsHandWidth.toString());
  return secondsLine;
}

function createMinutesHand(): SVGLineElement {
  const minutesLine = document.createElementNS(SVG_NAMESPACE, "line");
  minutesLine.id = "minutes";
  minutesLine.setAttribute("x1", CENTER_X.toString());
  minutesLine.setAttribute("y1", CENTER_Y.toString());
  minutesLine.setAttribute("x2", CENTER_X.toString());
  minutesLine.setAttribute("y2", (CENTER_Y - clockConfig.radius * 0.8).toString());
  minutesLine.setAttribute("stroke", clockConfig.minutesHandColor);
  minutesLine.setAttribute("stroke-width", clockConfig.minutesHandWidth.toString());
  return minutesLine;
}

function createHoursHand(): SVGLineElement {
  const hoursLine = document.createElementNS(SVG_NAMESPACE, "line");
  hoursLine.id = "hours";
  hoursLine.setAttribute("x1", CENTER_X.toString());
  hoursLine.setAttribute("y1", CENTER_Y.toString());
  hoursLine.setAttribute("x2", CENTER_X.toString());
  hoursLine.setAttribute("y2", (CENTER_Y - clockConfig.radius * 0.5).toString());
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
    view(model, { seconds: secondsLine, minutes: minutesLine, hours: hoursLine })
    );
  
  // Create and mount the clock component
  const clockComponent = createClockComponent('clock-container', clockModel$);
  clockComponent.mount();

  return {
    mount: () => {
      const parent = document.getElementById(parentId);
      if (!parent) throw new Error(`Parent element with id "${parentId}" not found.`);
      parent.appendChild(container);
    },
    unmount: () => {
      subscription.unsubscribe();
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  };
}

// seconds to angle
/**
 * Converts the current second into an angle in degrees.
 * @param seconds - The current second (0-59).
 * @returns The angle in degrees.
 */
function calculateSecondsAngle(seconds: number): number {
    // Converts seconds to a fraction of a minute and then to degrees (360°).
    return (seconds / 60) * 360;
  }

// minutes to angle
/**
 * Converts the current minute and second into an angle in degrees.
 * Adds a smooth adjustment for seconds.
 * @param minutes - The current minute (0-59).
 * @param seconds - The current second (0-59).
 * @returns The angle in degrees.
 */
function calculateMinutesAngle(minutes: number, seconds: number): number {
    // Convert minutes to a fraction of an hour and then to degrees.
    // Adjust by adding a small increment based on the current second.
    return (minutes / 60) * 360 + (seconds / 60) * 6;
  }
  

// hours to angle
/**
 * Converts the current hour and minute into an angle in degrees.
 * Adjusts the hour hand smoothly based on the current minute.
 * @param hours - The current hour (in 24-hour format; e.g., 0-23).
 * @param minutes - The current minute (0-59).
 * @returns The angle in degrees.
 */
function calculateHoursAngle(hours: number, minutes: number): number {
    // For a 12-hour clock, convert the hour into a fraction of 12 hours.
    const adjustedHours = hours % 12;
    // Convert hours to degrees and add an adjustment based on minutes.
    return (adjustedHours / 12) * 360 + (minutes / 60) * 30;
  }

  
function view(model: ClockState, elements: { seconds: SVGLineElement; minutes: SVGLineElement; hours: SVGLineElement }) {
  const { seconds, minutes, hours } = elements;
  
  // Calculate angles for each hand.
  const secondsUpdated = calculateSecondsAngle(model.seconds);
  //const secondsAngle = (model.seconds / 60) * 360;
  //const minutesAngle = (model.minutes / 60) * 360 + (model.seconds / 60) * 6;
  const minutesUpdated = calculateMinutesAngle(model.minutes, model.seconds);
  //const hoursAngle = (model.hours / 12) * 360 + (model.minutes / 60) * 30;
  const hoursUpdated = calculateHoursAngle(model.hours, model.minutes);

  // Update the rotation of each hand.
  seconds.setAttribute("transform", `rotate(${secondsUpdated}, ${CENTER_X}, ${CENTER_Y})`);
  minutes.setAttribute("transform", `rotate(${minutesUpdated}, ${CENTER_X}, ${CENTER_Y})`);
  hours.setAttribute("transform", `rotate(${hoursUpdated}, ${CENTER_X}, ${CENTER_Y})`);
}

// Use the createClockComponent function
const clockModel$: Observable<ClockState> = interval(1000).pipe(
    map(() => {
      const now = new Date();
      return {
        seconds: now.getSeconds(),
        minutes: now.getMinutes(),
        hours: now.getHours() % 12 // Convert to 12-hour format
      };
    })
  );