import { CharacterPosition, ImageAspectRatio, ImageStyle, SelectOption } from './types';

export const IMAGE_STYLE_OPTIONS: SelectOption[] = Object.values(ImageStyle).map(
  (style) => ({
    value: style,
    label: style,
  })
);

export const CHARACTER_POSITION_OPTIONS: SelectOption[] = Object.values(CharacterPosition).map(
  (position) => ({
    value: position,
    label: position,
  })
);

export const IMAGE_ASPECT_RATIO_OPTIONS: SelectOption[] = Object.values(ImageAspectRatio).map(
  (ratio) => ({
    value: ratio,
    label: ratio,
  })
);

// Placeholder image URL
export const PLACEHOLDER_IMAGE_URL = 'https://picsum.photos/400/300';
