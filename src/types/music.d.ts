interface MusicData {
  music_title: string;
  origin_artist: string;
  mv_aid: number;
  mv_cid: number;
  mv_bvid: string;
  mv_index_order: number;
  mv_fav: number;
  mv_likes: number;
  mv_shares: number;
  mv_cover: string;
  mv_lyric: string;
  support_listen: boolean;
  wish_listen: boolean;
  wish_count: number;
  music_shares: number;
  music_source: string;
  album: string;
  artists: any[];
  listen_pv: number;
  achievement: string[];
  music_rank: string;
  max_list_id: number;
  show_chosen: boolean;
  hot_song_heat: HotSongHeat;
  hot_song_rank: HotSongRank;
  creation_rank: any;
  music_out_url: any;
  ab_test: any;
  music_comment: MusicComment;
  music_material: any;
  is_nextgen_activity: number;
  is_original: number;
  music_hot: number;
  music_relation: number;
  music_publish: string;
  mv_lyric_data?: string; // 手动请求补充
}

interface HotSongHeat {
  last_heat: number;
  song_heat: SongHeat[];
}

interface SongHeat {
  date: number;
  heat: number;
}

interface HotSongRank {
  last_update: number;
  highest_rank: number;
  on_list_times: number;
  list_detail: ListDetail[];
}

interface ListDetail {
  date: number;
  rank: number;
}

interface MusicComment {
  state: number;
  nums: number;
  oid: number;
  page_type: number;
}
