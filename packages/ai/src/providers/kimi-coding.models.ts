// 手动维护的模型目录。
// 原由 scripts/generate-models.ts 联网生成，现已移除。当前为空表，表示该
// provider 暂无可用模型。如需启用，请在此手动填写模型（参照 src/types.ts
// 的 Model 类型，api 字段必须为 "anthropic-messages"）。

import type { Model } from "../types.ts";

export const KIMI_CODING_MODELS = {} as Record<string, Model<"anthropic-messages">>;
