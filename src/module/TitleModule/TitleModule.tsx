import { FC } from 'react'

// css

import './TitleModule.css'

// 

import brandLogo from './../../assets/BrandLogo.png'

const TitleModule: FC = () => {
  return (
    <div className='title_module_container'>

        <img className='title_module_logo' alt={'img'} src={brandLogo}/>

        <div className='title_module_wrapper'>

            <div className='title_module_wrapper_title'>AIR Converter</div>
            <div className='title_module_wrapper_subtitle'>Утилита конвертации файлов .air</div>

        </div>

    </div>
  )
}

export default TitleModule