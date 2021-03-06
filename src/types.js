export type ChainOptions = {
  delay:           number,
  currentDuration: number,
  totalDuration:   number
};

export type EasingFunction = (currentIteration: number, beginningValue: number, changeInValue: number, duration: number) => number;

export type AnimationType = Immutable<{
  currentIteration: number,
  startValue:       number,
  changeInValue:    number,
  totalIterations:  number,
  easingFunction:   EasingFunction,
  delay:            number,
  looping:          boolean,
  wait:             number
}>;

export type AttributeType = Immutable<{
  model:      number,
  animations: Array<Animation>
}>;

export type ElementType = Immutable<{
  attributes: { [attributeName: string]: Attribute }
}>;

export type HookFunction = () => void;

export type HookType = Immutable<{
  hook:             HookFunction,
  currentIteration: number,
  delay:            number,
  looping:          boolean,
  wait:             number,
  called:           boolean
}>;

export type ConstructorOptions = {
  delay:          number,
  easingFunction: EasingFunction,
  duration:       number
};
