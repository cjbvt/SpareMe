'use strict';
import React, { Component } from 'react';
import { Dimensions, StyleSheet, Text, View, ScrollView, Image, Button } from 'react-native';
import CustomStatusBar from '../components/CustomStatusBar'
import * as constants from 'constants'
import Video from 'react-native-video'

export default class Tutorial extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstPage: true,
            layout: {
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height
            }
        };
    }

    onScroll = (event) => {
        this.setState({
            firstPage: (event.nativeEvent.contentOffset.x < this.state.layout.width/2),
            secondPage: (event.nativeEvent.contentOffset.x >= this.state.layout.width/2 && event.nativeEvent.contentOffset.x < 3*this.state.layout.width/2),
            thirdPage: (event.nativeEvent.contentOffset.x >= 3*this.state.layout.width/2)
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

    donePressed = () => {
        if (this.props.navigation.state.params) {
            if (this.props.navigation.state.params.fromCreate) {
                this.props.navigation.navigate('Home');
            }
            else {
                this.props.navigation.goBack();
            }
        }
        else {
            this.props.navigation.goBack();
        }
    }

    render() {
        return (
            <View style={styles.container} onLayout={this.onLayout}>
                <CustomStatusBar />
                <View style={[styles.progressContainer, {width: this.state.layout.width}]}>
                    <Text style={styles.progressText}>{this.state.thirdPage ? ' ' : 'Swipe to Continue'}</Text>
                    <View style={styles.iconsContainer}>
                        <View style={styles.iconContainer} >
                            <Image source={require('./circle.png')} style={[styles.icon, this.state.firstPage ? styles.current : null]}/>
                        </View>
                        <View style={styles.iconContainer} >
                            <Image source={require('./circle.png')} style={[styles.icon, this.state.secondPage ? styles.current : null]}/>
                        </View>
                        <View style={styles.iconContainer} >
                            <Image source={require('./circle.png')} style={[styles.icon, this.state.thirdPage ? styles.current : null]}/>
                        </View>
                    </View>
                </View>
                <ScrollView
                    ref='scrollView'
                    horizontal={true}
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    onScroll={this.onScroll}
                    scrollEventThrottle={16}
                >
                    <View style={[styles.pageContainer, {width: this.state.layout.width}]}>
                        <Text style={styles.instructions}>{"Highlight and flag any content that you don't want to see."}</Text>
                        <View style={styles.videoContainer}>
                            <Video
                                source={require('./tutorial1.mp4')}
                                muted={false}
                                paused={false}
                                resizeMode='contain'
                                repeat={true}
                                style={{height: this.state.layout.height * constants.VIDEO_HEIGHT_MULTIPLIER, width: this.state.layout.height * constants.VIDEO_WIDTH_MULTIPLIER}}
                            />
                        </View>
                    </View>
                    <View style={[styles.pageContainer, {width: this.state.layout.width}]}>
                        <Text style={styles.instructions}>{"Tap any blurred text that you wish to see, and choose to unflag it."}</Text>
                        <View style={styles.videoContainer}>
                            <Video
                                source={require('./tutorial2.mp4')}
                                muted={false}
                                paused={false}
                                resizeMode='contain'
                                repeat={true}
                                style={{height: this.state.layout.height * constants.VIDEO_HEIGHT_MULTIPLIER, width: this.state.layout.height * constants.VIDEO_WIDTH_MULTIPLIER}}
                            />
                        </View>
                    </View>
                    <View style={[styles.pageContainer, {width: this.state.layout.width, justifyContent: 'center'}]}>
                        <View style={styles.button}>
                            <Button
                                title='Done'
                                onPress={this.donePressed}
                                color={constants.COLOR_POSITIVE}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: constants.COLOR_MAIN
    },
    pageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    progressContainer: {
        alignItems: 'center',
        padding: 20
    },
    progressText: {
        color: constants.COLOR_WHITE,
        fontSize: constants.TEXT_MEDIUM,
        marginBottom: 5
    },
    instructions: {
        color: constants.COLOR_WHITE,
        fontSize: constants.TEXT_MEDIUM,
        textAlign: 'center',
        marginHorizontal: 25,
        marginVertical: 15
    },
    iconsContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 10,
        width: 10,
        margin: 3
    },
    icon: {
        flex: 1,
        aspectRatio: 1,
        resizeMode: 'contain',
        tintColor: constants.COLOR_DISABLED
    },
    current: {
        tintColor: null
    },
    videoContainer: {
        backgroundColor: constants.COLOR_WHITE,
        paddingHorizontal: 10,
        paddingTop: 20,
        paddingBottom: 0,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10
    },
});
