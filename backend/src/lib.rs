extern crate wasm_bindgen;
use std::{io::Write, panic};

use wasm_bindgen::prelude::*;

// use id3::frame::{Content, Picture, PictureType};
use id3::{
    frame::{self, Picture, PictureType},
    Frame, Tag, TagLike, Version,
};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct AddTagOptionRs {
    pub author: String,
    pub title: String,
    pub album: String,
    pub host: String,
    pub cover: Vec<u8>,
    pub cover_mime: String,
    pub layric: Vec<(u32, String)>,
}

#[wasm_bindgen(typescript_custom_section)]
const ITEXT_STYLE: &'static str = r#"
interface AddTagOption {
    author: string;
    title: string;
    album: string;
    host: string;
    cover: Uint8Array;
    cover_mime: string;
    layric: Array<[number, string]>;
}
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "AddTagOption")]
    pub type AddTagOption;

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

const MILLISECONDS_PER_HOUR: u32 = 3600000;
const MILLISECONDS_PER_MINUTE: u32 = 60000;
const MILLISECONDS_PER_SECOND: u32 = 1000;

#[wasm_bindgen]
pub fn add_tag(mut file: Vec<u8>, _option: AddTagOption) -> Result<Vec<u8>, JsValue> {
    panic::set_hook(Box::new(console_error_panic_hook::hook));
    let out_lenght = file.len();
    let option = serde_wasm_bindgen::from_value::<AddTagOptionRs>(_option.into())?;

    let mut out_tag = Vec::new();
    set_tag(&mut out_tag, option)?;

    file.write_all(&out_tag).unwrap();

    console_log!("修改前: {}, 修改后: {}", out_lenght, file.len());
    Ok(file)
}

fn set_tag(out: &mut Vec<u8>, option: AddTagOptionRs) -> Result<(), JsValue> {
    let mut tag = Tag::new();
    tag.set_album(option.album);
    tag.set_artist(&option.author);
    tag.set_text("TCOM", option.author);
    tag.set_title(option.title);
    tag.add_frame(Frame::link("WOAS", option.host));

    let mut lyrics: Vec<String> = Vec::new();

    lyrics.push("[offset:0]".to_owned());

    for item in &option.layric {
        let total_ms = item.0;
        let mins = (total_ms % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE;
        let secs = (total_ms % MILLISECONDS_PER_MINUTE) / MILLISECONDS_PER_SECOND;
        let ms = total_ms % MILLISECONDS_PER_SECOND;

        lyrics.push(format!("[{:02}:{:02}.{:03}] {}", mins, secs, ms, item.1));
    }

    tag.add_frame(frame::Lyrics {
        lang: "zho".to_owned(),
        description: "".to_owned(),
        text: lyrics.join("\n"),
    });

    tag.add_frame(frame::SynchronisedLyrics {
        lang: "zho".to_owned(),
        timestamp_format: frame::TimestampFormat::Ms,
        content_type: frame::SynchronisedLyricsType::Lyrics,
        description: "".to_owned(),
        content: option.layric,
    });

    tag.add_frame(Picture {
        mime_type: option.cover_mime,
        picture_type: PictureType::CoverFront,
        description: "cover".to_owned(),
        data: option.cover,
    });

    tag.add_frame(frame::Comment{
        text:"Bilibili🎶音乐姬下载,仅供个人学习使用,严谨售卖和其他侵权行为,版权解释权为原作者|Up主|B站".to_owned(),
        lang: "zho".to_owned(),
        description: "Bilibili🎶音乐姬".to_owned(), 
    });

    tag.set_text("TRSN", "bilibili.com");

    let mut out_tag = Vec::new();
    tag.write_to(&mut out_tag, Version::Id3v23).unwrap();

    out.write_all(b"id3 ").unwrap();
    out.write_all(&(out_tag.len() as u32).to_le_bytes())
        .unwrap();
    out.write_all(&out_tag).unwrap();
    Ok(())
}

#[cfg(test)]
mod tests {
    use std::{fs, io::Write};

    use crate::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_wsam() {
        wasm_bindgen_test_configure!(run_in_browser);
        let (in_file, opt) = test_data();
        let in_len = in_file.len();
        let opt = serde_wasm_bindgen::to_value(&opt).unwrap();
        let out_file = add_tag(in_file, AddTagOption { obj: opt }).unwrap();
        self::console_log!("res: {:?}", out_file);
        let out_len = out_file.len();
        self::console_log!("in len: {}, out len: {}", in_len, out_len);
        assert!(in_len < out_len, "in len: {}, out len: {}", in_len, out_len);
    }

    #[test]
    fn test_rs() {
        let (in_file, option) = test_data();

        let mut out_file = fs::File::create("./testdata/test_out.wav").unwrap();
        let mut out_tag = Vec::new();
        set_tag(&mut out_tag, option).unwrap();

        out_file.write_all(&in_file).unwrap();
        out_file.write_all(&out_tag).unwrap();
        let (in_len, out_len) = (in_file.len(), out_file.metadata().unwrap().len() as usize);

        println!("in len: {}, out len: {}", in_len, out_len);
        assert!(in_len < out_len, "in len: {}, out len: {}", in_len, out_len);
        assert!(
            in_len == 2355244 && out_len == 2376766,
            "in len[2355244]: {}, out len[2376766]: {}",
            in_len,
            out_len
        );
    }

    fn test_data() -> (Vec<u8>, AddTagOptionRs) {
        let cover_file = include_bytes!("../testdata/cover.jpeg").to_vec();
        let in_file = include_bytes!("../testdata/music_13s.wav").to_vec();
        let mut lyrics = Vec::<(u32, String)>::new();
        for i in 0..10 {
            let i = i * 1024;
            let (from, to) = (4 + i, i + 1024);
            lyrics.push((from, format!("test:{}-{}", from, to)));
        }
        let opt = AddTagOptionRs {
            author: "Ocyss".to_string(),
            title: "add tag test".to_string(),
            album: "tests".to_string(),
            host: "https://github.com/ocyss".to_string(),
            cover: cover_file,
            cover_mime: "image/jpeg".to_string(),
            layric: lyrics,
        };
        return (in_file, opt);
    }
}
