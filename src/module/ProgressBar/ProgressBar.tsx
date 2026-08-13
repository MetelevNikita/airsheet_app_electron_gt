import { FC } from 'react'

// css

import './ProgressBar.css'


interface ProgressBarInterFace {
    title: string
    progresText: string
    progressValue: number
    progressMax: number
    readbleText: string
}

const ProgressBar: FC<ProgressBarInterFace> = ({ title, progresText, progressValue, progressMax, readbleText }) => {
  return (
    <div className='progress_bar_container'>

        <div className='progress_bar_wrapper'>
            <div className='progress_bar_title_text'>{title}</div>
            <div className='progress_bar_progress_text'>{progresText}</div>    
        </div>             

        <progress value={progressValue} max={progressMax} className='progress_bar_indicator'></progress>

        <div className='progress_bar_progress_info'>{readbleText}</div>
    </div>
  )
}

export default ProgressBar