import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Animated } from "react-native"
import { useRefFn, useRenderRef } from "./hooks"
// import logger from "../logger"
// import { useAnimatedLatestValueRef } from "./animationUtils"



/**
 * Since there's no (official) way to read an Animated.Value synchronously this is the best solution I could come up with
 * to have access to an up-to-date copy of the latest value without sacrificing performance.
 *
 * @param animatedValue the Animated.Value to track
 * @param initial Optional initial value if you know it to initialize the latest value ref before the animated value listener fires for the first time
 *
 * returns a ref with the latest value of the Animated.Value and a boolean ref indicating if a value has been received yet
 */
export const useAnimatedLatestValueRef = (animatedValue: Animated.Value, initial?: number) => {

    //If we're given an initial value then we can pretend we've received a value from the listener already
    const latestValueRef = useRef(initial ?? 0)
    const initialized = useRef(typeof initial == "number")
    //
    // useEffect(() => {
    //         console.log("EFFECT URN")
    //     const id = animatedValue.addListener((v) => {
    //         //Store the latest animated value
    //         latestValueRef.current = v.value
    //         //Indicate that we've recieved a value
    //         initialized.current = true
    //     })
    //
    //     //Return a deregister function to clean up
    //     return () => animatedValue.removeListener(id)
    //
    //     //Note that the behavior here isn't 100% correct if the animatedValue changes -- the returned ref
    //     //may refer to the previous animatedValue's latest value until the new listener returns a value
    // }, [animatedValue])

    return [latestValueRef, initialized] as const
}

