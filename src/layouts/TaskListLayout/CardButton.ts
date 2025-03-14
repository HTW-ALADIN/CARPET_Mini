import type { ComputedRef } from "vue";

export type TaskGridButton = RouteButton | ModalButton;

export interface QButton {
  tooltip?: string | ComputedRef<string>;
  label?: string | ComputedRef<string>;
  icon?: string;
}

export interface RouteButton extends QButton {
  route: string;
}

export interface ModalButton extends QButton {
  modal: object;
}

export const isRouteButton = (
  button: TaskGridButton,
): button is RouteButton => {
  return button.hasOwnProperty("route");
};
export const isModalButton = (
  button: TaskGridButton,
): button is ModalButton => {
  return button.hasOwnProperty("modal");
};
