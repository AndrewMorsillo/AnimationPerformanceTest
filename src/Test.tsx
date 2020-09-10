import React, {useEffect, useRef, useState} from "react"
import {Animated, Dimensions, Easing, Image, ImageBackground, StyleSheet, View} from "react-native"
import _ from "lodash"
import {useFloatAnim, useFloatSimpleAnimation, useRefFn} from "./hooks";

const {width, height} = Dimensions.get("screen")
const imgSize = 50

function randomPos(){
    return {x: _.random(0, width-imgSize), y: _.random(0, height-imgSize)}
}



function AnimatedComponent({index}:{index: number}){

    const pos = useRef(randomPos()).current

    // const [render, animVal] = useFloatAnim(true)
    const [render, animVal] = useFloatSimpleAnimation(true)

    console.log("Render chicken ", index)
    return (
        <Animated.View style={{ position: "absolute", top: 0, left: 0,transform: [{translateY: pos.y} ,{translateX: pos.x}], width: imgSize, height: imgSize}}>
            <Animated.View style={{transform: [{translateY: animVal}], width: imgSize, height: imgSize}} >
                <Image source={require("../assets/chicken.png")} style={{width: imgSize, height: imgSize}} />
            </Animated.View>
        </Animated.View>
    )
}

export function Test(){


    return (
        <View style={{...StyleSheet.absoluteFillObject}}>
            <ImageBackground
                source={require("../assets/testbg.jpg")}
                resizeMode={"stretch"}
                style={{
                    ...StyleSheet.absoluteFillObject,

                    zIndex: -1,
                }}
            />
            {_.range(500).map((i) => <AnimatedComponent key={i} index={i} />

            )}
        </View>

    )
}
