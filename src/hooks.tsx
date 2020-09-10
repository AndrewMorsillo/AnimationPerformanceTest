import React, {useEffect, useRef, useState} from "react";
import {Animated, Easing} from "react-native";
import _ from "lodash";
import {useSimpleAnimation} from "./useSimpleAnimation";


const SENTINEL = {}
export function useRefFn<T>(init: () => T) {
    const ref = useRef<T | typeof SENTINEL>(SENTINEL)
    if (ref.current === SENTINEL) {
        ref.current = init()
    }
    return ref as React.MutableRefObject<T>
}

/**
 * A convenience wrapper for a ref to trigger a re-render when the value changes
 * It does this by setting state on change
 * Useful for coordinating animations between components where effects need to happen when
 * an animation starts/stops
 * @param init
 */
export const useRenderRef: <T>(init: T) => { current: T } = (init) => {
    const [state, setState] = useState(init)
    const ref = useRef(init)

    //Use getters and setters to retain the original ref API
    return {
        get current() {
            return ref.current
        },
        set current(val) {
            ref.current = val
            setState(val)
        },
    }
}



export function useDelayUnmount(isMounted: boolean, delayTime: number) {
    const [shouldRender, setShouldRender] = useState(isMounted)

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>
        if (isMounted && !shouldRender) {
            setShouldRender(true)
        } else if (!isMounted && shouldRender) {
            timeoutId = setTimeout(() => setShouldRender(false), delayTime)
        }
        return () => clearTimeout(timeoutId)
    }, [isMounted, delayTime, shouldRender])
    return shouldRender
}

export const useFloatAnim = (shown: boolean, speed: number = 1200) => {
    const shouldRender = useDelayUnmount(shown, speed)
    const yValue = useRef(new Animated.Value(0))

    const randomFloatAmount = - useRefFn(() => _.random(1,5)).current
    const randomSpeed =  useRefFn(() => _.random(900,1800)).current


    //useEffect will re-run this fn any time "shown" changes so our animation starts at the right time
    useEffect(() => {
        Animated.loop(

            Animated.timing(yValue.current, {
                toValue: shown ? 1 : 0,
                duration: randomSpeed,
                easing: Easing.linear,
                useNativeDriver: true,
            })
            , {iterations: -1}).start()
    }, [shown])


    const interpolatedTranslateY = yValue.current.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, randomFloatAmount, 0],
    })

    return [shouldRender, interpolatedTranslateY] as const
}


export const useFloatSimpleAnimation = (shown: boolean, speed: number = 1200) => {
    const shouldRender = useDelayUnmount(shown, speed)

    const randomFloatAmount = - useRefFn(() => _.random(1,5)).current
    const randomSpeed =  useRefFn(() => _.random(900,1800)).current


    const [animValRef] = useSimpleAnimation({timingConfig: {duration: randomSpeed}, name: "testFloat", loop: -1, debug: true})

    const interpolatedTranslateY = animValRef.current.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, randomFloatAmount, 0],
    })

    return [shouldRender, interpolatedTranslateY] as const
}



export const usePopScaleInOut = (shown: boolean, speed: number = 400) => {
    const shouldRender = useDelayUnmount(shown, speed)
    const opacityValue = useRef(new Animated.Value(0))
    const outerScaleValue = useRef(new Animated.Value(0))

    //useEffect will re-run this fn any time "shown" changes so our animation starts at the right time
    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacityValue.current, {
                toValue: shown ? 1 : 0,
                duration: speed,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            Animated.timing(outerScaleValue.current, {
                toValue: shown ? 1 : 0,
                duration: speed,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        ]).start()
    }, [shown])

    const interpolatedOpacity = opacityValue.current.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.5, 1],
    })
    const interpolatedScale = outerScaleValue.current.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.1, 1.3, 1],
    })

    return [shouldRender, interpolatedOpacity, interpolatedScale] as const
}
