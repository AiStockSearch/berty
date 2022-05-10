import grpcBridge from './bridge'

export type { GRPCBridge } from './bridge'
export { ReactNativeTransport } from './grpc-web-react-native-transport'
export { WebsocketTransport } from './grpc-web-websocket-transport'
export { createServiceClient } from './service'
export { GRPCError, EOF } from './error'

export default grpcBridge
