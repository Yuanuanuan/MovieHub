export interface MovieInfoRes {
  data: MovieInfo;
}

/** 電影的資料 */
export interface MovieInfo {
  id: string;
  poster_path: string;
  overview: string;
  title: string;
  release_date: string;
  vote_average: number;
  runtime: number;
}

export interface IMovieDetails extends MovieInfo {
  videos: MovieVideos;
  credits: MovieCredits;
}

/** 電影的影片資料 */
export interface MovieVideos {
  results: [
    {
      key: string;
    }
  ];
}

/** 電影的卡司資料格式 */
export interface MovieCredits {
  cast: MovieCast[];
}

/** 電影的卡司資料 */
export interface MovieCast {
  id: number;
  gender: 1 | 2;
  name: string;
  profile_path: string;
  character: string;
}

/** 獲取演員的社群資料回傳格式 */
export interface PersonInfoRes {
  data: PersonInfo;
}

/** 演員的資料 */
export interface PersonInfo {
  id: number;
  gender: 1 | 2;
  name: string;
  place_of_birth: string;
  profile_path: string;
  birthday: string;
  external_ids: PersonExternalIds;
  movie_credits: PersonCredits;
}

/** 演員的社群資料 */
export interface PersonExternalIds {
  facebook_id: string | null;
  imdb_id: string | null;
  instagram_id: string | null;
  tiktok_id: string | null;
  twitter_id: string | null;
  wikidata_id: string | null;
  youtube_id: string | null;
}

/** 演員的卡司資料 */
export interface PersonCredits {
  cast: MovieInfo[];
}
