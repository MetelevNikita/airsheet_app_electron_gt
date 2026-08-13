import { FC } from 'react'

// css

import './Credential.css'

// 

interface CredentialProps {
    description: string
    created: string
}

const Credential: FC<CredentialProps> = ({ description, created }) => {
  return (

                <div className='credential_container'>

                  <div className='credential_text'>{description}</div>
                  <a className='credential_description' target='_blanc' href='https://t.me/MetelevNikita' >{created}</a>

                </div>

  )
}

export default Credential