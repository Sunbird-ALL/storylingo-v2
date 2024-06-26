import React, { useEffect, useRef } from 'react';
import { ThemeProvider } from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import { StyledEngineProvider } from '@mui/material/styles';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import routes from './routes';
import { AppContent } from './views';
import theme from './assets/styles/theme';
import { initialize } from './services/telementryService';
import { startEvent } from './services/callTelemetryIntract';
import '@project-sunbird/telemetry-sdk/index.js';

const App = () => {
    const ranonce = useRef(false);

    useEffect(() => {
        const initService = async () => {
            var did;
            if (localStorage.getItem('fpDetails_v2') !== null) {
                let fpDetails_v2 = localStorage.getItem('fpDetails_v2');
                 did = fpDetails_v2.result;
            } else {
                 did = localStorage.getItem('did');
            }

            await initialize({
                context: {
                    mode: process.env.REACT_APP_MODE, // To identify preview used by the user to play/edit/preview
                    authToken: '', // Auth key to make  api calls
                    did: did, // Unique id to identify the device or browser
                    uid: 'anonymous',
                    channel: process.env.REACT_APP_CHANNEL, // Unique id of the channel(Channel ID)
                    env: process.env.REACT_APP_ENV,

                    pdata: {
                        // optional
                        id: process.env.REACT_APP_ID, // Producer ID. For ex: For sunbird it would be "portal" or "genie"
                        ver: process.env.REACT_APP_VER, // Version of the App
                        pid: process.env.REACT_APP_PID, // Optional. In case the component is distributed, then which instance of that component
                    },
                    tags: [
                        // Defines the tags data
                        '',
                    ],
                    timeDiff: 0, // Defines the time difference// Defines the object roll up data
                    host: process.env.REACT_APP_HOST, // Defines the from which domain content should be load
                    endpoint: process.env.REACT_APP_ENDPOINT,
                    apislug: process.env.REACT_APP_APISLUG,
                },
                config: {},
                // tslint:disable-next-line:max-line-length
                metadata: {},
            });
            if (!ranonce.current) {
                if (localStorage.getItem('contentSessionId') === null) {
                    startEvent();
                }
                ranonce.current = true;
            }
        };

        const setFp = async () => {
            const fp = await FingerprintJS.load();

            const { visitorId } = await fp.get();
            if (!localStorage.getItem('did')) {
                localStorage.setItem('did', visitorId);
            }
            initService();
        };

        setFp();
    }, []);

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <Router>
                    <AppContent routes={routes} />
                </Router>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default React.memo(App);
