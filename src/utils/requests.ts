import { GM_cookie, GM_xmlhttpRequest, GmXhrRequest } from "$";

export class RequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "请求错误";
  }
}

export type ResponseType =
  | "text"
  | "json"
  | "arraybuffer"
  | "blob"
  | "document"
  | "stream";
export type OnStream = (
  reader: ReadableStreamDefaultReader<Uint8Array>
) => void;
export type RequestArgs<TContext, TResponseType extends ResponseType> = Partial<
  Pick<
    GmXhrRequest<TContext, TResponseType>,
    "method" | "url" | "data" | "headers" | "timeout" | "responseType"
  > & {
    onStream: OnStream;
  }
>;
type ResolvedReturnType<T extends (...args: any) => any> =
  ReturnType<T> extends Promise<infer R> ? R : ReturnType<T>;
export function request<TContext, TResponseType extends ResponseType = "json">({
  method = "POST",
  url = "",
  data = undefined,
  headers = {},
  timeout = 5,
  responseType = "json" as TResponseType,
  onStream = () => {},
}: RequestArgs<TContext, TResponseType>) {
  return new Promise<TContext>(async (resolve, reject) => {
    const cookie = await new Promise<
      ResolvedReturnType<(typeof GM_cookie)["list"]>
    >((resolve, reject) =>
      GM_cookie.list({}, (ck, err) => {
        if (err) {
          reject(err);
        }
        resolve(ck);
      })
    );
    const abort = GM_xmlhttpRequest<TContext, TResponseType>({
      method,
      url,
      data,
      headers,
      timeout: timeout * 1000,
      responseType,
      cookie: cookie.map((c) => `${c.name}=${c.value}`).join("; "),

      ontimeout() {
        reject(new RequestError(`超时 ${Math.round(timeout / 1000)}s`));
      },
      onabort() {
        reject(new RequestError("用户中止"));
      },
      onerror(e) {
        const msg = `${e.responseText} | ${e.error}, ${e}`;

        reject(new RequestError(msg));
      },
      onloadend(e) {
        resolve(e.response);
      },
      onloadstart(e) {
        if (responseType === "stream") {
          const reader = (e.response as ReadableStream<Uint8Array>).getReader();
          onStream(reader);
        }
      },
    });
  });
}

request.post = <TContext, TResponseType extends ResponseType = "json">(
  args: Omit<RequestArgs<TContext, TResponseType>, "method">
) => {
  return request<TContext, TResponseType>({
    method: "POST",
    ...args,
  });
};

request.get = <TContext, TResponseType extends ResponseType = "json">(
  args: Omit<RequestArgs<TContext, TResponseType>, "method">
) => {
  return request<TContext, TResponseType>({
    method: "GET",
    ...args,
  });
};
