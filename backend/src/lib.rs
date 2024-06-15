extern crate wasm_bindgen;
use std::{
    io::{BufRead, Cursor, Write},
    panic,
};

use wasm_bindgen::prelude::*;

// use id3::frame::{Content, Picture, PictureType};
use id3::{
    frame::{self, Picture, PictureType},
    Content, Frame, Tag, TagLike, Version,
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
    pub layric: Vec<LayricItemRs>,
}
#[derive(Serialize, Deserialize, Clone)]
pub struct LayricItemRs {
    pub from: i64,
    pub to: i64,
    pub sid: i64,
    pub location: i64,
    pub content: String,
    pub music: i64,
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
    layric: Array<LayricItem>;
}

interface LayricItem {
    from: number;
    to: number;
    sid: number;
    location: number;
    content: string;
    music: number;
}
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "AddTagOption")]
    pub type AddTagOption;
    #[wasm_bindgen(typescript_type = "LayricItem")]
    pub type LayricItem;
}
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn add_tag(file: Vec<u8>, _option: AddTagOption) -> Result<Vec<u8>, JsValue> {
    panic::set_hook(Box::new(console_error_panic_hook::hook));
    let mut out_file = file.clone();
    let option = serde_wasm_bindgen::from_value::<AddTagOptionRs>(_option.into())?;

    let mut tag = Tag::new();
    tag.set_album(option.album);
    tag.set_artist(option.author.clone());
    tag.set_text("TCOM", option.author);
    tag.set_title(option.title);
    // tag.set_text("WOAS", option.host);

    // tag.add_frame(frame::Lyrics {
    //     lang: todo!(),
    //     description: todo!(),
    //     text: todo!(),
    // });
    // tag.add_frame(frame::SynchronisedLyrics {
    //     lang: todo!(),
    //     timestamp_format: todo!(),
    //     content_type: todo!(),
    //     description: todo!(),
    //     content: todo!(),
    // });
    tag.add_frame(Picture {
        mime_type: option.cover_mime,
        picture_type: PictureType::CoverFront,
        description: "cover".to_owned(),
        data: option.cover,
    });
    // tag.set_text(
    //     "WCOP",
    //     "Bilibili🎶音乐姬下载,仅供个人学习使用,严谨售卖和其他侵权行为,版权解释权为原作者|Up主|B站",
    // );
    let mut out_tag = Vec::new();
    tag.write_to(&mut out_tag, Version::Id3v23).unwrap();

    out_file.write_all(b"id3 ").unwrap();
    out_file
        .write_all(&(out_tag.len() as u32).to_le_bytes())
        .unwrap();
    out_file.write_all(&out_tag).unwrap();

    // console_log!("修改前: {}, 修改后: {}", file.len(), output.len());
    Ok(out_file)
}

#[cfg(test)]
mod tests {
    use std::{
        fs,
        io::{Read, Write},
    };

    use crate::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_wsam() {
        wasm_bindgen_test_configure!(run_in_browser);
        let cover_file = include_bytes!("../testdata/cover.jpeg").to_vec();
        let in_file = include_bytes!("../testdata/music_13s.wav").to_vec();
        let opt = serde_wasm_bindgen::to_value(&AddTagOptionRs {
            author: "Ocyss".to_string(),
            title: "add tag test".to_string(),
            album: "tests".to_string(),
            host: "https://github.com/ocyss".to_string(),
            cover: cover_file,
            cover_mime: "image/jpeg".to_string(),
            layric: Vec::new(),
        })
        .unwrap();
        let out_file = add_tag(in_file.clone(), AddTagOption { obj: opt }).unwrap();
        self::console_log!("res: {:?}", out_file);
        let (in_len, out_len) = (in_file.len(), out_file.len());
        self::console_log!("in len: {}, out len: {}", in_len, out_len);
        assert!(in_len < out_len, "in len: {}, out len: {}", in_len, out_len);
    }

    #[test]
    fn test_rs() {
        let cover_file = include_bytes!("../testdata/cover.jpeg").to_vec();
        let in_file = include_bytes!("../testdata/music_13s.wav").to_vec();
        let option = &AddTagOptionRs {
            author: "Ocyss".to_string(),
            title: "add tag test".to_string(),
            album: "tests".to_string(),
            host: "https://github.com/ocyss".to_string(),
            cover: cover_file,
            cover_mime: "image/jpeg".to_string(),
            layric: Vec::new(),
        };

        let mut tag = Tag::new();
        tag.set_album(option.album.clone());
        tag.set_artist(option.author.clone());
        tag.set_text("TCOM", option.author.clone());
        tag.set_title(option.title.clone());

        tag.add_frame(Picture {
            mime_type: option.cover_mime.clone(),
            picture_type: PictureType::CoverFront,
            description: "cover".to_owned(),
            data: option.cover.clone(),
        });
        let mut out_file = fs::File::create("./test6.wav").unwrap();
        let mut outt = Vec::new();
        out_file.write_all(&in_file).unwrap();

        tag.write_to(&mut outt, Version::Id3v23).unwrap();
        out_file.write_all(b"id3 ").unwrap();
        out_file
            .write_all(&(outt.len() as u32).to_le_bytes())
            .unwrap();
        out_file.write_all(&outt).unwrap();

        assert!(1 == 1);
    }
}
