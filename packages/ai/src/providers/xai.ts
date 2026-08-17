import { openAIResponsesApi } from "../api/openai-responses.lazy.ts";
import { envApiKeyAuth, lazyOAuth } from "../auth/helpers.ts";
import { loadXaiOAuth } from "../auth/oauth/load.ts";
import { createProvider } from "../models.ts";
import { XAI_MODELS } from "./xai.models.ts";

export function xaiProvider() {
	// 注释掉返回类型标注：提交的 xai.json 快照中 grok-4.3/4.6/grok-build-0.1 仍是
	// openai-completions，与 #8124 代码不一致；联网重新生成快照后应恢复原标注。
	return createProvider({
		id: "xai",
		name: "xAI",
		baseUrl: "https://api.x.ai/v1",
		auth: {
			apiKey: envApiKeyAuth("xAI API key", ["XAI_API_KEY"]),
			oauth: lazyOAuth({
				name: "xAI (Grok/X subscription)",
				isSubscription: true,
				loginLabel: "Sign in with SuperGrok or X Premium",
				load: loadXaiOAuth,
			}),
		},
		models: Object.values(XAI_MODELS),
		api: openAIResponsesApi(),
	});
}
