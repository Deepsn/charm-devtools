import { IS_SERVER, IS_STUDIO } from "constants";
import { logger } from "logger";
import { type Action, actionGuard, type DependentsUpdate, dependentsGuard } from "protocol";
import { createTransportApi, getTransport, resolveTransport } from "transport";

const noopBridge = {
	dispose: () => {},
	dispatch: (_payload: unknown) => {},
};

export function createBridge(onAction: (action: Action) => void, onDependents?: (update: DependentsUpdate) => void) {
	if (!IS_STUDIO) return noopBridge;

	const transport = createTransportApi(IS_SERVER ? resolveTransport() : getTransport());

	transport.connect((payload) => {
		if (actionGuard(payload)) {
			onAction(payload);
		} else if (dependentsGuard(payload)) {
			onDependents?.(payload);
		} else {
			logger.warn("received a payload that failed validation: {payload}", { payload });
		}
	});

	transport.markAsReady();

	return {
		dispose: transport.dispose,
		dispatch: transport.send,
	};
}

export function resolveBridge() {
	if (!IS_STUDIO) return noopBridge;

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
