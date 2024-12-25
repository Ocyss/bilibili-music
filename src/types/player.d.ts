interface PlayerData {
  aid: number;
  bvid: string;
  allow_bp: boolean;
  no_share: boolean;
  cid: number;
  max_limit: number;
  page_no: number;
  has_next: boolean;
  ip_info: IpInfo;
  login_mid: number;
  login_mid_hash: string;
  is_owner: boolean;
  name: string;
  permission: string;
  level_info: LevelInfo;
  vip: Vip;
  answer_status: number;
  block_time: number;
  role: string;
  last_play_time: number;
  last_play_cid: number;
  now_time: number;
  online_count: number;
  need_login_subtitle: boolean;
  subtitle: Subtitle;
  view_points: any[];
  preview_toast: string;
  options: Options;
  guide_attention: any[];
  jump_card: any[];
  operation_card: any[];
  online_switch: OnlineSwitch;
  fawkes: Fawkes;
  show_switch: ShowSwitch;
  bgm_info: BgmInfo;
  toast_block: boolean;
  is_upower_exclusive: boolean;
  is_upower_play: boolean;
  is_ugc_pay_preview: boolean;
  elec_high_level: ElecHighLevel;
  disable_show_up_info: boolean;
}

interface IpInfo {
  ip: string;
  zone_ip: string;
  zone_id: number;
  country: string;
  province: string;
  city: string;
}

interface LevelInfo {
  current_level: number;
  current_min: number;
  current_exp: number;
  next_exp: number;
  level_up: number;
}

interface Vip {
  type: number;
  status: number;
  due_date: number;
  vip_pay_type: number;
  theme_type: number;
  label: Label;
  avatar_subscript: number;
  nickname_color: string;
  role: number;
  avatar_subscript_url: string;
  tv_vip_status: number;
  tv_vip_pay_type: number;
  tv_due_date: number;
  avatar_icon: AvatarIcon;
}

interface Label {
  path: string;
  text: string;
  label_theme: string;
  text_color: string;
  bg_style: number;
  bg_color: string;
  border_color: string;
  use_img_label: boolean;
  img_label_uri_hans: string;
  img_label_uri_hant: string;
  img_label_uri_hans_static: string;
  img_label_uri_hant_static: string;
}

interface AvatarIcon {
  icon_resource: IconResource;
}

interface IconResource {}

interface Subtitle {
  allow_submit: boolean;
  lan: string;
  lan_doc: string;
  subtitles: Subtitle2[];
}

interface Subtitle2 {
  id: number;
  lan: string;
  lan_doc: string;
  is_lock: boolean;
  subtitle_url: string;
  type: number;
  id_str: string;
  ai_type: number;
  ai_status: number;
  data?: SubtitleData; // 手动请求补充
}

interface Options {
  is_360: boolean;
  without_vip: boolean;
}

interface OnlineSwitch {
  enable_gray_dash_playback: string;
  new_broadcast: string;
  realtime_dm: string;
  subtitle_submit_switch: string;
}

interface Fawkes {
  config_version: number;
  ff_version: number;
}

interface ShowSwitch {
  long_progress: boolean;
}

interface BgmInfo {
  music_id: string;
  music_title: string;
  jump_url: string;
}

interface ElecHighLevel {
  privilege_type: number;
  title: string;
  sub_title: string;
  show_button: boolean;
  button_text: string;
  jump_url: string;
  intro: string;
  new: boolean;
}

interface SubtitleData {
  font_size: number;
  font_color: string;
  background_alpha: number;
  background_color: string;
  Stroke: string;
  type: string;
  lang: string;
  version: string;
  body: Body[];
  _editBody: string; // 手动补充
  _lyricsBody: Array<[number, string]>; // 手动补充, ms: content 格式
}

interface Body {
  from: number;
  to: number;
  sid: number;
  location: number;
  content: string;
  music: number;
}
