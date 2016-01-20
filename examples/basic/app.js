import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
import { syncHistory, routeReducer } from 'redux-simple-router'
import { UserAuthWrapper } from 'redux-auth-wrapper'

import * as reducers from './reducers';
import { App, Home, Foo, Admin, Login } from './components';

const history = hashHistory;
const routingMiddleware = syncHistory(history);
const reducer = combineReducers(Object.assign({}, reducers, {
  routing: routeReducer
}));

const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey='ctrl-h'
               changePositionKey='ctrl-q'>
    <LogMonitor theme='tomorrow' />
  </DockMonitor>
);

const finalCreateStore = compose(
  applyMiddleware(routingMiddleware),
  DevTools.instrument()
)(createStore);
const store = finalCreateStore(reducer);
routingMiddleware.listenForReplays(store);

const UserIsAuthenticated = UserAuthWrapper(state => state.user)('/login', 'UserIsAuthenticated')
const UserIsAdmin = UserAuthWrapper(state => state.user)('/', 'UserIsAdmin', user => user.isAdmin, false)

ReactDOM.render(
  <Provider store={store}>
    <div>
      <Router history={history}>
        <Route path="/" component={App}>
          <IndexRoute component={Home}/>
          <Route path="login" component={Login}/>
          <Route path="foo" component={UserIsAuthenticated(Foo)}/>
          <Route path="admin" component={UserIsAuthenticated(UserIsAdmin(Admin))}/>
        </Route>
      </Router>
      <DevTools />
    </div>
  </Provider>,
  document.getElementById('mount')
);