import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { useNavigation } from '@react-navigation/native'
import { Translation, useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import beapi from '@berty-tech/api'

//
// Scan Invalid
//

// Styles
const useStylesInvalidScan = () => {
	const [{ width, height, border, text, padding, margin }] = useStyles()
	return {
		header: [width(120), height(120), border.radius.scale(60)],
		dismissButton: [
			border.color.light.grey,
			border.scale(2),
			border.radius.small,
			margin.top.scale(50),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
		],
		dismissText: [text.size.scale(17)],
	}
}

const _invalidScanStyles = StyleSheet.create({
	errorText: {
		fontSize: 14,
		fontFamily: 'Courier',
	},
	body: {
		bottom: 78,
	},
})

const InvalidScanHeader: React.FC<{ title: string }> = ({ title }) => {
	const _styles = useStylesInvalidScan()
	const [{ background, margin, text, border, row, column, color }] = useStyles()

	return (
		<View>
			<View
				style={[
					background.white,
					border.shadow.medium,
					margin.bottom.medium,
					row.item.justify,
					column.justify,
					_styles.header,
				]}
			>
				<Icon
					name='alert-circle-outline'
					width={100}
					height={100}
					fill={color.red}
					style={[row.item.justify]}
				/>
			</View>
			<View>
				<Text style={[text.color.red, text.bold.medium, text.align.center]}>{title}</Text>
			</View>
		</View>
	)
}

const InvalidScanError: React.FC<{ error: string }> = ({ error }) => {
	const [{ border, background, padding, margin, text }] = useStyles()

	return (
		<View style={[border.radius.medium, background.light.red, padding.medium, margin.top.huge]}>
			<Text
				style={[text.color.red, text.align.center, text.bold.medium, _invalidScanStyles.errorText]}
			>
				{error}
			</Text>
		</View>
	)
}

const InvalidScanDismissButton: React.FC<{}> = () => {
	const _styles = useStylesInvalidScan()
	const [{ row, margin, color, padding, text }] = useStyles()
	const navigation = useNavigation()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View style={row.center}>
					<TouchableOpacity
						style={[row.fill, margin.bottom.medium, _styles.dismissButton]}
						onPress={() => {
							try {
								navigation.goBack()
							} catch (e) {
								console.warn("couldn't go back:", e)
								navigation.navigate('Tabs')
							}
						}}
					>
						<Icon name='close' width={30} height={30} fill={color.grey} style={row.item.justify} />
						<Text
							style={[text.color.grey, padding.left.small, row.item.justify, _styles.dismissText]}
						>
							{t('modals.invalid-scan.dismiss-button')}
						</Text>
					</TouchableOpacity>
				</View>
			)}
		</Translation>
	)
}

const InvalidScan: React.FC<{ type: string; error: any }> = ({ type, error }) => {
	const [layout, setLayout] = useState<number>()
	const [{ background, padding, border }] = useStyles()
	const { t } = useTranslation()

	const isContactAlreadyAdded = error?.error?.errorDetails?.codes?.includes(
		beapi.errcode.ErrCode.ErrContactRequestContactAlreadyAdded,
	)
	let errorMessage = error.toString()
	let title = ''
	if (type === 'link') {
		title = t('modals.manage-deep-link.invalid-link')
	} else if (type === 'qr') {
		title = t('modals.manage-deep-link.invalid-qr')
		if (isContactAlreadyAdded) {
			title = t('modals.manage-deep-link.contact-already-added')
			errorMessage = t('modals.manage-deep-link.contact-already-added-message')
		}
	} else {
		title = t('modals.manage-deep-link.error')
	}

	return (
		<View style={[padding.medium, { justifyContent: 'center', height: '100%' }]}>
			<View
				onLayout={(e) => !layout && setLayout(e.nativeEvent.layout.height)}
				style={[
					background.white,
					padding.medium,
					border.radius.medium,
					layout && { height: layout - 78 },
				]}
			>
				<View style={[_invalidScanStyles.body]}>
					<InvalidScanHeader title={title} />
					<InvalidScanError error={errorMessage} />
					<InvalidScanDismissButton />
				</View>
			</View>
		</View>
	)
}

export default InvalidScan
