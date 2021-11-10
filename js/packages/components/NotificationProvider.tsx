import React from 'react'
import { InAppNotificationProvider, withInAppNotification } from 'react-native-in-app-notification'

import { useMessengerContext } from '@berty-tech/store/context'

import NotificationBody from './NotificationBody'

const NotificationBridge: React.FC = withInAppNotification(({ showNotification }: any) => {
	const { addNotificationListener, removeNotificationListener } = useMessengerContext()

	React.useEffect(() => {
		const listener = (evt: any) => {
			showNotification({
				title: evt.payload.title,
				message: evt.payload.body,
				onPress: evt.payload.onPress,
				additionalProps: evt,
			})
		}
		addNotificationListener(listener)

		return () => {
			removeNotificationListener(listener)
		}
	}, [showNotification, addNotificationListener, removeNotificationListener])
	return null
})

const NotificationProvider: React.FC = ({ children }) => (
	<InAppNotificationProvider
		notificationBodyComponent={NotificationBody}
		backgroundColour='transparent'
		closeInterval={5000}
	>
		<>
			<NotificationBridge />
			{children}
		</>
	</InAppNotificationProvider>
)

export default NotificationProvider
