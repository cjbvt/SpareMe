'use strict';
import React from 'react';
import { BackHandler, Icon, Image, Platform, StyleSheet, Text, TouchableOpacity, View, WebView } from 'react-native';
import * as api from 'ml-api'
import * as constants from 'constants'
import { injectedJS } from './injected.js'
import BottomButtonBar from './BottomButtonBar.js'
import CategoryInput from './CategoryInput.js'

export default class FilterWebView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showFullscreenOpacity: false
        }
        this.onBackClicked = this.onBackClicked.bind(this);
    }

    componentWillMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBackClicked);
        }
    }

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener("hardwareBackPress", this.onBackClicked);
        }
    }

    onBackClicked = () => {
        if (this.state.canGoBack) {
            this.goBack();
        } else {
            BackHandler.exitApp();
        }
        return true;
    }

    /**
    * Sends a message from React Native to the WebView
    */
    postMessage = (action) => {
        this.refs.webView.postMessage(JSON.stringify(action));
    }

    /**
    * Handles data passed from the WebView to React
    */
    onMessage(data) {
        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (error) {
            console.log("Eror parsing JSON data from string '" + data + "''");
            return;
        }

        let messageType = jsonData['messageType'];

        console.log('got message type: ' + messageType);

        switch(messageType) {
            case 'addTextToAPI':
                console.log('adding newly-flagged text to the API. category: ' + jsonData['category'] + ' text: ' + jsonData['text']);
                let category = jsonData['category'];
                api.addTextToCategory(jsonData['text'], category ? category: 'hateful', this.props.idToken);
                break;

            case 'textHidden':
                console.log('hiding text: ' + jsonData['text']);
                this.setState({textHidden: jsonData['text']})
                break;

            case 'predict':
                let predictionBatch = jsonData['content'];

                api.getCategoriesForBatch(predictionBatch, this.props.idToken,
                    (categories) => {
                        try {
                            for (var key in categories) {
                                if (!categories.hasOwnProperty(key)) continue;

                                let category = categories[key];
                                if (category === constants.HATEFUL) {
                                    console.log('hiding: ' + key);
                                    this.postMessage({
                                        name: 'hide',
                                        className: key
                                    });
                                } else {
                                    // console.log(key + ' is in category: ' + category);
                                }
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    });
                    break;

            case 'selectionChanged':
                let selection = jsonData['content'];
                let isHiddenElement = jsonData['isHiddenElement'];
                // console.log('selection changed to: ' + selection);
                this.refs.buttonBar.setState({
                    showFlagButton: !isHiddenElement
                });

                break;

            case 'selectionEnded':
                // console.log('selection ended');
                this.refs.buttonBar.setState({
                    showFlagButton: false
                })

                break;

            case 'elementRevealed':
                console.log('elementRevealed');
                this.refs.buttonBar.setState({
                    showFlagButton: false,
                    showUnflagButton: true
                });

                this.setState({
                    showFullscreenOpacity: true
                })

                break;

            default:
                /* Unknown message type */
        }
    }

    refresh() {
        this.refs.webView.reload();
    }

    goBack() {
        this.refs.webView.goBack();
    }

    goForward() {
        this.refs.webView.goForward();
    }

    onFlagCategoryButtonPress = (category) => {
        this.postMessage({
            name: 'selectionFlagged',
            category: category
        });

        this.refs.buttonBar.setState({
            showCategories: false
        });

        this.setState({
            showFullscreenOpacity: false,
            showCategoryInput: false
        });
    }

    onNewCategoryButtonPress = () => {
        this.setState({
            showCategoryInput: true,
            textHidden: ''
        });
        this.postMessage({
            name: 'hideSelectionForNewCategory'
        });
    }

    onCategorySubmit = (category) => {
        const lowerCategory = category.toLowerCase();
        console.log('adding newly-flagged text to the API. category: ' + lowerCategory + ' text: ' + this.state.textHidden);
        api.addTextToCategory(this.state.textHidden, category ? category: 'hateful', this.props.idToken);

        this.refs.buttonBar.setState({
            showCategories: false
        });

        this.setState({
            showFullscreenOpacity: false,
            showCategoryInput: false
        });
    }

    onUnflagButtonPress = () => {
        this.postMessage({
            name: 'selectionUnflagged'
        });

        this.refs.buttonBar.setState({
            showFlagButton: false,
            showUnflagButton: false
        });

        this.setState({
            showFullscreenOpacity: false
        });
    }

    removeFullscreen = () => {
        let removeCategories = this.refs.buttonBar.state.showCategories;

        if (removeCategories) {
            this.refs.buttonBar.setState({showCategories: false});
        } else { /* remove unflag button */
            this.refs.buttonBar.setState({showUnflagButton: false});
            this.postMessage({
                name: 'unflagIgnored'
            });
        }

        this.setState({
            showFullscreenOpacity: false,
            showCategoryInput: false
        });
    }

    navChangeHandler = (webState) => {
        if (!webState.url.includes('react-js-navigation://postMessage')) {
            this.props.navChangeHandler(webState);
            this.refs.buttonBar.setState({
                showFlagButton: false,
                showUnflagButton: false,
                showCategories: false
            });

            this.setState({
                showFullscreenOpacity: false,
                showCategoryInput: false,
                canGoBack: webState.canGoBack
            });
        }
    }

    render() {
        return (
            <View style={styles.web}>
                <WebView
                    {...this.props}
                    ref='webView'
                    injectedJavaScript={this.props.user ? injectedJS : null}
                    onNavigationStateChange={this.navChangeHandler}
                    onMessage={e => this.onMessage(e.nativeEvent.data)}
                />
                {this.state.showFullscreenOpacity ?
                    (
                        <TouchableOpacity style={styles.fullscreen} onPress={this.removeFullscreen} />
                    ) : null
                }
                {this.state.showCategoryInput ?
                    (
                        <View style={styles.input}>
                            <CategoryInput onSubmit={this.onCategorySubmit} />
                        </View>
                    ) : null
                }
                <BottomButtonBar
                    {...this.props}
                    ref='buttonBar'
                    webView={this}
                    style={{zIndex: 2}}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    web: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center'
    },
    fullscreen: {
        height: '100%',
        width: '100%',
        position: 'absolute',
        backgroundColor: '#77777777'
    },
    input: {
        flex: 1,
        width: '100%',
        position: 'absolute'
    }
});
