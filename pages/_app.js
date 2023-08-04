import '../styles/globals.css';
import { UserProvider } from '../context/authContext';
import { ChatContextProvider } from '../context/chatContext';

function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <ChatContextProvider>
        <Component {...pageProps} />
      </ChatContextProvider>
    </UserProvider>
  );
}

export default MyApp;
