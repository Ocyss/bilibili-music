import { userConfig } from "@/data";
import { Message } from "@arco-design/web-vue";

export type ChatCompletionMessageParam = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function callOpenAI(prompt: ChatCompletionMessageParam[]) {
  const { host, key, modal } = userConfig.openai;

  try {
    const response = await fetch(`${host}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: modal,
        messages: prompt,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    Message.error(`AI 处理失败: ${(error as Error).message}`);
    return null;
  }
}
