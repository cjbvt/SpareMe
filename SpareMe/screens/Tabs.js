'use strict';
import React, { Component } from 'react';
import { BackHandler, Platform, Dimensions, StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, NetInfo } from 'react-native';
import CreateAccount from './CreateAccount'
import Connectivity from '../components/Connectivity'
import SignIn from './SignIn'
import * as constants from 'constants'

export default class Tabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstPage: true,
            layout: {
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height
            }
        };
        NetInfo.isConnected.fetch().then(isConnected => {
            this.setState({isConnected: isConnected});
        });
    }

    componentWillMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBackClicked);
        }
    }

    componentDidMount() {
        NetInfo.isConnected.addEventListener('connectionChange', this.onConnectivityChange);
    }

    componentWillUnmount() {
        NetInfo.removeEventListener('connectionChange', this.onConnectivityChange);
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener("hardwareBackPress", this.onBackClicked);
        }
    }

    onBackClicked = () => {
        BackHandler.exitApp();
        return true;
    }

    onConnectivityChange = isConnected => {
        this.setState({isConnected: isConnected});
    }

    navigateHome = () => {
        this.props.navigation.navigate('Home');
    }

    navigateTutorial = () => {
        this.props.navigation.navigate('Tutorial', {fromCreate: true});
    }

    onScroll = (event) => {
        this.setState({
            firstPage: (event.nativeEvent.contentOffset.x < this.state.layout.width/2)
        });
    }

    onLayout = (event) => {
        this.setState({
            layout:{
                height: event.nativeEvent.layout.height,
                width: event.nativeEvent.layout.width,
            }
        });
    }

    render() {
        if (!this.state.isConnected) {
            return (<Connectivity />);
        }
        return (
            <View style={styles.container} onLayout={this.onLayout}>
                <ScrollView
                    ref='scrollView'
                    horizontal={true}
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    onScroll={this.onScroll}
                    scrollEventThrottle={16}
                >
                    <Image source={require('./photo.jpeg')} resizeMode='cover' style={[styles.backgroundImage, {height: this.state.layout.height, width: this.state.layout.width * 2}]}/>
                    <View style={{height: this.state.layout.height, width: this.state.layout.width}}>
                        <SignIn isATab={true} navigateHome={this.navigateHome} />
                    </View>
                    <View style={{height: this.state.layout.height, width: this.state.layout.width}}>
                        <CreateAccount isATab={true} navigateTutorial={this.navigateTutorial} />
                    </View>
                </ScrollView>
                <View style={[styles.iconContainer, {width: this.state.layout.width}]}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={ () => {
                            this.refs.scrollView.scrollTo({x: 0, y: 0, animated: true})
                        }
                    }>
                        <Image source={require('./account.png')} style={[styles.icon, this.state.firstPage ? null : styles.disabled]}/>
                        <Text style={[styles.iconText, this.state.firstPage ? null : styles.disabledText]}>Sign In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={ () => {
                            this.refs.scrollView.scrollTo({x: this.state.layout.width, y: 0, animated: true})
                        }
                    }>
                        <Image source={require('./create.png')} style={[styles.icon, this.state.firstPage ? styles.disabled : null]}/>
                        <Text style={[styles.iconText, this.state.firstPage ? styles.disabledText : null]}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: constants.COLOR_MAIN
    },
    iconContainer: {
        height: 65,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 2,
        position: 'absolute',
        bottom: 10
    },
    iconButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        color: constants.COLOR_WHITE,
        fontSize: constants.TEXT_SMALL
    },
    icon: {
        flex: 1,
        aspectRatio: 1,
        resizeMode: 'contain'
    },
    disabled: {
        tintColor: constants.COLOR_DISABLED
    },
    disabledText: {
        color: constants.COLOR_DISABLED
    },
    backgroundImage: {
        position: 'absolute',
        zIndex: -1
    }
});
