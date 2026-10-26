export type ApplauseQuality = 'Applause' | 'Craft' | 'Originality' | 'Presence';
export type ApplauseMoment = { second: number; quality: ApplauseQuality };

export function applauseSecond(second: number, duration: number) {
  return Math.floor(
    Math.max(
      0,
      Math.min(
        Number.isFinite(duration) && duration > 0 ? duration : 21600,
        Number.isFinite(second) ? second : 0
      )
    )
  );
}

export function withApplauseMoment(
  moments: ApplauseMoment[],
  second: number,
  quality: ApplauseQuality
): ApplauseMoment[] {
  if (
    !Number.isFinite(second) ||
    second < 0 ||
    !['Applause', 'Craft', 'Originality', 'Presence'].includes(quality)
  )
    return moments;
  const mark = { second: Math.floor(second), quality };
  return [...moments.filter((m) => m.second !== mark.second), mark].slice(-20);
}