// import { rootStoreReference } from "../../mobx/models"
//
// const log = logger.child("useSimpleAnimation.tsx")
// const SimpleAnimationStoreAnimation = t
//     .model({
//         id: t.identifier,
//         name: t.string,
//         isRunning: t.optional(t.boolean, false),
//         hasRun: t.optional(t.boolean, false),
//     })
//     .views((self) => ({
//         get log() {
//             return getEnv<SimpleAnimationStoreEnvType>(self).log
//         },
//     }))
//     .volatile<{
//         valueRef?: React.MutableRefObject<Animated.Value>
//         animationRef?: React.MutableRefObject<Animated.CompositeAnimation>
//         trigger?: () => void
//     }>((self) => {
//         return {
//             valueRef: undefined,
//             animationRef: undefined,
//         }
//     })
//     .actions((self) => {
//         const start = () => {
//             self.animationRef?.current.start()
//         }
//         const stop = () => {
//             self.animationRef?.current.stop()
//         }
//         const setIsRunning = (isRunning: boolean) => {
//             if (isRunning) self.hasRun = true
//             if (self.isRunning && !isRunning) {
//                 for (const cb of Object.values(onFinishedCallbacks)) {
//                     cb()
//                 }
//             }
//             self.isRunning = isRunning
//         }
//
//         let onFinishedCallbacks: { [key: string]: () => void } = {}
//         /**
//          * Callback when animation is finished (has to have started at least once)
//          * @param id id for callback so we don't add multiples
//          * @param cb callback
//          */
//         const onFinished = (id: string, cb: () => void) => {
//             onFinishedCallbacks[id] = cb
//         }
//
//         const setRefs = ({
//                              valueRef,
//                              animationRef,
//                              trigger,
//                          }: {
//             valueRef?: React.MutableRefObject<Animated.Value>
//             animationRef?: React.MutableRefObject<Animated.CompositeAnimation>
//             trigger?: () => void
//         }) => {
//             self.valueRef = valueRef
//             self.animationRef = animationRef
//             self.trigger = trigger
//         }
//
//         const beforeDestroy = () => {
//             //Not sure if necessary, but this is to make sure we don't hold references
//             //to callbacks and create memory leaks
//             onFinishedCallbacks = {}
//             self.valueRef = undefined
//             self.animationRef = undefined
//         }
//
//         return { start, stop, setIsRunning, onFinished, setRefs, beforeDestroy }
//     })
// export interface SimpleAnimationStoreAnimationType extends Instance<typeof SimpleAnimationStoreAnimation> {}
//
// type SimpleAnimationStoreEnvType = {
//     log: typeof logger
// }
// const SimpleAnimationStore = t
//     .model({
//         name: t.string,
//         debug: t.optional(t.boolean, false),
//         animations: t.map(SimpleAnimationStoreAnimation),
//     })
//     .views((self) => ({
//         get log() {
//             return getEnv<SimpleAnimationStoreEnvType>(self).log
//         },
//     }))
//     .volatile((self) => {
//         const animFinishedSubject = new Subject<{ animId: string; animName: string }>()
//         return {
//             animFinishedSubject,
//         }
//     })
//     .actions((self) => {
//         // const animFinishedPromise = flow(function* (name: string) {
//         //TODO: this is dangerous, could easily leak mem if the when() never resolves
//         //     let hasStarted = false
//         //     return when(() => {
//         //         const anim = self.animations.get(name)
//         //         if (anim) {
//         //             if (!hasStarted && anim.isRunning) {
//         //                 hasStarted = true
//         //             }
//
//         //             if (hasStarted && !anim.isRunning) {
//         //                 return true
//         //             }
//         //         }
//         //         return false
//         //     })
//         // })
//
//         const registerAnimation = (
//             id: string,
//             name: string,
//             valueRef?: React.MutableRefObject<Animated.Value>,
//             animationRef?: React.MutableRefObject<Animated.CompositeAnimation>,
//             trigger?: () => void
//         ) => {
//             const existing = self.animations.get(id)
//             if (existing) {
//                 self.log.warn("Tried to register same animation ID twice! Skipping.", { id, name })
//                 return existing
//             }
//             self.debug && self.log.info("Registered animation ", { id, name })
//             const animNode = self.animations.put({ id, name, isRunning: false })
//             animNode.onFinished("parentStore", () => {
//                 //emit an event on anim finished
//                 self.animFinishedSubject.next({ animId: animNode.id, animName: animNode.name })
//                 //Notify the root store subjects that an animation finished
//                 rootStoreReference.animIdFinishedSubject.next(animNode.id)
//                 rootStoreReference.animNameFinishedSubject.next(animNode.name)
//             })
//             animNode.setRefs({ valueRef, animationRef, trigger })
//             return animNode
//         }
//         const removeAnimation = (id: string) => {
//             const existing = self.animations.get(id)
//             if (!existing) {
//                 self.log.warn("Tried to remove non-existant animation", { id })
//                 return
//             }
//             const animLogInfo = { id, name: existing.name, animId: existing.id }
//
//             if (existing.animationRef) {
//                 existing.animationRef.current.stop()
//             }
//             if (existing.isRunning) {
//                 //Ensure that an unmounted animation still fires its finished callbacks, other code may depend on them
//                 // self.log.warn("removeAnimation removing still running animation", animLogInfo)
//                 existing.setIsRunning(false)
//             }
//             self.debug && self.log.info("Removing animation", animLogInfo)
//             destroy(existing)
//             self.animations.delete(id)
//         }
//
//         const beforeDestroy = () => {
//             self.animFinishedSubject.complete()
//         }
//
//         return { registerAnimation, removeAnimation, beforeDestroy }
//     })
// export interface SimpleAnimationStoreType extends Instance<typeof SimpleAnimationStore> {}
//
// const createSimpleAnimationContextStore = ({ name, debug = false }: { name: string; debug?: boolean }) => {
//     const log = logger.child(`simpleAnimationContext|${name}`)
//     debug && log.info("Creating animation context ", { name, debug })
//     const val = SimpleAnimationStore.create(
//         {
//             name,
//             debug,
//         },
//         { log }
//     )
//     return val
// }
//
// /**
//  * Helper hook to register an animation on mount and unregister on unmount
//  * @param animContext
//  * @param id
//  */
// export const useSimpleAnimationRegistration = (
//     animContext: SimpleAnimationStoreType,
//     id: string,
//     name: string,
//     valueRef?: React.MutableRefObject<Animated.Value>,
//     animationRef?: React.MutableRefObject<Animated.CompositeAnimation>,
//     trigger?: () => void,
//     debug?: boolean
// ) => {
//     //Create a new animation instance on the closest store in context
//     const animationNodeRef = useRef<SimpleAnimationStoreAnimationType>()
//
//     useEffect(() => {
//         debug && log.info("Create animation node useSimpleAnimationRegistration", { name, id })
//         animationNodeRef.current = animContext.registerAnimation(id, name, valueRef, animationRef, trigger)
//
//         //Remove self from store on unmount
//         return () => {
//             debug && log.info("Animation unmount remove from context", { name, id })
//             animContext.removeAnimation(id)
//         }
//     }, [])
//     //Return animation instance for updating state
//     return animationNodeRef
// }
//
// /**
//  * Call a callback when an animation in the current context finishes.
//  * Useful for coordinating the state of components with nested child animations.
//  * @param id id of animation in this context
//  * @param cb your callback function
//  * @param deps any deps you need, just like useCallback
//  */
// export const useSimpleAnimationFinishedCallback = (
//     id: string,
//     cb: () => void,
//     deps: React.DependencyList = [],
//     debug: boolean = false
// ) => {
//     const animContext = useSimpleAnimationContext()
//     const anim = animContext.animations.get(id)
//     const cbId = useRef(uuid()).current
//     const callback = useCallback(cb, deps)
//     debug && console.log("useSimpleAnimationFinishedCallback", id)
//     if (anim) {
//         anim.onFinished(cbId, callback)
//     }
// }
//
// export function useSimpleAnimationFinishedByNameCallback(
//     name: string,
//     cb: () => void,
//     deps: React.DependencyList = [],
//     debug: boolean = false
// ) {
//     const animContext = useSimpleAnimationContext()
//     useSubscription(animContext.animFinishedSubject.pipe(filter((a) => a.animName == name)), (a) => {
//         console.log("useSimpleAnimationFinishedByNameCallback", { name, a })
//
//         cb()
//     })
//     //I have NO IDEA why this didn't work, but the observable-hooks library takes care of doing it right with useSubscription
//     //it was terminating the subject when i called unsubscribe for some reason?
//     // useEffect(() => {
//     //     const animObservable = animContext.animFinishedSubject
//     //         .pipe(filter((a) => a.animName == name))
//     //         .subscribe((a) => {
//     //             debug && console.log("useSimpleAnimationFinishedByNameCallback", name)
//     //
//     //             cb()
//     //         })
//     //     return () => animObservable.unsubscribe()
//     // }, deps)
// }
//
// export const useSimpleAnimationFinishedObservable = (id: string) => {
//     const animContext = useSimpleAnimationContext()
//     const anim = animContext.animations.get(id)
//     const cbId = useRef(uuid()).current
//
//     const [callback, obs$] = useObservableCallback<boolean>((events$) => events$)
//     if (anim) {
//         anim.onFinished(cbId, () => callback(true))
//     }
//     return obs$
// }
//
// // export const createAnimationsFinishedPromise = (
// //     names: string[],
// //     animContext: SimpleAnimationStoreType,
// //     debug: boolean = true
// // ) => {
// //     const log = logger.child(`animationFinishedPromise.${name}`)
// //     //rxjs to the rescue, much simpler than below
// //     return animContext.animFinishedSubject
// //         .pipe(
// //             filter((id) => names.indexOf(id) > -1),
//
// //             timeout(30000),
// //             catchError((err) => {
// //                 log.error("ERROR animationFinishedPromise did not finish after 30s, likely a memory leak!")
// //                 return throwError(err)
// //             })
// //         )
// //         .toPromise()
// // }
//
// /**
//  * Given animation name and animation context returns a promise that resolves when the animation has completed after running once
//  * @param name
//  * @param animContext
//  * @param debug
//  */
// export const createAnimationFinishedPromise = (
//     animId: string,
//     animContext: SimpleAnimationStoreType,
//     debug: boolean = true
// ) => {
//     const log = logger.child(`animationFinishedPromise|${animId}`)
//     //rxjs to the rescue, much simpler than below
//     return animContext.animFinishedSubject
//         .pipe(
//             find((anim) => anim.animId == animId),
//             timeout(30000),
//             catchError((err) => {
//                 log.error("ERROR animationFinishedPromise did not finish after 30s, likely a memory leak!")
//                 return throwError(err)
//             })
//         )
//         .toPromise()
//
//     // let hasRun = false
//     // const p = when(() => {
//     //     const anim = animContext.animations.get(name)
//     //     if (anim) {
//     //         if (anim.isRunning) {
//     //             hasRun = true
//     //         }
//     //         if (!anim.isRunning && hasRun) {
//     //             return true
//     //         }
//     //     }
//     //     return false
//     // })
//
//     // //Set a timeout to log an error if an animationFinishedPromise is made but doesn't resolve
//     // const timeoutId = setTimeout(() => {
//     //     log.error("ERROR animationFinishedPromise did not finish after 30s, likely a memory leak!")
//     //     p.cancel()
//     // }, 30000)
//     // p.then(() => clearTimeout(timeoutId))
//
//     // return p
// }
//
// /**
//  *
//  * @param id id of animation
//  */
// const useSimpleAnimationFinishedState = (id: string) => {
//     const animContext = useSimpleAnimationContext()
//     const [finished, setFinished] = useState(false)
//     const hasRunOnceRef = useRef(false)
//     const anim = animContext.animations.get(id)
//     if (anim) {
//         if (hasRunOnceRef.current == true && !anim.isRunning) {
//             setFinished(true)
//         }
//         if (anim.isRunning) {
//             hasRunOnceRef.current = true
//         }
//     }
//     return finished
// }
//
// const useSimpleAnimationRunningState = (id: string) => {
//     const animContext = useSimpleAnimationContext()
//     const anim = animContext.animations.get(id)
//     if (anim) {
//         return anim.isRunning
//     } else {
//         return false
//     }
// }
//
// export const SimpleAnimationContext = createContext<SimpleAnimationStoreType>(
//     createSimpleAnimationContextStore({ name: "root", debug: false })
// )
//
// export const useSimpleAnimationContext = () => {
//     return useContext(SimpleAnimationContext)
// }
//
// //Idea here is to be able to create a context to hold the state of a bunch of animations used in one place so you don't have
// //to pass callbacks all over... not sure if it's going to work well though, experimental
// export const useCreateSimpleAnimationContext = ({ name, debug = false }: { name: string; debug?: boolean }) => {
//     const animContextVal = useRefFn<SimpleAnimationStoreType>(() => createSimpleAnimationContextStore({ name, debug }))
//         .current
//
//     const provider = useRef<React.FC>(({ children }) => (
//         <SimpleAnimationContext.Provider value={animContextVal}>{children}</SimpleAnimationContext.Provider>
//     )).current
//
//     //TODO: do we need to clean up if this gets unmounted? destroy store and stop animations?
//
//     return { SimpleAnimationStoreProvider: provider, animContext: animContextVal }
// }

