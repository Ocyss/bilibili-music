interface VideoParse {
  code: number;
  msg: string;
  data: Data;
}

interface Data {
  title: string;
  desc: string;
  cover: string;
  list: List[];
}

interface List {
  title: string;
  duration: number;
  durationFormat: string;
  width: number;
  height: number;
  accept: string[];
  url: string;
}
