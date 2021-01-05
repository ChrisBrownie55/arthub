import {StrictMode, Suspense} from 'react';
import ReactDOM from 'react-dom';

import {loadTheme} from '@fluentui/react';
import {Route, Redirect} from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import {initializeIcons} from 'office-ui-fabric-react/lib/Icons';

import {Landing} from './pages/landing.js';
import {Login, Register} from './pages/login.js';
import {Home} from './pages/home.js';
import {NewCharacter} from './pages/new-character.js';
import {CharacterPage} from './pages/character.js';
import {EditCharacterPage} from './pages/edit-character.js';
import {NoRoute} from './pages/404.js';

import {Loading} from './components/Loading.js';
import {FadeLayout} from './components/FadeLayout.js';
import {BasicBoundary} from './components/BasicBoundary.js';
import {TransitionRouter} from './components/TransitionRouter.js';

import {theme} from './shared/theme.js';
import {FirebaseProvider, useUser} from './shared/firebase.js';
import * as serviceWorker from './serviceWorker.js';

import './styles/index.css';

loadTheme(theme);
initializeIcons();

/**
 * A route that will only render when logged in. Redirects to "/login" when logged out.
 * @returns {JSX.Element}
 */
function PrivateRoute({as, ...props}) {
	const user = useUser();

	if (user) return <Route component={as} {...props} />;
	return (
		<FadeLayout>
			<Redirect to="/login" />
		</FadeLayout>
	);
}

/**
 * A route for when you're not logged in. Redirects to the home page when logged in.
 * @returns {JSX.Element}
 */
function UnauthenticatedRoute({as, ...props}) {
	const user = useUser();

	if (!user) return <Route component={as} {...props} />;
	return (
		<FadeLayout>
			<Redirect to="/" />
		</FadeLayout>
	);
}

ReactDOM.render(
	<StrictMode>
		<BasicBoundary>
			<Suspense fallback={<Loading label="Preparing everything as fast as we can..." />}>
				<FirebaseProvider>
					<TransitionRouter>
						<PrivateRoute exact as={Home} path="/" />
						<PrivateRoute exact as={NewCharacter} path="/new-character" />
						<PrivateRoute exact as={CharacterPage} path="/character/:characterId" />
						<PrivateRoute exact as={EditCharacterPage} path="/edit-character/:characterId" />
						<Landing exact path="/landing" />
						<UnauthenticatedRoute exact as={Login} path="/login" />
						<UnauthenticatedRoute exact as={Register} path="/register" />
						<NoRoute exact path="*" />
					</TransitionRouter>
				</FirebaseProvider>
			</Suspense>
		</BasicBoundary>
	</StrictMode>,
	document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
