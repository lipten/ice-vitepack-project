import { workspace } from "vscode";

// export const generationPreference = configuration.get("GenerationPreference");
// export const disabledFor = configuration.get("DisabledFor", new Object());

// export const disabledLangs = () => {
//     const disabledFor = configuration.get("DisabledFor", new Object());
//     let disabledLangs = [];
//     const keys = Object.keys(disabledFor);
//     for (let i = 0; i < keys.length; i++) {
//         let key = keys[i];
//         if (
//             (disabledFor as any)[key] === true ||
//             (disabledFor as any)[key] === "true"
//         ) {
//             disabledLangs.push(key);
//         }
//     }
//     return disabledLangs;
// };
export const apiKey = '68cf004321e94b47a91c2e45a8109852'
export const apiSecret = 'e82b86a16f9d471ab215f653060310e3'
const defaultConfig = {
    temp: 0.8,
    topp: 0.95,
    topk: 0,
};
export const temp = 0.8;
export const topk = 0;
export const topp = 0.95;
//get number of candidates
export const candidateNum = 1;
export const needGuide = false;
// export const translationInsertMode = configuration.get("Translation");
// export const enableExtension = configuration.get("EnableExtension", true);
// export const acceptedsurvey = configuration.get("Survey", null);
// export const completionDelay = configuration.get("CompletionDelay", 0.5);
// export const templates = configuration.get("PromptTemplates(Experimental)", {});
// export const onlyKeyControl = configuration.get("OnlyKeyControl");

export const supportLanguages = ['javascript',  'typescript', 'sql', 'python']