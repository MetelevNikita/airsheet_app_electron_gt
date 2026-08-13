import { FC , CSSProperties} from 'react'
import { motion } from 'motion/react'

// css 

import './MyButton.css'

// 

interface MyButtonInterface {
    text: string
    style?: CSSProperties
    onClick: () => any
    onFocus?: () => any
}

const MyButton: FC<MyButtonInterface> = ({ text, style, onClick, onFocus }) => {
  return (

    <motion.div
        className='my_btn'
        style={style}
        onClick={onClick}
        onFocus={onFocus}

        // 

        whileHover={{scale: 1.03}}
        whileTap={{scale: 1.10}}

    >
        {text}
    </motion.div>
  )
}

export default MyButton