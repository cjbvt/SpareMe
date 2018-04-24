'use strict';
import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Icon, View, Image, Text } from 'react-native';
import * as api from 'ml-api'
import * as constants from 'constants'
import { injectedJS } from './injected.js'

export default class BottomButtonBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showFlagButton: false,
            showUnflagButton: false
        }
    }

    showCategories() {
        api.getCategories(this.props.idToken, (response) => {
            this.setState({
                categories: response
            });
        });

        this.setState({
            showFlagButton: false,
            showUnflagButton: false,
            showCategories: true
        });

        this.props.webView.setState({
            showFullscreenOpacity: true
        })
    }

    render() {
        return (
            <View style={styles.buttonBar}>
                { this.state.showFlagButton ?
                    (
                        <TouchableOpacity style={styles.flagButton}
                            onPress={() => {this.showCategories()}}>
                            <Image source={require('./invisible.png')} style={styles.image}/>
                            <Text style={styles.flagButtonText}>Flag</Text>
                        </TouchableOpacity>
                    ) :
                    ( this.state.showUnflagButton ?
                        (
                            <TouchableOpacity
                                style={styles.flagButton}
                                onPress={this.props.webView.onUnflagButtonPress}>
                                <Image source={require('./visible.png')} style={styles.image}/>
                                <Text style={styles.flagButtonText}>Unflag</Text>
                            </TouchableOpacity>
                        ) :
                        null)
                }
                { this.state.showCategories ?
                    (
                        <ScrollView
                            ref='scrollView'
                            horizontal={true}
                            pagingEnabled={true}
                            showsHorizontalScrollIndicator={false}
                            /* Couldn't figure out how to align the content to the
                             right, so I'm just animating it for now. */
                            onContentSizeChange={(contentWidth, contentHeight) => {
                                this.refs.scrollView.scrollToEnd({animated: true});
                            }
                        }>
                            {this.renderCategoryButtons()}
                            <TouchableOpacity
                                style={styles.flagButton}
                                onPress={() => {this.props.webView.onNewCategoryButtonPress(this.state.categories)}}>
                                <Text style={styles.flagButtonText}>+</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    ) : null
                }
            </View>
        );
    }

    /**
    * Returns a button for each category in the state
    */
    renderCategoryButtons() {
        if (!this.state.categories) return null;

        return this.state.categories.map((item, index) => {
            return (
                <TouchableOpacity
                    key={'category' + index}
                    style={styles.flagButton}
                    onPress={() => {this.props.webView.onFlagCategoryButtonPress(item)}}>
                    <Text style={styles.flagButtonText}>{item}</Text>
                </TouchableOpacity>
            );
        });
    }
}

const styles = StyleSheet.create({
    buttonBar: {
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 15,
        paddingBottom: 15,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        position: 'absolute'
    },
    flagButton: {
        alignItems: 'center',
        backgroundColor: constants.COLOR_SECONDARY,
        borderRadius: 37,
        height: 74,
        justifyContent: 'center',
        margin: 5,
        width: 74,
        zIndex: 3
    },
    flagButtonText: {
        color: 'white',
        fontSize: constants.TEXT_SMALL,
        textAlign: 'center'
    },
    image: {
        height: 30,
        aspectRatio: 1,
        resizeMode: 'contain'
    }
});
