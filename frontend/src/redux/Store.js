import { createStore } from 'redux';
import { Provider } from 'react-redux';
import authReducer from './reducers/authReducer';

const store = createStore(authReducer);

function App() {
  return (
    <Provider store={store}>
      <Login />
    </Provider>
  );
}

export default App;
