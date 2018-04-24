'use strict';
import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation'
import Home from './screens/Home'
import Settings from './screens/Settings'
import Tabs from './screens/Tabs'
import Tutorial from './screens/Tutorial'
import SplashScreen from 'react-native-splash-screen';


export default class App extends Component {
    componentDidMount() {
        SplashScreen.hide();
    }
    render() {
        return <RootStack />;
    }
}

const RootStack = StackNavigator(
    {
        Home: {
            screen: Home
        },
        Settings: {
            screen: Settings,
        },
        Tabs: {
            screen: Tabs
        },
        Tutorial: {
            screen: Tutorial
        }
    },
    {
        initialRouteName: 'Home',
        headerMode: 'none',
        navigationOptions: {
            headerVisible: false,
            gesturesEnabled: false
        }
    }
);