export type SimpleAnimationConfigType = {
    /**
     * @param springConfig whatever spring config you want, defaults to useNativeDriver: true and isInteraction: false
     */
    springConfig?: Partial<Animated.SpringAnimationConfig>
    /**
     * @param timingConfig normal timing config, if set will result in a timing animation instead of spring
     */
    timingConfig?: Partial<Animated.TimingAnimationConfig>

    /**
     * @param decayConfig decay animation config. If set will result in a decay animation
     */
    decayConfig?: Partial<Animated.DecayAnimationConfig>
    /**
     * @param skipFirstRun default false, don't run the animation on first mount
     */
    skipFirstRun?: boolean
    /**
     * @param autoRun default true, run animation whenever value changes
     */
    autoRun?: boolean
    /**
     * @param autoReset default false, reset the animation to initial value at start/finish, useful for "trigger" animations
     */
    autoReset?: boolean
    /**
     * @param toValue default 1, the value to animate to.
     */
    toValue?: number
    /**
     * @param initialValue default 0, the value to start at, useful if you want to animate immediately on mount (with skipFirstRun false) or one shot animations
     */
    initialValue?: number
    /**
     * @param constantSpeedMaxDistance Use to animate at "constant speed". The maximum toValue this anim can have. When set animation will compute duration to travel constantSpeedMaxDistance units in timingConfig.duration ms
     */
    constantSpeedMaxDistance?: number
    /**
     * @param loop set to > 0 to build loop
     */
    loop?: number
    /**
     * @param renderOnStartAndStop default false whether to trigger a component re-render when an animation starts and stops. Useful if other animations depend on the state of this one.
     */
    renderOnStartAndStop?: boolean
    /**
     * @param id unique id for this animation to track it in simpleAnimationContext
     */
    id?: string
    /**
     * @param name non-unique name for this animation for logging purposes
     */
    name: string
    /**
     * @param debug default false spit out debug logs for this animation
     */
    debug?: boolean
    /**
     * @param onFinish convenience to call fn on animation finish without starting animation manually
     */
    onFinish?: (res: Animated.EndResult) => void
}

