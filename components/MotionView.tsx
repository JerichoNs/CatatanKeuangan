/**
 * MotionView — Universal animated wrapper.
 * On web: uses Framer Motion (whileInView fade/slide/scale animations).
 * On native: falls back to a plain View (no crash, no error).
 */
import React, { useEffect, useState } from 'react';
import { View, Platform, ViewProps } from 'react-native';

export type AnimationPreset =
  | 'fade-up'
  | 'fade-in'
  | 'slide-left'
  | 'slide-right'
  | 'scale-in'
  | 'none';

export interface MotionViewProps extends ViewProps {
  preset?: AnimationPreset;
  delay?: number;    // seconds
  duration?: number; // seconds
  once?: boolean;    // animate only once on scroll
  children?: React.ReactNode;
}

// Variant definitions for each preset
const presetVariants: Record<AnimationPreset, { hidden: object; visible: object }> = {
  'fade-up': {
    hidden: { opacity: 0, y: 48 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-in': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: -56 },
    visible: { opacity: 1, x: 0 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: 56 },
    visible: { opacity: 1, x: 0 },
  },
  'scale-in': {
    hidden: { opacity: 0, scale: 0.88 },
    visible: { opacity: 1, scale: 1 },
  },
  none: {
    hidden: {},
    visible: {},
  },
};

// Web-only wrapper using Framer Motion loaded dynamically
function WebMotionView({
  preset = 'fade-up',
  delay = 0,
  duration = 0.6,
  once = true,
  style,
  children,
  ...rest
}: MotionViewProps) {
  const [MotionDiv, setMotionDiv] = useState<any>(null);

  useEffect(() => {
    import('framer-motion').then((mod) => {
      setMotionDiv(() => mod.motion.div);
    });
  }, []);

  const variants = presetVariants[preset ?? 'fade-up'];

  if (!MotionDiv) {
    // Show content immediately while loading (prevents layout shift)
    return (
      <div style={{ ...(style as any), opacity: 1 }} {...(rest as any)}>
        {children}
      </div>
    );
  }

  return (
    <MotionDiv
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.12 }}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={style as any}
      {...(rest as any)}
    >
      {children}
    </MotionDiv>
  );
}

// Exported component — auto selects web or native
export function MotionView({
  children,
  preset,
  delay,
  duration,
  once,
  ...rest
}: MotionViewProps) {
  if (Platform.OS === 'web') {
    return (
      <WebMotionView
        preset={preset}
        delay={delay}
        duration={duration}
        once={once}
        {...rest}
      >
        {children}
      </WebMotionView>
    );
  }
  // Native: no-op wrapper
  return <View {...rest}>{children}</View>;
}
