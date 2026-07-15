import { IS_SERVER } from "constants";
import { type Action, actionGuard } from "./protocol";
import { createTransportApi, getTransport, resolveTransport } from "./transport";

export function createBridge(onAction: (action: Action) => void) {
	const transport = createTransportApi(IS_SERVER ? resolveTransport() : getTransport());

	transport.connect((payload) => {
		if (!actionGuard(payload)) {
			warn("[charm-devtools] received a payload that failed validation:", payload);
			return;
		}

		onAction(payload);
	});

	transport.markAsReady();

	return {
		dispose: transport.dispose,
		dispatch: transport.send,
	};
}

export function resolveBridge() {
	let transport: ReturnType<typeof createTransportApi> | undefined;
	let queue: defined[] = [];

	const thread = task.spawn(() => {
		transport = createTransportApi(getTransport());

		const pending = queue;
		queue = [];

		for (const payload of pending) {
			transport.send(payload);
		}
	});

	return {
		dispose: () => {
			task.cancel(thread);
			transport?.dispose();
		},
		dispatch: (payload: unknown) => {
			if (transport) {
				transport.send(payload);
			} else {
				queue.push(payload as defined);
			}
		},
	};
}
