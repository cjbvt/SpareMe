'use strict';
import React, { Component } from 'react';
import { Alert, StyleSheet, Text, View, Button, TextInput } from 'react-native';
import FilterWebView from '../components/FilterWebView'
import Connectivity from '../components/Connectivity'
import firebase from 'react-native-firebase';
import * as constants from 'constants'

export default class SignIn extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onLogin = () => {
        const { email, password } = this.state;
        firebase.auth().signInAndRetrieveDataWithEmailAndPassword(email, password)
        .then((user) => {
            this.props.navigateHome();
            // If you need to do anything with the user, do it here
            // The user will be logged in automatically by the
            // `onAuthStateChanged` listener we set up in App.js earlier
        }).catch((error) => {
            const { code, message } = error;
            console.log(message);
            var alertMessage = 'Unable to login.'
            if (message.includes('There is no user record') || message.includes('email address')) {
                alertMessage = constants.INCORRECT_EMAIL;
            }
            else if (message.includes('The password is invalid')) {
                alertMessage = constants.INCORRECT_PASSWORD;
            }
            Alert.alert(
              'Login Failed',
              alertMessage,
              [
                {text: 'OK', onPress: () => console.log('OK Pressed')},
              ],
              { cancelable: false }
            )
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.loginView}>
                    <Text style={styles.signInText}>
                        Sign In
                    </Text>
                    <Text style={styles.headerText}>
                        Email:
                    </Text>
                    <TextInput
                        style= {styles.input}
                        placeholder="Enter Email"
                        underlineColorAndroid={constants.COLOR_WHITE}
                        autoCapitalize='none'
                        autoCorrect={false}
                        selectionColor={constants.COLOR_GRAY}
                        onChangeText={ (text) => {
                            this.setState({
                                email: text
                            });
                        }}
                    />
                    <Text style={styles.headerText}>
                        Password:
                    </Text>
                    <TextInput
                        style= {styles.input}
                        placeholder="Enter Password"
                        underlineColorAndroid={constants.COLOR_WHITE}
                        autoCapitalize='none'
                        autoCorrect={false}
                        secureTextEntry={true}
                        selectionColor={constants.COLOR_GRAY}
                        onChangeText={ (text) => {
                            this.setState({
                                password: text
                            });
                        }}
                    />

                    <View style={styles.buttonContainer}>
                        <View style={styles.button}>
                            <Button
                                title='Sign In'
                                onPress={this.onLogin}
                                color={constants.COLOR_POSITIVE}
                            />
                        </View>
                    </View>
                </View>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    loginView: {
        padding: 50,
        flex: 1,
        backgroundColor: constants.COLOR_MAIN_TRANSPARENT,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    button: {
        flex: 1,
        height: 40,
        margin: 5
    },
    connectionContainer: {
        flex: 1,
        backgroundColor: constants.COLOR_MAIN,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30
    },
    connectionText: {
        color: constants.COLOR_WHITE,
        fontSize: constants.TEXT_LARGE
    },
    signInText: {
        color: constants.COLOR_WHITE,
        fontSize: constants.TEXT_HEADER,
        marginBottom: 20
    },
    headerText: {
        color: constants.COLOR_WHITE,
        fontSize: constants.TEXT_LARGE,
        marginBottom: 5
    },
    input: {
        alignSelf: 'stretch',
        fontSize: constants.TEXT_MEDIUM,
        marginBottom: 10,
        color: constants.COLOR_WHITE
    }
});
