import React from 'react';
import FastImage, { FastImageProperties } from 'react-native-fast-image';
import { StyleSheet, View, Animated, ViewStyle, Image } from 'react-native';

/* ------------- Props and State ------------- */
type Props = {
  images: FastImageProperties['source'][];
  style?: ViewStyle;
};

/* ------------- Class ------------- */
const showTime = 7000;
const scaleValue = 1.2;
const transitionDuration = 1000;

// TODO: Check why performance is low on emulator, check on prod build
class ImageOpacityCycler extends React.PureComponent<Props> {
  scaleValues = this.props.images.map(() => new Animated.Value(1));
  opacityValues = this.props.images.map(() => new Animated.Value(1));

  componentDidMount() {
    this.initiateAnimation();
  }

  initiateAnimation = async () => {
    const { images } = this.props;

    if (images.length > 1) {
      this.animateImageByIndex(0);
    }
  };

  animateImageByIndex = (index: number) => {
    const { images } = this.props;
    const isLastImage = index === images.length - 1;
    const nextIndex = isLastImage ? 0 : index + 1;

    if (index === 0) {
      Animated.timing(this.opacityValues[index], {
        toValue: 1,
        duration: transitionDuration,
        useNativeDriver: true,
      }).start();
    }

    Animated.timing(this.scaleValues[index], {
      toValue: scaleValue,
      duration: showTime + transitionDuration,
      useNativeDriver: true,
    }).start();

    Animated.delay(showTime).start(() => {
      this.resetAnimationValues(nextIndex, isLastImage);
      this.animateImageByIndex(nextIndex);

      if (!isLastImage) {
        Animated.timing(this.opacityValues[index], {
          toValue: 0,
          duration: transitionDuration,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  resetAnimationValues = (index: number, onlyResetScale: boolean) => {
    this.scaleValues[index].setValue(1);
    onlyResetScale || this.opacityValues[index].setValue(1);
  };

  getAnimatedSlideStyle = (index: number) => {
    return { transform: [{ scale: this.scaleValues[index] }], opacity: this.opacityValues[index] };
  };

  renderImages = () => {
    const { images } = this.props;

    return images
      .map((image, index) => (
        <Animated.View key={`${image.toString()}_${index}`} style={[styles.slide, this.getAnimatedSlideStyle(index)]}>
          <FastImage source={image} style={styles.image} resizeMode="cover" />
        </Animated.View>
      ))
      .reverse();
  };

  render() {
    const { style } = this.props;
    console.tron.log('render');

    return (
      <View style={style}>
        {this.renderImages()}
        <View style={styles.dimmer} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  slide: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  dimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
});

export default ImageOpacityCycler;