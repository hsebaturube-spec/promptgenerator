export enum ImageStyle {
  REALISTIC = 'Realistic',
  CARTOON = 'Cartoon',
  OIL_PAINTING = 'Oil Painting',
  ANIME = 'Anime',
  SCI_FI = 'Sci-Fi',
  FANTASY = 'Fantasy',
  SKETCH = 'Sketch',
  CYBERPUNK = 'Cyberpunk',
  WATERCOLOR = 'Watercolor'
}

export enum CharacterPosition {
  STANDING = 'Standing',
  SITTING = 'Sitting',
  RUNNING = 'Running',
  JUMPING = 'Jumping',
  RELAXING = 'Relaxing',
  ACTION_POSE = 'Action Pose',
  CLOSE_UP = 'Close-up Face',
  FULL_BODY = 'Full Body Shot'
}

export enum ImageAspectRatio {
  ONE_TO_ONE = '1:1',
  THREE_TO_FOUR = '3:4',
  FOUR_TO_THREE = '4:3',
  NINE_TO_SIXTEEN = '9:16',
  SIXTEEN_TO_NINE = '16:9'
}

export interface SelectOption {
  value: string;
  label: string;
}
