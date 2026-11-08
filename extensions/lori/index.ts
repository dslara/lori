import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getStatusMessage } from "../../src/status.ts";

export default function (pi: ExtensionAPI) {
	pi.on("session_start", async (_event, ctx) => {
		ctx.ui.notify("Lori ativo.", "info");
	});

	pi.registerCommand("lori-status", {
		description: "Mostra status da Lori",
		handler: async (_args, ctx) => {
			ctx.ui.notify(getStatusMessage(), "info");
		},
	});
}
