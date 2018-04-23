'use strict';
import React, { Component } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import CustomStatusBar from './CustomStatusBar'
import * as constants from 'constants'

export default class Loading extends Component {
    render() {
        return(
            <View style={styles.container}>
                {this.props.hideBar ? null : <CustomStatusBar/>}
                <View style={[styles.activityView, this.props.hideBar ? {backgroundColor: constants.COLOR_MAIN_TRANSPARENT} : null]}>
                    <ActivityIndicator
                        animating={true}
                        color={constants.COLOR_WHITE}
                        size='large'
                        hidesWhenStopped={true}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    activityView: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: constants.COLOR_MAIN,
        flex: 1
    }
});
