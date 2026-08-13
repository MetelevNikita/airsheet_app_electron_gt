import { FC } from 'react'
import { motion } from 'motion/react'

// css

import './MyInput.css'

// 

interface MyInputInput {
    title: string
    input: string
    onClick: () => any
    btn: string
}

const MyInput: FC<MyInputInput> = ({ title, input, onClick, btn }) => {
  return (
    
    <div className='input_container'>
        <span className='input_title_text'>{title}</span>
        <div className='input_insert_container'>

            <div className='input_insert_text'>{input}</div>
            <motion.button
                className='input_insert_button'
                onClick={onClick}
                whileHover={{
                    scale: 1.20
                }}
                whileTap={{
                    scale: 1.10
                }}
            >
                {btn}
            </motion.button>

        </div>
    </div>
  )
}

export default MyInput