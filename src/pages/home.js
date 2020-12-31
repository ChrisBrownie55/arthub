import {Suspense, useState} from 'react'

import {AnimatePresence, motion} from 'framer-motion'
import {useMachine} from '@xstate/react'
import {useHistory} from 'react-router-dom'
import {ActionButton} from '../components/ActionButton.js'
import {ProfileMenuContext, profileMenuMachine} from '../shared/machines.js'

import '../styles/ProfileMenu.css'
import 'wicg-inert'
import {Loading} from '../components/Loading'
import {CharacterCardList} from '../components/CharacterCardList'
import {ProfileHeader} from '../components/ProfileHeader'
import {Text} from '@fluentui/react'

/**
 * Home page
 * @returns {JSX.Element}
 * @constructor
 */
export function Home() {
	const [mode, setMode] = useState('view-characters')
	const machine = useMachine(profileMenuMachine)

	const history = useHistory()
	function openNewCharacterPage() {
		history.push('/new-character')
	}

	return (
		<motion.div
			layout
			style={{height: '100%', display: 'flex', flexDirection: 'column'}}
			initial={{opacity: 0}}
			animate={{opacity: 1}}
			exit={{opacity: 0}}
		>
			<ProfileMenuContext.Provider value={machine}>
				<ProfileHeader changeMode={setMode} />
			</ProfileMenuContext.Provider>

			<main style={{flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '95px'}}>
				<AnimatePresence>
					{mode === 'share-characters' ? (
						<motion.div
							style={{overflow: 'hidden'}}
							initial={{height: 0, opacity: 0}}
							animate={{height: 'auto', opacity: 1}}
							exit={{height: 0, opacity: 0}}
							layout
						>
							<Text as="h2" variant="xxLarge" block style={{margin: '0 0 10px', textAlign: 'center'}}>
								Share a character
							</Text>
							<Text as="p" block style={{margin: '0 10px 10px', textAlign: 'center'}}>
								By clicking the share button, you can create a public link for your character which you can then share
								with your friends.
							</Text>
						</motion.div>
					) : null}
				</AnimatePresence>
				<Suspense fallback={<Loading label="Loading your characters..." />}>
					<CharacterCardList mode={mode} />
				</Suspense>
			</main>

			<section style={{position: 'fixed', bottom: 0, left: 0, padding: 10}}>
				{mode === 'view-characters' ? (
					<ActionButton variant="round-light-orange" iconName="Add" onClick={openNewCharacterPage}>
						New
					</ActionButton>
				) : (
					<ActionButton variant="round-light-orange" iconName="Cancel" onClick={() => setMode('view-characters')}>
						Cancel
					</ActionButton>
				)}
			</section>
		</motion.div>
	)
}