//TODO: figure out how to type this better to avoid invalid configurations
/**
 * Simple wrapper around creating an animation to reduce boilerplate
 * Sets some defaults and takes care of common patterns we would otherwise repeat everywhere
 * uses a spring by default that animates from 0-1 with useNativeDriver: true and isInteraction: false
 *
 * @returns array containing the following
 * animatedValueRef -- a ref to the Animated.Value, you can interpolate this or combine it with other values before applying to your styles
 * animationRef -- a ref to the Animated.spring/timing, you can use this to start/stop or coordinate with Animated.parallel/sequence/stagger
 * trigger -- a function to reset the animation to initial value and play it again, useful for playing animation on user interaction or other event
 * isRunningRef -- a ref to a boolean indicating whether the animation is running. Useful if you need to coordinate animations beyond parallel/sequence/stagger
 * @example
 * ```
 *  check out useHeroMoveAnimation for some good examples
 * ```
 */
let anonCounter = 0
function getNextAnonAnimationId() {
    anonCounter += 1
    return `anim${anonCounter}`
}
export const useSimpleAnimation = function useSimpleAnimation({
                                                                  initialValue = 0,
                                                                  toValue,
                                                                  springConfig,
                                                                  timingConfig,
                                                                  decayConfig,
                                                                  constantSpeedMaxDistance,
                                                                  skipFirstRun = false,
                                                                  autoRun = true,
                                                                  renderOnStartAndStop = false,
                                                                  autoReset,
                                                                  loop,
                                                                  id,
                                                                  name,
                                                                  debug = false,
                                                                  onFinish,
                                                              }: SimpleAnimationConfigType) {
    //Assign an anonymous id if we didn't get one passed in
    const animId = useRefFn(() => id ?? getNextAnonAnimationId()).current

    // const animContext = useSimpleAnimationContext()

    const log = useRef(console).current
    // const log = useRef(logger.child(`Animation.${animContext.name}|${name}|${animId}`)).current

    //might get a new onFinish fn each render (inline function) so keep a ref up to date here to call the latest one
    const onFinishRef = useRef(onFinish)
    onFinishRef.current = onFinish

    //If there is no "to" value specified then assume we're animating 0-1 and consumer will interpolate
    const animateToValue = toValue ?? 1

    //Get a bunch of refs we need
    const { animatedValueRef, isRunningRef, isFirstRun, animationRef, initialValRef } = useGenericAnimationSetup(
        //If skipping first run initialze to destination value otherwise use the provided initial value or zero
        skipFirstRun ? animateToValue : initialValue ?? 0,
        renderOnStartAndStop,
        timingConfig ? "timing" : springConfig ? "spring" : undefined,
        initialValue ?? 0
    )

    const trigger = useCallback(() => {
        debug && log.info("animation trigger", { animateToValue })
        animatedValueRef.current.setValue(initialValRef.current)
        animationRef.current.start()
    }, [animateToValue])

    //Register this animation in the closes animation store in context
    //This lets observer components watch the state of the animation without passing a shitload of props everywhere
    // const animationStoreNodeRef = useSimpleAnimationRegistration(
    //     animContext,
    //     animId,
    //     name,
    //     animatedValueRef,
    //     animationRef,
    //     trigger
    // )
    debug && log.info("animation hook run")

    //Keep a reference to the most recent value of the animated value so we can compute duration for constant speed animations
    const [lastAnimatedValueRef] = useAnimatedLatestValueRef(animatedValueRef.current, initialValue)

    //Set some defaults for the animation
    const defaultAnimationConfig = { useNativeDriver: true, isInteraction: false }

    //Build the animation and set a ref to it
    useEffect(() => {
        debug && log.info("Animation main effect run")

        if (loop) {
            debug &&
            log.info("animation loop reset on value updated", {
                loop,
                animateToValue,
                initial: initialValRef.current,
            })
            //If this is a loop animation and the target value was set to the initial value then stop
            animatedValueRef.current.setValue(initialValRef.current)
        }

        //Make either a timing or a spring or a decay based on parameters we got
        let animationInstance: Animated.CompositeAnimation
        if (timingConfig) {
            let duration = timingConfig.duration!
            if (constantSpeedMaxDistance) {
                //This is a constant speed animation, compute duration required to get the right speed
                duration =
                    duration * (Math.abs(lastAnimatedValueRef.current - animateToValue) / constantSpeedMaxDistance)
            }
            animationInstance = Animated.timing(animatedValueRef.current, {
                toValue: animateToValue,
                ...defaultAnimationConfig,
                ...timingConfig,
                duration,
            })
        } else if (decayConfig) {
            const velocity = decayConfig.velocity ?? 1
            animationInstance = Animated.decay(animatedValueRef.current, {
                velocity,
                ...defaultAnimationConfig,
                ...decayConfig,
            })
        } else {
            animationInstance = Animated.spring(animatedValueRef.current, {
                toValue: animateToValue,
                ...defaultAnimationConfig,
                ...springConfig,
            })
        }

        if (loop) {
            //It should loop, wrap in Animated.loop
            animationInstance = Animated.loop(animationInstance, { iterations: loop })
            debug && log.log("Creating animation loop instance")
        }

        const originalStart = animationInstance.start
        const originalStop = animationInstance.stop

        //Hax to wokr around bug in react native -- finish callback doesn't run when stop
        //is called on a loop so manually call it here by wrapping stop but we don't wan to run it multiple times
        let hasCalledFinishCallback = false
        let finishCallbackSuppliedToStart: Animated.EndCallback | undefined

        const finishCallback = (v: Animated.EndResult) => {
            if (hasCalledFinishCallback) {
                debug && log.info("skipping finish callback, it has already run", v)

                //TODO: verify that this isn't causing any issues -- I think it's normal -- animation can stop then on unmount hook tries to stop it again
                // log.warn("animation Finish callback would have been called twice")
                return
            }
            hasCalledFinishCallback = true
            debug && log.info("animation complete", v)

            //Update animation state in context
            // animationStoreNodeRef.current?.setIsRunning(false)

            //If autoReset specified then reset the animation to start value now that it's over
            if (autoReset) {
                debug && log.log("Resetting due to autoReset")
                animatedValueRef.current.setValue(initialValRef.current)
            }

            isRunningRef.current = false

            //if start caller gave an onEnd callback run it
            finishCallbackSuppliedToStart?.(v)

            //if onFinish passed in animation options run it
            // console.log("Finish anim ", animId, timingConfig, name)
            debug && log.log("end finishcallback, calling onFinishRef.current if existing")
            onFinishRef.current?.(v)
        }

        const wrappedStop = () => {
            if (!isRunningRef.current) {
                debug && log.info("Stop called but not running, noop")
                return
            }
            debug && log.info("animation explicit stop called")
            finishCallback({ finished: false })
            originalStop()
        }

        const wrappedStart: (cb?: Animated.EndCallback) => void = (cb) => {
            finishCallbackSuppliedToStart = cb
            debug && log.info("animation start")

            if (isFirstRun.current && skipFirstRun) {
                //Skip first run if configured to do so
                debug && log.info("animation skip first run")
                isFirstRun.current = false
                return
            }

            //Update animation state in context
            // animationStoreNodeRef.current?.setIsRunning(true)

            isFirstRun.current = false

            //Set running state ref, other effects could depend on it
            isRunningRef.current = true

            //If autoReset specified then reset the animation to start value before it starts
            if (autoReset) {
                animatedValueRef.current.setValue(initialValRef.current)
            }

            //Start the animation
            originalStart(finishCallback)
        }

        //Wrap the start function with one that sets isRunningRef
        animationInstance.start = wrappedStart
        //Wrap the stop function with our custom one that fixes stop callbacks for loops
        animationInstance.stop = wrappedStop

        //Set a ref to return to callers can use it for animated sequences, staggers, etc
        animationRef.current = animationInstance

        debug && log.info("animation instance toValue update", { animateToValue })
        return () => {
            if (isRunningRef.current) {
                debug && log.info("animation instance stop on effect cleanup")
                animationInstance.stop()
            }
        }
    }, [animateToValue])

    //If we want to run automatically when value changes do it here, otherwise it's up to caller to start the animation
    useEffect(() => {
        if (autoRun) {
            if (loop && animateToValue == initialValRef.current) {
                debug && log.info("animation skip autorun due to loop set to initial value")
            } else {
                debug && log.info("animation autorun", { animateToValue })

                animationRef.current.start()
            }
        }
    }, [animateToValue])

    //Return refs to the value, the animation instance, the trigger function, and the isRunning ref
    return [animatedValueRef, animationRef, trigger, isRunningRef, animId] as const
}

//I guess this fn isn't really necessary since it's only used in useSimpleAnimation
//but it keeps that a little cleaner
const useGenericAnimationSetup = (
    initialAnimationValue: number = 0,
    renderOnStartAndStop: boolean = false,
    type: "spring" | "timing" = "spring",
    defaultStartValue: number = 0
) => {
    const animatedValueRef = useRef(new Animated.Value(initialAnimationValue))
    let isRunningRef
    if (renderOnStartAndStop) {
        isRunningRef = useRenderRef(false)
    } else {
        isRunningRef = useRef(false)
    }
    const isFirstRun = useRef(true)
    const initialValRef = useRef(defaultStartValue)
    const animType = type == "spring" ? Animated.spring : Animated.timing
    //Add a default animation here we will overwrite so this is never undefined
    const animationRef = useRef(
        animType(animatedValueRef.current, {
            toValue: animatedValueRef.current,
            useNativeDriver: true,
            isInteraction: false,
        })
    )
    return { animatedValueRef, isRunningRef, isFirstRun, animationRef, initialValRef }
}
