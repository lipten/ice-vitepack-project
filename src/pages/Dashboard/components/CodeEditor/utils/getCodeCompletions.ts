import axios from 'axios';
import { apiHref } from './localconfig';
import { temp, topp, topk } from './configures';
import { getEndData, getStartData } from './statisticFunc';

export interface GetCodeCompletions {
  completions: string[];
  commandid: string;
}

export function getCodeCompletions(
  prompt: string,
  num: Number,
  lang: string,
  apiKey: string,
  apiSecret: string,
  mode: string,
): Promise<GetCodeCompletions> {
  let API_URL = '';
  if (mode === 'prompt') {
    API_URL = `${apiHref}/multilingual_code_generate_block`;
  } else if (mode === 'interactive') {
    API_URL = `${apiHref}/multilingual_code_generate_adapt`;
  } else {
    API_URL = `${apiHref}/multilingual_code_generate_adapt`;
  }
  return new Promise(async (resolve, reject) => {
    let n = 0;
    if (prompt.length <= 300) {
      n = 3;
    } else if (prompt.length > 600 && prompt.length <= 900) {
      n = 2;
    } else if (prompt.length > 900 && prompt.length <= 1200) {
      n = 1;
    } else if (prompt.length > 1200) {
      prompt = prompt.slice(prompt.length - 1200);
      n = 1;
    }
    let payload = {};
    if (lang.length == 0) {
      payload = {
        prompt,
        n: num,
        apikey: apiKey,
        apisecret: apiSecret,
        temperature: temp,
        top_p: topp,
        top_k: topk,
      };
    } else {
      payload = {
        lang,
        prompt,
        n: num,
        apikey: apiKey,
        apisecret: apiSecret,
        temperature: temp,
        top_p: topp,
        top_k: topk,
      };
    }
    const time1 = new Date().getTime();
    try {
      const time2 = new Date().getTime();
      axios
        .post(API_URL, payload, { proxy: false, timeout: 120000 })
        .then(async (res) => {
          console.log(res);
          console.log(
            `process time: ${res.data.result.process_time}`,
          );
          if (res?.data.status === 0) {
            const codeArray = res?.data.result.output.code;
            const completions = Array<string>();
            for (let i = 0; i < codeArray.length; i++) {
              const completion = codeArray[i];
              const tmpstr = completion;
              if (tmpstr.trim() === '') continue;
              if (completions.includes(completion)) continue;
              completions.push(completion);
            }
            const timeEnd = new Date().getTime();
            console.log(timeEnd - time1, timeEnd - time2);
            resolve({ completions });
          } else {
            reject(res.data.message);
          }
        })
        .catch((err) => {
          reject(err);
        });
    } catch (e) {
      reject(e);
    }
  });
}
