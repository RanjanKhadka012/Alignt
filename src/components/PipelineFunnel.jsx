import React, { useEffect, useState } from 'react'
export default function PipelineFunnel({ analysis }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setProgress(1); return }
    let frame, start
    const tick = now => { start ??= now; const value = Math.min((now - start) / 600, 1); setProgress(value); if (value < 1) frame = requestAnimationFrame(tick) }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])
  const blocks = [ ['Workforce Pool', analysis.pool.length, 'Employees in relevant roles', 'neutral'], ['Fully Qualified', analysis.fullyQualified.length, '2+ capabilities at Intermediate+', 'teal'], ['Trainable', analysis.trainable.length, 'Some foundation; further training needed', 'amber'], ['Skill-Gapped', analysis.gapped.length, 'No relevant skills recorded', 'red'] ]
  return <div className="pipeline-funnel">{blocks.map(([label, count, caption, tone]) => <div className={tone} key={label}><span>{label}</span><strong aria-label={`${count} employees`}><span aria-hidden="true">{Math.round(count * progress)}</span></strong><p>{caption}</p></div>)}</div>
}
