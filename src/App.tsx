import React, {useState, useEffect} from 'react'

// 

import { Container, Row, Col } from 'react-bootstrap/esm'

// components

import TitleBar from './module/TitleBar/TitleBar'
import TitleModule from './module/TitleModule/TitleModule'
import MyInput from './components/UI/MyInput/MyInput'
import MyButton from './components/UI/MyButton/MyButton'
import ProgressBar from './module/ProgressBar/ProgressBar'
import Credential from './module/Credential/Credential'

// css

import './App.css'

const App = () => {


  const [progress, setProgress] = useState(0)
  const [channel ,setChannel] = useState<null | {id: number, label: string, value: string}>(null)
  const [channelActive, setChannelActive] = useState<Boolean>(false)
  const [dataFiles, setDataFiles] = useState<any>({})
  const [convertTitle, setConvertTitle] = useState<string>('')
  const [result, setResult] = useState<any>(null)


  const channelList: {id: number, label: string, value: string}[]  = [
    {
      id: 1,
      label: 'Глазами туриста',
      value: "GT"
    },
    {
      id: 2,
      label: 'Живи Активно',
      value: "LA"
    }
  ]


  useEffect(() => {
    window.electronAPI.onProgress((num: number) => {
      setProgress(num)
    })

    return () => {
      window.electronAPI.removeProgressListener()
    }
  })



  async function getInputfile(dataFiles: {title: string}) {
    try {
      
      const inputData = await window.electronAPI.selectInputFile(dataFiles) as any
      console.log(inputData)

      if (inputData) {
        console.log('Входные данные получены')
        setDataFiles({...dataFiles, input: inputData})
        return
      }

    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        console.error('Ошибка данных файла ', error.message)
      }
      console.error('Неизвестная ошибка ', error)
    }
  }

  async function getOutputFolder () {
    try {
      
      const outputPath = await window.electronAPI.selectOutputFolder() as any
      console.log(outputPath)

      if (outputPath.filePaths) {
        console.log('Выходные данные получены')
        setDataFiles({...dataFiles, output: outputPath.filePaths[0]})
        return
      }

    } catch (error: Error | unknown) {

      if (error instanceof Error) {
        console.error('Ошибка данных папки ', error.message)
      }

      console.error('Неизвестная ошибка ', error)
    }
  }

  async function getAgeInputFolder () {
    try {

      const ageOutputPath = await window.electronAPI.selectInputAgeFolder() as any

      if (ageOutputPath.filePaths) {
        console.log('Выходные данные получены')
        setDataFiles({...dataFiles, age: ageOutputPath.filePaths[0]})
        return
      }
      
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        console.error('Ошибка данных папки возраста ', error.message)
      }
      console.error('Неизвестная ошибка ', error)
    }
  }

  // 


  async function convertingHandler(data: {title: string, input: {path: string, length: number | string}, output: string, age: string}) {
    try {

      const sendToMain = await window.electronAPI.convertFileHandler(data)
      console.log(sendToMain)
      setResult(sendToMain)
      
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        console.error('Ошибка конвертации ', error.message)
      }
      console.error('Неизвестная ошибка ', error)
    }
  }


  // 


  return (
    <>

    <Col>
      <TitleBar />
    </Col>

    <Container className=' mt-5 vh-100 vw-100'>

        <Row md={12} className='mt-3 mb-4'>
          <Col>
            <TitleModule />
          </Col>
        </Row>

        <Row md={12}>

          {
            channelList && channelList.map((item: {id: number, label: string, value: string}, index: number) => {
              return <Col key={index}>
                        <MyButton
                            text={item.label}
                            onClick={() => {
                              setChannelActive(true)
                              setChannel(item)
                              setDataFiles({...dataFiles, titleChannel: item.value})
                            }} />
                      </Col>
            })
          }

        </Row>

        <Row md={12}>

        {
          
          channelActive ? (
                    <Row className='mt-4 mb-4'>

                      <Row className='mb-3'>
                        <div className='channel_title'>
                          {
                            channel && `Выбран: ${channel.label}`
                          }
                        </div>
                      </Row>

                      <Row>
                        <Col md={12}>
                          <MyInput
                            title={'Исходный файл'}
                            input={(dataFiles.input?.path) ? dataFiles.input?.path : 'TEXT'}
                            onClick={() => {
                              getInputfile(dataFiles)
                            }}
                            btn={'Обзор...'} />
                        </Col>

                        
                        {
                          (dataFiles.input?.length) && (
                            <div>
                              <div className='input_info'>Найдено {dataFiles.input?.length}</div>
                              <hr/>
                            </div>
                          )
                        }

                      </Row>

                      <Row>
                        <Col md={12}>
                          <MyInput
                            title={'Выходная папка'}
                            input={(dataFiles.output) ? dataFiles.output : 'TEXT'}
                            onClick={() => {
                              getOutputFolder()
                            }}
                            btn={'Обзор...'} />
                        </Col>
                      </Row>

                    </Row>

          ) : (
          <Row md={12} className='mt-5 mb-5'>
            <Col className='d-flex justify-content-center'>
              <div className='channel_title'>Выберите канал</div>
            </Col>
          </Row>
          )

        }

        </Row>




        {/* progress */}

        <Row md={12} className='mt-3'>
          <Col>
              <ProgressBar
                title={'Прогресс'}
                progresText={`Конвертация ${progress}`}
                progressValue={progress}
                progressMax={(dataFiles.input?.length) ? Number(dataFiles.input?.length) : 0}
                readbleText={(convertTitle) ? convertTitle : 'Конвертация еще не началась...'}
              />
          </Col>
        </Row>


        {

          (result) && (
            <Row md={12}>
              <Col md={12}>
              <div className='input_info_container'>
                <div className='input_info'>{result.message}</div>
                <div className='input_info'>Обработано {result.data}</div>
              </div>
              </Col>
            </Row>
          )

        }
            

        {/*  */}


        <Row md={12} className='mt-5'>
          <Col>
              
              <MyButton
                text={'Запустить'}
                onClick={() => {
                  console.log(dataFiles)
                  convertingHandler(dataFiles)
                  setConvertTitle('Конвертация началась')
                }}
              />
          
          </Col>

          <Col>
                <MyButton
                  text={'Сбросить'}
                  onClick={() => {
                    console.log('Сброшено')
                    setProgress(0)
                    setChannel(null)
                    setChannelActive(false)
                    setDataFiles({})
                    setConvertTitle('')
                    setResult(null)

                  }} />
          </Col>
        </Row>


        <Row md={12} className='mt-3'>
          <Col md={12}>
              <Credential
                description={'@ Сделано РУКАМИ а не нейро СКАМОМ'}
                created={'Разработка MetelevNikita'}
              />
          </Col>
        </Row>
    </Container>
    </>
  )
}

export default App