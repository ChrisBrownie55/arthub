import {useContext, useEffect, useRef} from 'react';

import {Text} from '@fluentui/react';
import {AnimatePresence, motion} from 'framer-motion';
import {ShepherdTourContext} from 'react-shepherd';

import {colors, transitions} from '../shared/theme.js';
import {PROFILE_SIZE, ProfilePhoto} from './ProfilePhoto.js';
import {forEachNonDescendantTree} from '../shared/helpers.js';
import {ProfileMenuContext} from '../shared/machines.js';

/** @type {import('framer-motion').MotionStyle} */
const profileMenuStyles = {
	position: 'absolute',
	top: '27px',
	right: '20px',
	display: 'flex',
	flexDirection: 'column',
	backgroundColor: colors.pink,
	borderRadius: '1.6rem',
	zIndex: 2,
	overflow: 'hidden',
};

/** @type {import('framer-motion').MotionStyle} */
const backdropStyles = {
	position: 'absolute',
	left: 0,
	top: 0,
	width: '100vw',
	height: '100vh',
	background: 'white',
	zIndex: 1,
};

/** @type {import('framer-motion').MotionStyle} */
const profileMenuButtonStyles = {
	position: 'relative',
	display: 'flex',
	alignItems: 'center',
	overflow: 'hidden',
	width: PROFILE_SIZE,
	padding: 0,
	background: colors.lightPink,
	border: 'none',
	borderRadius: '2rem',
	cursor: 'pointer',
	outline: 'none',
	WebkitTapHighlightColor: 'rgba(0,0,0,0)',
	zIndex: 2,
};

/** @type {import('framer-motion').MotionStyle} */
const nameWrapperStyles = {
	flexGrow: 1,
	width: '100%',
	position: 'absolute',
	left: `calc(50% + ${PROFILE_SIZE}px / 2)`,
	transform: 'translateX(-50%)',
};

/** @type {import('csstype').Properties} */
const nameStyles = {
	fontWeight: 400,
	letterSpacing: '1px',
	lineHeight: 1.2,
	textAlign: 'center',
	textTransform: 'capitalize',
};

const listVariants = {
	visible: {
		opacity: 1,
		height: 259 - PROFILE_SIZE,
		transition: {
			staggerChildren: 0.05,
		},
	},
	hidden: {
		opacity: 0,
		height: 0,
		transition: {
			duration: 0,
		},
	},
};
/** @type {React.CSSProperties} */
const listStyles = {
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	overflow: 'hidden',
};

const itemVariants = {
	visible: {opacity: 1, y: 0},
	hidden: {opacity: 0, y: 25, transition: {duration: 0}},
};
/** @type {React.CSSProperties} */
const itemStyles = {
	width: '100%',
	padding: '10px 0',
	margin: '0.1rem 0',
	fontSize: '18px',
	fontFamily: 'Inter',
	fontWeight: 600,
	border: 'none',
	cursor: 'pointer',
};

const itemHoverStyles = {scale: 1.05};
const itemTapStyles = {scale: 0.95};

export function ProfileMenuItem(props) {
	return (
		<motion.button
			variants={itemVariants}
			style={itemStyles}
			initial={false}
			whileHover={itemHoverStyles}
			whileTap={itemTapStyles}
			className="ProfileMenuItem"
			{...props}
		/>
	);
}

export function ProfileMenu({
	email, name, menuName, children,
}) {
	const tour = useContext(ShepherdTourContext);

	const [profileState, send, service] = useContext(ProfileMenuContext);
	const backdropRef = useRef(null);

	// handle TAP_AWAY, ESC, and inert
	useEffect(() => {
		function handleTapAway(event) {
			if (backdropRef.current === event.target) send('TAP_AWAY');
		}
		function handleESC(event) {
			if (event.key === 'Escape' || event.key === 'Esc') send('ESC');
		}

		const nonDescendantTrees = new Set();
		function addListeners() {
			window.addEventListener('click', handleTapAway);
			window.addEventListener('keydown', handleESC);
			forEachNonDescendantTree(document.getElementById('profile-menu'), (element) => {
				nonDescendantTrees.add(element);
				element.inert = true;
			});
		}
		function removeListeners() {
			window.removeEventListener('click', handleTapAway);
			window.removeEventListener('keydown', handleESC);
			for (const element of nonDescendantTrees) element.inert = false;
		}

		const subscription = service.subscribe((state) => {
			if (state.matches('open')) addListeners();
			else removeListeners();
		});

		return () => {
			removeListeners();
			subscription.unsubscribe();
		};
	}, [service, send]);

	let width;
	let height = PROFILE_SIZE;
	if (profileState.matches('closed')) width = PROFILE_SIZE;
	else if (profileState.matches('partiallyOpen')) width = PROFILE_SIZE * 3;
	else if (profileState.matches('open')) {
		width = 249;
		height = 259;
	}

	let buttonLabel = 'Open profile menu';
	if (profileState.matches('open')) buttonLabel = 'Close profile menu';

	// TODO: Add focus style to profile menu close button (while profile menu is open)
	return (
		<div id="profile-menu">
			<motion.div style={profileMenuStyles} animate={{height}} transition={transitions.menu}>
				{/* Button to open menu */}
				<motion.button
					style={profileMenuButtonStyles}
					animate={{width}}
					onHoverStart={() => send('HOVER_START')}
					onHoverEnd={() => send('HOVER_END')}
					onFocus={() => send('FOCUS')}
					onBlur={() => send('BLUR')}
					onClick={() => {
						send('TAP_TOGGLE');
						if (
							tour.isActive()
							&& (profileState.matches('closed') || profileState.matches('partiallyOpen'))
						) {
							tour.next();
						}
					}}
					transition={transitions.menu}
					aria-label={buttonLabel}
					title={buttonLabel}
				>
					<motion.span
						animate={{
							opacity: profileState.matches('partiallyOpen') || profileState.matches('open') ? 1 : 0,
						}}
						style={nameWrapperStyles}
						transition={{type: 'spring', mass: 0.2}}
					>
						<Text variant="mediumTitle" style={nameStyles}>
							{profileState.matches('open') ? `${menuName} Menu` : name}
						</Text>
					</motion.span>
					<ProfilePhoto email={email} />
				</motion.button>

				{/* Render menu buttons passed as children */}
				<AnimatePresence>
					{profileState.matches('open') && (
						<motion.div
							initial="hidden"
							animate="visible"
							exit="hidden"
							variants={listVariants}
							/* @ts-ignore */
							style={listStyles}
						>
							{children}
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>

			{/* Fade in backdrop */}
			<AnimatePresence>
				{(profileState.matches('open') || profileState.matches('partiallyOpen')) && (
					<motion.div
						ref={backdropRef}
						initial={{opacity: 0}}
						animate={{opacity: 0.81}}
						exit={{opacity: 0}}
						style={backdropStyles}
						id="profile-menu-backdrop"
					/>
				)}
			</AnimatePresence>
		</div>
	);
}
