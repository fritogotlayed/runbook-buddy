import { JSX } from 'preact';

export interface EventWithValue extends Event {
  target: EventTarget & {
    value: string;
  };
}

export type InputEventWithValue = JSX.TargetedEvent<
  HTMLInputElement,
  EventWithValue
>;
