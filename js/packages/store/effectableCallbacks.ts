import { Platform } from 'react-native'

import beapi from '@berty/api'
import { persistor, resetAccountStore } from '@berty/redux/store'
import { useAppDispatch } from '@berty/hooks'
import {
	setCreatedAccount,
	setStateStreamDone,
	setStateStreamInProgress,
} from '@berty/redux/reducers/ui.reducer'

import { reducerAction, MessengerActions, StreamInProgress } from './types'
import { accountService } from './accountService'

/*

These callbacks were in providerCallbacks.tsx but they are splited here because of dependencies cycles

*/

export const closeAccountWithProgress = async (
	dispatch: (arg0: reducerAction) => void,
	reduxDispatch: ReturnType<typeof useAppDispatch>,
) => {
	try {
		const stream = await accountService.closeAccountWithProgress({})
		stream.onMessage((msg, err) => {
			if (err) {
				if (err.EOF) {
					console.log('Node is closed')
				} else {
					console.warn('Error while closing node:', err)
				}
				reduxDispatch(resetAccountStore())
				reduxDispatch(setStateStreamDone())
				return
			}
			if (msg?.progress?.state !== 'done') {
				const progress = msg?.progress
				if (progress) {
					const payload: StreamInProgress = {
						msg: progress,
						stream: 'Close account',
					}
					reduxDispatch(setStateStreamInProgress(payload))
				}
			}
		})
		await persistor.flush()
		persistor.pause()
		await stream.start()
	} catch (err) {
		console.warn('Failed to close node:', err)
		reduxDispatch(resetAccountStore())
		dispatch({
			type: MessengerActions.SetStreamError,
			payload: { error: new Error(`Failed to close node: ${err}`) },
		})
	}
}

export const importAccountWithProgress = (
	path: string,
	dispatch: ReturnType<typeof useAppDispatch>,
) =>
	new Promise<beapi.account.ImportAccountWithProgress.Reply | null>(async resolve => {
		let metaMsg: beapi.account.ImportAccountWithProgress.Reply | null = null
		let done = false
		try {
			const stream = await accountService.importAccountWithProgress({ backupPath: path })
			stream.onMessage(async (msg, _) => {
				if (msg?.progress?.state !== 'done') {
					const progress = msg?.progress
					if (progress) {
						const payload: StreamInProgress = {
							msg: progress,
							stream: 'Import account',
						}
						dispatch(setStateStreamInProgress(payload))
					}
				}

				metaMsg = msg?.accountMetadata ? msg : metaMsg
				done = msg?.progress?.state === 'done' || done

				if (done && metaMsg) {
					dispatch(setStateStreamDone())
					resolve(metaMsg)
				}
			})
			await stream.start()
		} catch (err) {
			dispatch({
				type: MessengerActions.SetStreamError,
				payload: { error: new Error(`Failed to import account: ${err}`) },
			})
			resolve(null)
		}
	})

export const refreshAccountList = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
): Promise<beapi.account.IAccountMetadata[]> => {
	try {
		if (embedded) {
			const resp = await accountService.listAccounts({})

			if (!resp.accounts) {
				return []
			}

			dispatch({ type: MessengerActions.SetAccounts, payload: resp.accounts })

			return resp.accounts
		}

		let accounts = [{ accountId: '0', name: 'remote server account' }]

		dispatch({ type: MessengerActions.SetAccounts, payload: accounts })

		return accounts
	} catch (e) {
		console.warn(e)
		return []
	}
}

export const createAccount = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	reduxDispatch: ReturnType<typeof useAppDispatch>,
	config?: beapi.account.INetworkConfig,
) => {
	let resp: beapi.account.CreateAccount.Reply
	try {
		let networkConfig
		if (!config) {
			const defaultConfig = await accountService.networkConfigGet({ accountId: '' })
			networkConfig = defaultConfig.currentConfig
		} else {
			networkConfig = config
		}
		resp = await accountService.createAccount({
			networkConfig,
			sessionKind: Platform.OS === 'web' ? 'desktop-electron' : null,
		})
		persistor.persist()
	} catch (e) {
		console.warn('unable to create account', e)
		return
	}
	if (!resp.accountMetadata?.accountId) {
		throw new Error('no account id returned')
	}

	await refreshAccountList(embedded, dispatch)
	reduxDispatch(
		setCreatedAccount({
			accountId: resp.accountMetadata.accountId,
		}),
	)
}

export const createNewAccount = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	reduxDispatch: ReturnType<typeof useAppDispatch>,
	config?: beapi.account.INetworkConfig,
) => {
	if (!embedded) {
		return
	}

	try {
		await createAccount(embedded, dispatch, reduxDispatch, config)
	} catch (e) {
		console.warn('unable to create account', e)
		return
	}
}

export const getUsername = async () => {
	const username = await accountService.getUsername({})
	return username || null
}
