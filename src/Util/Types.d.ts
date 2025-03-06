export type Base64<imageType extends string = "png"> =
  `data:image/${imageType};base64${string}`;
// const base64: Base64<'png'> = 'data:image/png;base64test...'
