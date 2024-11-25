// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.2.3
//   protoc               v3.19.1
// source: plugins/runtime.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { type CallContext, type CallOptions } from "nice-grpc-common";

export const protobufPackage = "yaak.plugins.runtime";

export interface EventStreamEvent {
  event: string;
}

function createBaseEventStreamEvent(): EventStreamEvent {
  return { event: "" };
}

export const EventStreamEvent: MessageFns<EventStreamEvent> = {
  encode(message: EventStreamEvent, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.event !== "") {
      writer.uint32(10).string(message.event);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): EventStreamEvent {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventStreamEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.event = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EventStreamEvent {
    return { event: isSet(object.event) ? globalThis.String(object.event) : "" };
  },

  toJSON(message: EventStreamEvent): unknown {
    const obj: any = {};
    if (message.event !== "") {
      obj.event = message.event;
    }
    return obj;
  },

  create(base?: DeepPartial<EventStreamEvent>): EventStreamEvent {
    return EventStreamEvent.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventStreamEvent>): EventStreamEvent {
    const message = createBaseEventStreamEvent();
    message.event = object.event ?? "";
    return message;
  },
};

export type PluginRuntimeDefinition = typeof PluginRuntimeDefinition;
export const PluginRuntimeDefinition = {
  name: "PluginRuntime",
  fullName: "yaak.plugins.runtime.PluginRuntime",
  methods: {
    eventStream: {
      name: "EventStream",
      requestType: EventStreamEvent,
      requestStream: true,
      responseType: EventStreamEvent,
      responseStream: true,
      options: {},
    },
  },
} as const;

export interface PluginRuntimeServiceImplementation<CallContextExt = {}> {
  eventStream(
    request: AsyncIterable<EventStreamEvent>,
    context: CallContext & CallContextExt,
  ): ServerStreamingMethodResult<DeepPartial<EventStreamEvent>>;
}

export interface PluginRuntimeClient<CallOptionsExt = {}> {
  eventStream(
    request: AsyncIterable<DeepPartial<EventStreamEvent>>,
    options?: CallOptions & CallOptionsExt,
  ): AsyncIterable<EventStreamEvent>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

export type ServerStreamingMethodResult<Response> = { [Symbol.asyncIterator](): AsyncIterator<Response, void> };

export interface MessageFns<T> {
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
  fromJSON(object: any): T;
  toJSON(message: T): unknown;
  create(base?: DeepPartial<T>): T;
  fromPartial(object: DeepPartial<T>): T;
}
