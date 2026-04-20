export type AddSongDto = {
  title: string;
  artist: string;
  song: Express.Multer.File;
  artwork: Express.Multer.File;
};
