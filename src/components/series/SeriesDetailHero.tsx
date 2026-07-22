/**
 * Shared series details view-model type.
 *
 * The original `SeriesDetailHero` presentational component was removed as dead code
 * (superseded by the A/B/C/D layout shells in `./layouts/`, which each compose their
 * own hero/cover treatment from `SeriesDetailCover` + `SeriesDetailTitleBlock`). This
 * type is still imported across the series details feature, so it is kept here to
 * avoid a wider rename.
 */
export interface SeriesDetailViewModel {
  id: string;
  title: string;
  alt_title?: string | null;
  description?: string | null;
  author?: string | null;
  artist?: string | null;
  cover_image_url?: string | null;
  status?: string | null;
  genres?: string[] | null;
  tags?: string[] | null;
  content_type?: string | null;
  format?: string | null;
  rating_average?: number | null;
  rating_count?: number | null;
  view_count?: number | null;
  followers_count?: number | null;
  language?: string | null;
  publication_date?: string | null;
  updated_at?: string | null;
  age_rating?: string | null;
}
