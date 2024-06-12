interface VideoData {
  bvid: string;
  aid: number;
  videos: number;
  tid: number;
  tname: string;
  copyright: number;
  pic: string;
  title: string;
  pubdate: number;
  ctime: number;
  desc: string;
  desc_v2: DescV2[];
  state: number;
  duration: number;
  mission_id: number;
  rights: Rights;
  owner: Owner;
  stat: Stat;
  argue_info: ArgueInfo;
  dynamic: string;
  cid: number;
  dimension: Dimension;
  season_id: number;
  premiere: any;
  teenage_mode: number;
  is_chargeable_season: boolean;
  is_story: boolean;
  is_upower_exclusive: boolean;
  is_upower_play: boolean;
  is_upower_preview: boolean;
  enable_vt: number;
  vt_display: string;
  no_cache: boolean;
  pages: Page[];
  subtitle: Subtitle;
  label: Label;
  ugc_season: UgcSeason;
  is_season_display: boolean;
  user_garb: UserGarb;
  honor_reply: HonorReply;
  like_icon: string;
  need_jump_bv: boolean;
  disable_show_up_info: boolean;
  is_story_play: number;
  embedPlayer: EmbedPlayer;
}

interface DescV2 {
  raw_text: string;
  type: number;
  biz_id: number;
}

interface Rights {
  bp: number;
  elec: number;
  download: number;
  movie: number;
  pay: number;
  hd5: number;
  no_reprint: number;
  autoplay: number;
  ugc_pay: number;
  is_cooperation: number;
  ugc_pay_preview: number;
  no_background: number;
  clean_mode: number;
  is_stein_gate: number;
  is_360: number;
  no_share: number;
  arc_pay: number;
  free_watch: number;
}

interface Owner {
  mid: number;
  name: string;
  face: string;
}

interface Stat {
  aid: number;
  view: number;
  danmaku: number;
  reply: number;
  favorite: number;
  coin: number;
  share: number;
  now_rank: number;
  his_rank: number;
  like: number;
  dislike: number;
  evaluation: string;
  vt: number;
  viewseo: number;
  age: string;
}

interface ArgueInfo {
  argue_msg: string;
  argue_type: number;
  argue_link: string;
}

interface Dimension {
  width: number;
  height: number;
  rotate: number;
}

interface Page {
  cid: number;
  page: number;
  from: string;
  part: string;
  duration: number;
  vid: string;
  weblink: string;
  dimension: Dimension2;
  first_frame: string;
}

interface Dimension2 {
  width: number;
  height: number;
  rotate: number;
}

interface Subtitle {
  allow_submit: boolean;
  list: any[];
}

interface Label {
  type: number;
}

interface UgcSeason {
  id: number;
  title: string;
  cover: string;
  mid: number;
  intro: string;
  sign_state: number;
  attribute: number;
  sections: Section[];
  stat: Stat3;
  ep_count: number;
  season_type: number;
  is_pay_season: boolean;
  enable_vt: number;
}

interface Section {
  season_id: number;
  id: number;
  title: string;
  type: number;
  episodes: Episode[];
  isActive: boolean;
  height: number;
}

interface Episode {
  season_id: number;
  section_id: number;
  id: number;
  aid: number;
  cid: number;
  title: string;
  attribute: number;
  arc: Arc;
  page: Page2;
  bvid: string;
}

interface Arc {
  aid: number;
  videos: number;
  type_id: number;
  type_name: string;
  copyright: number;
  pic: string;
  title: string;
  pubdate: number;
  ctime: number;
  desc: string;
  state: number;
  duration: number;
  rights: Rights2;
  author: Author;
  stat: Stat2;
  dynamic: string;
  dimension: Dimension3;
  desc_v2: any;
  is_chargeable_season: boolean;
  is_blooper: boolean;
  enable_vt: number;
  vt_display: string;
}

interface Rights2 {
  bp: number;
  elec: number;
  download: number;
  movie: number;
  pay: number;
  hd5: number;
  no_reprint: number;
  autoplay: number;
  ugc_pay: number;
  is_cooperation: number;
  ugc_pay_preview: number;
  arc_pay: number;
  free_watch: number;
}

interface Author {
  mid: number;
  name: string;
  face: string;
}

interface Stat2 {
  aid: number;
  view: number;
  danmaku: number;
  reply: number;
  fav: number;
  coin: number;
  share: number;
  now_rank: number;
  his_rank: number;
  like: number;
  dislike: number;
  evaluation: string;
  argue_msg: string;
  vt: number;
  vv: number;
}

interface Dimension3 {
  width: number;
  height: number;
  rotate: number;
}

interface Page2 {
  cid: number;
  page: number;
  from: string;
  part: string;
  duration: number;
  vid: string;
  weblink: string;
  dimension: Dimension4;
}

interface Dimension4 {
  width: number;
  height: number;
  rotate: number;
}

interface Stat3 {
  season_id: number;
  view: number;
  danmaku: number;
  reply: number;
  fav: number;
  coin: number;
  share: number;
  now_rank: number;
  his_rank: number;
  like: number;
  vt: number;
  vv: number;
}

interface UserGarb {
  url_image_ani_cut: string;
}

interface HonorReply {
  honor: Honor[];
}

interface Honor {
  aid: number;
  type: number;
  desc: string;
  weekly_recommend_num: number;
}

interface EmbedPlayer {
  p: number;
  aid: number;
  bvid: string;
  cid: number;
  vid: string;
  vtype: string;
  stats: Stats;
  t: number;
  fromDid: any;
  featureList: string[];
}

interface Stats {
  spmId: string;
  spmIdFrom: string;
}
