import { ReplicatedStorage } from "@rbxts/services";
import { IS_SERVER } from "constants";
import { READY_ATTRIBUTE } from "protocol";

interface Transport extends Folder {
	RemoteEvent: RemoteEvent;
	BindableEvent: BindableEvent;
}

const TRANSPORT_NAME = "__CHARM_DEVTOOLS__";
const READY_SENTINEL = READY_ATTRIBUTE;
const READY_THRESHOLD = 2;

export function resolveTransport() {
	assert(IS_SERVER, "expected to be called on the server");

	const container = ReplicatedStorage.FindFirstChild(TRANSPORT_NAME);
	if (container) return container as Transport;

	const transport = new Instance("Folder");
	transport.Name = TRANSPORT_NAME;
	transport.Archivable = false;

	const remote = new Instance("RemoteEvent");
	remote.Name = "RemoteEvent";
	const bindable = new Instance("BindableEvent");
	bindable.Name = "BindableEvent";

	remote.Parent = transport;
	bindable.Parent = transport;
	transport.Parent = ReplicatedStorage;

	return transport as Transport;
}

export function getTransport() {
	return ReplicatedStorage.WaitForChild(TRANSPORT_NAME) as Transport;
}

export function createTransportApi(transport: Transport) {
	const connections = new Set<RBXScriptConnection>();

	let pending: Array<defined> = [];

	const readyCount = () => (transport.GetAttribute(READY_ATTRIBUTE) as number | undefined) ?? 0;

	let ready = readyCount() >= READY_THRESHOLD;

	const dispatch = (payload: unknown) => {
		transport.BindableEvent.Fire(payload);

		if (IS_SERVER) {
			transport.RemoteEvent.FireAllClients(payload);
		} else {
			transport.RemoteEvent.FireServer(payload);
		}
	};

	const flush = () => {
		const queued = pending;
		pending = [];
		for (const payload of queued) {
			dispatch(payload);
		}
	};

	const setReady = () => {
		if (ready) return;
		ready = true;
		flush();
	};

	const publishReady = () => {
		if (IS_SERVER) transport.SetAttribute(READY_ATTRIBUTE, readyCount() + 1);
	};

	const subscribe = (handler: (payload: unknown) => void) => {
		const bindable = transport.BindableEvent.Event.Connect(handler);
		const remote = IS_SERVER
			? transport.RemoteEvent.OnServerEvent.Connect((_player, payload) => handler(payload))
			: transport.RemoteEvent.OnClientEvent.Connect(handler);

		connections.add(bindable);
		connections.add(remote);

		return () => {
			bindable.Disconnect();
			remote.Disconnect();
			connections.delete(bindable);
			connections.delete(remote);
		};
	};

	connections.add(
		transport.GetAttributeChangedSignal(READY_ATTRIBUTE).Connect(() => {
			if (readyCount() >= READY_THRESHOLD) setReady();
		}),
	);

	subscribe((payload) => {
		if (payload === READY_SENTINEL) publishReady();
	});

	return {
		connect: (callback: (payload: unknown) => void) =>
			subscribe((payload) => {
				if (payload !== READY_SENTINEL) callback(payload);
			}),

		send: (payload: unknown) => {
			if (ready) {
				dispatch(payload);
			} else {
				pending.push(payload as defined);
			}
		},

		isReady: () => ready,

		markAsReady: () => dispatch(READY_SENTINEL),

		dispose: () => {
			for (const conn of connections) {
				conn.Disconnect();
			}
			connections.clear();
			pending = [];
		},
	};
}
