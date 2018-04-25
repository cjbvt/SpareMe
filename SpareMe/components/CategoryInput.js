'use strict';
import React, { Component } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import * as constants from 'constants';

class CategoryInput extends Component {

    constructor(props) {
        super(props);
        this.state = {text: ''};
    }

    render() {
        const {onSubmit} = this.props;
          return (
              <TextInput
                  style={styles.input}
                  onChangeText={ (text) => {
                      this.setState({
                          text: text
                      });
                  }}
                  onSubmitEditing={ () => {
                      onSubmit(this.state.text);
                  }}
                  placeholder='Enter new category'
                  autoFocus={true}
                  editable={true}
                  autoCorrect={false}
                  autoCapitalize='none'
                  returnKeyType='done'
                  underlineColorAndroid='transparent'
              />
          );
    }
}
const styles = StyleSheet.create({
    input: {
        height: 35,
        margin: 40,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: constants.COLOR_WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        fontSize: constants.TEXT_SMALL
    }
});

export default CategoryInput;
