export interface MovieInfoRes {
  data: MovieInfo;
}

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
  reviews: MovieReviews;
  credits: MovieCredits;
}

export interface MovieVideos {
  results: [
    {
      key: string;
    }
  ];
}

export interface MovieReviews {
  results: [
    {
      author_details: {
        name: string;
        username: string;
        avatar_path: string | null;
        rating: number;
      };
      content: string;
      created_at: string;
      id: string;
    }
  ];
}

export interface MovieCredits {
  cast: MovieCast[];
}

export interface MovieCast {
  id: number;
  gender: 1 | 2;
  name: string;
  profile_path: string;
  character: string;
}
