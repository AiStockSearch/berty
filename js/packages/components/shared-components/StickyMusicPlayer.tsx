import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, Animated } from 'react-native'
import { Icon } from '@ui-kitten/components'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useStyles } from '@berty-tech/styles'
import { useMusicPlayer } from '@berty-tech/music-player'
import { useThemeColor } from '@berty-tech/store/hooks'
import { navigationRef, ScreensParams } from '@berty-tech/navigation'

export const HEIGHT_OF_PLAYER = 60

const hidePlayerRoutes: (keyof ScreensParams)[] = ['Chat.OneToOne', 'Chat.Group']

export const StickMusicPlayer = () => {
	const [{ border, padding, margin }, { windowWidth, scaleSize }] = useStyles()
	const colors = useThemeColor()
	const [animatedWidth] = useState(new Animated.Value(0))
	const { player, unload, handlePlayPause, refresh } = useMusicPlayer()
	const { top } = useSafeAreaInsets()
	const currentRoute: keyof ScreensParams = navigationRef.current?.getCurrentRoute()
		?.name as keyof ScreensParams

	useEffect(() => {
		if (player.player?.isPlaying) {
			Animated.timing(animatedWidth, {
				toValue:
					((player.player?.currentTime === -1
						? player.player?.duration
						: player.player?.currentTime) /
						player.player?.duration) *
					windowWidth *
					0.92,
				duration: 100,
				useNativeDriver: false,
			}).start()
		} else if (player.player?.isStopped) {
			Animated.timing(animatedWidth, {
				toValue: 0,
				duration: 100,
				useNativeDriver: false,
			}).start()
		}
	}, [animatedWidth, windowWidth, player, refresh])

	if (!player.player || hidePlayerRoutes.includes(currentRoute)) {
		return null
	}

	return (
		<View
			style={[
				padding.horizontal.large,
				padding.vertical.medium,
				border.radius.top.medium,
				{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					width: '100%',
					position: 'relative',
					marginBottom: -top,
					marginTop: top,
					zIndex: 9,
					backgroundColor: colors['background-header'],
					height: HEIGHT_OF_PLAYER,
				},
			]}
		>
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'flex-start',
				}}
			>
				<TouchableOpacity
					style={[
						border.radius.big,
						{
							padding: 1,
							borderWidth: 3,
							borderColor: colors['positive-asset'],
							transform: [{ rotate: '45deg' }],
						},
					]}
					onPress={() => unload()}
				>
					<Icon
						height={16 * scaleSize}
						width={16 * scaleSize}
						name='plus'
						pack='custom'
						fill={colors['positive-asset']}
					/>
				</TouchableOpacity>
			</View>

			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<TouchableOpacity
					onPress={() => {
						if (player.player?.currentTime) {
							const seekValue = player.player.currentTime - 1000
							player.player.seek(seekValue < 0 ? 0 : seekValue)
						}
					}}
					style={[
						border.radius.small,
						{
							backgroundColor: colors['background-header'],
							alignItems: 'center',
							justifyContent: 'center',
						},
					]}
				>
					<Icon
						name='prev'
						fill={colors['reverted-main-text']}
						height={25 * scaleSize}
						width={25 * scaleSize}
						pack='custom'
					/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						handlePlayPause()
					}}
					style={[
						border.radius.small,
						margin.horizontal.big,
						{
							backgroundColor: colors['background-header'],
							alignItems: 'center',
							justifyContent: 'center',
						},
					]}
				>
					<Icon
						name={player.player?.isPlaying ? 'pause' : 'play'}
						fill={colors['reverted-main-text']}
						height={25 * scaleSize}
						width={25 * scaleSize}
						pack='custom'
					/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						if (player.player?.currentTime) {
							const seekValue = player.player.currentTime + 1000
							player.player.seek(
								seekValue > player.player.duration ? player.player.duration : seekValue,
							)
						}
					}}
					style={[
						border.radius.small,
						{
							backgroundColor: colors['background-header'],
							alignItems: 'center',
							justifyContent: 'center',
						},
					]}
				>
					<Icon
						name='next'
						fill={colors['reverted-main-text']}
						height={25 * scaleSize}
						width={25 * scaleSize}
						pack='custom'
					/>
				</TouchableOpacity>
			</View>

			<View
				style={{
					flex: 1,
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'flex-end',
				}}
			>
				<TouchableOpacity onPress={() => {}} style={[padding.tiny, margin.left.small]}>
					<Icon
						name='volume'
						fill={colors['reverted-main-text']}
						height={20 * scaleSize}
						width={20 * scaleSize}
						pack='custom'
					/>
				</TouchableOpacity>
			</View>

			<View
				style={{
					position: 'absolute',
					top: 0,
					left: 15,
					right: 15,
					backgroundColor: colors['positive-asset'],
					height: 5,
				}}
			>
				<Animated.View
					style={[
						{
							position: 'absolute',
							top: 0,
							left: 0,
							right: -15,
							backgroundColor: colors['background-header'],
							height: 5,
							width: animatedWidth,
						},
						Number(animatedWidth).toFixed(2) !== windowWidth.toFixed(2) && border.radius.right.tiny,
					]}
				/>
			</View>
		</View>
	)
}
