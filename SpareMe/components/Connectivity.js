'use strict';
import React, { Component } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import CustomStatusBar from './CustomStatusBar'
import Loading from './Loading'
import * as constants from 'constants'

export default class Connectivity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            layout: {
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height
            }
        };
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
        return(
            <View style={styles.container}>
                <Image source={require('../screens/photo.jpeg')} resizeMode='cover' style={[styles.backgroundImage, {height: this.state.layout.height, width: this.state.layout.width}]}/>
                <View style={styles.connectionContainer}>
                    <Text style={styles.connectionText}>Unable to connect. Please check your network settings.</Text>
                </View>
                <Loading hideBar={true} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    connectionContainer: {
        flex: 2,
        backgroundColor: constants.COLOR_MAIN_TRANSPARENT,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30
    },
    connectionText: {
        color: constants.COLOR_WHITE,
        fontSize: constants.TEXT_LARGE
    },
    backgroundImage: {
        position: 'absolute',
        zIndex: -1
    }
});
