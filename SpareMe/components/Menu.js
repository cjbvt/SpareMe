'use strict';
import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import * as constants from 'constants';
import firebase from 'react-native-firebase';

class Menu extends Component {
    render() {
        const {menuHandler} = this.props;
        const user = firebase.auth().currentUser;
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => menuHandler(constants.SIGN_OUT)}
                >
                    <Text style={styles.menuText}>Sign Out</Text>
                    {user == null ? null : <Text style={styles.menuText}>{'(' + user._user.email + ')'}</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => menuHandler(constants.SETTINGS)}
                >
                    <Text style={styles.menuText}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => menuHandler(constants.TUTORIAL)}
                >
                    <Text style={styles.menuText}>Tutorial</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 5,
        paddingVertical: 2.5,
        justifyContent: 'space-between',
        alignItems: 'stretch'
    },
    menuButton: {
        flex: 1,
        marginVertical: 2.5,
        padding: 5,
        backgroundColor: constants.COLOR_SECONDARY,
        justifyContent: 'center',
        alignItems: 'center'
    },
    menuText: {
        color: constants.COLOR_WHITE,
        fontSize: constants.TEXT_MEDIUM,
        margin: 5
    }
});

export default Menu;
